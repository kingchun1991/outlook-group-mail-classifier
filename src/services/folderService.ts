import { GraphRequestService } from './graphService';

interface MailFolder { id: string; displayName: string; childFolderCount?: number; }
interface MailFolderPage { value: MailFolder[]; }

/** Resolves and creates the destination path through Graph when available. */
export class FolderService {
  public constructor(private readonly graph = new GraphRequestService()) {}

  public async ensureFolder(path: string): Promise<string> {
    const names = path.split('/').map((part) => part.trim()).filter(Boolean);
    if (names.length === 0) throw new Error('A destination folder is required.');
    let parentId = await this.findWellKnownFolder(names.shift() as string);
    for (const name of names) {
      const children = await this.graph.get<MailFolderPage>(`/me/mailFolders/${encodeURIComponent(parentId)}/childFolders?$filter=displayName eq '${name.replace(/'/g, "''")}'`);
      const existing = children.value[0];
      if (existing) parentId = existing.id;
      else {
        const created = await this.graph.post<MailFolder>(`/me/mailFolders/${encodeURIComponent(parentId)}/childFolders`, { displayName: name });
        parentId = created.id;
      }
    }
    return parentId;
  }

  private async findWellKnownFolder(name: string): Promise<string> {
    const known = name.toLowerCase() === 'inbox' ? 'inbox' : undefined;
    if (known) return known;
    const page = await this.graph.get<MailFolderPage>(`/me/mailFolders?$filter=displayName eq '${name.replace(/'/g, "''")}'`);
    const folder = page.value[0];
    if (!folder) throw new Error(`Mailbox folder '${name}' was not found.`);
    return folder.id;
  }
}
