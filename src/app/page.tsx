import { AibeopchinEntryAnimation } from "@/components/brand/aibeopchin-entry-animation";
import { AibeopchinSpaceMenuHome } from "@/components/brand/aibeopchin-space-menu-home";

/**
 * 공개 진입 화면.
 * 진입 애니메이션 후 우주 배경 + 3D 캐릭터 + 말풍선 + 메뉴 버튼만 노출한다.
 */
export default function HomePage() {
  return (
    <>
      <AibeopchinEntryAnimation />
      <AibeopchinSpaceMenuHome />
    </>
  );
}
