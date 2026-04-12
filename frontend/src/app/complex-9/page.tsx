import { notFound } from "next/navigation";
import { publicApi } from "@/lib/publicApi";
import { Complex9View } from "./Complex9View";

export const revalidate = 60;

export default async function Complex9Page() {
  try {
    const branch = await publicApi.getBranchBySlug("complex-9");
    return <Complex9View branch={branch} />;
  } catch {
    notFound();
  }
}
