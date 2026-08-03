import ProductPage from "../page";

export default async function ProductSlugPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <ProductPage identifier={slug} />;
}
