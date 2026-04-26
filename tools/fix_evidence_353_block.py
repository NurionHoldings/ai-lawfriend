# -*- coding: utf-8 -*-
from pathlib import Path

p = Path("docs/project-governance/IMPLEMENTATION_EVIDENCE.md")
s = p.read_text(encoding="utf-8")
marker = "**이 표**에` **넣`지` **않`는`"
heading = "#### `353+` **별도** PR — **UI** **가**용**"
i0 = s.find(marker)
i1 = s.find(heading)
if i0 < 0 or i1 < 0 or i1 <= i0:
    raise SystemExit(f"markers not found: {i0=} {i1=}")
replacement = (
    "**이 표에 넣지 않는 것(아래 `353+` 전용 PR):** `getAllowedCaseActions` / `allowedLifecycleActions` **이중 축**"
    "([310] **남은 예외(2)**), [UI-03](ALIGNMENT_AUDIT_V1.md#6-11-화면-우선순위-및-화면-api-연결-정합성)·"
    "[LC-02](ALIGNMENT_AUDIT_V1.md#6-2-사건-라이프사이클-정합성) **판정 잔여**(§6-11).\n\n"
)
p.write_text(s[:i0] + replacement + s[i1:], encoding="utf-8")
print("OK")
