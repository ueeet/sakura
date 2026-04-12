import { notFound } from "next/navigation";
import { publicApi } from "@/lib/publicApi";
import { SaunaDetailView } from "./SaunaDetailView";

export const revalidate = 60;

export default async function Complex9DetailPage({
  params,
}: {
  params: Promise<{ category: string; id: string }>;
}) {
  const { category, id } = await params;
  const slug = `complex-9-${category}-${id}`;

  try {
    const [sauna, branch] = await Promise.all([
      publicApi.getSaunaBySlug(slug),
      publicApi.getBranchBySlug("complex-9"),
    ]);

    const categoryName = branch.categories.find((c) => c.slug === category)?.name;

    return (
      <SaunaDetailView
        sauna={sauna}
        branchSlug="complex-9"
        branchName={branch.name}
        branchPhone={branch.phone}
        branchAddress={branch.address}
        categoryName={categoryName}
        categorySlug={category}
        backHref={`/complex-9?tab=${category}`}
      />
    );
  } catch {
    notFound();
  }
}
