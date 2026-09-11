import { ClassificationResult } from '../models/classification';
import { CategoryService } from './categoryService';
import { FolderService } from './folderService';
import { GraphRequestService } from './graphService';

export class MessageService {
  public constructor(private readonly categories = new CategoryService(), private readonly folders = new FolderService(), private readonly graph = new GraphRequestService()) {}

  public async applyClassification(result: ClassificationResult): Promise<void> {
    await this.categories.applyCategory(result.classification);
    if (result.folder) {
      const destination = await this.folders.ensureFolder(result.folder);
      await this.moveMessage(destination);
    }
  }

  public async moveMessage(destinationFolderId: string): Promise<void> {
    const item = typeof Office !== 'undefined' ? Office.context?.mailbox?.item : undefined;
    const moveAsync = item?.moveAsync;
    if (!moveAsync) throw new Error('This Outlook client cannot move the current message.');
    await new Promise<void>((resolve, reject) => moveAsync(destinationFolderId, (moveResult: OfficeAsyncResult<unknown>) => moveResult.status === Office.AsyncResultStatus.Succeeded ? resolve() : reject(moveResult.error)));
  }

  /** Updates a current message through Graph for clients where Office.js has no writable field API. */
  public async updateMessage(fields: Record<string, unknown>): Promise<void> {
    const itemId = typeof Office !== 'undefined' ? Office.context?.mailbox?.item?.itemId : undefined;
    if (!itemId) throw new Error('A current message is required to update it.');
    await this.graph.patch(`/me/messages/${encodeURIComponent(itemId)}`, fields);
  }
}
