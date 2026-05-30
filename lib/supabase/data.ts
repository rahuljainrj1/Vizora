import { slugify } from "@/lib/utils";
import type {
  BootstrapData,
  Catalog,
  CatalogSession,
  Category,
  CollaborativeSessionBundle,
  CustomerSession,
  CustomerSessionSummary,
  Product,
  ProductImage,
  ProductOption,
  ProductWithImages,
  SessionEvent,
  SessionEventType,
  SessionProduct,
  SessionBundle,
  Vendor,
} from "@/lib/types";
import type { CatalogInput } from "@/lib/schemas/catalog";
import type { ProductInput } from "@/lib/schemas/product";
import type {
  SessionCreateInput,
  SessionEventInput,
  SessionStatusInput,
} from "@/lib/schemas/session";
import type { VendorInput } from "@/lib/schemas/vendor";
import { getAppUrl } from "@/lib/utils";
import { getSupabaseAdmin } from "./server";

type SupabaseAdmin = ReturnType<typeof getSupabaseAdmin>;

function asVendor(value: unknown) {
  return value as Vendor;
}

function asCategories(value: unknown) {
  return (value ?? []) as Category[];
}

function asProducts(value: unknown) {
  return (value ?? []) as Product[];
}

function asImages(value: unknown) {
  return (value ?? []) as ProductImage[];
}

function asProductOptions(value: unknown) {
  return (value ?? []) as ProductOption[];
}

function asCatalogs(value: unknown) {
  return (value ?? []) as Catalog[];
}

function asSessions(value: unknown) {
  return (value ?? []) as CatalogSession[];
}

function asCustomerSessions(value: unknown) {
  return (value ?? []) as CustomerSession[];
}

function asSessionProducts(value: unknown) {
  return (value ?? []) as SessionProduct[];
}

function asSessionEvents(value: unknown) {
  return (value ?? []) as SessionEvent[];
}

function assertNoError(error: { message: string } | null) {
  if (error) throw new Error(error.message);
}

function isMissingRelationError(
  error: { message: string } | null,
  relation: string,
) {
  return Boolean(
    error?.message.includes(`relation "public.${relation}" does not exist`),
  );
}

export async function getOrCreateVendor(client: SupabaseAdmin) {
  const configuredVendorId = process.env.VIZORA_VENDOR_ID;

  if (configuredVendorId) {
    const { data, error } = await client
      .from("vendors")
      .select("*")
      .eq("id", configuredVendorId)
      .maybeSingle();
    assertNoError(error);
    if (data) return asVendor(data);
  } else {
    const { data, error } = await client
      .from("vendors")
      .select("*")
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();
    assertNoError(error);
    if (data) return asVendor(data);
  }

  const insertQuery = configuredVendorId
    ? client.from("vendors").insert({
        id: configuredVendorId,
        business_name: "Vizora Fabrication Studio",
        brand_color: "#ffffff",
      })
    : client.from("vendors").insert({
        business_name: "Vizora Fabrication Studio",
        brand_color: "#ffffff",
      });

  const { data, error } = await insertQuery.select("*").single();
  assertNoError(error);
  return asVendor(data);
}

