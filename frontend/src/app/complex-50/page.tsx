import { notFound } from "next/navigation";
import { publicApi } from "@/lib/publicApi";
import { Complex50View } from "./Complex50View";

export const dynamic = "force-dynamic";

export default async function Complex50Page() {
  try {
    const branch = await publicApi.getBranchBySlug("complex-50");
    return <Complex50View branch={branch} />;
  } catch {
    notFound();
  }
}
