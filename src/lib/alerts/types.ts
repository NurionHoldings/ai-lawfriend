export const ALERT_RULE_TYPES = ["ROLE_SPIKE", "NIGHT_ACTIVITY", "ACTION_POLICY"] as const;

export const ALERT_SEVERITIES = ["INFO", "WARNING", "CRITICAL"] as const;

export const ALERT_EVENT_STATUSES = ["OPEN", "ACKNOWLEDGED", "IGNORED", "RESOLVED"] as const;

export type AlertRuleType = (typeof ALERT_RULE_TYPES)[number];
export type AlertSeverity = (typeof ALERT_SEVERITIES)[number];
export type AlertEventStatus = (typeof ALERT_EVENT_STATUSES)[number];

export type RoleSpikeRuleConfig = {
  timeWindowHours: number;
  minCount: number;
  spikeMultiplier: number;
  roleTargets: string[];
};

export type NightActivityRuleConfig = {
  startHour: number;
  endHour: number;
  minCount: number;
  whitelistActionTypes: string[];
};

export type ActionPolicyRuleConfig = {
  blacklist: string[];
  whitelist: string[];
  mode: "BLACKLIST_ONLY" | "WHITELIST_ONLY" | "BOTH";
};

export type AlertRuleConfig =
  | RoleSpikeRuleConfig
  | NightActivityRuleConfig
  | ActionPolicyRuleConfig;
