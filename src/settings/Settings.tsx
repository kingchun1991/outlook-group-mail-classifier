import React, { useEffect, useState } from 'react';
import { Button, Field, Input, MessageBar, Text, Textarea } from '@fluentui/react-components';
import { DEFAULT_SETTINGS, GroupEmailRule, UserSettings } from '../models/classification';
import { deleteRule as removeRule, duplicateRule, SettingsService } from '../services/settingsService';
import './settings.css';

const fields = ['TO_ONLY', 'TO_INCLUDED', 'CC_ONLY', 'CC_INCLUDED'] as const;

export function Settings(): JSX.Element {
  const service = new SettingsService();
  const [settings, setSettings] = useState<UserSettings>({ rules: DEFAULT_SETTINGS.rules.map((rule) => ({ ...rule, folderMapping: { ...rule.folderMapping } })) });
  const [editing, setEditing] = useState(0);
  const [importValue, setImportValue] = useState('');
  const [status, setStatus] = useState('');
  useEffect(() => { void service.load().then(setSettings); }, []);
  async function save(): Promise<void> { await service.save(settings); setStatus('Settings saved.'); }
  function updateRule(change: Partial<GroupEmailRule>): void { setSettings({ ...settings, rules: settings.rules.map((rule, index) => index === editing ? { ...rule, ...change } : rule) }); }
  function updateFolder(key: typeof fields[number], value: string): void { const rule = settings.rules[editing] ?? DEFAULT_SETTINGS.rules[0]!; updateRule({ folderMapping: { ...rule.folderMapping, [key]: value } }); }
  function addRule(copy?: GroupEmailRule): void { const rule = copy ? duplicateRule(copy) : { id: `rule-${Date.now()}`, name: '', groupEmail: '', folderMapping: { TO_ONLY: '', TO_INCLUDED: '', CC_ONLY: '', CC_INCLUDED: '' } }; setSettings({ ...settings, rules: [...settings.rules, rule] }); setEditing(settings.rules.length); }
  function deleteRule(index: number): void { const rules = removeRule(settings.rules, index); setSettings({ rules }); setEditing(Math.max(0, Math.min(editing, rules.length - 1))); }
  function exportSettings(): void { void globalThis.navigator?.clipboard?.writeText(JSON.stringify(settings, null, 2)); setStatus('Settings copied as JSON.'); }
  async function reset(): Promise<void> { await service.reset(); setSettings(DEFAULT_SETTINGS); setStatus('Settings reset.'); }
  function importSettings(): void {
    const parsed = JSON.parse(importValue) as Partial<UserSettings>;
    if (!parsed || (!Array.isArray(parsed.rules) && typeof parsed.groupEmail !== 'string')) throw new Error('Invalid settings JSON.');
    const imported = parsed.rules ?? [{ id: 'rule-1', name: 'Default', groupEmail: parsed.groupEmail, folderMapping: parsed.folderMapping }];
    setSettings({ rules: imported as GroupEmailRule[] });
    setStatus('Settings imported. Select Save to persist them.');
  }
  const rule = settings.rules[editing] ?? DEFAULT_SETTINGS.rules[0]!;
  return <main className="settings-shell"><Text size={600} weight="semibold">Group Mail Classifier Settings</Text>
    <div className="rule-list">{settings.rules.map((item, index) => <div key={item.id}><Button appearance={index === editing ? 'primary' : 'secondary'} onClick={() => setEditing(index)}>{item.name || item.groupEmail || `Rule ${index + 1}`}</Button><Button onClick={() => addRule(item)}>Duplicate Rule</Button><Button onClick={() => deleteRule(index)}>Delete Rule</Button></div>)}</div>
    <Button onClick={() => addRule()}>Add Rule</Button>
    <Field label="Rule Name"><Input value={rule.name} onChange={(_, data) => updateRule({ name: data.value })} placeholder="AIOps" /></Field>
    <Field label="Group Email Address" required><Input value={rule.groupEmail} onChange={(_, data) => updateRule({ groupEmail: data.value })} placeholder="support@company.com" /></Field>
    {fields.map((key) => <Field key={key} label={`${key} Folder`}><Input value={rule.folderMapping[key]} onChange={(_, data) => updateFolder(key, data.value)} placeholder="Inbox/Support" /></Field>)}
    <div className="actions"><Button appearance="primary" onClick={() => void save()}>Save</Button><Button onClick={exportSettings}>Export Settings</Button><Button onClick={() => void reset()}>Reset Settings</Button></div>
    <Field label="Import Settings (JSON)"><Textarea value={importValue} onChange={(_, data) => setImportValue(data.value)} placeholder='{"groupEmail":"support@company.com","folderMapping":{...}}' /></Field>
    <Button onClick={() => { try { importSettings(); } catch (error) { setStatus(error instanceof Error ? error.message : 'Invalid settings JSON.'); } }}>Import Settings</Button>
    {status && <MessageBar intent="success">{status}</MessageBar>}
  </main>;
}
