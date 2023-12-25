import path from 'path'
import camelCaseKeys from 'camelcase-keys'

import { DocumentApi } from './document'
import { TemplateApi } from './template'
import { TransactionApi } from './transaction'
import { WebhookApi } from './webhook'

import * as config from '../package.json'
const ClientVersion = config.version
const PROTOCOL = 'https'
const NOTARIZE_HOST = 'api.notarize.com/v1/'

/*
 * These are the acceptable options to the creation of the Client:
 *
 *   {
 *     webhookUrl: "https://my.service.com/notarize/webhook"
 *   }
 *
 * and the construction of the Client will set the webhook to this URL
 * regardless of it's previous value.
 */
export interface NotarizeOptions {
  host?: string;
  apiKey?: string;
  webhookUrl?: string;
  webhookHeader?: string;
}

/*
 * This is the main constructor of the Notarize Client, and will be called
 * with something like:
 *
 *   import Notarize from "notarize-sdk"
 */
export class Notarize {
  host: string
  apiKey: string
  webhookUrl?: string
  webhookHeader?: string
  document: DocumentApi
  template: TemplateApi
  transaction: TransactionApi
  webhook: WebhookApi

  constructor (apiKey: string, options?: NotarizeOptions) {
    this.host = options?.host || NOTARIZE_HOST
    this.apiKey = apiKey
    this.webhookUrl = options?.webhookUrl
    // now construct all the specific domain objects
    this.document = new DocumentApi(this, options)
    this.template = new TemplateApi(this, options)
    this.transaction = new TransactionApi(this, options)
    this.webhook = new WebhookApi(this, options)

    // if we have a webhook, then update that now
    if (this.webhookUrl) {
      this.webhook.update(this.webhookUrl, this.webhookHeader)
    }
  }

  /*
   * Function to fire off a GET, PUT, POST, (method) to the uri, preceeded
   * by the host, with the optional query params, and optional body, and
   * puts the 'apiKey' into the headers for the call, and fires off the call
   * to the Notarize host and returns the response.
   */
  async fire(
    method: string,
    uri: string,
    query?: { [index:string] : number | string },
    body?: object | object[]
  ): Promise<{ response: any, payload?: any }> {
    // build up the complete url from the provided 'uri' and the 'host'
    let url = new URL(PROTOCOL+'://'+path.join(this.host, uri))
    if (query) {
      Object.keys(query).forEach(k =>
        url.searchParams.append(k, query[k].toString()))
    }
    // ...and now we can make the call
    const response = await fetch(url, {
      method: method,
      body: body ? JSON.stringify(body) : undefined,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        ApiKey: this.apiKey,
        'X-Notarize-Client-Ver': ClientVersion,
      }
    })
    try {
      const payload = camelCaseKeys((await response.json()) as any, {deep: true})
      return { response, payload }
    } catch (err) {
      return { response }
    }
  }
}
