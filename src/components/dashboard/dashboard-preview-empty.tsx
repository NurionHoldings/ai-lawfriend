type Props = {
  message: string;
};

export function DashboardPreviewEmpty({ message }: Props) {
  return (
    <p className="mt-5 rounded-2xl bg-white/[0.04] p-4 text-sm leading-6 text-slate-300">
      {message}
    </p>
  );
}
