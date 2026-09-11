import { GuestCaseDemoPreview } from "@/components/auth/guest-case-demo-preview";

type Props = Readonly<{
  params: Promise<{ slug?: string[] }>;
}>;

export default async function GuestCaseDemoPage({ params }: Props) {
  const resolved = await params;
  const slug = resolved.slug?.[0];
  const variant = slug === "wage" ? "wage" : "default";
  return <GuestCaseDemoPreview variant={variant} />;
}
