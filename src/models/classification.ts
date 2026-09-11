export type Classification = 'TO_ONLY' | 'TO_INCLUDED' | 'CC_ONLY' | 'CC_INCLUDED' | 'NONE';

export interface Recipient {
  emailAddress?: string;
  displayName?: string;
  address?: string;
}

export interface FolderMapping {
  TO_ONLY: string;
  TO_INCLUDED: string;
  CC_ONLY: string;
  CC_INCLUDED: string;
}

export interface GroupEmailRule {
  id: string;
  name: string;
  groupEmail: string;
  folderMapping: FolderMapping;
}

export interface UserSettings {
  rules: GroupEmailRule[];
  /** Legacy fields are accepted when importing older settings. */
  groupEmail?: string;
  folderMapping?: FolderMapping;
}

export interface MessageInfo {
  itemId: string;
  subject: string;
  messageId?: string;
  toRecipients: Recipient[];
  ccRecipients: Recipient[];
  currentFolder?: string;
  categories: string[];
}

export interface ClassificationResult {
  classification: Classification;
  ruleName?: string;
  groupEmail?: string;
  category?: string;
  folder?: string;
  toCount: number;
  ccCount: number;
  reason: string;
}

export const CATEGORY_BY_CLASSIFICATION: Record<Exclude<Classification, 'NONE'>, string> = {
  TO_ONLY: 'GMC-TO-ONLY',
  TO_INCLUDED: 'GMC-TO',
  CC_ONLY: 'GMC-CC-ONLY',
  CC_INCLUDED: 'GMC-CC'
};

export const DEFAULT_SETTINGS: UserSettings = {
  rules: [{
    id: 'rule-1',
    name: '',
    groupEmail: '',
    folderMapping: { TO_ONLY: '', TO_INCLUDED: '', CC_ONLY: '', CC_INCLUDED: '' }
  }]
};