export async function getBootstrapData(): Promise<BootstrapData> {
  const client = getSupabaseAdmin();
  const vendor = await getOrCreateVendor(client);

  const [
    categoriesResult,
    productsResult,
    imagesResult,
    productOptionsResult,
    catalogsResult,
    sessionsResult,
  ] = await Promise.all([
    client
      .from("categories")
      .select("*")
      .eq("vendor_id", vendor.id)
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true }),
    client
      .from("products")
      .select("*")
      .eq("vendor_id", vendor.id)
      .order("display_order", { ascending: true })
      .order("created_at", { ascending: false }),
    client
      .from("product_images")
      .select("*")
      .eq("vendor_id", vendor.id)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true }),
    client
      .from("product_options")
      .select("*")
      .eq("vendor_id", vendor.id)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true }),
    client
      .from("catalogs")
      .select("*")
      .eq("vendor_id", vendor.id)
      .order("updated_at", { ascending: false }),
    client
      .from("catalog_sessions")
      .select("*")
      .eq("vendor_id", vendor.id)
      .order("created_at", { ascending: false }),
  ]);

  assertNoError(categoriesResult.error);
  assertNoError(productsResult.error);
  assertNoError(imagesResult.error);
  if (
    productOptionsResult.error &&
    !isMissingRelationError(productOptionsResult.error, "product_options")
  ) {
    assertNoError(productOptionsResult.error);
  }
  assertNoError(catalogsResult.error);
  assertNoError(sessionsResult.error);

  const categories = asCategories(categoriesResult.data);
  const products = asProducts(productsResult.data);
  const images = asImages(imagesResult.data);
  const productOptions = productOptionsResult.error
    ? []
    : asProductOptions(productOptionsResult.data);
  const catalogs = asCatalogs(catalogsResult.data);
  const sessions = asSessions(sessionsResult.data);
  const categoryById = new Map(categories.map((category) => [category.id, category]));
  const imagesByProduct = new Map<string, ProductImage[]>();
  const optionsByProduct = new Map<string, ProductOption[]>();

  for (const image of images) {
    imagesByProduct.set(image.product_id, [
      ...(imagesByProduct.get(image.product_id) ?? []),
      image,
    ]);
  }

  for (const option of productOptions) {
    optionsByProduct.set(option.product_id, [
      ...(optionsByProduct.get(option.product_id) ?? []),
      option,
    ]);
  }

  return {
    vendor,
    categories,
    products: products.map((product) => ({
      ...product,
      category: product.category_id
        ? categoryById.get(product.category_id) ?? null
        : null,
      images: imagesByProduct.get(product.id) ?? [],
      options: optionsByProduct.get(product.id) ?? [],
    })),
    catalogs,
    sessions,
  };
}

export async function saveVendor(input: VendorInput) {
  const client = getSupabaseAdmin();
  const vendor = await getOrCreateVendor(client);
  const { data, error } = await client
    .from("vendors")
    .update({
      business_name: input.businessName,
      contact_name: input.contactName || null,
      phone: input.phone || null,
      email: input.email || null,
      website: input.website || null,
      address: input.address || null,
      brand_color: input.brandColor,
    })
    .eq("id", vendor.id)
    .select("*")
    .single();

  assertNoError(error);
  return asVendor(data);
}

export async function createCategory(name: string) {
  const client = getSupabaseAdmin();
  const vendor = await getOrCreateVendor(client);
  return createCategoryForVendor(client, vendor.id, name);
}

async function createCategoryForVendor(
  client: SupabaseAdmin,
  vendorId: string,
  name: string,
) {
  const slug = slugify(name);
  if (!slug) throw new Error("Category name is required");

  const { data: existing, error: existingError } = await client
    .from("categories")
    .select("*")
    .eq("vendor_id", vendorId)
    .eq("slug", slug)
    .maybeSingle();
  assertNoError(existingError);
  if (existing) return existing as Category;

  const { count, error: countError } = await client
    .from("categories")
    .select("id", { count: "exact", head: true })
    .eq("vendor_id", vendorId);
  assertNoError(countError);

  const { data, error } = await client
    .from("categories")
    .insert({
      vendor_id: vendorId,
      name,
      slug,
      sort_order: count ?? 0,
    })
    .select("*")
    .single();
  assertNoError(error);
  return data as Category;
}

export async function saveProduct(input: ProductInput, productId?: string) {
  const client = getSupabaseAdmin();
  const vendor = await getOrCreateVendor(client);

  let categoryId = input.categoryId || null;
  if (input.newCategoryName) {
    const category = await createCategoryForVendor(
      client,
      vendor.id,
      input.newCategoryName,
    );
    categoryId = category.id;
  }

  const payload = {
    vendor_id: vendor.id,
    category_id: categoryId,
    sku: input.sku,
    name: input.name,
    material_type: input.materialType || null,
    finish_color: input.finishColor || null,
    description: input.description || null,
    tags: input.tags,
    featured: input.featured,
  };

  if (productId) {
    const { data, error } = await client
      .from("products")
      .update(payload)
      .eq("vendor_id", vendor.id)
      .eq("id", productId)
      .select("*")
      .single();
    assertNoError(error);
    await syncProductOptions(client, vendor.id, productId, input.options);
    return data as Product;
  }

  const { count, error: countError } = await client
    .from("products")
    .select("id", { count: "exact", head: true })
    .eq("vendor_id", vendor.id);
  assertNoError(countError);

  const { data, error } = await client
    .from("products")
    .insert({
      ...payload,
      display_order: count ?? 0,
    })
    .select("*")
    .single();
  assertNoError(error);
  await syncProductOptions(client, vendor.id, (data as Product).id, input.options);
  return data as Product;
}

