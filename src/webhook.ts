import snakecaseKeys from 'snakecase-keys'

import type { Notarize, NotarizeOptions } from './'

export class WebhookApi {
  client: Notarize

  constructor(client: Notarize, options?: NotarizeOptions) {  // eslint-disable-line no-unused-vars
    this.client = client
  }

  /*
   * Function to set/update the webhook URL for the apiKey for this Client.
   * This will overwrite any previously set webhook URL, and cannot be
   * null or undefined - for that, use delete().
   */
  async update(url: string, header?: string): Promise<{
    success: boolean,
    webhookUrl?: string,
    header?: string,
    error?: string
  }> {
    const body = { url, header }
    const resp = await this.client.fire('POST', 'webhooks', undefined, body)
    return {
      success: resp.response.ok,
      webhookUrl: resp?.payload?.url,
      header: resp?.payload?.header,
    }
  }

  /*
   * Function to retrieve the webhook URL from Notarize for the apiKey for
   * this Client. If no webhook URL is set, then this will not return that
   * value - it's undefined.
   */
  async retrieve(): Promise<{
    success: boolean,
    webhookUrl?: string,
    header?: string,
    error?: string
  }> {
    let url
    const resp = await this.client.fire('GET', 'webhooks')
    if (resp?.payload?.errors?.request !== 'resource not found') {
      url = resp?.payload?.url
    }
    return { success: resp.response.ok, webhookUrl: url }
  }

  /*
   * Function to delete the current webhook URL at Notarize for the apiKey
   * for the Client. This should return just a 'success', as Notarize returns
   * nothing.
   */
  async delete(): Promise<{
    success: boolean,
    error?: string
  }> {
    const resp = await this.client.fire('DELETE', 'webhooks')
    if (resp?.response?.status === 404) {
      // nothing to delete, but it's not an error, really.
      return { success: true }
    }
    return { success: resp.response.ok }
  }

  /*
   * Function to send a message to the webhook URL for this apiKey of the
   * Client, so that the caller can test the sending of data from Notarize
   * without it effecting any existing documents or transactions.
   */
  async simulateResponses(msg: {
    event: string,
    data: {
      transactionId: string;
      status: string;
    },
  }): Promise<{
    success: boolean,
    error?: string
  }> {
    const body = snakecaseKeys({ webhookBody: msg })
    const resp = await this.client.fire(
      'POST',
      'webhook_tests',
      undefined,
      body
    )
    if (resp?.payload?.error === 'Missing Webhook') {
      // nothing to send to - this isn't god
      return {
        success: resp.response.ok,
        error: 'There is no defined webhook URL for this Api Key',
      }
    }
    return { success: resp.response.ok }
  }
}
