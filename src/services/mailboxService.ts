import { MessageInfo, Recipient } from '../models/classification';
import { officeErrorMessage } from '../utils/environment';

function getRecipients(field: unknown): Recipient[] {
  if (!Array.isArray(field)) return [];
  return field.map((entry) => {
    if (typeof entry === 'string') return { emailAddress: entry } satisfies Recipient;
    if (entry && typeof entry === 'object') {
      const item = entry as { emailAddress?: string; displayName?: string; address?: string };
      const recipient: Recipient = {};
      const address = item.emailAddress ?? item.address;
      if (address) recipient.emailAddress = address;
      if (item.displayName) recipient.displayName = item.displayName;
      return recipient;
    }
    return {};
  });
}

export class MailboxService {
  public async getCurrentItem(): Promise<MessageInfo> {
    const item = typeof Office !== 'undefined' ? Office.context?.mailbox?.item : undefined;
    if (!item) throw new Error('Outlook is not available. Use the add-in inside an Outlook message.');
    const [to, cc] = await Promise.all([this.getRecipients(item.to), this.getRecipients(item.cc)]);
    const result: MessageInfo = {
      itemId: item.itemId ?? '',
      subject: item.subject ?? '',
      toRecipients: to,
      ccRecipients: cc,
      categories: []
    };
    if (item.internetMessageId) result.messageId = item.internetMessageId;
    return result;
  }

  public getMailboxAddress(): string | undefined {
    return typeof Office !== 'undefined' ? Office.context?.mailbox?.userProfile?.emailAddress : undefined;
  }

  private getRecipients(field: unknown): Promise<Recipient[]> {
    if (field && typeof (field as { getAsync?: unknown }).getAsync === 'function') {
      return new Promise((resolve, reject) => (field as { getAsync: (callback: (result: OfficeAsyncResult<unknown>) => void) => void }).getAsync((result) => {
        if (result.status === Office.AsyncResultStatus.Succeeded) resolve(getRecipients(result.value));
        else reject(new Error(officeErrorMessage(result.error)));
      }));
    }
    return Promise.resolve(getRecipients(field));
  }
}