async function syncProductOptions(
  client: SupabaseAdmin,
  vendorId: string,
  productId: string,
  options: ProductInput["options"],
) {
  const normalizedOptions = options
    .map((option) => ({
      label: (option.label || option.finishColor || "").trim(),
      finish_color: option.finishColor?.trim() || null,
      image_id: option.imageId || null,
      linked_product_id:
        option.linkedProductId && option.linkedProductId !== productId
          ? option.linkedProductId
          : null,
    }))
    .filter((option) => option.label);

  const { error: deleteError } = await client
    .from("product_options")
    .delete()
    .eq("vendor_id", vendorId)
    .eq("product_id", productId);
  if (isMissingRelationError(deleteError, "product_options")) {
    if (normalizedOptions.length) {
      throw new Error(
        "Product options need the product_options migration. Run supabase/schema.sql or 20260529001000_product_options.sql.",
      );
    }
    return;
  }
  assertNoError(deleteError);

  if (!normalizedOptions.length) return;

  const { error: insertError } = await client.from("product_options").insert(
    normalizedOptions.map((option, index) => ({
      vendor_id: vendorId,
      product_id: productId,
      label: option.label,
      finish_color: option.finish_color,
      image_id: option.image_id,
      linked_product_id: option.linked_product_id,
      sort_order: index,
    })),
  );
  assertNoError(insertError);
}

export async function reorderProducts(productIds: string[]) {
  const client = getSupabaseAdmin();
  const vendor = await getOrCreateVendor(client);

  await Promise.all(
    productIds.map((productId, index) =>
      client
        .from("products")
        .update({ display_order: index })
        .eq("vendor_id", vendor.id)
        .eq("id", productId),
    ),
  );

  return getBootstrapData();
}

export async function saveCatalog(input: CatalogInput) {
  const client = getSupabaseAdmin();
  const vendor = await getOrCreateVendor(client);
  const contactSnapshot = {
    businessName: vendor.business_name,
    logoUrl: vendor.logo_url,
    contactName: vendor.contact_name,
    phone: vendor.phone,
    email: vendor.email,
    website: vendor.website,
    address: vendor.address,
    brandColor: vendor.brand_color,
  };
  const payload = {
    vendor_id: vendor.id,
    title: input.title,
    cover_title: input.coverTitle || input.title,
    contact_snapshot: contactSnapshot,
    product_order: input.productIds,
    options: {
      groupedByCategory: true,
      description: input.description || "",
      layoutByProduct: input.layoutByProduct ?? {},
    },
  };

  if (input.id) {
    const { data, error } = await client
      .from("catalogs")
      .update(payload)
      .eq("vendor_id", vendor.id)
      .eq("id", input.id)
      .select("*")
      .single();
    assertNoError(error);
    return data as Catalog;
  }

  const { data, error } = await client
    .from("catalogs")
    .insert(payload)
    .select("*")
    .single();
  assertNoError(error);
  return data as Catalog;
}

export async function createCatalogSession(catalogId: string) {
  const client = getSupabaseAdmin();
  const vendor = await getOrCreateVendor(client);
  const { data, error } = await client
    .from("catalog_sessions")
    .insert({
      vendor_id: vendor.id,
      catalog_id: catalogId,
    })
    .select("*")
    .single();
  assertNoError(error);

  const session = data as CatalogSession;
  return {
    session,
    url: `${getAppUrl()}/session/${session.id}`,
  };
}

