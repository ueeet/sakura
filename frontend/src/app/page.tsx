import { publicApi } from "@/lib/publicApi";
import { HomeView } from "./HomeView";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  let promotions = [];
  try {
    promotions = await publicApi.getPromotions();
  } catch {
    promotions = [];
  }
  return <HomeView promotions={promotions} />;
}
