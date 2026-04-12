import { publicApi } from "@/lib/publicApi";
import type { Sauna } from "@/lib/types";
import { SearchView } from "./SearchView";

export const revalidate = 60;

export default async function SearchPage() {
  let saunas: Sauna[] = [];
  try {
    saunas = await publicApi.getSaunas();
  } catch {
    saunas = [];
  }
  return <SearchView allSaunas={saunas} />;
}
