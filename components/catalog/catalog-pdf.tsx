"use client";

/* eslint-disable jsx-a11y/alt-text */

import {
  Document,
  Image,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";
import type {
  Category,
  ProductWithImages,
  Vendor,
} from "@/lib/types";

type ProductLayout = "hero" | "image" | "compact" | "detail";

const PAGE_SIZE: [number, number] = [648, 864];
const ACCENT = "#ffb300";
const ACCENT_DARK = "#d68200";
const BLUE = "#24529a";
const ICE = "#deded4";
const INK = "#222222";
const BODY = "#535353";
const MUTED = "#7a7a72";
const LINE = "#d4d4cc";

const styles = StyleSheet.create({
  page: {
    position: "relative",
    padding: 42,
    backgroundColor: "#ffffff",
    color: INK,
    fontFamily: "Helvetica",
  },
  coverPage: {
    padding: 0,
    backgroundColor: ACCENT,
  },
  coverPatternTop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 150,
    backgroundColor: "#ffc22a",
    opacity: 0.55,
  },
  coverInner: {
    padding: 42,
    height: "100%",
    justifyContent: "space-between",
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  brandMark: {
    width: 54,
    height: 54,
    borderRadius: 28,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
  },
  brandInitial: {
    fontSize: 28,
    fontWeight: 700,
  },
  brandName: {
    fontSize: 30,
    fontWeight: 700,
  },
  brandSub: {
    marginTop: 3,
    fontSize: 9,
    letterSpacing: 1.4,
    textTransform: "uppercase",
  },
  coverHero: {
    marginTop: 54,
    alignItems: "center",
  },
  coverCircle: {
    width: 390,
    height: 390,
    borderRadius: 195,
    border: `5px solid rgba(255,255,255,0.26)`,
    backgroundColor: "#f7f2e8",
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  coverImage: {
    width: 390,
    height: 390,
    objectFit: "cover",
  },
  coverTitleBlock: {
    alignItems: "center",
    marginTop: -18,
  },
  coverTitle: {
    fontSize: 42,
    lineHeight: 1.02,
    fontWeight: 700,
    textAlign: "center",
    maxWidth: 460,
  },
  coverDesc: {
    marginTop: 10,
    fontSize: 17,
    lineHeight: 1.28,
    textAlign: "center",
    maxWidth: 420,
  },
  coverContact: {
    marginTop: 26,
    borderTop: "1px solid rgba(34,34,34,0.28)",
    paddingTop: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 18,
  },
  contactCol: {
    flex: 1,
  },
  tinyLabel: {
    fontSize: 7.5,
    letterSpacing: 1.2,
    color: MUTED,
    textTransform: "uppercase",
  },
  contactText: {
    marginTop: 4,
    fontSize: 10,
    lineHeight: 1.35,
  },
  categoryPage: {
    backgroundColor: "#ffffff",
  },
  categoryShape: {
    position: "absolute",
    top: 46,
    right: 0,
    width: 295,
    height: 72,
    borderTopLeftRadius: 36,
    backgroundColor: ICE,
  },
  categoryTextWrap: {
    marginTop: 165,
    width: 410,
  },
  categoryEyebrow: {
    fontSize: 10,
    letterSpacing: 1.8,
    textTransform: "uppercase",
    color: MUTED,
    marginBottom: 16,
  },
  categoryTitle: {
    fontSize: 42,
    lineHeight: 1.02,
    fontWeight: 700,
    textTransform: "uppercase",
  },
  categoryDesc: {
    marginTop: 20,
    fontSize: 13,
    lineHeight: 1.45,
    color: BODY,
  },
  categoryMetaBar: {
    marginTop: 36,
    width: 270,
    height: 7,
    flexDirection: "row",
  },
  metaAccentA: { flex: 1, backgroundColor: ACCENT },
  metaAccentB: { flex: 1, backgroundColor: BLUE },
  metaAccentC: { flex: 1, backgroundColor: ACCENT_DARK },
  productPage: {
    backgroundColor: "#ffffff",
    padding: 34,
  },
  productNamePillRight: {
    position: "absolute",
    top: 40,
    right: 34,
    minWidth: 230,
    maxWidth: 370,
    height: 44,
    paddingHorizontal: 22,
    borderTopLeftRadius: 22,
    backgroundColor: BLUE,
    justifyContent: "center",
  },
  productNamePillLeft: {
    position: "absolute",
    top: 40,
    left: 34,
    minWidth: 230,
    maxWidth: 370,
    height: 44,
    paddingHorizontal: 22,
    borderTopRightRadius: 22,
    backgroundColor: BLUE,
    justifyContent: "center",
  },
  productNameText: {
    color: "#ffffff",
    fontSize: 22,
    fontWeight: 700,
    textTransform: "uppercase",
  },
  sku: {
    position: "absolute",
    top: 46,
    left: 38,
    fontSize: 10,
    letterSpacing: 1.3,
    textTransform: "uppercase",
    color: MUTED,
  },
  skuRight: {
    left: "auto",
    right: 38,
  },
  heroWrap: {
    position: "absolute",
    top: 106,
    left: 128,
    width: 392,
    height: 390,
    alignItems: "center",
    justifyContent: "center",
  },
  heroWrapWide: {
    top: 98,
    left: 95,
    width: 455,
    height: 420,
  },
  productImage: {
    width: "100%",
    height: "100%",
    objectFit: "contain",
  },
  imagePlaceholder: {
    width: "100%",
    height: "100%",
    border: `1px solid ${LINE}`,
    backgroundColor: "#f6f6f2",
    alignItems: "center",
    justifyContent: "center",
  },
  sideRailLeft: {
    position: "absolute",
    top: 102,
    left: 34,
    width: 94,
    alignItems: "center",
  },
  sideRailRight: {
    position: "absolute",
    top: 102,
    right: 34,
    width: 94,
    alignItems: "center",
  },
  optionBadge: {
    width: 72,
    height: 82,
    borderRadius: 10,
    backgroundColor: ACCENT,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },
  optionNumber: {
    fontSize: 36,
    lineHeight: 1,
    fontWeight: 700,
  },
  optionLabel: {
    marginTop: 2,
    fontSize: 9,
    letterSpacing: 1.2,
    textTransform: "uppercase",
    fontWeight: 700,
  },
  featureItem: {
    width: 86,
    borderTop: `2px solid ${ACCENT}`,
    paddingTop: 7,
    marginBottom: 17,
  },
  featureTitle: {
    fontSize: 9,
    lineHeight: 1.18,
    fontWeight: 700,
    textTransform: "uppercase",
  },
  featureCaption: {
    marginTop: 3,
    fontSize: 7.2,
    lineHeight: 1.2,
    color: BODY,
  },
  variantRow: {
    position: "absolute",
    left: 68,
    right: 68,
    bottom: 144,
    flexDirection: "row",
    justifyContent: "center",
    gap: 14,
  },
  variantItem: {
    width: 72,
    alignItems: "center",
  },
  variantImageWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    border: `1px solid ${LINE}`,
    backgroundColor: "#ffffff",
    overflow: "hidden",
    marginBottom: 6,
  },
  variantImage: {
    width: 64,
    height: 64,
    objectFit: "cover",
  },
  variantDot: {
    width: 64,
    height: 64,
    borderRadius: 32,
    border: `1px solid ${LINE}`,
    backgroundColor: "#f1eee6",
    marginBottom: 6,
  },
  variantLabel: {
    fontSize: 8.2,
    lineHeight: 1.1,
    textAlign: "center",
    fontWeight: 700,
  },
  variantSub: {
    fontSize: 7.2,
    lineHeight: 1.1,
    color: BODY,
    textAlign: "center",
  },
  bottomPanel: {
    position: "absolute",
    left: 34,
    right: 34,
    bottom: 34,
    minHeight: 90,
    border: `1px solid ${LINE}`,
    borderRadius: 14,
    overflow: "hidden",
    flexDirection: "row",
  },
  bulletPanel: {
    width: 210,
    padding: 12,
    borderRight: `1px solid ${LINE}`,
    justifyContent: "center",
  },
  bulletText: {
    fontSize: 9,
    lineHeight: 1.22,
    marginBottom: 4,
    color: BODY,
  },
  specsPanel: {
    flex: 1,
  },
  specsHeader: {
    height: 28,
    backgroundColor: ICE,
    flexDirection: "row",
    alignItems: "center",
  },
  specsRow: {
    flexDirection: "row",
    minHeight: 28,
    alignItems: "center",
    borderTop: `1px solid ${LINE}`,
  },
  specCell: {
    flex: 1,
    paddingHorizontal: 6,
  },
  specHead: {
    fontSize: 7.5,
    lineHeight: 1.05,
    fontWeight: 700,
    textAlign: "center",
  },
  specValue: {
    fontSize: 8,
    lineHeight: 1.15,
    color: BODY,
    textAlign: "center",
  },
  descriptionBox: {
    position: "absolute",
    left: 150,
    right: 150,
    bottom: 244,
    alignItems: "center",
  },
  productDesc: {
    fontSize: 10.2,
    lineHeight: 1.35,
    color: BODY,
    textAlign: "center",
  },
  pageNumber: {
    position: "absolute",
    bottom: 18,
    right: 36,
    fontSize: 10,
    color: INK,
  },
  pageNumberLeft: {
    right: "auto",
    left: 36,
  },
});

export function CatalogPdfDocument({
  vendor,
  categories,
  products,
  title,
  coverTitle,
  description,
  layoutByProduct,
}: {
  vendor: Vendor;
  categories: Category[];
  products: ProductWithImages[];
  title: string;
  coverTitle: string;
  description?: string;
  layoutByProduct?: Record<string, ProductLayout>;
}) {
  const grouped = groupProducts(categories, products);
  const coverImage = findCoverImage(products);
  let pageNumber = 1;

  return (
    <Document title={title} author={vendor.business_name}>
      <Page size={PAGE_SIZE} style={[styles.coverPage]}>
        <View style={styles.coverPatternTop} />
        <View style={styles.coverInner}>
          <View>
            <View style={styles.brandRow}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                {vendor.logo_url ? (
                  <Image src={vendor.logo_url} style={styles.brandMark} />
                ) : (
                  <View style={styles.brandMark}>
                    <Text style={styles.brandInitial}>
                      {vendor.business_name.slice(0, 1).toUpperCase()}
                    </Text>
                  </View>
                )}
                <View>
                  <Text style={styles.brandName}>{vendor.business_name}</Text>
                  <Text style={styles.brandSub}>Showroom catalogue</Text>
                </View>
              </View>
            </View>

            <View style={styles.coverHero}>
              <View style={styles.coverCircle}>
                {coverImage ? (
                  <Image src={coverImage.public_url} style={styles.coverImage} />
                ) : (
                  <Text style={styles.coverDesc}>No product image selected</Text>
                )}
              </View>
              <View style={styles.coverTitleBlock}>
                <Text style={styles.coverTitle}>{coverTitle || title}</Text>
                {description ? (
                  <Text style={styles.coverDesc}>{description}</Text>
                ) : null}
              </View>
            </View>
          </View>

          <View style={styles.coverContact}>
            <ContactItem label="Prepared by" value={vendor.contact_name || vendor.business_name} />
            <ContactItem label="Phone" value={vendor.phone} />
            <ContactItem label="Email" value={vendor.email} />
            <ContactItem label="Website" value={vendor.website || vendor.address} />
          </View>
        </View>
      </Page>

      {grouped.flatMap((group) => {
        const categoryPageNumber = ++pageNumber;
        const productPages = group.products.map((product, productIndex) => {
          const currentPage = ++pageNumber;
          return (
            <ProductPage
              key={product.id}
              product={product}
              categoryName={group.name}
              pageNumber={currentPage}
              reverse={productIndex % 2 === 1}
              layout={layoutByProduct?.[product.id] ?? "image"}
            />
          );
        });

        return [
          <CategoryDivider
            key={`category-${group.name}`}
            groupName={group.name}
            productCount={group.products.length}
            pageNumber={categoryPageNumber}
          />,
          ...productPages,
        ];
      })}
    </Document>
  );
}

function ContactItem({
  label,
  value,
}: {
  label: string;
  value?: string | null;
}) {
  if (!value) return <View style={styles.contactCol} />;

  return (
    <View style={styles.contactCol}>
      <Text style={styles.tinyLabel}>{label}</Text>
      <Text style={styles.contactText}>{value}</Text>
    </View>
  );
}

function CategoryDivider({
  groupName,
  productCount,
  pageNumber,
}: {
  groupName: string;
  productCount: number;
  pageNumber: number;
}) {
  return (
    <Page size={PAGE_SIZE} style={[styles.page, styles.categoryPage]}>
      <View style={styles.categoryShape} />
      <View style={styles.categoryTextWrap}>
        <Text style={styles.categoryEyebrow}>Product category</Text>
        <Text style={styles.categoryTitle}>{groupName}</Text>
        <Text style={styles.categoryDesc}>
          A focused edit of {productCount} showroom SKU
          {productCount === 1 ? "" : "s"} with visual references, finish options,
          and decision-ready product details.
        </Text>
        <View style={styles.categoryMetaBar}>
          <View style={styles.metaAccentA} />
          <View style={styles.metaAccentB} />
          <View style={styles.metaAccentC} />
        </View>
      </View>
      <Text style={styles.pageNumber}>{formatPageNumber(pageNumber)}</Text>
    </Page>
  );
}

function ProductPage({
  product,
  categoryName,
  pageNumber,
  reverse,
  layout,
}: {
  product: ProductWithImages;
  categoryName: string;
  pageNumber: number;
  reverse: boolean;
  layout: ProductLayout;
}) {
  const primaryImage = getPrimaryImage(product);
  const variants = getVariantItems(product);
  const features = getFeatureItems(product, categoryName);
  const specs = getSpecItems(product, categoryName);
  const isHero = layout === "hero";

  return (
    <Page size={PAGE_SIZE} style={[styles.page, styles.productPage]}>
      <Text style={reverse ? [styles.sku, styles.skuRight] : styles.sku}>
        {product.sku}
      </Text>
      <View
        style={reverse ? styles.productNamePillLeft : styles.productNamePillRight}
      >
        <Text style={styles.productNameText}>{product.name}</Text>
      </View>

      <View style={reverse ? styles.sideRailRight : styles.sideRailLeft}>
        <View style={styles.optionBadge}>
          <Text style={styles.optionNumber}>
            {String(product.options.length || product.images.length || 1)}
          </Text>
          <Text style={styles.optionLabel}>
            {product.options.length === 1 ? "Option" : "Options"}
          </Text>
        </View>
        {features.map((feature) => (
          <View key={feature.title} style={styles.featureItem}>
            <Text style={styles.featureTitle}>{feature.title}</Text>
            {feature.caption ? (
              <Text style={styles.featureCaption}>{feature.caption}</Text>
            ) : null}
          </View>
        ))}
      </View>

      <View style={isHero ? styles.heroWrapWide : styles.heroWrap}>
        {primaryImage ? (
          <Image src={primaryImage.public_url} style={styles.productImage} />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Text style={styles.productDesc}>No image uploaded</Text>
          </View>
        )}
      </View>

      {product.description ? (
        <View style={styles.descriptionBox}>
          <Text style={styles.productDesc}>{product.description}</Text>
        </View>
      ) : null}

      {variants.length ? (
        <View style={styles.variantRow}>
          {variants.slice(0, 6).map((variant) => (
            <View key={variant.key} style={styles.variantItem}>
              {variant.image ? (
                <View style={styles.variantImageWrap}>
                  <Image
                    src={variant.image.public_url}
                    style={styles.variantImage}
                  />
                </View>
              ) : (
                <View style={styles.variantDot} />
              )}
              <Text style={styles.variantLabel}>{variant.label}</Text>
              {variant.subLabel ? (
                <Text style={styles.variantSub}>{variant.subLabel}</Text>
              ) : null}
            </View>
          ))}
        </View>
      ) : null}

      <View style={styles.bottomPanel}>
        <View style={styles.bulletPanel}>
          {getBulletPoints(product).map((item) => (
            <Text key={item} style={styles.bulletText}>
              - {item}
            </Text>
          ))}
        </View>
        <View style={styles.specsPanel}>
          <View style={styles.specsHeader}>
            {specs.map((spec) => (
              <View key={spec.label} style={styles.specCell}>
                <Text style={styles.specHead}>{spec.label}</Text>
              </View>
            ))}
          </View>
          <View style={styles.specsRow}>
            {specs.map((spec) => (
              <View key={spec.label} style={styles.specCell}>
                <Text style={styles.specValue}>{spec.value}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      <Text
        style={
          reverse
            ? [styles.pageNumber, styles.pageNumberLeft]
            : styles.pageNumber
        }
      >
        {formatPageNumber(pageNumber)}
      </Text>
    </Page>
  );
}

function getPrimaryImage(product: ProductWithImages) {
  return product.images.find((item) => item.is_primary) ?? product.images[0];
}

function getImageById(product: ProductWithImages, imageId: string | null) {
  if (!imageId) return null;
  return product.images.find((image) => image.id === imageId) ?? null;
}

function getVariantItems(product: ProductWithImages) {
  if (product.options.length) {
    return product.options.map((option) => ({
      key: option.id,
      label: option.label,
      subLabel: option.finish_color ?? undefined,
      image: getImageById(product, option.image_id),
    }));
  }

  return product.images.slice(1, 7).map((image, index) => ({
    key: image.id,
    label: `View ${index + 2}`,
    subLabel: image.alt_text ?? undefined,
    image,
  }));
}

function getFeatureItems(product: ProductWithImages, categoryName: string) {
  const values = [
    {
      title: shortText(product.material_type || categoryName, 22),
      caption: product.material_type ? "material" : "category",
    },
    {
      title: shortText(product.finish_color || "Finish ready", 24),
      caption: "finish",
    },
    {
      title: `${product.images.length || 0} image${product.images.length === 1 ? "" : "s"}`,
      caption: "visual reference",
    },
    {
      title: `${product.options.length || 1} option${product.options.length === 1 ? "" : "s"}`,
      caption: "selection",
    },
  ];

  return values.slice(0, 4);
}

function getSpecItems(product: ProductWithImages, categoryName: string) {
  return [
    { label: "Category", value: categoryName },
    { label: "Material", value: product.material_type || "As shown" },
    { label: "Finish", value: product.finish_color || "To confirm" },
    { label: "Images", value: String(product.images.length || 0) },
    { label: "Options", value: String(product.options.length || 1) },
    { label: "SKU", value: product.sku },
  ];
}

function getBulletPoints(product: ProductWithImages) {
  const bullets = [
    product.material_type ? `${product.material_type} material` : "Visual product reference",
    product.finish_color ? `${product.finish_color} finish` : "Finish to be confirmed",
    product.featured ? "Featured showroom SKU" : "Catalogue-ready SKU",
    ...product.tags.slice(0, 2),
  ];

  return bullets.filter(Boolean).slice(0, 5);
}

function findCoverImage(products: ProductWithImages[]) {
  return (
    products.find((product) => product.featured && getPrimaryImage(product))?.images[0] ??
    products.map(getPrimaryImage).find(Boolean) ??
    null
  );
}

function formatPageNumber(value: number) {
  return String(value).padStart(2, "0");
}

function shortText(value: string, maxLength: number) {
  if (value.length <= maxLength) return value;
  return `${value.slice(0, maxLength - 1).trim()}...`;
}

function groupProducts(categories: Category[], products: ProductWithImages[]) {
  const categoryById = new Map(categories.map((category) => [category.id, category]));
  const groupMap = new Map<string, { name: string; products: ProductWithImages[] }>();

  for (const product of products) {
    const name =
      (product.category_id && categoryById.get(product.category_id)?.name) ||
      "Uncategorized";
    groupMap.set(name, {
      name,
      products: [...(groupMap.get(name)?.products ?? []), product],
    });
  }

  return Array.from(groupMap.values());
}
