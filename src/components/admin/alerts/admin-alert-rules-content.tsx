"use client";

import { useState } from "react";
import { AlertRuleForm } from "./alert-rule-form";
import { AlertRuleList } from "./alert-rule-list";

export function AdminAlertRulesContent() {
  const [listKey, setListKey] = useState(0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">경고 규칙 설정</h1>
        <p className="mt-1 text-sm text-zinc-500">
          역할별 급증, 심야 활동, 액션 정책 경고 규칙을 생성하고 활성화 상태를 관리합니다.
        </p>
      </div>

      <AlertRuleForm onCreated={() => setListKey((k) => k + 1)} />
      <AlertRuleList key={listKey} />
    </div>
  );
}
