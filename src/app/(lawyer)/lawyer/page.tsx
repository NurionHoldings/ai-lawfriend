import { requireLawyer } from "@/lib/auth/session";

export default async function LawyerPage() {
  const user = await requireLawyer();

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-bold">변호사 포털</h1>
      <div className="rounded-xl border p-4">
        <p>이름: {user.name}</p>
        <p>이메일: {user.email}</p>
        <p>권한: {user.role}</p>
      </div>
    </section>
  );
}
