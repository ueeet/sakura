import { publicApi } from "@/lib/publicApi";
import type { Promotion, HomeSlide } from "@/lib/types";
import { HomeView } from "./HomeView";

// Кеш главной на 60с — акции и слайды меняются редко.
// Раньше было force-dynamic, из-за которого каждый заход на "/" блокировал
// страницу запросом к backend → Supabase во Франкфурте (3-6 секунд SSR).
export const revalidate = 60;

export default async function HomePage() {
  // Параллельные запросы — ни один не блокирует другой.
  const [promotions, slides] = await Promise.all([
    publicApi.getPromotions().catch((): Promotion[] => []),
    publicApi.getHomeSlides().catch((): HomeSlide[] => []),
  ]);
  return <HomeView promotions={promotions} slides={slides} />;
}
