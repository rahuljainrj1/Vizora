import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.106.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const metadataSchema = {
  type: "object",
  additionalProperties: false,
  required: [
    "name",
    "description",
    "materialType",
    "finishColor",
    "category",
    "tags",
    "altText",
    "visualSummary",
    "catalogUse",
    "qualityWarnings",
    "threeDReadiness",
  ],
  properties: {
    name: { type: "string" },
    description: { type: "string" },
    materialType: { type: "string" },
    finishColor: { type: "string" },
    category: { type: "string" },
    tags: { type: "array", items: { type: "string" } },
    altText: { type: "string" },
    visualSummary: { type: "string" },
    catalogUse: { type: "array", items: { type: "string" } },
    qualityWarnings: { type: "array", items: { type: "string" } },
    threeDReadiness: {
      type: "object",
      additionalProperties: false,
      required: [
        "score",
        "silhouetteQuality",
        "textureClarity",
        "lighting",
        "occlusion",
        "recommendedCaptureAngles",
        "materialMapHints",
      ],
      properties: {
        score: { type: "integer" },
        silhouetteQuality: { type: "string" },
        textureClarity: { type: "string" },
        lighting: { type: "string" },
        occlusion: { type: "string" },
        recommendedCaptureAngles: {
          type: "array",
          items: { type: "string" },
        },
        materialMapHints: { type: "array", items: { type: "string" } },
      },
    },
  },
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
}

function requiredEnv(name: string) {
  const value = Deno.env.get(name);
  if (!value) throw new Error(`${name} is required`);
  return value;
}

function safeFileName(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9.]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function publicUrl(supabaseUrl: string, bucket: string, path: string) {
  return `${supabaseUrl.replace(/\/$/, "")}/storage/v1/object/public/${bucket}/${path}`;
}

function bytesToBase64(bytes: Uint8Array) {
  let binary = "";
  const chunkSize = 0x8000;
  for (let index = 0; index < bytes.length; index += chunkSize) {
    const chunk = bytes.subarray(index, index + chunkSize);
    binary += String.fromCharCode(...chunk);
  }
  return btoa(binary);
}

function base64ToBytes(value: string) {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
}

function getTextOutput(response: Record<string, unknown>) {
  if (typeof response.output_text === "string") return response.output_text;

  const output = Array.isArray(response.output) ? response.output : [];
  return output
    .flatMap((item) =>
      Array.isArray(item?.content)
        ? item.content.map((content) => content?.text ?? "")
        : [],
    )
    .join("")
    .trim();
}

async function fetchImage({
  supabase,
  supabaseUrl,
  bucket,
  storagePath,
  imageUrl,
}: {
  supabase: ReturnType<typeof createClient>;
  supabaseUrl: string;
  bucket: string;
  storagePath?: string;
  imageUrl?: string;
}) {
  const url = imageUrl || (storagePath ? publicUrl(supabaseUrl, bucket, storagePath) : "");

  if (url) {
    const response = await fetch(url);
    if (response.ok) {
      const bytes = new Uint8Array(await response.arrayBuffer());
      return {
        bytes,
        mimeType: response.headers.get("content-type") || "image/jpeg",
        url,
      };
    }
  }

  if (!storagePath) throw new Error("Image URL or storage path is required");

  const { data, error } = await supabase.storage.from(bucket).download(storagePath);
  if (error) throw new Error(error.message);

  return {
    bytes: new Uint8Array(await data.arrayBuffer()),
    mimeType: data.type || "image/jpeg",
    url: publicUrl(supabaseUrl, bucket, storagePath),
  };
}

async function generateMetadata({
  openAiKey,
  imageUrl,
  imageBytes,
  mimeType,
  context,
}: {
  openAiKey: string;
  imageUrl: string;
  imageBytes: Uint8Array;
  mimeType: string;
  context: Record<string, unknown>;
}) {
  const model = Deno.env.get("OPENAI_VISION_MODEL") || "gpt-5-mini";
  const imageInputUrl =
    imageUrl || `data:${mimeType};base64,${bytesToBase64(imageBytes)}`;

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${openAiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      input: [
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text:
                "You are Vizora's product image analyst for premium fabrication and interior catalogs. " +
                "Analyze the product image for showroom/catalog use. Return concise but premium metadata. " +
                "Do not invent unavailable dimensions or pricing. Favor specific material, finish, room/use, fabrication, and style tags. " +
                "Also judge whether this single image is useful for downstream 3D asset preparation, while noting that true 3D reconstruction requires multi-angle captures. " +
                `Known product context: ${JSON.stringify(context)}`,
            },
            {
              type: "input_image",
              image_url: imageInputUrl,
              detail: "high",
            },
          ],
        },
      ],
      text: {
        format: {
          type: "json_schema",
          name: "vizora_product_image_analysis",
          strict: true,
          schema: metadataSchema,
        },
      },
    }),
  });

  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload?.error?.message || "OpenAI metadata request failed");
  }

  const text = getTextOutput(payload);
  if (!text) throw new Error("OpenAI metadata response was empty");
  return JSON.parse(text);
}