export async function getCustomerSessionSummaries() {
  const client = getSupabaseAdmin();
  const bootstrap = await getBootstrapData();
  const vendor = bootstrap.vendor;

  const [sessionsResult, sessionProductsResult, eventsResult] = await Promise.all([
    client
      .from("sessions")
      .select("*")
      .eq("vendor_id", vendor.id)
      .order("updated_at", { ascending: false }),
    client.from("session_products").select("*").order("sort_order", {
      ascending: true,
    }),
    client
      .from("session_events")
      .select("*")
      .order("created_at", { ascending: false }),
  ]);

  assertNoError(sessionsResult.error);
  assertNoError(sessionProductsResult.error);
  assertNoError(eventsResult.error);

  const sessions = asCustomerSessions(sessionsResult.data);
  const sessionIds = new Set(sessions.map((session) => session.id));
  const sessionProducts = asSessionProducts(sessionProductsResult.data).filter(
    (item) => sessionIds.has(item.session_id),
  );
  const events = asSessionEvents(eventsResult.data).filter((event) =>
    sessionIds.has(event.session_id),
  );
  const productById = new Map(
    bootstrap.products.map((product) => [product.id, product]),
  );

  return {
    vendor,
    sessions: sessions.map((session): CustomerSessionSummary => {
      const products = sessionProducts
        .filter((item) => item.session_id === session.id)
        .sort((first, second) => first.sort_order - second.sort_order)
        .map((item) => productById.get(item.product_id))
        .filter((product): product is ProductWithImages => Boolean(product));
      const sessionEvents = events.filter((event) => event.session_id === session.id);
      const state = getSessionInteractionState(sessionEvents);

      return {
        ...session,
        products,
        events: sessionEvents,
        shortlisted_product_ids: state.shortlistedProductIds,
        discussed_product_ids: state.discussedProductIds,
        revisit_count: sessionEvents.filter(
          (event) => event.event_type === "revisit",
        ).length,
        note_count: sessionEvents.filter((event) => event.event_type === "note_added")
          .length,
      };
    }),
  };
}

export async function createCustomerSession(input: SessionCreateInput) {
  const client = getSupabaseAdmin();
  const vendor = await getOrCreateVendor(client);
  const shareToken = createShareToken();
  const { data, error } = await client
    .from("sessions")
    .insert({
      vendor_id: vendor.id,
      catalog_id: input.catalogId || null,
      title: input.title,
      customer_name: input.customerName || null,
      share_token: shareToken,
    })
    .select("*")
    .single();
  assertNoError(error);

  const session = data as CustomerSession;
  const productRows = input.productIds.map((productId, index) => ({
    session_id: session.id,
    product_id: productId,
    sort_order: index,
  }));

  const { error: productsError } = await client
    .from("session_products")
    .insert(productRows);
  assertNoError(productsError);

  return {
    session,
    url: `${getAppUrl()}/session/${session.share_token}`,
  };
}

export async function updateCustomerSessionStatus(
  sessionId: string,
  input: SessionStatusInput,
) {
  const client = getSupabaseAdmin();
  const vendor = await getOrCreateVendor(client);
  const { data, error } = await client
    .from("sessions")
    .update({ status: input.status })
    .eq("vendor_id", vendor.id)
    .eq("id", sessionId)
    .select("*")
    .single();
  assertNoError(error);
  return data as CustomerSession;
}

export async function duplicateCustomerSession(sessionId: string) {
  const client = getSupabaseAdmin();
  const vendor = await getOrCreateVendor(client);
  const { data: sourceData, error: sourceError } = await client
    .from("sessions")
    .select("*")
    .eq("vendor_id", vendor.id)
    .eq("id", sessionId)
    .single();
  assertNoError(sourceError);
  const source = sourceData as CustomerSession;

  const { data: productData, error: productError } = await client
    .from("session_products")
    .select("*")
    .eq("session_id", source.id)
    .order("sort_order", { ascending: true });
  assertNoError(productError);

  return createCustomerSession({
    title: `Copy of ${source.title}`,
    customerName: source.customer_name ?? "",
    catalogId: source.catalog_id,
    productIds: asSessionProducts(productData).map((item) => item.product_id),
  });
}

