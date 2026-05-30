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
import type { Category, ProductWithImages, Vendor } from "@/lib/types";

type ProductLayout = "hero" | "image" | "compact" | "detail";

const styles = StyleSheet.create({
  page: {
    padding: 34,
    backgroundColor: "#f5f5f6",
    color: "#282c3f",
    fontFamily: "Helvetica",
  },
  cover: {
    justifyContent: "space-between",
  },
  stripe: {
    height: 5,
    width: 180,
    flexDirection: "row",
    marginBottom: 28,
  },
  stripeA: { flex: 1, backgroundColor: "#ff905a" },
  stripeB: { flex: 1, backgroundColor: "#ff3f6c" },
  stripeC: { flex: 1, backgroundColor: "#f16565" },
  logo: {
    width: 92,
    height: 92,
    objectFit: "contain",
    marginBottom: 32,
  },
  eyebrow: {
    fontSize: 9,
    letterSpacing: 1.8,
    color: "#7e818c",
    textTransform: "uppercase",
    marginBottom: 10,
  },
  h1: {
    fontSize: 42,
    lineHeight: 1.08,
    fontWeight: 700,
    maxWidth: 430,
  },
  h2: {
    fontSize: 21,
    lineHeight: 1.2,
    fontWeight: 700,
    marginBottom: 14,
  },
  categoryTitle: {
    fontSize: 24,
    lineHeight: 1.16,
    fontWeight: 700,
    marginBottom: 14,
  },
  body: {
    fontSize: 11,
    lineHeight: 1.45,
    color: "#535766",
  },
  contact: {
    borderTop: "1px solid #e3e4e8",
    paddingTop: 18,
    gap: 5,
  },
  category: {
    marginBottom: 18,
  },
  product: {
    marginBottom: 28,
    breakInside: "avoid",
  },
  image: {
    width: "100%",
    height: 300,
    objectFit: "cover",
    marginBottom: 14,
  },
  heroImage: {
    width: "100%",
    height: 390,
    objectFit: "cover",
    marginBottom: 16,
  },
  compactProduct: {
    flexDirection: "row",
    gap: 14,
    marginBottom: 22,
    breakInside: "avoid",
  },
  compactImage: {
    width: 140,
    height: 110,
    objectFit: "cover",
  },
  metaRow: {
    flexDirection: "row",
    gap: 14,
    marginTop: 8,
    color: "#535766",
    fontSize: 10,
  },
  sku: {
    fontSize: 9,
    letterSpacing: 1.5,
    color: "#7e818c",
    textTransform: "uppercase",
    marginBottom: 5,
  },
  tags: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 9,
  },
  tag: {
    border: "1px solid #e3e4e8",
    backgroundColor: "#ffffff",
    padding: "3px 6px",
    fontSize: 8,
    color: "#535766",
    textTransform: "uppercase",
    letterSpacing: 1.1,
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

  return (
    <Document title={title} author={vendor.business_name}>
      <Page size="A4" style={[styles.page, styles.cover]}>
        <View>
          <View style={styles.stripe}>
            <View style={styles.stripeA} />
            <View style={styles.stripeB} />
            <View style={styles.stripeC} />
          </View>
          {vendor.logo_url ? <Image src={vendor.logo_url} style={styles.logo} /> : null}
          <Text style={styles.eyebrow}>{vendor.business_name}</Text>
          <Text style={styles.h1}>{coverTitle || title}</Text>
          {description ? <Text style={[styles.body, { marginTop: 18 }]}>{description}</Text> : null}
        </View>
        <View style={styles.contact}>
          <Text style={styles.body}>{vendor.contact_name}</Text>
          <Text style={styles.body}>{vendor.phone}</Text>
          <Text style={styles.body}>{vendor.email}</Text>
          <Text style={styles.body}>{vendor.website}</Text>
          <Text style={styles.body}>{vendor.address}</Text>
        </View>
      </Page>

      {grouped.map((group) => (
        <Page key={group.name} size="A4" style={styles.page}>
          <View style={styles.category}>
            <Text style={styles.eyebrow}>Category</Text>
            <Text style={styles.categoryTitle}>{group.name}</Text>
          </View>
          {group.products.map((product) => {
            const image = product.images.find((item) => item.is_primary) ?? product.images[0];
            const layout = layoutByProduct?.[product.id] ?? "image";
            if (layout === "compact") {
              return (
                <View key={product.id} style={styles.compactProduct}>
                  {image ? <Image src={image.public_url} style={styles.compactImage} /> : null}
                  <View style={{ flex: 1 }}>
                    <Text style={styles.sku}>{product.sku}</Text>
                    <Text style={styles.h2}>{product.name}</Text>
                    <View style={styles.tags}>
                      {product.tags.map((tag) => (
                        <Text key={tag} style={styles.tag}>
                          {tag}
                        </Text>
                      ))}
                    </View>
                  </View>
                </View>
              );
            }

            if (layout === "detail") {
              return (
                <View key={product.id} style={styles.product}>
                  <Text style={styles.sku}>{product.sku}</Text>
                  <Text style={styles.h2}>{product.name}</Text>
                  {product.description ? (
                    <Text style={styles.body}>{product.description}</Text>
                  ) : null}
                  <View style={styles.metaRow}>
                    {product.material_type ? (
                      <Text>Material: {product.material_type}</Text>
                    ) : null}
                    {product.finish_color ? (
                      <Text>Finish: {product.finish_color}</Text>
                    ) : null}
                  </View>
                  {image ? <Image src={image.public_url} style={[styles.image, { marginTop: 14 }]} /> : null}
                </View>
              );
            }

            return (
              <View key={product.id} style={styles.product}>
                {image ? (
                  <Image
                    src={image.public_url}
                    style={layout === "hero" ? styles.heroImage : styles.image}
                  />
                ) : null}
                <Text style={styles.sku}>{product.sku}</Text>
                <Text style={styles.h2}>{product.name}</Text>
                {product.description ? (
                  <Text style={styles.body}>{product.description}</Text>
                ) : null}
                <View style={styles.metaRow}>
                  {product.material_type ? (
                    <Text>Material: {product.material_type}</Text>
                  ) : null}
                  {product.finish_color ? (
                    <Text>Finish: {product.finish_color}</Text>
                  ) : null}
                </View>
                <View style={styles.tags}>
                  {product.tags.map((tag) => (
                    <Text key={tag} style={styles.tag}>
                      {tag}
                    </Text>
                  ))}
                </View>
              </View>
            );
          })}
        </Page>
      ))}
    </Document>
  );
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
