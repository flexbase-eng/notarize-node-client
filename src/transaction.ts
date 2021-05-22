import snakecaseKeys from 'snakecase-keys'

import type { Notarize, NotarizeOptions } from './'

/*
 * These are the components for some of the arguments to Notarize. These are
 * all part of the 'transaction' space.
 */
export interface DocumentSubmission {
  resource: string | Buffer;
  filename?: string;
  requirement?: string;
  customerCanAnnotate?: boolean;
  witnessRequired?: boolean;
  pdfBookbarked?: boolean;
  trackingId?: string;
  textTagSyntax?: string;
  signingDestinations?: {
    signerIdentifier: string;
    type: string;
    pageNumber: number;
    x: number;
    y: number;
    height: number;
    width: string;
    fontSize: number;
    hint: string;
  }[];
  authorizationHeader?: string;
}

export interface Signer {
  email: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  phone?: {
    countryCode: string;
    number: string;
  }[];
  address?: {
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    postal?: string;
    country?: string;
  };
  externalId?: string;
  entity?: string;
  capacity?: string;
}

export interface SignerInfo {
  email: string;
  firstName?: string;
  lastName?: string;
  dob?: string;
  address?: {
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    postal?: string;
    country?: string;
  };
  transactionAccessLink?: string;
}

/*
 * ...and these are the data structures returned from Notarize
 */
export interface Transaction {
  id: string;
  dateCreated: string;
  dateUpdated: string;
  transactionName: string;
  externalId?: string;
  transactionType: string;
  requireSecondaryPhotoId: boolean;
  fileNumber: string;
  documents: Document[];
  signerInfo: SignerInfo;
  cosignerInfo?: SignerInfo;
  streetAddress: {
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    fullAddress?: string;
  };
  status: string;
  notarizationRecord: string;
  messageToSigner: string;
  messageSignature: string;
  detailedStatus: string;
  auditTrailUrl: string;
}

export interface Document {
  id: string;
  dateCreated: string;
  dateUpdated: string;
  documentName: string;
  allowedActions?: string[];
  requirement?: string;
  permissions: string[];
  bundlePosition: number;
  isEnote: boolean;
  trackingId?: string;
  signedUrl?: string;
  processingState: string;
  processingError?: string;
  signingDestinations: SigningDestination[];
  signingType: string;
  data?: string;
}

export interface NotarizedDocument {
  notarialActs: string[];
  documentUrl: string;
}

export interface VerificationCredentials {
  retrievalId: string;
  retrievalPin: string;
  lastName: string;
  dateCompleted: string;
}

export interface SignerPhotoIdentification {
  primaryFront: string;
  primaryBack: string;
  secondaryFront?: string;
}

export interface NotarizationRecord {
  id: string;
  meetingStart: string;
  meetingEnd: string;
  notaryName: string;
  notaryRegistration: string;
  notaryCountyCity: string;
  signerInfo: SignerInfo;
  notarizedDocuments: NotarizedDocument[];
  verificationCredentials: VerificationCredentials;
  signerPhotoIdentification: SignerPhotoIdentification;
}

export interface SigningDestination {
  signerIdentifier: string;
  type: string;
  pageNumber: number;
  x: number;
  y: number;
  height: number;
  width: string;
  fontSize: number;
  hint: string;
}

export class TransactionApi {
  client: Notarize;

  constructor(client: Notarize, options?: NotarizeOptions) {  // eslint-disable-line no-unused-vars
    this.client = client
  }

  /*
   * Function to take the id of a Transaction created in 'draft' mode, and
   * start the notarization workflow by taking it *out* of 'draft' mode.
   */
  async retrieve(id: string): Promise<{
    success: boolean,
    transaction?: Transaction,
    error?: string,
  }> {
    const resp = await this.client.fire('GET', `transactions/${id}`)
    if (resp?.response?.status === 404) {
      return {
        success: resp.response.ok,
        error: 'The indicated transaction does not exist',
      }
    }
    return { success: resp.response.ok, transaction: resp.payload }
  }

  /*
   * Function to create a new Notarization Transaction that will start
   * the process of the notarization workflow at Notarize.com.
   */
  async create(doc: {
    documents?: DocumentSubmission[];
    signers: Signer[];
    draft?: boolean;
    externalId?: string;
    transactionType?: string;
    transactionName?: string;
    suppressEmail?: boolean;
    messageToSigner?: string;
    messageSignature?: string;
    messageSubject?: string;
    requireNewSignerVerification?: boolean;
    requireSecondaryPhotoId?: boolean;
    notaryInstructions?: {
      notaryNote: string;
    }[];
    expiry?: string;
    payer?: string;
  }): Promise<{
    success: boolean,
    transaction?: Transaction,
    error?: string,
  }> {
    // convert any resource values that are Buffers to Base64 strings
    if (doc.documents && doc.documents.length > 0) {
      doc.documents = doc.documents.map(ds => {
        if (Buffer.isBuffer(ds.resource)) {
          ds.resource = ds.resource.toString('base64')
        }
        return ds
      })
    }
    // ...now process normally
    const body  = snakecaseKeys(doc)
    const resp = await this.client.fire('POST', 'transactions', undefined, body)
    if (resp?.response?.status === 404) {
      return {
        success: resp.response.ok,
        error: resp?.payload?.error,
      }
    }
    return { success: resp.response.ok, transaction: resp.payload }
  }

  /*
   * Function to take the id of a Meeting Record, aka Notarization Record
   * from the Transaction, and return it to the caller. This is one part
   * of the Transaction - the Notarization Meeting Record.
   */
  async list(limit?: number, offset?: number): Promise<{
    success: boolean,
    count?: number,
    transactions?: Transaction[],
    error?: string
  }> {
    const params = { limit: limit || 10, offset: offset || 0 }
    const resp = await this.client.fire('GET', 'transactions', params)
    return {
      success: resp.response.ok,
      count: resp.payload.count,
      transactions: resp.payload.data,
    }
  }

