import { Classification, GroupEmailRule, Recipient } from '../models/classification';

function normalizeAddress(value: string | Recipient): string | undefined {
  const raw = typeof value === 'string' ? value : value.emailAddress ?? value.address;
  if (!raw) return undefined;
  const extracted = raw.match(/<([^>]+)>/)?.[1] ?? raw;
  const address = extracted.trim().toLowerCase();
  return /^[^\s@]+@[^\s@]+$/.test(address) ? address : undefined;
}

function normalizedList(recipients: readonly (string | Recipient)[]): string[] {
  return recipients
    .map(normalizeAddress)
    .filter((address): address is string => Boolean(address));
}

export function classifyRecipients(
  groupEmail: string,
  toRecipients: readonly (string | Recipient)[],
  ccRecipients: readonly (string | Recipient)[]
): Classification {
  const group = normalizeAddress(groupEmail);
  if (!group) return 'NONE';
  const to = normalizedList(toRecipients);
  const cc = normalizedList(ccRecipients);
  const inTo = to.includes(group);
  const inCc = cc.includes(group);

  if (inTo && to.length === 1 && cc.length === 0) return 'TO_ONLY';
  if (inTo) return 'TO_INCLUDED';
  if (inCc && cc.length === 1 && !inTo) return 'CC_ONLY';
  if (inCc && cc.length > 1 && !inTo) return 'CC_INCLUDED';
  return 'NONE';
}

export interface RuleClassification {
  rule: GroupEmailRule;
  classification: Exclude<Classification, 'NONE'>;
}

export function classifyRules(
  rules: readonly GroupEmailRule[],
  toRecipients: readonly (string | Recipient)[],
  ccRecipients: readonly (string | Recipient)[]
): RuleClassification | undefined {
  for (const rule of rules) {
    const classification = classifyRecipients(rule.groupEmail, toRecipients, ccRecipients);
    if (classification !== 'NONE') return { rule, classification };
  }
  return undefined;
}

export function normalizeRecipients(recipients: readonly (string | Recipient)[]): string[] {
  return normalizedList(recipients);
}