async function removeBackground({
  openAiKey,
  imageBytes,
  mimeType,
  fileName,
}: {
  openAiKey: string;
  imageBytes: Uint8Array;
  mimeType: string;
  fileName: string;
}) {
  const model = Deno.env.get("OPENAI_IMAGE_MODEL") || "gpt-image-1.5";
  const formData = new FormData();
  formData.append("model", model);
  formData.append(
    "prompt",
    [
      "Create a premium product cutout for an interior/fabrication catalog.",
      "Remove only the background and preserve the exact product geometry, edges, proportions, finish, grain, texture, and visible fabrication details.",
      "Return a transparent PNG with clean alpha, no new shadows, no labels, no styling changes, no scene, no invented parts, and no cropping of the object.",
      "Optimize the silhouette for downstream masking, product comparison, and future 3D asset preparation.",
    ].join(" "),
  );
  formData.append(
    "image",
    new File([imageBytes], safeFileName(fileName || "product-image.jpg"), {
      type: mimeType || "image/jpeg",
    }),
  );
  formData.append("background", "transparent");
  formData.append("output_format", "png");
  formData.append("quality", Deno.env.get("OPENAI_IMAGE_QUALITY") || "high");
  formData.append("size", Deno.env.get("OPENAI_IMAGE_SIZE") || "auto");
  if (model.startsWith("gpt-image-")) formData.append("input_fidelity", "high");

  const response = await fetch("https://api.openai.com/v1/images/edits", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${openAiKey}`,
    },
    body: formData,
  });

  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload?.error?.message || "OpenAI background removal failed");
  }

  const base64 = payload?.data?.[0]?.b64_json;
  if (!base64) throw new Error("OpenAI image edit did not return image data");

  return base64ToBytes(base64);
}

serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }

  try {
    const openAiKey = requiredEnv("OPENAI_API_KEY");
    const supabaseUrl = requiredEnv("SUPABASE_URL");
    const serviceRoleKey = requiredEnv("SUPABASE_SERVICE_ROLE_KEY");
    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const body = await request.json();
    const bucket = body.bucket || "product-images";
    const productId = body.productId || null;
    const imageId = body.imageId || null;
    const operations = {
      generateMetadata: body.operations?.generateMetadata !== false,
      removeBackground: Boolean(body.operations?.removeBackground),
    };
    const writeMode = body.writeMode || "suggest";

    let product = null;
    if (productId) {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", productId)
        .maybeSingle();
      if (error) throw new Error(error.message);
      product = data;
    }

    const vendorId =
      body.vendorId ||
      product?.vendor_id ||
      Deno.env.get("VIZORA_VENDOR_ID") ||
      null;
    if (!vendorId) throw new Error("vendorId or productId is required");

    const image = await fetchImage({
      supabase,
      supabaseUrl,
      bucket,
      storagePath: body.storagePath,
      imageUrl: body.imageUrl,
    });

    const context = {
      sku: product?.sku ?? body.context?.sku ?? "",
      name: product?.name ?? body.context?.name ?? "",
      materialType: product?.material_type ?? body.context?.materialType ?? "",
      finishColor: product?.finish_color ?? body.context?.finishColor ?? "",
      currentDescription: product?.description ?? "",
      currentTags: product?.tags ?? [],
    };

    const metadata = operations.generateMetadata
      ? await generateMetadata({
          openAiKey,
          imageUrl: image.url,
          imageBytes: image.bytes,
          mimeType: image.mimeType,
          context,
        })
      : null;

    let cutout = null;
    if (operations.removeBackground) {
      const cutoutBytes = await removeBackground({
        openAiKey,
        imageBytes: image.bytes,
        mimeType: image.mimeType,
        fileName: body.fileName || body.storagePath || "product-image.jpg",
      });
      const cutoutPath = `${vendorId}/${productId || "unassigned"}/ai-cutouts/${Date.now()}-transparent-cutout.png`;
      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(cutoutPath, cutoutBytes, {
          contentType: "image/png",
          upsert: false,
        });
      if (uploadError) throw new Error(uploadError.message);

      const cutoutUrl = publicUrl(supabaseUrl, bucket, cutoutPath);
      cutout = {
        bucket,
        path: cutoutPath,
        publicUrl: cutoutUrl,
      };

      if (productId) {
        const { count, error: countError } = await supabase
          .from("product_images")
          .select("id", { count: "exact", head: true })
          .eq("product_id", productId);
        if (countError) throw new Error(countError.message);

        const { data: insertedImage, error: insertError } = await supabase
          .from("product_images")
          .insert({
            vendor_id: vendorId,
            product_id: productId,
            storage_path: cutoutPath,
            public_url: cutoutUrl,
            alt_text: metadata?.altText || "AI transparent product cutout",
            sort_order: count ?? 0,
            is_primary: false,
          })
          .select("*")
          .single();
        if (insertError) throw new Error(insertError.message);
        cutout.productImage = insertedImage;
      }
    }

    if (writeMode === "update" && productId && metadata) {
      const existingTags = Array.isArray(product?.tags) ? product.tags : [];
      const suggestedTags = Array.isArray(metadata.tags) ? metadata.tags : [];
      const mergedTags = Array.from(
        new Set([...existingTags, ...suggestedTags].map((tag) => String(tag).trim()).filter(Boolean)),
      ).slice(0, 12);

      const { data: updatedProduct, error: updateError } = await supabase
        .from("products")
        .update({
          description: metadata.description || product?.description || null,
          material_type: metadata.materialType || product?.material_type || null,
          finish_color: metadata.finishColor || product?.finish_color || null,
          tags: mergedTags,
          ai_metadata: metadata,
        })
        .eq("id", productId)
        .eq("vendor_id", vendorId)
        .select("*")
        .single();
      if (updateError) throw new Error(updateError.message);
      product = updatedProduct;
    }

    return json({
      productId,
      imageId,
      sourceImageUrl: image.url,
      metadata,
      cutout,
      updatedProduct: product,
    });
  } catch (error) {
    return json(
      { error: error instanceof Error ? error.message : "Unexpected AI failure" },
      500,
    );
  }
});
