import { CATEGORY_BY_CLASSIFICATION, ClassificationResult, UserSettings } from '../models/classification';
import { classifyRules } from '../utils/classifyRecipients';
import { MailboxService } from './mailboxService';
import { MessageService } from './messageService';
import { SettingsService } from './settingsService';

export class ClassifierService {
  public constructor(
    private readonly mailbox = new MailboxService(),
    private readonly settings = new SettingsService(),
    private readonly messages = new MessageService()
  ) {}

  public async classifyCurrentMessage(apply = false): Promise<ClassificationResult> {
    const [message, settings] = await Promise.all([this.mailbox.getCurrentItem(), this.settings.load()]);
    return this.classify(message, settings, apply);
  }

  private async classify(message: Awaited<ReturnType<MailboxService['getCurrentItem']>>, settings: UserSettings, apply: boolean): Promise<ClassificationResult> {
    const match = classifyRules(settings.rules, message.toRecipients, message.ccRecipients);
    const classification = match?.classification ?? 'NONE';
    const result: ClassificationResult = {
      classification,
      toCount: message.toRecipients.length,
      ccCount: message.ccRecipients.length,
      reason: classification === 'NONE' ? 'No configured group email was found in To or Cc.' : `Matched ${classification}.`
    };
    if (classification !== 'NONE') {
      result.category = CATEGORY_BY_CLASSIFICATION[classification];
      if (match) {
        result.ruleName = match.rule.name;
        result.groupEmail = match.rule.groupEmail;
        result.folder = match.rule.folderMapping[classification];
      }
    }
    if (apply && classification !== 'NONE') await this.messages.applyClassification(result);
    return result;
  }
}
