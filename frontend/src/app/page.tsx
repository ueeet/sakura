import { publicApi } from "@/lib/publicApi";
import type { Promotion } from "@/lib/types";
import { HomeView } from "./HomeView";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  let promotions: Promotion[] = [];
  try {
    promotions = await publicApi.getPromotions();
  } catch {
    promotions = [];
  }
  return <HomeView promotions={promotions} />;
}
