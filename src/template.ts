import type { Notarize, NotarizeOptions } from './'

export class TemplateApi {
  client: Notarize;

  constructor(client: Notarize, options?: NotarizeOptions) {  // eslint-disable-line no-unused-vars
    this.client = client
  }

  /*
   * Function to list the templates at Notarize for the apiKey for this Client.
   * the arguments are optional, and will default to 100, and 0, respectively.
   * the response includes the total number of templates, so that the caller
   * can page them in as they wish.
   */
  async list(limit?: number, offset?: number): Promise<{
    success: boolean,
    totalCount: number,
    templates: {
      id: string;
      name: string;
      createdAt: string;
      updatedAt: string;
    }[],
    error?: string
  }> {
    const params = { limit: limit || 100, offset: offset || 0 }
    const resp = await this.client.fire('GET', 'templates', params)
    return {
      success: resp.response.ok,
      ...resp.payload,
    }
  }
}
