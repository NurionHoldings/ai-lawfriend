export default function NotFoundPage() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center p-6">
      <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <h1 className="text-xl font-semibold text-slate-900">
          페이지를 찾을 수 없습니다.
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          주소가 변경되었거나 삭제되었을 수 있습니다.
        </p>
      </div>
    </div>
  );
}
