import AdminApp from "@/components/admin/AdminApp";
import { getMenu } from "@/lib/store";

export const dynamic = "force-dynamic";
export const metadata = { title: "SmartMenu — Admin", robots: { index: false } };

export default async function Page() {
  return <AdminApp initialMenu={await getMenu()} />;
}
