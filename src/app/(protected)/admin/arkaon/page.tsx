import { ArkaonControlCenter } from "@/components/admin/arkaon/arkaon-control-center";
import { getArkaonControlCenterSnapshot } from "@/features/arkaon/arkaon.service";

export const dynamic = "force-dynamic";

export default async function ArkaonControlCenterPage() {
  const snapshot = await getArkaonControlCenterSnapshot();
  return <ArkaonControlCenter initialSnapshot={snapshot} />;
}