export async function getCollaborativeSessionBundle(
  identifier: string,
): Promise<CollaborativeSessionBundle | null> {
  const client = getSupabaseAdmin();
  const session = await findCustomerSession(client, identifier);
  if (!session) return null;

  const [
    catalogResult,
    sessionProductsResult,
    eventsResult,
    bootstrap,
  ] = await Promise.all([
    session.catalog_id
      ? client.from("catalogs").select("*").eq("id", session.catalog_id).maybeSingle()
      : Promise.resolve({ data: null, error: null }),
    client
      .from("session_products")
      .select("*")
      .eq("session_id", session.id)
      .order("sort_order", { ascending: true }),
    client
      .from("session_events")
      .select("*")
      .eq("session_id", session.id)
      .order("created_at", { ascending: true }),
    getBootstrapData(),
  ]);

  assertNoError(catalogResult.error);
  assertNoError(sessionProductsResult.error);
  assertNoError(eventsResult.error);

  const productById = new Map(
    bootstrap.products.map((product) => [product.id, product]),
  );
  const products = asSessionProducts(sessionProductsResult.data)
    .map((item) => productById.get(item.product_id))
    .filter((product): product is ProductWithImages => Boolean(product));
  const events = asSessionEvents(eventsResult.data);
  const state = getSessionInteractionState(events);

  return {
    session,
    catalog: catalogResult.data ? (catalogResult.data as Catalog) : null,
    vendor: bootstrap.vendor,
    categories: bootstrap.categories,
    products,
    events,
    shortlistedProductIds: state.shortlistedProductIds,
    discussedProductIds: state.discussedProductIds,
    notesByProduct: state.notesByProduct,
  };
}

export async function recordCustomerSessionEvent(
  identifier: string,
  input: SessionEventInput,
) {
  const client = getSupabaseAdmin();
  const session = await findCustomerSession(client, identifier);
  if (!session) throw new Error("Session not found");

  const metadata = {
    ...input.metadata,
    visitorKey: input.visitorKey,
  };

  if (input.eventType === "session_opened") {
    const { data: previousEvents, error: previousError } = await client
      .from("session_events")
      .select("id")
      .eq("session_id", session.id)
      .eq("event_type", "session_opened")
      .eq("metadata->>visitorKey", input.visitorKey ?? "");
    assertNoError(previousError);

    const isRevisit = Boolean(input.visitorKey && (previousEvents?.length ?? 0) > 0);
    const eventRows = [
      {
        session_id: session.id,
        event_type: "session_opened" satisfies SessionEventType,
        product_id: null,
        metadata: { ...metadata, isRevisit },
      },
    ];
    if (isRevisit) {
      eventRows.push({
        session_id: session.id,
        event_type: "revisit",
        product_id: null,
        metadata: { ...metadata, isRevisit: true },
      });
    }

    const [eventInsert, sessionUpdate] = await Promise.all([
      client.from("session_events").insert(eventRows).select("*"),
      client
        .from("sessions")
        .update({
          open_count: session.open_count + 1,
          last_opened_at: new Date().toISOString(),
        })
        .eq("id", session.id),
    ]);
    assertNoError(eventInsert.error);
    assertNoError(sessionUpdate.error);
    return asSessionEvents(eventInsert.data);
  }

  const { data, error } = await client
    .from("session_events")
    .insert({
      session_id: session.id,
      event_type: input.eventType,
      product_id: input.productId || null,
      metadata,
    })
    .select("*");
  assertNoError(error);
  return asSessionEvents(data);
}

export async function getSessionBundle(sessionId: string): Promise<SessionBundle> {
  const client = getSupabaseAdmin();
  const { data: sessionData, error: sessionError } = await client
    .from("catalog_sessions")
    .select("*")
    .eq("id", sessionId)
    .single();
  assertNoError(sessionError);
  const session = sessionData as CatalogSession;

  const { data: catalogData, error: catalogError } = await client
    .from("catalogs")
    .select("*")
    .eq("id", session.catalog_id)
    .single();
  assertNoError(catalogError);
  const catalog = catalogData as Catalog;

  const bootstrap = await getBootstrapData();
  const productIds = Array.isArray(catalog.product_order)
    ? catalog.product_order.filter((value): value is string => typeof value === "string")
    : [];
  const productsById = new Map(
    bootstrap.products.map((product) => [product.id, product]),
  );

  return {
    session,
    catalog,
    vendor: bootstrap.vendor,
    categories: bootstrap.categories,
    products: productIds
      .map((productId) => productsById.get(productId))
      .filter((product): product is ProductWithImages => Boolean(product)),
  };
}

