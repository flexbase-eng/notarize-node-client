import snakecaseKeys from 'snakecase-keys'

import type { Notarize, NotarizeOptions } from './'
import type { Document } from './transaction'

export class DocumentApi {
  client: Notarize

  constructor(client: Notarize, options?: NotarizeOptions) {  // eslint-disable-line no-unused-vars
    this.client = client
  }

  /*
   * Function to take a Transaction id and a Document id on that Transaction
   * and return the Document object in the response. This will contain the
   * Base64 encoded version of the contents of the document in the 'data'
   * element of the Document.
   */
  async get(id: string, documentId: string): Promise<{
    success: boolean,
    document?: Document,
    errors?: string[],
  }> {
    const resp = await this.client.fire(
      'GET',
      `transactions/${id}/documents/${documentId}?encoding=base64`
    )
    if (resp?.response?.status === 404) {
      return {
        success: resp.response.ok,
        errors: resp?.payload?.errors,
      }
    }
    return { success: resp.response.ok, document: resp.payload }
  }

  /*
   * Function to update a document within a Transaction that's still in the
   * 'draft' state. There is no way to know if this is true, when this call
   * is made, so it'll have to be handled in the response from Notarize.
   */
  async update(id: string, doc: {
    name?: string;
    trackingId?: string;
    customerCanAnnotate?: boolean;
    notarizationRequired?: boolean;
    identityConfirmationRequired?: boolean;
    witnessRequired?: boolean;
    authorizationHeader?: string;
  }): Promise<{
    success: boolean,
    document?: Document,
    errors?: string[],
  }> {
    const body  = snakecaseKeys(doc)
    const resp = await this.client.fire(
      'PUT',
      `documents/${id}`,
      undefined,
      body)
    if (resp?.response?.status === 422) {
      return {
        success: resp.response.ok,
        errors: resp?.payload?.errors,
      }
    }
    return { success: resp.response.ok, document: resp.payload }
  }

  /*
   * Function to take the documentId of a document at Notarize and delete it
   * from their servers. This is a permanent act, and should be used with care.
   */
  async delete(id: string): Promise<{
    success: boolean,
    error?: string,
    message?: string,
  }> {
    const resp = await this.client.fire('DELETE', `documents/${id}`)
    if (resp?.response?.status === 404) {
      return {
        success: resp.response.ok,
        error: 'The indicated document does not exist',
      }
    }
    return { success: resp.response.ok, ...resp.payload }
  }
}
