import { GroupEmailRule } from '../models/classification';
import { deleteRule, duplicateRule, SettingsService } from './settingsService';

describe('settings rules', () => {
  const rule: GroupEmailRule = {
    id: 'one',
    name: 'AIOps',
    groupEmail: 'aiops@company.com',
    folderMapping: { TO_ONLY: 'Direct', TO_INCLUDED: 'Shared', CC_ONLY: 'FYI', CC_INCLUDED: 'Monitor' }
  };

  it('duplicates a rule without sharing its folder mapping', () => {
    const copy = duplicateRule(rule, 'two');
    expect(copy).toEqual({ ...rule, id: 'two' });
    expect(copy.folderMapping).not.toBe(rule.folderMapping);
  });

  it('deletes a rule and keeps one blank rule when deleting the last rule', () => {
    expect(deleteRule([rule], 0)).toEqual([{ id: 'rule-1', name: '', groupEmail: '', folderMapping: { TO_ONLY: '', TO_INCLUDED: '', CC_ONLY: '', CC_INCLUDED: '' } }]);
    expect(deleteRule([rule, { ...rule, id: 'two' }], 0)).toHaveLength(1);
  });

  it('migrates legacy settings to rules and persists the new shape', async () => {
    globalThis.localStorage.setItem('groupMailClassifier.settings', JSON.stringify({
      groupEmail: 'Support@Company.com',
      folderMapping: { TO_ONLY: 'Direct' }
    }));
    const settings = await new SettingsService().load();
    expect(settings.rules).toEqual([{
      id: 'rule-1',
      name: 'Default',
      groupEmail: 'support@company.com',
      folderMapping: { TO_ONLY: 'Direct', TO_INCLUDED: '', CC_ONLY: '', CC_INCLUDED: '' }
    }]);
    expect(JSON.parse(globalThis.localStorage.getItem('groupMailClassifier.settings')!).rules).toHaveLength(1);
  });
});
