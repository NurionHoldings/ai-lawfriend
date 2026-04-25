import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/get-session-user";
import { assertPermission, permissionContextFromSession } from "@/lib/authz";
import { DocumentTemplateEditor } from "@/components/admin/document-template-editor";

export default async function AdminDocumentTemplateDetailPage({
  params,
}: {
  params: Promise<{ templateId: string }>;
}) {
  const { templateId } = await params;
  const sessionUser = await getSessionUser();

  if (!sessionUser) {
    redirect("/login");
  }

  assertPermission("documentTemplate.read", permissionContextFromSession(sessionUser, {}));

  const item = await prisma.documentTemplate.findUnique({
    where: { id: templateId },
  });

  if (!item) {
    notFound();
  }

  return (
    <div className="space-y-4 p-6">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-gray-600">
        <Link
          href="/admin/document-templates"
          className="underline hover:text-gray-900"
          title="목록 · ?catalog=·?page= 칩과 서버 catalogStatus 조회가 같습니다"
        >
          ← 문서 템플릿 목록
        </Link>
        <span className="text-gray-300" aria-hidden>
          |
        </span>
        <Link
          href="/admin/question-sets"
          className="underline hover:text-gray-900"
          title="상태 열과 같은 한글: 초안·게시됨·보관됨"
        >
          인터뷰 질문셋 관리
        </Link>
        <span className="text-gray-300" aria-hidden>
          |
        </span>
        <Link href="/admin" className="underline hover:text-gray-900" title="관리자 콘솔">
          관리자 콘솔
        </Link>
      </div>
      <p className="text-xs leading-relaxed text-gray-500">
        이 화면은 <strong className="font-medium text-slate-700">편집</strong>입니다. 목록으로 돌아가면
        항목은 <strong className="font-medium text-slate-700">수정일 최신 순</strong>(목록 상단 안내와 동일)으로
        보입니다. 칩·주소의{" "}
        <span className="whitespace-nowrap font-mono text-[0.7rem]">?catalog=</span>·
        <span className="whitespace-nowrap font-mono text-[0.7rem]">?page=</span>는 인터뷰 질문셋 관리와
        같은 카탈로그·페이지 규칙입니다.
      </p>

      <DocumentTemplateEditor
        item={{
          id: item.id,
          code: item.code,
          version: item.version,
          type: item.type,
          title: item.title,
          description: item.description,
          definitionJson: item.definitionJson,
          updatedAt: item.updatedAt.toISOString(),
          catalogStatus: item.catalogStatus,
          publishedAt: item.publishedAt?.toISOString() ?? null,
          archivedAt: item.archivedAt?.toISOString() ?? null,
        }}
      />
    </div>
  );
}
