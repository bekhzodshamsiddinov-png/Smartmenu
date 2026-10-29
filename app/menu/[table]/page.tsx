import GuestMenu from "@/components/guest/GuestMenu";
import { getMenu } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const m = await getMenu();
  return { title: `${m.settings.name} — Menyu`, description: m.settings.tagline.uz };
}

export default async function Page({ params }: { params: Promise<{ table: string }> }) {
  const { table } = await params;
  const menu = await getMenu();
  return <GuestMenu initial={menu} tableId={decodeURIComponent(table)} />;
}