  /*
   * Function to add a document to an existing transaction, referenced by
   * it's transaction id. This can only be done as long as the transaction
   * is in the 'draft' state.
   */
  async addDocument(id: string, doc: DocumentSubmission): Promise<{
    success: boolean,
    document?: Document,
    error?: string,
  }> {
    // convert a Buffer resource value to Base64 string
    if (doc && Buffer.isBuffer(doc.resource)) {
      doc.resource = doc.resource.toString('base64')
    }
    // ...now process normally
    const body  = snakecaseKeys(doc)
    const resp = await this.client.fire(
      'POST',
      `transactions/${id}/documents`,
      undefined,
      body,
    )
    if (resp?.response?.status === 404) {
      return {
        success: resp.response.ok,
        error: resp?.payload?.error,
      }
    }
    return { success: resp.response.ok, document: resp.payload }
  }

  /*
   * Function to update the Transaction indicated by the first argument with
   * the optional values in the second - but *only* if the transaction is
   * still in 'draft' status. If not, this will be an error.
   */
  async update(id: string, doc: {
    signers?: Signer[];
    draft?: boolean;
    externalId?: string;
    transactionType?: string;
    transactionName?: string;
    suppressEmail?: boolean;
    messageToSigner?: string;
    messageSignature?: string;
    messageSubject?: string;
    requireSecondaryPhotoId?: boolean;
    notaryInstructions?: {
      notaryNote: string;
    }[];
    expiry?: Date | string;
    payer?: string;
    allowSignerAnnotations?: boolean;
  }): Promise<{
    success: boolean,
    transaction?: Transaction,
    errors?: string[],
  }> {
    const body  = snakecaseKeys(doc)
    const resp = await this.client.fire(
      'PUT',
      `transactions/${id}`,
      undefined,
      body)
    if (resp?.response?.status === 422) {
      return {
        success: resp.response.ok,
        errors: resp?.payload?.errors,
      }
    }
    return { success: resp.response.ok, transaction: resp.payload }
  }

  /*
   * Function to take the id of a Transaction created in 'draft' mode, and
   * start the notarization workflow by taking it *out* of 'draft' mode.
   */
  async activate(id: string, suppressEmail?: boolean): Promise<{
    success: boolean,
    transaction?: Transaction,
    error?: string,
  }> {
    let body
    if (suppressEmail !== null && suppressEmail !== undefined) {
      body = snakecaseKeys({ suppressEmail })
    }
    const resp = await this.client.fire(
      'POST',
      `transactions/${id}/notarization_ready`,
      undefined,
      body,
    )
    if (resp?.response?.status === 404) {
      return {
        success: resp.response.ok,
        error: 'The indicated transaction does not exist',
      }
    }
    return { success: resp.response.ok, transaction: resp.payload }
  }

  /*
   * Function to take the id of a Transaction at Notarize and delete it
   * from their servers. This is a permanent act, and should be used with care.
   */
  async delete(id: string): Promise<{
    success: boolean,
    error?: string,
    message?: string,
  }> {
    const resp = await this.client.fire('DELETE', `transactions/${id}`)
    if (resp?.response?.status === 404) {
      return {
        success: resp.response.ok,
        error: 'The indicated transaction does not exist',
      }
    }
    return { success: resp.response.ok, ...resp.payload }
  }

  /*
   * Function to take the id of a Transaction and resend the email to the
   * signer(s), just in case they deleted it, or lost it, and needed to
   * have it again to proceed.
   */
  async resendEmail(id: string, messageToSigner?: string): Promise<{
    success: boolean,
    transaction?: Transaction,
    error?: string,
  }> {
    let body
    if (messageToSigner !== null && messageToSigner !== undefined) {
      body = snakecaseKeys({ messageToSigner })
    }
    const resp = await this.client.fire(
      'POST',
      `transactions/${id}/send_email`,
      undefined,
      body,
    )
    if (resp?.response?.status === 404) {
      return {
        success: resp.response.ok,
        error: 'The indicated transaction does not exist',
      }
    }
    return { success: resp.response.ok, transaction: resp.payload }
  }

  /*
   * Function to take the id of a Transaction and resend the email to the
   * signer(s), just in case they deleted it, or lost it, and needed to
   * have it again to proceed.
   */
  async resendSms(
    id: string,
    phone?: {
      countryCode: string;
      number: string;
    },
  ): Promise<{
    success: boolean,
    transaction?: Transaction,
    error?: string,
  }> {
    let body
    if (phone !== null && phone !== undefined) {
      body = snakecaseKeys({ phone })
    }
    const resp = await this.client.fire(
      'POST',
      `transactions/${id}/send_sms`,
      undefined,
      body,
    )
    if (resp?.response?.status === 404) {
      return {
        success: resp.response.ok,
        error: 'The indicated transaction does not exist',
      }
    }
    return { success: resp.response.ok, transaction: resp.payload }
  }

  /*
   * Function to take the id of a Meeting Record, aka Notarization Record
   * from the Transaction, and return it to the caller. This is one part
   * of the Transaction - the Notarization Meeting Record.
   */
  async retrieveMeetingRecord(id: string): Promise<{
    success: boolean,
    record?: NotarizationRecord,
    error?: string,
  }> {
    const resp = await this.client.fire('GET', `notarization_records/${id}`)
    if (resp?.response?.status === 404) {
      return {
        success: resp.response.ok,
        error: 'The indicated transaction does not exist',
      }
    }
    return { success: resp.response.ok, record: resp.payload }
  }
}
