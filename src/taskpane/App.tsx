import React, { useEffect, useMemo, useState } from 'react';
import { Badge, Button, Card, CardHeader, Divider, MessageBar, Text } from '@fluentui/react-components';
import { ClassificationResult, MessageInfo, UserSettings } from '../models/classification';
import { ClassifierService } from '../services/classifierService';
import { MailboxService } from '../services/mailboxService';
import { SettingsService } from '../services/settingsService';
import { officeErrorMessage } from '../utils/environment';
import './taskpane.css';

const badgeColor = (value?: string): 'danger' | 'warning' | 'informative' | 'success' | 'subtle' =>
  value === 'TO_ONLY' ? 'danger' : value === 'TO_INCLUDED' ? 'warning' : value === 'CC_ONLY' ? 'informative' : value === 'CC_INCLUDED' ? 'success' : 'subtle';

export function App(): JSX.Element {
  const classifier = useMemo(() => new ClassifierService(), []);
  const settingsService = useMemo(() => new SettingsService(), []);
  const mailbox = useMemo(() => new MailboxService(), []);
  const [settings, setSettings] = useState<UserSettings>();
  const [result, setResult] = useState<ClassificationResult>();
  const [status, setStatus] = useState<string>();
  const [message, setMessage] = useState<MessageInfo>();
  const [busy, setBusy] = useState(false);

  useEffect(() => { void settingsService.load().then(setSettings); }, [settingsService]);
  async function refresh(apply = false): Promise<void> {
    setBusy(true); setStatus(undefined);
    try { setMessage(await mailbox.getCurrentItem()); setResult(await classifier.classifyCurrentMessage(apply)); setStatus(apply ? 'Category applied and message moved when a folder was configured.' : 'Classification refreshed.'); }
    catch (error) { setStatus(officeErrorMessage(error)); }
    finally { setBusy(false); }
  }
  function openSettings(): void {
    if (typeof Office !== 'undefined' && Office.context?.ui) Office.context.ui.displayDialogAsync(`${window.location.origin}/settings.html`, { height: 60, width: 40 });
  }
  return <main className="app-shell">
    <Card>
      <CardHeader header={<Text weight="semibold" size={500}>Group Mail Classifier</Text>} description="Classify the current message by configured group rules." />
      <Divider />
      <div className="content">
        <Text>Configured Rules: <strong>{settings?.rules.length ?? 0}</strong></Text>
        {message && <section className="result"><Text>Subject: {message.subject}</Text><Text>Message Id: {message.messageId || message.itemId}</Text><Text>Current Folder: {message.currentFolder || 'Unavailable in Office.js'}</Text><Text>Current Categories: {message.categories.join(', ') || 'None'}</Text></section>}
        <div className="actions">
          <Button appearance="primary" disabled={busy} onClick={() => void refresh(false)}>Refresh</Button>
          <Button disabled={busy} onClick={() => void refresh(true)}>Apply Category</Button>
          <Button disabled={busy} onClick={() => void refresh(true)}>Move Message</Button>
          <Button appearance="secondary" onClick={openSettings}>Open Settings</Button>
        </div>
        {result && <section className="result" aria-live="polite">
          <Text>Matched Rule: {result.ruleName || 'None'}</Text><Text>Group Email: {result.groupEmail || 'None'}</Text>
          <Text>Classification <Badge color={badgeColor(result.classification)}>{result.classification}</Badge></Text>
          <Text>To Count: {result.toCount}</Text><Text>Cc Count: {result.ccCount}</Text>
          <Text>Category: {result.category ?? 'None'}</Text><Text>Folder: {result.folder || 'No action'}</Text>
          <Text>Routing Decision: {result.reason}</Text>
        </section>}
        {status && <MessageBar intent={status.startsWith('Unable') || status.startsWith('This') ? 'error' : 'success'}>{status}</MessageBar>}
      </div>
    </Card>
  </main>;
}
