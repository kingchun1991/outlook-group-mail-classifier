import { Client } from '@microsoft/microsoft-graph-client';

export interface AccessTokenProvider { getAccessToken(): Promise<string>; }

export class OfficeAccessTokenProvider implements AccessTokenProvider {
  public getAccessToken(): Promise<string> {
    if (typeof Office === 'undefined' || !Office.context?.auth?.getAccessTokenAsync) return Promise.reject(new Error('Office authentication is unavailable.'));
    const auth = Office.context?.auth;
    if (!auth) return Promise.reject(new Error('Office authentication is unavailable.'));
    return new Promise((resolve, reject) => auth.getAccessTokenAsync({ allowSignInPrompt: true, allowConsentPrompt: true }, (result: OfficeAsyncResult<string>) => {
      if (result.status === Office.AsyncResultStatus.Succeeded) resolve(result.value);
      else reject(new Error(result.error?.message ?? 'Unable to acquire a Microsoft Graph token.'));
    }));
  }
}

export class GraphRequestService {
  private readonly client?: Client;

  public constructor(private readonly tokenProvider: AccessTokenProvider = new OfficeAccessTokenProvider()) {
    this.client = Client.init({ authProvider: async (done) => {
      try { done(null, await this.tokenProvider.getAccessToken()); } catch (error) { done(error as Error, null); }
    } });
  }

  public async get<T>(path: string): Promise<T> {
    if (!this.client) throw new Error('Microsoft Graph is not configured.');
    return this.client.api(path).get() as Promise<T>;
  }

  public async post<T>(path: string, body: unknown): Promise<T> {
    if (!this.client) throw new Error('Microsoft Graph is not configured.');
    return this.client.api(path).post(body) as Promise<T>;
  }

  public async patch<T>(path: string, body: unknown): Promise<T> {
    if (!this.client) throw new Error('Microsoft Graph is not configured.');
    return this.client.api(path).patch(body) as Promise<T>;
  }
}
