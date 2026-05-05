import { LawyerCasePackageDetailClient } from "@/components/lawyer/case-package/lawyer-case-package-detail-client";

type LawyerCasePackageDetailPageProps = {
  params: Promise<{
    shareId: string;
  }>;
};

export default async function LawyerCasePackageDetailPage({
  params,
}: LawyerCasePackageDetailPageProps) {
  const { shareId } = await params;

  return <LawyerCasePackageDetailClient shareId={shareId} />;
}