export async function trackSessionOpen(sessionId: string, visitorKey: string) {
  const client = getSupabaseAdmin();
  const { data: sessionData, error: sessionError } = await client
    .from("catalog_sessions")
    .select("*")
    .eq("id", sessionId)
    .single();
  assertNoError(sessionError);
  const session = sessionData as CatalogSession;

  const { count, error: countError } = await client
    .from("catalog_session_visits")
    .select("id", { count: "exact", head: true })
    .eq("session_id", sessionId)
    .eq("visitor_key", visitorKey);
  assertNoError(countError);

  const isRevisit = (count ?? 0) > 0;
  const { data: visitData, error: visitError } = await client
    .from("catalog_session_visits")
    .insert({
      session_id: sessionId,
      visitor_key: visitorKey,
      last_seen_at: new Date().toISOString(),
    })
    .select("id")
    .single();
  assertNoError(visitError);

  const { error: updateError } = await client
    .from("catalog_sessions")
    .update({
      open_count: session.open_count + 1,
      revisit_count: session.revisit_count + (isRevisit ? 1 : 0),
      last_opened_at: new Date().toISOString(),
    })
    .eq("id", sessionId);
  assertNoError(updateError);

  return {
    visitId: (visitData as { id: string }).id,
    isRevisit,
  };
}

export async function trackSessionHeartbeat(
  sessionId: string,
  visitId: string,
  elapsedSeconds: number,
) {
  const client = getSupabaseAdmin();
  const { data: visitData, error: visitError } = await client
    .from("catalog_session_visits")
    .select("*")
    .eq("id", visitId)
    .eq("session_id", sessionId)
    .single();
  assertNoError(visitError);

  const existingVisit = visitData as { time_spent_seconds: number };
  const delta = Math.max(0, elapsedSeconds - existingVisit.time_spent_seconds);

  if (delta === 0) {
    return { delta: 0 };
  }

  const { data: sessionData, error: sessionError } = await client
    .from("catalog_sessions")
    .select("total_time_seconds")
    .eq("id", sessionId)
    .single();
  assertNoError(sessionError);

  const session = sessionData as { total_time_seconds: number };

  const [visitUpdate, sessionUpdate] = await Promise.all([
    client
      .from("catalog_session_visits")
      .update({
        time_spent_seconds: elapsedSeconds,
        last_seen_at: new Date().toISOString(),
      })
      .eq("id", visitId),
    client
      .from("catalog_sessions")
      .update({
        total_time_seconds: session.total_time_seconds + delta,
      })
      .eq("id", sessionId),
  ]);

  assertNoError(visitUpdate.error);
  assertNoError(sessionUpdate.error);

  return { delta };
}

function createShareToken() {
  const random =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  return random.replace(/-/g, "").slice(0, 20);
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}

async function findCustomerSession(client: SupabaseAdmin, identifier: string) {
  const { data: tokenData, error: tokenError } = await client
    .from("sessions")
    .select("*")
    .eq("share_token", identifier)
    .maybeSingle();
  assertNoError(tokenError);
  if (tokenData) return tokenData as CustomerSession;

  if (!isUuid(identifier)) return null;

  const { data, error } = await client
    .from("sessions")
    .select("*")
    .eq("id", identifier)
    .maybeSingle();
  assertNoError(error);
  return data ? (data as CustomerSession) : null;
}

function getSessionInteractionState(events: SessionEvent[]) {
  const shortlistState = new Map<string, boolean>();
  const discussedState = new Map<string, boolean>();
  const notesByProduct: Record<string, SessionEvent[]> = {};

  for (const event of events) {
    if (event.event_type === "product_shortlisted" && event.product_id) {
      const metadata = getRecordMetadata(event.metadata);
      shortlistState.set(event.product_id, metadata.selected !== false);
    }

    if (event.event_type === "discussed" && event.product_id) {
      const metadata = getRecordMetadata(event.metadata);
      discussedState.set(event.product_id, metadata.selected !== false);
    }

    if (event.event_type === "note_added" && event.product_id) {
      notesByProduct[event.product_id] = [
        ...(notesByProduct[event.product_id] ?? []),
        event,
      ];
    }
  }

  return {
    shortlistedProductIds: Array.from(shortlistState.entries())
      .filter(([, selected]) => selected)
      .map(([productId]) => productId),
    discussedProductIds: Array.from(discussedState.entries())
      .filter(([, selected]) => selected)
      .map(([productId]) => productId),
    notesByProduct,
  };
}

function getRecordMetadata(value: unknown) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}
