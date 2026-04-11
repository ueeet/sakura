import { publicApi } from "@/lib/publicApi";
import type { Sauna } from "@/lib/types";
import { SearchView } from "./SearchView";

export const dynamic = "force-dynamic";

export default async function SearchPage() {
  let saunas: Sauna[] = [];
  try {
    saunas = await publicApi.getSaunas();
  } catch {
    saunas = [];
  }
  return <SearchView allSaunas={saunas} />;
}
