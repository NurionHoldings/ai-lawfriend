"use client";

import { useMemo, useState } from "react";
import { requireOkResponseBody } from "@/lib/client/api-error";

type Props = {
  onCreated?: () => void;
};

type RuleType = "ROLE_SPIKE" | "NIGHT_ACTIVITY" | "ACTION_POLICY";
type Severity = "INFO" | "WARNING" | "CRITICAL";
type PolicyMode = "BLACKLIST_ONLY" | "WHITELIST_ONLY" | "BOTH";

export function AlertRuleForm({ onCreated }: Props) {
  const [type, setType] = useState<RuleType>("ROLE_SPIKE");
  const [severity, setSeverity] = useState<Severity>("WARNING");
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [enabled, setEnabled] = useState(true);

  const [roleTargets, setRoleTargets] = useState("ADMIN,LAWYER,USER");
  const [timeWindowHours, setTimeWindowHours] = useState(6);
  const [minCount, setMinCount] = useState(20);
  const [spikeMultiplier, setSpikeMultiplier] = useState(2);

  const [startHour, setStartHour] = useState(0);
  const [endHour, setEndHour] = useState(6);
  const [nightMinCount, setNightMinCount] = useState(5);
  const [whitelistActionTypes, setWhitelistActionTypes] = useState("AUTH_LOGIN_SUCCESS");

  const [mode, setMode] = useState<PolicyMode>("BOTH");
  const [blacklist, setBlacklist] = useState("CASE_FORCE_DELETE,USER_FORCE_ROLE_CHANGE");
  const [whitelist, setWhitelist] = useState("AUTH_LOGIN_SUCCESS,CASE_CREATE,CASE_UPDATE");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const configJson = useMemo(() => {
    if (type === "ROLE_SPIKE") {
      return {
        timeWindowHours,
        minCount,
        spikeMultiplier,
        roleTargets: roleTargets
          .split(",")
          .map((x) => x.trim())
          .filter(Boolean),
      };
    }

    if (type === "NIGHT_ACTIVITY") {
      return {
        startHour,
        endHour,
        minCount: nightMinCount,
        whitelistActionTypes: whitelistActionTypes
          .split(",")
          .map((x) => x.trim())
          .filter(Boolean),
      };
    }

    return {
      mode,
      blacklist: blacklist.split(",").map((x) => x.trim()).filter(Boolean),
      whitelist: whitelist.split(",").map((x) => x.trim()).filter(Boolean),
    };
  }, [
    type,
    timeWindowHours,
    minCount,
    spikeMultiplier,
    roleTargets,
    startHour,
    endHour,
    nightMinCount,
    whitelistActionTypes,
    mode,
    blacklist,
    whitelist,
  ]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/admin/alert-rules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          code,
          type,
          severity,
          enabled,
          description,
          configJson,
        }),
      });

      const raw = await res.json().catch(() => null);
      requireOkResponseBody(res, raw, "생성 실패");

      setMessage("규칙이 생성되었습니다.");
      setName("");
      setCode("");
      setDescription("");
      onCreated?.();
    } catch (err: unknown) {
      setMessage(err instanceof Error ? err.message : "오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-2xl border bg-white p-5 shadow-sm">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-1">
          <div className="text-sm font-medium">규칙명</div>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-xl border px-3 py-2"
          />
        </label>

        <label className="space-y-1">
          <div className="text-sm font-medium">코드</div>
          <input
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            className="w-full rounded-xl border px-3 py-2"
            placeholder="ROLE_SPIKE_FINANCE_TEAM"
          />
        </label>

        <label className="space-y-1">
          <div className="text-sm font-medium">규칙 타입</div>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as RuleType)}
            className="w-full rounded-xl border px-3 py-2"
          >
            <option value="ROLE_SPIKE">ROLE_SPIKE</option>
            <option value="NIGHT_ACTIVITY">NIGHT_ACTIVITY</option>
            <option value="ACTION_POLICY">ACTION_POLICY</option>
          </select>
        </label>

        <label className="space-y-1">
          <div className="text-sm font-medium">심각도</div>
          <select
            value={severity}
            onChange={(e) => setSeverity(e.target.value as Severity)}
            className="w-full rounded-xl border px-3 py-2"
          >
            <option value="INFO">INFO</option>
            <option value="WARNING">WARNING</option>
            <option value="CRITICAL">CRITICAL</option>
          </select>
        </label>
      </div>

      <label className="block space-y-1">
        <div className="text-sm font-medium">설명</div>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="min-h-[84px] w-full rounded-xl border px-3 py-2"
        />
      </label>

      <label className="inline-flex items-center gap-2 text-sm font-medium">
        <input type="checkbox" checked={enabled} onChange={(e) => setEnabled(e.target.checked)} />
        활성화
      </label>

      {type === "ROLE_SPIKE" && (
        <div className="grid gap-4 rounded-2xl border border-zinc-200 bg-zinc-50 p-4 md:grid-cols-2">
          <label className="space-y-1">
            <div className="text-sm font-medium">대상 역할(csv)</div>
            <input
              value={roleTargets}
              onChange={(e) => setRoleTargets(e.target.value)}
              className="w-full rounded-xl border px-3 py-2"
            />
          </label>
          <label className="space-y-1">
            <div className="text-sm font-medium">시간 구간(시간)</div>
            <input
              type="number"
              value={timeWindowHours}
              onChange={(e) => setTimeWindowHours(Number(e.target.value))}
              className="w-full rounded-xl border px-3 py-2"
            />
          </label>
          <label className="space-y-1">
            <div className="text-sm font-medium">최소 건수</div>
            <input
              type="number"
              value={minCount}
              onChange={(e) => setMinCount(Number(e.target.value))}
              className="w-full rounded-xl border px-3 py-2"
            />
          </label>
          <label className="space-y-1">
            <div className="text-sm font-medium">급증 배수</div>
            <input
              type="number"
              step="0.1"
              value={spikeMultiplier}
              onChange={(e) => setSpikeMultiplier(Number(e.target.value))}
              className="w-full rounded-xl border px-3 py-2"
            />
          </label>
        </div>
      )}

      {type === "NIGHT_ACTIVITY" && (
        <div className="grid gap-4 rounded-2xl border border-zinc-200 bg-zinc-50 p-4 md:grid-cols-2">
          <label className="space-y-1">
            <div className="text-sm font-medium">시작 시각</div>
            <input
              type="number"
              value={startHour}
              onChange={(e) => setStartHour(Number(e.target.value))}
              className="w-full rounded-xl border px-3 py-2"
            />
          </label>
          <label className="space-y-1">
            <div className="text-sm font-medium">종료 시각</div>
            <input
              type="number"
              value={endHour}
              onChange={(e) => setEndHour(Number(e.target.value))}
              className="w-full rounded-xl border px-3 py-2"
            />
          </label>
          <label className="space-y-1">
            <div className="text-sm font-medium">최소 건수</div>
            <input
              type="number"
              value={nightMinCount}
              onChange={(e) => setNightMinCount(Number(e.target.value))}
              className="w-full rounded-xl border px-3 py-2"
            />
          </label>
          <label className="space-y-1">
            <div className="text-sm font-medium">허용 액션(csv)</div>
            <input
              value={whitelistActionTypes}
              onChange={(e) => setWhitelistActionTypes(e.target.value)}
              className="w-full rounded-xl border px-3 py-2"
            />
          </label>
        </div>
      )}

      {type === "ACTION_POLICY" && (
        <div className="grid gap-4 rounded-2xl border border-zinc-200 bg-zinc-50 p-4 md:grid-cols-2">
          <label className="space-y-1 md:col-span-2">
            <div className="text-sm font-medium">모드</div>
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value as PolicyMode)}
              className="w-full rounded-xl border px-3 py-2"
            >
              <option value="BLACKLIST_ONLY">BLACKLIST_ONLY</option>
              <option value="WHITELIST_ONLY">WHITELIST_ONLY</option>
              <option value="BOTH">BOTH</option>
            </select>
          </label>
          <label className="space-y-1">
            <div className="text-sm font-medium">블랙리스트 액션(csv)</div>
            <textarea
              value={blacklist}
              onChange={(e) => setBlacklist(e.target.value)}
              className="min-h-[100px] w-full rounded-xl border px-3 py-2"
            />
          </label>
          <label className="space-y-1">
            <div className="text-sm font-medium">화이트리스트 액션(csv)</div>
            <textarea
              value={whitelist}
              onChange={(e) => setWhitelist(e.target.value)}
              className="min-h-[100px] w-full rounded-xl border px-3 py-2"
            />
          </label>
        </div>
      )}

      {message ? <div className="rounded-xl bg-zinc-50 px-3 py-2 text-sm">{message}</div> : null}

      <button
        type="submit"
        disabled={loading}
        className="rounded-xl bg-black px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
      >
        {loading ? "저장 중..." : "규칙 생성"}
      </button>
    </form>
  );
}
