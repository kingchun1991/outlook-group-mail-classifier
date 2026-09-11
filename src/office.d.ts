interface OfficeAsyncResult<T> {
  status: string;
  value: T;
  error: { message?: string };
}
interface OfficeItem {
  itemId?: string;
  subject?: string;
  from?: { emailAddress?: string; displayName?: string };
  to?: unknown;
  cc?: unknown;
  internetMessageId?: string;
  categories?: { addAsync: (category: string, callback: (result: OfficeAsyncResult<unknown>) => void) => void };
  moveAsync?: (folderId: string, callback: (result: OfficeAsyncResult<unknown>) => void) => void;
}
interface OfficeMailbox {
  item?: OfficeItem;
  userProfile?: { emailAddress?: string };
}
interface OfficeContext {
  mailbox?: OfficeMailbox;
  auth?: { getAccessTokenAsync: (options: unknown, callback: (result: OfficeAsyncResult<string>) => void) => void };
  roamingSettings?: { get: (key: string) => unknown; set: (key: string, value: unknown) => void; saveAsync: (callback: (result: OfficeAsyncResult<unknown>) => void) => void };
  ui?: { displayDialogAsync: (url: string, options: { height: number; width: number }) => void };
}
declare const Office: {
  context?: OfficeContext;
  AsyncResultStatus: { Succeeded: string };
  onReady: (callback: () => void) => void;
};
