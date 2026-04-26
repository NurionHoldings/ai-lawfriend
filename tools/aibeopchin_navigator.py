#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
AI법친 프로젝트 진행 내비게이터

목적
- 프로젝트의 기준 계획/순서를 고정한다.
- 다음 세션용 브리핑 초안을 생성한다.
- 저장소 안에 구 상태명(OPEN, IN_PROGRESS 등)이 섞였는지 검사한다.
- 본선 기준 파일이 없으면 구 자료를 현행 정의로 오인하지 않도록 경고한다.

check-status 관련 (중요) — [FILE-034] 경고·exit 1을 곧바로 구현 품질(사건 CaseStatus) 오류로
  보지 말고 docs/project-governance/IMPLEMENTATION_EVIDENCE.md §4-1,
  CASE_STATUS_DEFINITION §5.1을 본다(휴리스틱).

- LEGACY_TERMS(OPEN, IN_PROGRESS, DONE)는 단어 경계(\\b)로만 찾는 휴리스틱이다.
- 기본(--scope all)은 저장소 전체 텍스트를 스캔하므로, 알림·OPS·기타 도메인의 동일
  영단어도 대량으로 걸린다. 이는 사건(Case) 상태 정리 여부와 자동으로 일치하지 않는다.
- 사건 상태 문자열만 좁히려면 --scope case 를 사용한다(사건 API·컴포넌트·정의 모듈 등
  일부 경로만 검사).

사용 예시
1) 계획 보기
   python tools/aibeopchin_navigator.py show-plan

2) 상태 검사(전체 저장소)
   python tools/aibeopchin_navigator.py check-status

2b) 사건 도메인만 검사
   python tools/aibeopchin_navigator.py check-status --scope case

3) 다음 세션 브리핑 생성
   python tools/aibeopchin_navigator.py make-brief \
       --phase 1 \
       --done "상태 기준 규칙 반영" \
       --next "상태값 정의서 작성" \
       --output docs/project-governance/NEXT_SESSION_BRIEF.md

4) 다른 루트 폴더 검사
   python tools/aibeopchin_navigator.py check-status --root "C:/path/to/project"

Windows 등에서 python 실행 파일이 없으면 동일 인자로 py -3 tools/aibeopchin_navigator.py ... 를 쓴다.

