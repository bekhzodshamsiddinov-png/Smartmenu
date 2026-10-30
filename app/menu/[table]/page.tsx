import GuestMenu from "@/components/guest/GuestMenu";
import { getMenu, soldToday } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const m = await getMenu();
  return { title: `${m.settings.name} — Menyu`, description: m.settings.tagline.uz };
}

export default async function Page({ params }: { params: Promise<{ table: string }> }) {
  const { table } = await params;
  const [menu, sold] = await Promise.all([getMenu(), soldToday().catch(() => ({}))]);
  return <GuestMenu initial={menu} sold={sold} tableId={decodeURIComponent(table)} />;
}
