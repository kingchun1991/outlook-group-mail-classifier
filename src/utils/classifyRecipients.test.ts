import { classifyRecipients, classifyRules } from './classifyRecipients';
import { CATEGORY_BY_CLASSIFICATION, GroupEmailRule } from '../models/classification';

describe('classifyRecipients', () => {
  const group = 'support@company.com';
  it.each([
    ['TO_ONLY', ['support@company.com'], [], 'TO_ONLY', 'Direct Support'],
    ['TO_INCLUDED', ['support@company.com', 'user1@company.com'], [], 'TO_INCLUDED', 'Shared Support'],
    ['TO_INCLUDED when CC exists', ['support@company.com'], ['manager@company.com'], 'TO_INCLUDED', 'Shared Support'],
    ['CC_ONLY', ['user1@company.com'], ['support@company.com'], 'CC_ONLY', 'FYI'],
    ['CC_INCLUDED', ['user1@company.com'], ['support@company.com', 'manager@company.com'], 'CC_INCLUDED', 'Monitoring'],
    ['NONE', ['user1@company.com'], ['manager@company.com'], 'NONE', undefined],
    ['NONE when group is absent', [], [], 'NONE', undefined]
  ])('%s', (_name, to, cc, expected, expectedFolder) => {
    const classification = classifyRecipients(group, to, cc);
    expect(classification).toBe(expected);
    const settings: GroupEmailRule = { id: 'support', name: 'Support', groupEmail: group, folderMapping: { TO_ONLY: 'Direct Support', TO_INCLUDED: 'Shared Support', CC_ONLY: 'FYI', CC_INCLUDED: 'Monitoring' } };
    expect(expected === 'NONE' ? undefined : CATEGORY_BY_CLASSIFICATION[classification as keyof typeof CATEGORY_BY_CLASSIFICATION]).toBe(expected === 'NONE' ? undefined : `GMC-${expected === 'TO_ONLY' ? 'TO-ONLY' : expected === 'TO_INCLUDED' ? 'TO' : expected === 'CC_ONLY' ? 'CC-ONLY' : 'CC'}`);
    expect(expected === 'NONE' ? undefined : settings.folderMapping[classification as keyof typeof settings.folderMapping]).toBe(expectedFolder);
  });

  it('uses the first matching rule', () => {
    const rules: GroupEmailRule[] = [
      { id: 'first', name: 'AIOps', groupEmail: 'aiops@company.com', folderMapping: { TO_ONLY: 'AIOps Direct', TO_INCLUDED: '', CC_ONLY: '', CC_INCLUDED: '' } },
      { id: 'second', name: 'NOC', groupEmail: 'noc@company.com', folderMapping: { TO_ONLY: 'NOC Direct', TO_INCLUDED: '', CC_ONLY: '', CC_INCLUDED: '' } }
    ];
    expect(classifyRules(rules, ['aiops@company.com', 'noc@company.com'], [])?.rule.name).toBe('AIOps');
  });
});
