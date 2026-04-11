import { notFound } from "next/navigation";
import { publicApi } from "@/lib/publicApi";
import { SaunaDetailView } from "../../complex-9/[category]/[id]/SaunaDetailView";

export const dynamic = "force-dynamic";

export default async function Complex50DetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const slug = `complex-50-${id}`;

  try {
    const [sauna, branch] = await Promise.all([
      publicApi.getSaunaBySlug(slug),
      publicApi.getBranchBySlug("complex-50"),
    ]);

    return (
      <SaunaDetailView
        sauna={sauna}
        branchSlug="complex-50"
        branchName={branch.name}
        branchPhone={branch.phone}
        branchAddress={branch.address}
        backHref="/complex-50"
      />
    );
  } catch {
    notFound();
  }
}