DELETED 역점검(사건 soft-delete 복구 경로) 실행 브리핑은
docs/project-governance/IMPLEMENTATION_EVIDENCE.md 최상단 [EVIDENCE-20260421-243]([239] 후속1 repository 축)·[242](인용·OPEN-4/DENY-8) 순으로 본다.
판정은 [242] 고정. 실무 후속 repository [243]: 노출 raw + documents/generate 차단 + admin alerts 잔존 + apply-case-status-transition([240]) + document-draft.repository(초안 메모 잔존) → 공통 차단 아님(「누적 중간 결론」). 다음: 기타 find*·AlertEvent 수명. 템플릿: docs/project-governance/REPOSITORY_DELETED_3QUESTION_WORK_TEMPLATE.md. 근거 펼침 → [241]·[240].
UI 6파일 실사 붙여넣기 포맷: docs/project-governance/DELETED_UI_6FILE_3QUESTION_WORK_TEMPLATE.md
전체 로드맵은 본 스크립트 show-plan 등으로 보조한다.
"""

from __future__ import annotations

import argparse
import json
import os
import re
import sys
from dataclasses import dataclass
from datetime import datetime
from pathlib import Path
from typing import Dict, Iterable, List, Optional


PROJECT_PLAN = {
    "project_name": "AI법친",
    "principles": [
        "상태 이름의 유일 기준은 prisma/schema.prisma 와 src/lib/definitions/case-status.ts 이다.",
        "옛 메모, 위키, 슬랙, 패치셋은 단독 기준으로 사용할 수 없다.",
        "새 기능 추가보다 기준문서 잠금이 우선이다.",
        "구현은 정의서를 따르도록 재정렬한다.",
        "verify-canonical-sources 통과 전 결과물은 현행 기준으로 인정하지 않는다.",
    ],
    "mvp_flow": [
        "변호사 가입/승인",
        "로그인",
        "대시보드",
        "의뢰인 초대/가입",
        "사건 생성",
        "AI 인터뷰",
        "사건 요약",
        "문서 생성",
        "사건 상세",
        "보완 요청",
        "관리자 승인",
    ],
    "phase1_start_baseline": (
        "시작 기준선: docs/project-governance/CASE_STATUS_DEFINITION.md §7.1 - "
        "CaseStatus, DELETED, soft delete, allowedLifecycleActions 정합 확인 스냅 -> "
        "FILE_REALIGN §2 Batch 1-A/1-B + §5 FILE Batch A/B/C done (EVIDENCE-20260423-316~320), next SPEC §0 / governance & Step 3 question-set (separate EVIDENCE)"
    ),
    "post_file_realign_320_baseline": (
        "고정점(§5): EVIDENCE-20260423-320 - FILE_REALIGN §5 Batch A/B/C 완료. "
        "다음 차수(동일 순서): (1) docs/project-governance/SPEC_IMPLEMENTATION_REAUDIT_ROWS_V1.md#spec-320-이후-거버넌스-순서 - "
        "(2) docs/project-governance/IMPLEMENTATION_EVIDENCE.md 최상단 EVIDENCE(327 잠금, 328~329 Step3·싱글소스) - "
        "(3) 본 show-plan - "
        "(4) 실작업 단위: SPEC#spec-320-거버넌스-작업-단위 = GW-0.1~0.4, GW-0.1 EVIDENCE=323, "
        "GW-0.2(비기본) EVIDENCE=324·SPEC#gw-0-2-범위-완료, GW-0.3(비기본) EVIDENCE=325·SPEC#gw-0-3-범위-완료, "
        "GW-0.4(검증·조건부) EVIDENCE=326·SPEC#gw-0-4-범위-완료, "
        "정렬 주기 1차 완료(잠금) EVIDENCE=327·SPEC#gw-0-정렬-주기-1차-완료. "
        "327 이후 우선 실착(별도 EVIDENCE): Step 3 EVIDENCE=328~; 싱글소스 1차 스캔·로드맵=329·SPEC#step-3-싱글-소스-질문셋. "
        "A안(questions) 런타임 잠금·getInterviewFlow+complete 동일 기준: EVIDENCE-20260423-330 완료. "
        "질문 유형 3층 매핑(런타임 type / Zod inputType / 정의서 §7): EVIDENCE-20260423-331·docs/project-governance/QUESTION_TYPE_MAPPING.md 완료. "
        "질문셋 admin UI 경계(고아 question-set-admin-client 삭제, QUESTION_SET_DEFINITION §14-1): EVIDENCE-20260423-332 완료. "
        "333~346: …+339~342 B, 343~344 publish·백필, 345=[345] 시드 잠금, 346 종료(A=visibility B=documentMapping 완·C·D 스킵·EVIDENCE-346). "
        "[343][345] 재오픈 금지. 다음: [347]+·[348] 1순위(EVIDENCE-347·348·SPEC#spec-347-후속-고정). "
        "이전(338): 2차 동기 EV(EVIDENCE_STEP3_B §1~4). "
        "비기본(별도 증빙): B안/IO/§5.4/ALIGNMENT 보감 - §0 '이후 분기'/313/320과 직교. "
        "이후 착수: 정의·스키마·코드 실변경 등 필요 항목만 별도 단위·EVIDENCE. "
        "Step3 1순([351] EVIDENCE-20260426-351) 종료·2순 GW-0.2 [352] (나) 마감(EVIDENCE-20260426-352) → [347]3순 "
        "ALIGNMENT/Case/인터뷰 잔여(post_352_next_347_tier3_alignment, DEV_BRIEF_POST_STEP3_352.md). "
        "SPEC#spec-347-후속-고정. 348·349·1순 흐름과 3순 혼재 금지. "
        "GW-0.2 차기 (가) 시 확인: SPEC#gw-0-2-범위-완료 → IO_DATA → POST_278 §6.3 → SPEC §5.4 → EVIDENCE-324. 합의 전 src/** 금지."
    ),
    "next_work_unit_step3_question_set": (
        "Step 3 질문셋 본착수 (EVIDENCE-20260423-328) - SPEC #step-3-질문셋-본착수, "
        "docs/project-governance/QUESTION_SET_DEFINITION.md 기준, 질문셋 route / 관리·생성·편집 UI / "
        "정의-저장 1차 정합. 싱글소스 1차 스캔·로드맵: EVIDENCE-20260423-329 · SPEC #step-3-싱글-소스-질문셋. "
        "A안(questions) 런타임 잠금·getInterviewFlow+complete 동일 기준: EVIDENCE-20260423-330 완료. "
        "유형 매핑: EVIDENCE-20260423-331·QUESTION_TYPE_MAPPING.md. admin UI: EVIDENCE-20260423-332·QUESTION_SET_DEFINITION §14-1. "
        "334·335·336 완, 337 1차 종료. 338+EVIDENCE_STEP3_B 2차(§1~4). 339~345: 343=게시, 344=백필, 345=시드 잠금. 346 종료(A=visibility B=documentMapping·C·D 스킵). 스냅: .../EVIDENCE_STEP3_ACTIVE_QUESTIONSET_DB_SNAPSHOT.md. "
        "다음: [347]+ 작업 단위 개설. B안/IO/§5.4 = 별도 합의."
    ),
    "step3_question_set_single_source_roadmap": (
        "Step 3 싱글 소스 (인터뷰 런타임) - EVIDENCE-20260423-329, SPEC #step-3-싱글-소스-질문셋. "
        "이번 결론(329): questions 플랫 JSON vs definitionJson.sections vs 타입 3층, 단일 기준 부재. "
        "330 완: A안(questions) 런타임 잠금; getInterviewFlow + completeCaseInterviewService = 동일 질문 소스·동일 complete 판정; definitionJson.sections = 이번 차수 런타임 필수 아님(관리·Zod). "
        "331 완: QUESTION_TYPE_MAPPING.md — QuestionSetQuestionType / QuestionInputType / §7 3층 행 잠금. "
        "332~342: …+339(§1)+340(§2)+341(§3)+342(§4). "
        "잔여: 342=§4 잠금 완, 동기 코드=전용 EVIDENCE, 시드 — A §4.5 / B."
    ),
    "post_345_step3_remaining": (
        "EVIDENCE-346: [346] 종료. PR-346-A visibility·PR-346-B documentMapping 구현 완. PR-346-C·D=필요 없음(스킵, 본절). "
        "C: inputType/조건 불필요·B+ValidationError+QUESTION_TYPE_MAPPING 정합 변화 없음. "
        "D: [346]범위 CaseStatus/스키마/사건 실변경 없음·GW-0.4(가) 정렬만. "
        "[343][345] 재오픈 없음. 이후 증빙=[346]|[347]+. "
        "다음: [347]+ 후속(SPEC/거버넌스·EVIDENCE) — `post_347_step3_followup` 참고. A·B 완료 시점: tsc+lint+verify:canonical-sources."
    ),
    "post_347_step3_followup": (
        "EVIDENCE-20260425-347: [347]+ 본절·SPEC#spec-347-후속-고정. [343][345][346] 재오픈 금지(346 종료·345 잠금 유지). "
        "선정(2026-04-25): 1) Step3 잔여·운용 2) GW-0.2 B안/IO/§5.4 3) ALIGNMENT§6·Case/인터뷰 잔여. "
        "1순 [348]·①+② [349]·③ [350]·[352] 2순 GW-0.2(나) 마감 = 문서권 Step3/Phase 종료(점검표 [343]~[352]). "
        "3순: EVIDENCE-20260426-353 — 문서권 마감 #347-tier3-document-scope-closure-20260426; 후속(가)·본착수=별 PR(post_352_next_347_tier3_alignment). "
        "348·349·1순·352 흐름과 3순 혼재·한 PR 금지. show-plan: post_348, post_349, post_352_next_347_tier3_alignment."
    ),
    "post_348_step3_tier1": (
        "EVIDENCE-20260425-348(확정): [347] 1순위 Step3 잔여·운용 회귀 검증. [343][345][346] 재오픈 없음. "
        "2026-04-25: npx tsc --noEmit·npm run lint·verify:canonical-sources·npm test — 모두 exit 0 (vitest 31/94). "
        "누적: 문서·스냅·운용로그·회귀=[348]에만. src/**·시드·자동검·런타임=[349+]에만(IMPLEMENTATION [348]/[349] 표). "
        "2·3(GW-0.2, ALIGNMENT/Case)=[347]·SPEC#spec-347-후속-고정·[320]—348·349와 혼재 금지."
    ),
    "post_349_step3_tier1_code": (
        "EVIDENCE-20260425-349: 후보1·2·3 신규diff 불필요 처리 완료. 후보4: ①②③ 범위 확정. "
        "PR분기 정본: IMPLEMENTATION_EVIDENCE.md [349]「누적·분리」와 EVIDENCE-20260425-350. "
        "①+②는 [349]에만 누적하고, verify:349-12 exit0 완료 기록으로 닫습니다. "
        "③은 [350]/EVIDENCE-20260425-350에만 누적합니다(개설 2026-04-25, ci.yml). ③범위=CI·PR게이트·.github/workflows/*·파이프라인. "
        "[349]에는 ③·workflow를 혼입하지 않습니다. "
        "2·3순/348=별트랙. [343]~[346] 비재오픈."
    ),
    "post_351_step3_tier1_reaudit": (
        "EVIDENCE-20260426-351: [351] Step3 1순위 종료 판정 — 추가 착수 후보 없음. "
        "당시 다음은 [347] 2순 GW-0.2·이후 [352] (나)로 2순 마감(EVIDENCE-20260426-352). "
        "다음(현재): [347] 3순 ALIGNMENT/Case/인터뷰 — post_352_next_347_tier3_alignment. "
        "GW-0.2 (가) 재착수 시: SPEC#gw-0-2-범위-완료·IO·POST_278 §6.3·SPEC §5.4·EVIDENCE-324, 합의 전 src/** 금지."
    ),
    "post_352_gw02_document_agreement": (
        "EVIDENCE-20260426-352: GW-0.2 본 주기 마감. 1·2단계 완료, 이번 (나). "
        "신규 src/**·B안·§5.4 행 이관/유지·API_SPEC success/ok 강제 없음 → 3) 문서 3종 생략, 4) 이번 흐름 src/** 없음. "
        "Step3/Phase [343]~[352] 점검표·문서권 완료. 향후 GW-0.2 src/** = 별도 EVIDENCE/PR (가) 재판정. "
        "다음: [347] 3순 — post_352_next_347_tier3_alignment, docs/project-governance/DEV_BRIEF_POST_STEP3_352.md."
    ),
    "post_352_next_347_tier3_alignment": (
        "[347]3순 #evidence-20260426-353 — A·B·C(A)·**문서권 전체** 닫힘 — #347-tier3-document-scope-closure-20260426 "
        "(전제 #c-gw03-a-tier3-20260426·당장 본착수·src 없음). "
        "**후속만:** GW-0.3 **(가)**·질문셋 본착수·런타임 대규모=FOLLOWUP §4·**별** EVIDENCE/PR·343~350 비재오픈. "
        "[347]이후 코드 1순위 FILE-1B: #work-instruction-post-347-file-1b-attachment-case-link · "
        "WORK_INSTRUCTION_POST_347_DEV_CANDIDATE_PRIORITY.md · WORK_INSTRUCTION_POST_347_FILE_1B_ATTACHMENT_CASE_LINK.md. "
        "B축 마감·C 전환 기록: #347-tier3-b-axis-closure-c-next-20260426 · 표 #347-tier3-bc-next-after-bg1. "
        "B 증빙 소급: #work-instruction-347-tier3-case-interview-gap-audit · #work-instruction-347-tier3-b-residual-lc-case-api-ui · B-G1 #b-g1-ux-pr-20260426 · B-LC05. "
        "문서승인 전용 감사행=보류 후보만(착수 안 함). FILE-1B·IV대규모=별 트랙, C PR과 혼재 금지. "
        "C: 착수 전 판정 #work-instruction-347-tier3-c-gw03-spec-preflight · WORK_INSTRUCTION_347_TIER3_C_GW03_SPEC_PREFLIGHT.md "
        "(GW-0.2(나) 마감 전제·SPEC/질문셋 겹침·별도 EVIDENCE/PR). "
        "GW-0.3 (A) 1차 완료 확인: #c-gw03-a-tier3-20260426 (문서·정렬·src 없음·verify:canonical-sources). "
        "질문셋 본착수·런타임 대규모=(가)만; (A)에 넣지 않음. SPEC#gw-0-3-범위-완료 · #spec-347-후속-고정 · FOLLOWUP §3·§4 · GW-0.3-분기/SPEC-347-확장. "
        "전제·닫힘: P0첫코드 #p0-353-구현-20260426 · P0잔여·P2통합 #p0-347-tier3-p0-p2-integrated-20260426 · "
        "P1·IO-05·353+ #p0-353-plus-dual-axis-real — 재오픈·canonical CaseStatus 변경 금지. "
        "SPEC#spec-347-후속-고정, 348/349/1·2순(352)과 PR 혼재·한PR 금지. GW-0.2 src/** 필요 시 별 EVIDENCE (가) 재판정. "
        "고정: [343]~[346]·[349]①+② 재오픈 금지, [350]③, [352] (나) 마감. "
        "PR/릴리스 전: verify:349-12·CI. DEV_BRIEF: DEV_BRIEF_POST_STEP3_352.md · #p0-353-p1p2-next."
    ),
    "governance_gw0_cycle1_closed": (
        "GW-0.1~0.4 문서·증빙·show-plan 정렬 주기 1차 완료·잠금 - "
        "EVIDENCE-20260423-327 · SPEC#gw-0-정렬-주기-1차-완료. "
        "우선 실착(별도 EVIDENCE): 328~332 + 331 매핑 + 332 admin UI(§14-1) (SPEC#step-3-싱글-소스-질문셋). "
        "see next_work_unit_step3_question_set, step3_question_set_single_source_roadmap. "
        "이후(잔여·333~, 337~342): 341 B §3(백필/시드), 342 B §4(구현 형태); 다음=동기 코드 전용 EVIDENCE; 338=2차 EVIDENCE(EVIDENCE_STEP3_B); 실구현=전용 EVIDENCE · §4.5; "
        "B안/IO/§5.4 합의·정의/스키마/코드 실수정·GW-0.4(가) 등 필요한 항목만 "
        "별도 착수·전용 EVIDENCE·해당 GW-0.x (가) · SPEC#이후-분기-고정."
    ),
    "governance_321_work_units": [
        "GW-0.1: §0 훑기 - 이후-분기-고정, C(R6) 닫힘(참조만), B안/IO/ROWS 비기본 표시; 범위·완료 판정 SPEC#gw-0-1-범위-완료; IMPLEMENTATION GW-0.1 EVIDENCE + show-plan 첫 bullet 1:1 (도메인 구현 없음).",
        "GW-0.2 (비기본): B안·IO·POST_278 §6.3·§5.4; 합의 전 src/** 변경 금지; "
        "[352] 본 주기 마감: 1·2 완료·(나); 신규 src·B안·§5.4 행·API_SPEC 강제 없음; 3 생략 4 미실시; "
        "SPEC#gw-0-2-범위-완료; EVIDENCE-324 + (가)/(나) + show-plan 둘째 1:1; "
        "향후 src 필요 시 별 EVIDENCE/PR (가) 재판정.",
        "GW-0.3 (비기본): §7 Step 3 질문셋·QUESTION_SET_DEFINITION·[320] 이후 궤도; "
        "범위·완료 판정 SPEC#gw-0-3-범위-완료; EVIDENCE-325 + 이번 주기 실착수(A)/(B) + 분기(가)/(나) + show-plan 셋째 bullet 1:1; "
        "질문셋 본 착수·src는 (가)에서만. "
        "[347] C 1차: #c-gw03-a-tier3-20260426 — (A) 문서·정렬만·(나) 분기·343~350 재오픈 없음. "
        "[347]3순 문서권 마감: #347-tier3-document-scope-closure-20260426.",
        "GW-0.4 (검증·조건부): 정의서·스키마·CaseStatus 실수정 시 verify + check-status --scope case (§4-1); "
        "범위·완료 판정 SPEC#gw-0-4-범위-완료; EVIDENCE-326 + 이번 주기 실착수(A)/(B) + 분기(가)/(나) + show-plan 넷째 bullet 1:1; "
        "수정 없으면 (나)·(A) 정렬만.",
    ],
    "phases": [
        {
            "phase": 1,
            "title": "도메인 기준문서 잠금",
            "items": [
                "상태값 정의서",
                "사건 라이프사이클 정의서",
                "권한정의서",
                "질문셋 정의서",
                "문서 템플릿 정의서",
            ],
        },
        {
            "phase": 2,
            "title": "AI 출력 기준 잠금",
            "items": [
                "AI 출력 정책서",
                "고지문/면책문구 정의서",
                "사건 요약 출력 명세서",
            ],
        },
        {
            "phase": 3,
            "title": "데이터 구조 문서화",
            "items": [
                "입력/출력 데이터 정의서",
                "첨부자료 분류 기준서",
                "DB 상세 설계 초안",
            ],
        },
        {
            "phase": 4,
            "title": "화면/API 기준 문서화",
            "items": [
                "화면 우선순위표",
                "API 명세 1차본",
            ],
        },
        {
            "phase": 5,
            "title": "정의서 대비 구현 역점검",
            "items": [
                "정의서 대비 구현 불일치 역점검표",
                "수정 우선순위표",
                "파일별 수정 대상 목록",
                "check-status --scope case 용 CASE_SCOPE_* 프리픽스와 실제 사건 디렉터리 구조 정합(누락·오탐 방지)",
            ],
        },
        {
            "phase": 6,
            "title": "구현 재정렬 패치",
            "items": [
                "role / permission 통합",
                "case status / lifecycle 통합",
                "question set / interview contract 통합",
                "document template / paragraph policy 통합",
                "API response contract 통합",
                "화면 문구/버튼/상태 라벨 통합",
            ],
        },
    ],
}

CANONICAL_REQUIRED_FILES = [
    "prisma/schema.prisma",
    "src/lib/definitions/case-status.ts",
]

LEGACY_TERMS = [
    "OPEN",
    "IN_PROGRESS",
    "DONE",
]

DEFAULT_SKIP_DIRS = {
    ".git",
    ".next",
    ".turbo",
    ".idea",
    ".vscode",
    "node_modules",
    "dist",
    "build",
    "coverage",
    "__pycache__",
}

DEFAULT_TEXT_EXTENSIONS = {
    ".ts",
    ".tsx",
    ".js",
    ".jsx",
    ".mjs",
    ".cjs",
    ".json",
    ".md",
    ".mdx",
    ".txt",
    ".py",
    ".prisma",
    ".yml",
    ".yaml",
    ".sql",
    ".sh",
    ".zsh",
}

# check-status --scope case 일 때만 스캔하는 경로(프로젝트 루트 기준 posix 상대경로).
# 사건(Case) 모델·API·UI·전이·정의 모듈 위주이며, prisma 마이그레이션 SQL 등은 제외한다.
CASE_SCOPE_EXACT_FILES = frozenset(
    {
        "prisma/schema.prisma",
    }
)
CASE_SCOPE_PREFIXES = (
    "src/lib/definitions/case-",
    "src/lib/case-",
    "src/lib/cases/",
    "src/features/cases/",
    "src/app/api/cases/",
    "src/app/(protected)/cases/",
    "src/components/cases/",
    "src/__tests__/lib/definitions/case-definitions",
    "src/__tests__/api/cases/",
    "src/__tests__/features/cases/",
)


@dataclass
class CanonicalCheckResult:
    ok: bool
    root: str
    found_files: Dict[str, bool]
    message: str


@dataclass
class LegacyFinding:
    path: str
    line_no: int
    term: str
    line: str


def eprint(*args: object) -> None:
    print(*args, file=sys.stderr)


def normalize_root(root: Optional[str]) -> Path:
    if root:
        return Path(root).expanduser().resolve()
    return Path.cwd().resolve()


def path_exists(root: Path, relative_path: str) -> bool:
    return (root / relative_path).exists()


def posix_relative(root: Path, file_path: Path) -> str:
    return file_path.resolve().relative_to(root.resolve()).as_posix()


def file_in_case_scope(root: Path, file_path: Path) -> bool:
    """사건(Case) 도메인으로 보는 경로만 True. --scope case 용."""

    try:
        rel = posix_relative(root, file_path)
    except ValueError:
        return False

    if rel in CASE_SCOPE_EXACT_FILES:
        return True

    for prefix in CASE_SCOPE_PREFIXES:
        p = prefix.rstrip("/")
        if rel == p or rel.startswith(prefix):
            return True

    return False


def check_canonical_sources(root: Path) -> CanonicalCheckResult:
    found = {p: path_exists(root, p) for p in CANONICAL_REQUIRED_FILES}
    ok = all(found.values())

    if ok:
        msg = (
            "[OK] 본선 기준 파일이 모두 존재합니다.\n"
            f" - {CANONICAL_REQUIRED_FILES[0]}\n"
            f" - {CANONICAL_REQUIRED_FILES[1]}\n"
            "상태 관련 비교/문서화/패치 검토를 진행할 수 있습니다."
        )
    else:
        missing = [p for p, exists in found.items() if not exists]
        msg = (
            "[경고] 본선 기준 파일이 모두 확인되지 않았습니다.\n"
            f"누락 파일: {', '.join(missing)}\n"
            "이 상태에서는 상태 정의 추출/비교를 성공으로 간주하지 않습니다.\n"
            "구 패치(aibeopchin_patchset 등)를 본선 정의로 착각하지 마십시오."
        )

    return CanonicalCheckResult(
        ok=ok,
        root=str(root),
        found_files=found,
        message=msg,
    )


def iter_text_files(root: Path, scope: str = "all") -> Iterable[Path]:
    for dirpath, dirnames, filenames in os.walk(root):
        dirnames[:] = [d for d in dirnames if d not in DEFAULT_SKIP_DIRS]
        current_dir = Path(dirpath)

        for filename in filenames:
            path = current_dir / filename
            if path.suffix.lower() not in DEFAULT_TEXT_EXTENSIONS:
                continue
            if scope == "case" and not file_in_case_scope(root, path):
                continue
            yield path


def should_ignore_line(path: Path, line: str) -> bool:
    line_lower = line.lower()
    path_str = str(path).replace("\\", "/").lower()

    if "옛 표기" in line or "현행 코드 값" in line:
        return True

    if "mapping" in line_lower and "open" in line_lower:
        return True

    if "aibeopchin_patchset" in path_str:
        return True

    if "status_single_source_of_truth" in path_str:
        return True

    if "verify-canonical-sources" in path_str:
        return True

    return False


def find_legacy_terms(
    root: Path, legacy_terms: List[str], scope: str = "all"
) -> List[LegacyFinding]:
    findings: List[LegacyFinding] = []
    patterns = {term: re.compile(rf"\b{re.escape(term)}\b") for term in legacy_terms}

    for file_path in iter_text_files(root, scope=scope):
        try:
            text = file_path.read_text(encoding="utf-8")
        except UnicodeDecodeError:
            try:
                text = file_path.read_text(encoding="utf-8-sig")
            except Exception:
                continue
        except Exception:
            continue

        for idx, line in enumerate(text.splitlines(), start=1):
            if should_ignore_line(file_path, line):
                continue

            for term, pattern in patterns.items():
                if pattern.search(line):
                    findings.append(
                        LegacyFinding(
                            path=str(file_path.relative_to(root)),
                            line_no=idx,
                            term=term,
                            line=line.strip(),
                        )
                    )
    return findings


def render_plan() -> str:
    lines: List[str] = []
    lines.append(f"# {PROJECT_PLAN['project_name']} 진행 계획")
    lines.append("")
    lines.append("## 원칙")
    for principle in PROJECT_PLAN["principles"]:
        lines.append(f"- {principle}")

    lines.append("")
    lines.append("## MVP 흐름")
    for idx, step in enumerate(PROJECT_PLAN["mvp_flow"], start=1):
        lines.append(f"{idx}. {step}")

    baseline = PROJECT_PLAN.get("phase1_start_baseline")
    if baseline:
        lines.append("")
        lines.append("## Phase 1 시작 기준선 (show-plan·Batch 공통)")
        lines.append(baseline)

    post_320 = PROJECT_PLAN.get("post_file_realign_320_baseline")
    if post_320:
        lines.append("")
        lines.append("## [320] 이후 - SPEC §0 / 거버넌스 차기 (show-plan / 증빙과 동일 순서)")
        lines.append(post_320)

    gw = PROJECT_PLAN.get("governance_321_work_units")
    if gw:
        lines.append("")
        lines.append(
            "## [321] 기준 - 거버넌스 실작업 단위 (GW-0.1~0.4, 321/322, GW-0.1=[323], "
            "GW-0.2(비기본)=[324]·#gw-0-2-범위-완료, "
            "GW-0.3(비기본)=[325]·#gw-0-3-범위-완료, "
            "GW-0.4(검증·조건부)=[326]·#gw-0-4-범위-완료, "
            "정렬1차(잠금)=[327]·#gw-0-정렬-주기-1차-완료)"
        )
        for item in gw:
            lines.append(f"- {item}")

    gw0_c1 = PROJECT_PLAN.get("governance_gw0_cycle1_closed")
    if gw0_c1:
        lines.append("")
        lines.append("## GW-0.1~0.4 정렬 주기 1차 완료 (잠금)")
        lines.append(gw0_c1)

    nwu = PROJECT_PLAN.get("next_work_unit_step3_question_set")
    if nwu:
        lines.append("")
        lines.append("## [327] 이후 - Step 3 질문셋 본착수 (EVIDENCE-328, next_work_unit_step3_question_set)")
        lines.append(nwu)

    p348t = PROJECT_PLAN.get("post_348_step3_tier1")
    if p348t:
        lines.append("")
        lines.append(
            "## [348] 1순위 — Step 3 잔여·운용 (EVIDENCE-20260425-348, post_348_step3_tier1)"
        )
        lines.append(p348t)

    p349c = PROJECT_PLAN.get("post_349_step3_tier1_code")
    if p349c:
        lines.append("")
        lines.append(
            "## [349] 1순위 — 코드·시드·자동검·런타임 전용 (EVIDENCE-20260425-349, post_349_step3_tier1_code)"
        )
        lines.append(p349c)

    p351r = PROJECT_PLAN.get("post_351_step3_tier1_reaudit")
    if p351r:
        lines.append("")
        lines.append(
            "## [351] — 1순 종료 판정 (이후 2순 [352] 마감·3순으로 이동) (EVIDENCE-20260426-351, post_351_step3_tier1_reaudit)"
        )
        lines.append(p351r)

    p352g = PROJECT_PLAN.get("post_352_gw02_document_agreement")
    if p352g:
        lines.append("")
        lines.append(
            "## [352] — [347] 2순 GW-0.2 본 주기 (나) 마감 (EVIDENCE-20260426-352, post_352_gw02_document_agreement)"
        )
        lines.append(p352g)

    p352t3 = PROJECT_PLAN.get("post_352_next_347_tier3_alignment")
    if p352t3:
        lines.append("")
        lines.append(
            "## [347] 3순위 — ALIGNMENT / Case·인터뷰 잔여 (post_352_next_347_tier3_alignment)"
        )
        lines.append(p352t3)

    p345r = PROJECT_PLAN.get("post_345_step3_remaining")
    if p345r:
        lines.append("")
        lines.append(
            "## [346] 종료 · 후속 ([347]+) (EVIDENCE-346, post_345_step3_remaining)"
        )
        lines.append(p345r)

    p347f = PROJECT_PLAN.get("post_347_step3_followup")
    if p347f:
        lines.append("")
        lines.append(
            "## [347]+ — 후속 개설 (EVIDENCE-20260425-347, post_347_step3_followup)"
        )
        lines.append(p347f)

    ssrc = PROJECT_PLAN.get("step3_question_set_single_source_roadmap")
    if ssrc:
        lines.append("")
        lines.append("## Step 3 - 싱글 소스 (EVIDENCE-329, step3_question_set_single_source_roadmap)")
        lines.append(ssrc)

    lines.append("")
    lines.append("## 실행 단계")
    for phase in PROJECT_PLAN["phases"]:
        lines.append(f"### Phase {phase['phase']}. {phase['title']}")
        for item in phase["items"]:
            lines.append(f"- {item}")
        lines.append("")

    return "\n".join(lines).strip() + "\n"


def save_project_plan(root: Path) -> Path:
    target_dir = root / ".aibeopchin"
    target_dir.mkdir(parents=True, exist_ok=True)
    target = target_dir / "project_plan.json"
    target.write_text(
        json.dumps(PROJECT_PLAN, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    return target


def make_brief(
    root: Path,
    phase: Optional[int],
    done_items: List[str],
    next_items: List[str],
    output_path: Optional[str],
    notes: List[str],
) -> str:
    now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    phase_title = None
    if phase is not None:
        for p in PROJECT_PLAN["phases"]:
            if p["phase"] == phase:
                phase_title = p["title"]
                break

    lines: List[str] = []
    lines.append("# NEXT_SESSION_BRIEF")
    lines.append("")
    lines.append(f"- 생성 시각: {now}")
    lines.append(f"- 프로젝트: {PROJECT_PLAN['project_name']}")
    if phase_title:
        lines.append(f"- 현재 Phase: {phase} / {phase_title}")
    elif phase is not None:
        lines.append(f"- 현재 Phase: {phase}")
    lines.append("")
    lines.append("## 오늘 완료")
    if done_items:
        for item in done_items:
            lines.append(f"- {item}")
    else:
        lines.append("- 없음")

    lines.append("")
    lines.append("## 다음 작업 1순위")
    if next_items:
        for item in next_items:
            lines.append(f"- {item}")
    else:
        lines.append("- 상태값 정의서 작성")

    lines.append("")
    lines.append("## 고정 원칙")
    for principle in PROJECT_PLAN["principles"]:
        lines.append(f"- {principle}")

    lines.append("")
    lines.append("## 주의할 점")
    caution_items = [
        "verify-canonical-sources 통과 전 결과물은 현행 기준으로 인정하지 않음",
        "구 패치셋(aibeopchin_patchset 등)을 본선 정의로 오인하지 않음",
        "옛 용어가 필요한 경우 반드시 매핑표를 붙인 뒤 사용",
        "새 기능 추가보다 기준문서 잠금이 우선",
    ]
    for item in caution_items:
        lines.append(f"- {item}")

    if notes:
        lines.append("")
        lines.append("## 추가 메모")
        for note in notes:
            lines.append(f"- {note}")

    lines.append("")
    lines.append("## 다음 세션 시작 순서")
    lines.append("1. npm run verify:canonical-sources")
    lines.append(
        "2. python tools/aibeopchin_navigator.py check-status [--scope all|case]"
    )
    lines.append("3. 현재 Phase 확인")
    lines.append("4. 다음 작업 1순위부터 재개")
    lines.append("")

    content = "\n".join(lines)

    if output_path:
        target = root / output_path
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_text(content, encoding="utf-8")

    return content


def command_show_plan(args: argparse.Namespace) -> int:
    root = normalize_root(args.root)
    print(render_plan(), end="")

    saved = save_project_plan(root)
    print(f"[INFO] 프로젝트 계획 JSON 저장: {saved}")
    return 0


def command_check_status(args: argparse.Namespace) -> int:
    root = normalize_root(args.root)
    scope = args.scope

    canonical = check_canonical_sources(root)
    print(canonical.message)

    if not canonical.ok:
        return 1

    print("")
    print("[안내] check-status는 OPEN/IN_PROGRESS/DONE을 단어 경계로 찾는 휴리스틱입니다.")
    print(
        "  - --scope all: 저장소 전체(알림·OPS 등 다른 도메인 문자열도 대량 포함될 수 있음)"
    )
    print(
        "  - --scope case: 사건(Case) 관련 경로만 스캔(사건 상태 정리 점검에 더 가깝게 사용)"
    )
    print(f"  - 현재 스코프: {scope}")
    print("")

    findings = find_legacy_terms(root, LEGACY_TERMS, scope=scope)

    if not findings:
        print("[OK] 구 상태명 혼용이 발견되지 않았습니다.")
        return 0

    print(f"[경고] 구 상태명 혼용 {len(findings)}건 발견")
    for finding in findings[:200]:
        print(
            f"- {finding.path}:{finding.line_no} | {finding.term} | {finding.line}"
        )

    print(
        "[안내] 위 항목이 매핑표/인용/구버전 기록이 아니라면 현행 상태명으로 정리하십시오."
    )
    return 1


def command_make_brief(args: argparse.Namespace) -> int:
    root = normalize_root(args.root)

    content = make_brief(
        root=root,
        phase=args.phase,
        done_items=args.done or [],
        next_items=args.next_items or [],
        output_path=args.output,
        notes=args.note or [],
    )

    print(content)
    if args.output:
        print(f"[INFO] 브리핑 저장 완료: {root / args.output}")
    return 0


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="AI법친 프로젝트 진행 내비게이터"
    )
    subparsers = parser.add_subparsers(dest="command", required=True)

    p_show = subparsers.add_parser(
        "show-plan",
        help="고정 계획/순서표 출력",
    )
    p_show.add_argument(
        "--root",
        help="프로젝트 루트 경로(기본값: 현재 작업 디렉터리)",
    )
    p_show.set_defaults(func=command_show_plan)

    p_check = subparsers.add_parser(
        "check-status",
        help="구 상태명 혼용 및 본선 기준 파일 존재 여부 검사",
        description=(
            "본선 기준 파일 존재 확인 후, OPEN/IN_PROGRESS/DONE 토큰을 휴리스틱으로 검색한다. "
            "기본(scope all)은 저장소 전체라 알림·OPS 등 비사건 도메인도 걸린다. "
            "사건 상태만 보려면 --scope case."
        ),
    )
    p_check.add_argument(
        "--root",
        help="프로젝트 루트 경로(기본값: 현재 작업 디렉터리)",
    )
    p_check.add_argument(
        "--scope",
        choices=("all", "case"),
        default="all",
        help=(
            "검색 범위: all=전체 저장소, case=사건 API·컴포넌트·정의·스키마 등 일부 경로만"
        ),
    )
    p_check.set_defaults(func=command_check_status)

    p_brief = subparsers.add_parser(
        "make-brief",
        help="다음 세션 브리핑 초안 생성",
    )
    p_brief.add_argument(
        "--root",
        help="프로젝트 루트 경로(기본값: 현재 작업 디렉터리)",
    )
    p_brief.add_argument(
        "--phase",
        type=int,
        help="현재 진행 Phase 번호",
    )
    p_brief.add_argument(
        "--done",
        action="append",
        help="오늘 완료한 항목(여러 번 사용 가능)",
    )
    p_brief.add_argument(
        "--next",
        dest="next_items",
        action="append",
        help="다음 작업 1순위 항목(여러 번 사용 가능)",
    )
    p_brief.add_argument(
        "--note",
        action="append",
        help="추가 메모(여러 번 사용 가능)",
    )
    p_brief.add_argument(
        "--output",
        help="출력 파일 경로 예: docs/project-governance/NEXT_SESSION_BRIEF.md",
    )
    p_brief.set_defaults(func=command_make_brief)

    return parser


def main() -> int:
    parser = build_parser()
    args = parser.parse_args()

    try:
        return args.func(args)
    except KeyboardInterrupt:
        eprint("\n[중단] 사용자가 작업을 중단했습니다.")
        return 130
    except Exception as exc:
        eprint(f"[오류] {exc}")
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
