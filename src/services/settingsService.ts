import { DEFAULT_SETTINGS, FolderMapping, UserSettings } from '../models/classification';

const SETTINGS_KEY = 'groupMailClassifier.settings';

function clone(settings: UserSettings): UserSettings {
  return { rules: settings.rules.map((rule) => ({ ...rule, folderMapping: { ...rule.folderMapping } })) };
}

const defaultMapping = (): FolderMapping => ({ TO_ONLY: '', TO_INCLUDED: '', CC_ONLY: '', CC_INCLUDED: '' });
export function duplicateRule(rule: UserSettings['rules'][number], id = `rule-${Date.now()}`): UserSettings['rules'][number] {
  return { ...rule, id, folderMapping: { ...rule.folderMapping } };
}

export function deleteRule(rules: UserSettings['rules'], index: number): UserSettings['rules'] {
  const remaining = rules.filter((_, itemIndex) => itemIndex !== index);
  return remaining.length ? remaining : [{ ...DEFAULT_SETTINGS.rules[0]!, folderMapping: { ...DEFAULT_SETTINGS.rules[0]!.folderMapping } }];
}

function normalize(raw: Partial<UserSettings> & { rules?: unknown }): UserSettings {
  const sourceRules: unknown[] = Array.isArray(raw.rules) ? raw.rules : [{
    name: 'Default',
    groupEmail: raw.groupEmail,
    folderMapping: raw.folderMapping
  }];
  const rules = sourceRules.filter((rule): rule is Record<string, unknown> => Boolean(rule && typeof rule === 'object')).map((rule, index) => ({
    id: typeof rule.id === 'string' ? rule.id : `rule-${index + 1}`,
    name: typeof rule.name === 'string' ? rule.name.trim() : '',
    groupEmail: typeof rule.groupEmail === 'string' ? rule.groupEmail.trim().toLowerCase() : '',
    folderMapping: { ...defaultMapping(), ...(rule.folderMapping && typeof rule.folderMapping === 'object' ? rule.folderMapping : {}) }
  }));
  return { rules: rules.length ? rules : clone(DEFAULT_SETTINGS).rules };
}

export class SettingsService {
  public async load(): Promise<UserSettings> {
    const raw = typeof Office !== 'undefined'
      ? Office.context?.roamingSettings?.get(SETTINGS_KEY)
      : globalThis.localStorage?.getItem(SETTINGS_KEY);
    if (!raw) return clone(DEFAULT_SETTINGS);
    const value = typeof raw === 'string' ? JSON.parse(raw) as Partial<UserSettings> : raw as Partial<UserSettings>;
    const normalized = normalize(value);
    if (!Array.isArray(value.rules)) await this.save(normalized);
    return normalized;
  }

  public async save(settings: UserSettings): Promise<void> {
    const normalized: UserSettings = { rules: settings.rules.map((rule, index) => ({
      id: rule.id || `rule-${index + 1}`,
      name: rule.name.trim(),
      groupEmail: rule.groupEmail.trim().toLowerCase(),
      folderMapping: Object.fromEntries(Object.entries(rule.folderMapping).map(([key, value]) => [key, value.trim()])) as FolderMapping
    })) };
    const roaming = typeof Office !== 'undefined' ? Office.context?.roamingSettings : undefined;
    if (roaming) {
      roaming.set(SETTINGS_KEY, normalized);
      await new Promise<void>((resolve, reject) => roaming.saveAsync((result) => result.status === Office.AsyncResultStatus.Succeeded ? resolve() : reject(result.error)));
    } else {
      globalThis.localStorage?.setItem(SETTINGS_KEY, JSON.stringify(normalized));
    }
  }

  public async reset(): Promise<void> {
    await this.save(DEFAULT_SETTINGS);
  }
}
