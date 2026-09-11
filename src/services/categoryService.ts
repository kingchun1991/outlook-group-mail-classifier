import { CATEGORY_BY_CLASSIFICATION, Classification } from '../models/classification';

export class CategoryService {
  public async applyCategory(classification: Classification): Promise<void> {
    if (classification === 'NONE') return;
    const category = CATEGORY_BY_CLASSIFICATION[classification];
    const item = typeof Office !== 'undefined' ? Office.context?.mailbox?.item : undefined;
    const categories = item?.categories;
    if (!categories || typeof categories.addAsync !== 'function') throw new Error('This Outlook client cannot apply categories.');
    await new Promise<void>((resolve, reject) => categories.addAsync(category, (result: OfficeAsyncResult<unknown>) => result.status === Office.AsyncResultStatus.Succeeded ? resolve() : reject(result.error)));
  }
}
