/* Event-based activation runs without a task pane. Keep this handler short and never show UI. */
export function onItemSend(event: { completed(options: { allowEvent: boolean }): void }): void {
  // Full recipient classification is performed in the task pane/manual flow. Event activation
  // support varies by client and ItemSend cannot reliably move an item before it is sent.
  event.completed({ allowEvent: true });
}

if (typeof Office !== 'undefined') Office.onReady(() => undefined);
