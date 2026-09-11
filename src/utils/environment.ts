export function isOfficeReady(): boolean {
  return typeof Office !== 'undefined' && Boolean(Office.context?.mailbox);
}

export function officeErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  return 'The Outlook operation could not be completed.';
}
