# notarize-node-client

`notarize-node-client` is a Node/JS and TypeScript Client for
[Notarize.com](https://notarize.com) that allows you to use normal Node
syntax to start notarizations - as opposed to writing a client based on the
REST endpoints documented on the Notarize.com Developer portal.

## Install

```bash
# with npm
$ npm install notarize-node-client
```

## Usage

This README isn't going to cover all the specifics of what Notarize.com is,
and how to use it - it's targeted as a _companion_ to the Notarize developer
[docs](https://dev.notarize.com/reference) that explain each of the endpoints
and how the general Notarize workflow works.

However, we'll put in plenty of examples so that it's clear how to use this
library to interact with Notarize.com.

### Getting your API Key

As documented on the Notarize.com site, the first step is getting an API Key
for the calls to Notarize.com. This is available on their API Keys
[page](https://business.notarize.com/settings/api), once you login. For the
rest of this document, the API Key will be seen as: `[Your API Key]`, and will
need to be replaced with the API Key you obtain from the site.

### Creating the Client

All Notarize functions are available from the client, and the basic
construction of the client is:

```typescript
import { Notarize } from 'notarize-node-client'
const client = new Notarize('[Your API Key]')
```

If you'd like to provide the webhook URL in the constructor, you can do that
with:

```typescript
const client = new Notarize(
  '[Your API Key]',
  {
    webhookUrl: 'https://my.service.com/notarize/callback'
  }
)
```

where the options can include:

* `webhookUrl` - the URL for all Notarize updates to be sent
* `webhookHeader` - the header to be sent on each of the calls for
  authentication, or validation by the receiver.

### Document Calls

#### [Get a Document](https://dev.notarize.com/reference#get-document)

```typescript
const doc = await client.document.get(id, transactionId)
```

This will get the document with `id`, in the transaction with `transactionId`
and return that data. The response will be something like:

```javascript
{
  "success": true,
  "document": {
    "id": "do_9f7b097a-6469-41dc-86b9-c7aa9743cfc4",
    "dateCreated": "2021-03-26T19:57:37.946749Z",
    "dateUpdated": "2021-03-26T19:57:39.216662Z",
    "documentName": "dummy.pdf",
    "allowedActions": [
      "CUSTOMER_CAN_ANNOTATE",
      "ESIGN_REQUIRED"
    ],
    "bundlePosition": 2,
    "isEnote": false,
    "trackingId": null,
    "signedUrl": null,
    "processingState": "done",
    "processingError": null,
    "permissions": [
      "CUSTOMER_CAN_ANNOTATE",
      "ESIGN_REQUIRED"
    ],
    "signingDesignations": [],
    "signingType": "NOTARIZATION",
    "data": "...BASE64STRING..."
  }
}
```

If there had been an error, the response would be:

```javascript
{
  "success": false,
  "errors": [ "(Error message from Notarize.com...)" ]
}
```

So looking at the `success` value of the response will quickly let you know the outcome of the call.

#### [Update a Document](https://dev.notarize.com/reference#update-business-documents)

```typescript
const doc = await client.document.update(id, opts)
```

where `opts` is an Object with one or more of these optional properties:

```typescript
{
  name?: string;
  trackingId?: string;
  customerCanAnnotate?: boolean;
  notarizationRequired?: boolean;
  identityConfirmationRequired?: boolean;
  witnessRequired?: boolean;
  authorizationHeader?: string;
}
```

This will update the document with `id`, assuming the transaction it's in is
still `draft`. The response will be something like:

```javascript
{
  "success": true,
  "document": {
    "id": "do_29f983a4-8485-4afb-8343-95996f75c2d5",
    "date_created": "2017-05-10T13:10:20.702098Z",
    "date_updated": "2017-05-10T13:10:20.702098Z",
    "document_name": "document.pdf",
    "allowed_actions": ["CUSTOMER_CAN_ANNOTATE"],
    "bundle_position": 1,
    "processing_state": "pending"
  }
}
```

#### [Delete a Document](https://dev.notarize.com/reference#delete-business-documents)

```typescript
const doc = await client.document.delete(id)
```

This will delete the document with `id` from the transaction it's in, assuming
the transaction is still `draft`. The response will be something like:

```javascript
{
  "success": true,
  "message": "Deleted Document abcdefghijk successfully"
}
```

### Template Calls

#### [List Templates](https://dev.notarize.com/reference#list-business-templates)

```typescript
const trans = await client.template.list()
```

This will get the document with `id`, in the transaction with `transactionId`
and return that data. The response will be something like:

```javascript
{
  "success": true,
  "totalCount": 2,
  "templates": [
    {
      "id": "od6nzpx5n",
      "name": "Test Template",
      "permalink": "my_first_template",
      "createdAt": "2017-05-09T16:46:39.767123Z",
      "updatedAt": "2017-05-09T16:46:39.767123Z"
    },
    {
      "id": "od8zzpx7z",
      "name": "Another Template",
      "permalink": "my_favorite_template",
      "createdAt": "2017-05-09T16:46:39.767123Z",
      "updatedAt": "2017-05-09T16:46:39.767123Z"
    }
  ]
}
```

### Transaction Calls

#### [Retrieve Transaction](https://dev.notarize.com/reference#retrieve-business-transaction)

```typescript
const trans = await client.transaction.retrieve(id)
```

This will get the transaction with `id` and the response will be something like:

```javascript
{
  "success": true,
  "transaction": {
    "id": "ot_anpr8qn",
    "dateCreated": "2016-10-01T18:52:44.725Z",
    "dateUpdated": "2016-10-02T20:13:54.245Z",
    "signerInfo": {
      "email": "miguel.lee@notarize.com",
      "firstName": "Miguel",
      "lastName": "Lee",
      "transactionAccessLink": "https://app.notarize.com/activate-transaction?bundle_id=some-bundle-id&code=some-code&email=some@email.com"
    },
    "documents": [{
      "id": "do_c7e0e599-5e94-4ac1-a4a3-7e09f9994934",
      "dateCreated": "2017-05-09T17:09:52.248711Z",
      "dateUpdated": "2017-05-09T17:09:52.248711Z",
      "documentName": "document.pdf",
      "allowedActions": ["NOTARIZATION_REQUIRED"],
      "bundlePosition": 0,
      "processingState": "done",
      "finalDocumentUrl": "https://s3-us-west-2.amazonaws.com/assets.notarize.com/document.pdf?AWSAccessKeyId=AKIAJVT3IPSNH662QU6A&Expires=1449430428&Signature=j%2FTzUuHJkrlbAJZGNpCm3xfxgmE%3D"
    }],
    "transactionName": "Miguel's TPS notarization for Leeroy.",
    "transactionType": "Power of Attorney",
    "detailedStatus": "started",
    "messageToSigner": "Please notarize your TPS Report.",
    "messageSignature": "Love, Leeroy.",
    "status": "created",
    "requireSecondaryPhotoId": false,
    "detailedStatus": "complete",
    "auditTrailUrl": "https://463675841562-notarize-productionmirror-documents.s3.amazonaws.com/a6d9272144840dd05b49_AuditTrail.pdf?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAITYYWRHD2HZKXQ%2F20210211%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20210211T161632Z&X-Amz-Expires=900&X-Amz-SignedHeaders=host&X-Amz-Signature=cdd0b69d3017e8296936d0207c8aa376a"
  }
}
```

#### [Create Transaction](https://dev.notarize.com/reference#create-business-transaction)

```typescript
const trans = await client.transaction.create({
  draft: true,
  transactionName: 'Power of Attorney - Signer Smith',
  transactionType: 'Power of Attorney',
  documents: [
    {
      resource: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      requirement: 'notarization',
      customerCanAnnotate: false
    },
    {
      resource: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      requirement: 'notarization',
      customerCanAnnotate: true
    }
  ],
  signers: [
    { email: 'signer@notarize.com' },
  ],
})
```

This will create the transaction, starting in the `draft` mode so that documents
can be added, and then the transaction can be activated. The response will be
something like:

```javascript
{
  "success": true,
  "transaction": {
    "id": "ot_anpr8qn",
    "status": "draft",
    "dateCreated": "2019-10-01T18:52:44.725Z",
    "dateUpdated": "2019-10-02T20:13:54.245Z",
    "documents": [{
      "id": "do_c7e0e599-5e94-4ac1-a4a3-7e09f9994934",
      "dateCreated": "2019-10-02T17:09:52.248711Z",
      "dateUpdated": "2019-10-02T17:09:52.248711Z",
      "documentName": "document.pdf",
      "allowedActions": ["NOTARIZATION_REQUIRED"],
      "bundlePosition": 0,
      "processingState": "pending"
    }],
    "signers": [{
      "email": "signer@notarize.com",
      "firstName": "Signer",
      "lastName": "Smith",
      "transactionAccessLink": "https://app.notarize.com/activate-transaction?1234"
    }],
    "transactionName": "Power of Attorney - Signer Smith",
    "transactionType": "Power of Attorney",
    "detailedStatus": "started",
    "messageToSigner": "Please notarize this power of attorney form.",
    "messageSignature": "The Team"
  }
}
```

#### [List Transactions](https://dev.notarize.com/reference#list-business-transactions)

```typescript
const lst = await client.transaction.list()
```

This will list up to 10 transactions with the response:

```javascript
{
  "success": true,
  "count": 2,
  "transactions":  [
    {
      "id": "ot_anpr8qn",
      "dateCreated": "2016-10-01T18:52:44.725Z",
      "dateUpdated": "2016-10-02T20:13:54.245Z",
      "signerInfo": {
        "email": "miguel.lee@notarize.com",
        "firstName": "Miguel",
        "lastName": "Lee",
        "transactionAccessLink": "https://app.notarize.com/activate-transaction?bundle_id=some-bundle-id&code=some-code&email=some@email.com"
      },
      "documents": [{
        "id": "do_c7e0e599-5e94-4ac1-a4a3-7e09f9994934",
        "dateCreated": "2017-05-09T17:09:52.248711Z",
        "dateUpdated": "2017-05-09T17:09:52.248711Z",
        "documentName": "document.pdf",
        "allowedActions": ["NOTARIZATION_REQUIRED"],
        "bundlePosition": 0
      }],
      "transactionName": "Miguel's TPS notarization for Leeroy.",
      "transactionType": "Power of Attorney",
      "messageToSigner": "Please notarize your TPS Report.",
      "status": "sent",
      "requireSecondaryPhotoId": false
    },
    {
      "id": "ot_anpr8qn",
      "dateCreated": "2016-10-01T18:52:44.725Z",
      "dateUpdated": "2016-10-02T20:13:54.245Z",
      "signerInfo": {
        "email": "miguel.lee@notarize.com",
        "firstName": "Miguel",
        "lastName": "Lee",
        "transactionAccessLink": "https://app.notarize.com/activate-transaction?bundle_id=some-bundle-id&code=some-code&email=some@email.com"
      },
      "documents": [{
        "id": "do_c7e0e599-5e94-4ac1-a4a3-7e09f9994934",
        "dateCreated": "2017-05-09T17:09:52.248711Z",
        "dateUpdated": "2017-05-09T17:09:52.248711Z",
        "documentName": "pdf.pdf",
        "allowedActions": ["NOTARIZATION_REQUIRED"],
        "bundlePosition": 0
      }, {
        "id": "do_d46a3751-399f-4149-b7b2-d46aea498011",
        "dateCreated": "2017-05-09T17:09:52.872688Z",
        "dateUpdated": "2017-05-09T17:09:52.872688Z",
        "documentName": "pdf-sample.pdf",
        "allowedActions": ["NOTARIZATION_REQUIRED"],
        "bundlePosition": 1
      }],
      "transactionName": "Miguel's TPS notarization for Leeroy.",
      "transactionType": "Power of Attorney",
      "detailedStatus": "started",
      "messageToSigner": "Please notarize your TPS Report.",
      "messageSignature": "Love, Leeroy.",
      "status": "sent",
      "requireSecondaryPhotoId": false
    }
  ],
}
```

Yet this function also takes options:

```typescript
const lst = await client.transaction.list(opts)
```

where the options can be:

```typescript
{
  limit?: number;
  offset?: number;
}
```

So, to get the first 100, simply call:

```typescript
const lst = await client.transaction.list({ limit: 100 })
```

#### [Add Document](https://dev.notarize.com/reference#add-business-documents)

```typescript
const doc = await client.transaction.addDocument(id, {
  resource: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
  requirement: 'esign',
  customer_CanAnnotate: true
})
```

where `id` is the id of a transaction to add the document to, and this will
return something like:

```javascript
{
  "success": true,
  "document": {
    "id": "do_29f983a4-8485-4afb-8343-95996f75c2d5",
    "dateCreated": "2019-05-10T13:10:20.702098Z",
    "dateUpdated": "2019-05-10T13:10:20.702098Z",
    "documentName": "document.pdf",
    "allowedActions": ["ESIGN_REQUIRED","CUSTOMER_CAN_ANNOTATE"],
    "bundlePosition": 1,
    "processingState": "pending"
  }
}
```

#### [Update Draft Transaction](https://dev.notarize.com/reference#update-draft-business-transaction)

```typescript
const trans = await client.transaction.update(id, {
  allowSignerAnnotations: false,
  requireSecondaryPhotoId: false,
  suppressEmail: false
})
```

where `id` is the id of a transaction to update, and this will return
something like:

```javascript
{
  "success": true,
  "transaction": {
    "id": "ot_anpr8qn",
    "dateCreated": "2016-10-01T18:52:44.725Z",
    "dateUpdated": "2016-10-02T20:13:54.245Z",
    "signerInfo": {
      "email": "miguel.lee@notarize.com",
      "firstName": "Miguel",
      "lastName": "Lee",
      "transactionAccessLink": "https://app.notarize.com/activate-transaction?bundle_id=some-bundle-id&code=some-code&email=some@email.com"
    },
    "documents": [{
      "id": "do_c7e0e599-5e94-4ac1-a4a3-7e09f9994934",
      "dateCreated": "2017-05-09T17:09:52.248711Z",
      "dateUpdated": "2017-05-09T17:09:52.248711Z",
      "documentName": "document.pdf",
      "allowedActions": ["NOTARIZATION_REQUIRED"],
      "bundlePosition": 0
    }],
    "transactionName": "Miguel's TPS notarization for Leeroy",
    "transactionType": "Power of Attorney",
    "messageToSigner": "Please notarize your TPS Report.",
    "messageSignature": "Love, Leeroy.",
    "status": "sent",
    "detailedStatus": "started",
    "requireSecondary_photo_id": false
  }
}
```

#### [Activate Draft Transaction](https://dev.notarize.com/reference#activate-draft-business-transaction)

```typescript
const trans = await client.transaction.activate(id)
```

where `id` is the id of a transaction to activate, and this will return
something like:

```javascript
{
  "success": true,
  "transaction": {
    "id": "ot_anpr8qn",
    "dateCreated": "2016-10-01T18:52:44.725Z",
    "dateUpdated": "2016-10-02T20:13:54.245Z",
    "signerInfo": {
      "email": "miguel.lee@notarize.com",
      "firstName": "Miguel",
      "lastName": "Lee",
      "transactionAccessLink": "https://app.notarize.com/activate-transaction?bundle_id=some-bundle-id&code=some-code&email=some@email.com"
    },
    "documents": [{
      "id": "do_c7e0e599-5e94-4ac1-a4a3-7e09f9994934",
      "dateCreated": "2017-05-09T17:09:52.248711Z",
      "dateUpdated": "2017-05-09T17:09:52.248711Z",
      "documentName": "pdf.pdf",
      "allowedActions": ["NOTARIZATION_REQUIRED"],
      "bundlePosition": 0
    }, {
      "id": "do_d46a3751-399f-4149-b7b2-d46aea498011",
      "dateCreated": "2017-05-09T17:09:52.872688Z",
      "dateUpdated": "2017-05-09T17:09:52.872688Z",
      "documentName": "pdf-sample.pdf",
      "allowedActions": ["NOTARIZATION_REQUIRED"],
      "bundlePosition": 1
    }],
    "transactionName": "Miguel's TPS notarization for Leeroy.",
    "transactionType": "Power of Attorney",
    "detailedStatus": "sent_to_signer",
    "messageToSigner": "Please notarize your TPS Report.",
    "messageSignature": "Love, Leeroy.",
    "status": "sent",
    "requireSecondaryPhotoId": false
  }
}
```

If you'd like to update the `suppressEmail` flag on the transaction, that's
done with the optional argument on the call:

```typescript
const trans = await client.transaction.activate(id, false)
```

will indicating that `suppressEmail` should be set to `false`.

#### [Delete Transaction](https://dev.notarize.com/reference#delete-business-transaction)

```typescript
const resp = await client.transaction.delete(id)
```

where `id` is the id of a transaction to delete, and this will return
something like:

```javascript
{
  "success": true,
  "message": "Deleted Transaction abcdefghijk successfully"
}
```

#### [Resend Transaction Email]()

```typescript
const trans = await client.transaction.resendEmail(id)
```

where `id` is the id of a transaction to resend the email(s) for, and this
will return something like:

```javascript
{
  "success": true,
  "transaction": {
    "id": "ot_anpr8qn",
    "dateCreated": "2016-10-01T18:52:44.725Z",
    "dateUpdated": "2016-10-02T20:13:54.245Z",
    "signerInfo": {
      "email": "miguel.lee@notarize.com",
      "firstName": "Miguel",
      "lastName": "Lee",
      "transactionAccessLink": "https://app.notarize.com/activate-transaction?bundle_id=some-bundle-id&code=some-code&email=some@email.com"
    },
    "documents": [{
      "id": "do_c7e0e599-5e94-4ac1-a4a3-7e09f9994934",
      "dateCreated": "2017-05-09T17:09:52.248711Z",
      "dateUpdated": "2017-05-09T17:09:52.248711Z",
      "documentName": "document.pdf",
      "allowedActions": ["NOTARIZATION_REQUIRED"],
      "bundlePosition": 0
    }],
    "transactionName": "Miguel's TPS notarization for Leeroy.",
    "transactionType": "Power of Attorney",
    "detailedStatus": "started",
    "messageToSigner": "Please notarize your TPS Report.",
    "messageSignature": "Love, Leeroy.",
    "status": "sent",
    "requireSecondaryPhotoId": false
  }
}
```

This function also allows the `messageToSender` to be passed-into the call as
an optional parameter:

```typescript
const trans = await client.transaction.resendEmail(id, 'Second email message')
```

#### [Resend Transaction SMS](https://dev.notarize.com/reference#resend-business-transaction-sms)

```typescript
const trans = await client.transaction.resendSms(id)
```

where `id` is the id of a transaction to resend the SMS message(s) for, and
this will return something like:

```javascript
{
  "success": true,
  "transaction": {
    "id": "ot_anpr8qn",
    "dateCreated": "2016-10-01T18:52:44.725Z",
    "dateUpdated": "2016-10-02T20:13:54.245Z",
    "signerInfo": {
      "email": "testerson@notarize.com",
      "firstName": "Testy",
      "lastName": "McTesterson",
      "transactionAccessLink": "https://app.notarize.com/activate-transaction?bundle_id=some-bundle-id&code=some-code&email=some@email.com",
      "phone": {
        "countryCode": "1",
        "number": "5555555555"
      }
    },
    "documents": [{
      "id": "do_c7e0e599-5e94-4ac1-a4a3-7e09f9994934",
      "dateCreated": "2017-05-09T17:09:52.248711Z",
      "dateUpdated": "2017-05-09T17:09:52.248711Z",
      "documentName": "document.pdf",
      "allowedActions": ["NOTARIZATION_REQUIRED"],
      "bundlePosition": 0
    }],
    "transactionName": "Miguel's TPS notarization for Leeroy.",
    "transactionType": "Power of Attorney",
    "detailedStatus": "started",
    "messageToSigner": "Please notarize your TPS Report.",
    "messageSignature": "Love, Leeroy.",
    "status": "sent",
    "requireSecondaryPhotoId": false
  }
}
```

This function also allows the `phone` to be passed-into the call as
an optional parameter:

```typescript
const trans = await client.transaction.resendSms(id, {
  countryCode: '1',
  number: '515-555-5555'
})
```

#### [Retrieve Meeting Record](https://dev.notarize.com/reference#recall-business-meeting-record)

```typescript
const rec = await client.transaction.retrieveMeetingRecord(id)
```

where `id` is the id of a transaction to pull the meeting record for, and
this will return something like:

```javascript
{
  "success": true,
  "record": {
    "id": "me_rnykzyn",
    "meetingStart": "2016-10-01T18:52:44.725Z",
    "meetingEnd": "2016-10-01T18:58:54.245Z",
    "notaryName": "Leeroy Jenkins",
    "notaryRegistration": "1337",
    "signerInfo": {
      "email": "miguel.lee@notarize.com",
      "firstName": "Miguel",
      "lastName": "Lee"
    },
    "notarizedDocuments": [{
      "notarialActs": [
        "jurat",
        "verification_of_fact"
      ],
      "documentUrl": "https://s3-us-west-2.amazonaws.com/assets.notarize.com/document.pdf?AWSAccessKeyId=AKIAJVT3IPSNH662QU6A&Expires=1449430428&Signature=j%2FTzUuHJkrlbAJZGNpCm3xfxgmE%3D"
    }],
    "verificationCredentials": {
      "retrievalId": "CTJHT32H",
      "retrievalPin": "7RNTNN",
      "lastName": "Lee",
      "dateCompleted": "10/19/2016"
    },
    "signerPhotoIdentification": {
      "primaryFront": "https://s3-us-west-2.amazonaws.com/assets.notarize.com/primary_front.png?AWSAccessKeyId=AKIAJVT3IPSNH662QU6A&Expires=1449430428&Signature=j%2FTzUuHJkrlbAJZGNpCm3xfxgmE%3D",
      "primaryBack": "https://s3-us-west-2.amazonaws.com/assets.notarize.com/primary_back.png?AWSAccessKeyId=AKIAJVT3IPSNH662QU6A&Expires=1449430428&Signature=j%2FTzUuHJkrlbAJZGNpCm3xfxgmE%3D",
      "secondaryFront": "https://s3-us-west-2.amazonaws.com/assets.notarize.com/primary_back.png?AWSAccessKeyId=AKIAJVT3IPSNH662QU6A&Expires=1449430428&Signature=j%2FTzUuHJkrlbAJZGNpCm3xfxgmE%3D"
    }
  }
}
```

### Webhook Calls

#### [Set/Update Webhook URL](https://dev.notarize.com/reference#set-business-webhook)

```typescript
const hook = await client.webhook.update('https://my.service.com/esign/callback')
```

This will set, or update, the webhook URL for all subsequent calls by
Notarize.com - until the webhook is deleted, or changed to something else.
The response will be something like:

```javascript
{
  "success": true,
  "webhookUrl": "https://my.service.com/esign/callback",
  "header": ""
}
```

It's also possible to set the `header` to be returned on each webhook call, by
including it as the second, optional, parameter to the call:

```typescript
const hook = await client.webhook.update(
  'https://my.service.com/esign/callback',
  'MyHeaderName:mySecretValue'
)
```

#### [Retrieve Webhook URL](https://dev.notarize.com/reference#retrieve-business-webhook)

```typescript
const hook = await client.webhook.retrieve()
```

This will return the webhook URL for calls by Notarize.com - until the webhook
is deleted, or changed to something else. The response will be something like:

```javascript
{
  "success": true,
  "webhookUrl": "https://my.service.com/esign/callback"
}
```

#### [Delete Webhook URL](https://dev.notarize.com/reference#delete-business-webhook)

```typescript
const hook = await client.webhook.delete()
```

This will delete (clear) the webhook URL for any subsequent calls by
Notarize.com - until the webhook is set. The response will be something like:

```javascript
{
  "success": true
}
```

#### [Simulate Webhook Responses](https://dev.notarize.com/reference#simulate-webhook-reponses)

```typescript
const hook = await client.webhook.simulateResponses({
  "event": "transaction_status_update",
  "data": {
    "transactionId": "jhkjhkjh",
    "status": "received"
  }
})
```

If a webhook is set, then this will send the provided data to the webhook URL
for processing by your receiver code of the webhooks. This is simply a way to
send test data _through_ Notarize.com to your webhook receiver endpoint.
The response will be something like:

```javascript
{
  "success": true
}
```

## Development

For those interested in working on the library, there are a few things that
will make that job a little simpler. The organization of the code is all in
`src/`, with one module per _section_ of the Client: `document`, `template`,
etc. This makes location of the function very easy.

Additionally, the main communication with the Notarize service is in the
`src/index.ts` module in the `fire()` function. In the constructor for the
Client, each of the _sections_ are created, and then they link back to the
main class for their communication work.

### Setup

In order to work with the code, the development dependencies include `dotenv`
so that each user can create a `.env` file with two values for working with
Notarize.com:

* `NOTARIZE_API_KEY` - this is the API Key referred to, above, and can be
   created on the Notarize website's API Keys
   [page](https://business.notarize.com/settings/api)
* `NOTARIZE_TEST_EMAIL` - this is your email, or a test email, that will be
   used in all the tests in `tests/` so that you can easily control the
   destionation for the emails.

### Testing

There are several test scripts that create, test, and tear-down, state on the
Notarize.com service exercising different parts of the API. Each is
self-contained, and can be run with:

```bash
$ npm run ts tests/update-transaction.ts
creating a new transaction...
Success!
updating the new transaction...
Success!
retrieving the updated transaction...
Success!
deleting the new transaction...
Success!
```

Each of the tests will run a series of calls through the Client, and check the
results to see that the operation succeeded. As shown, if the steps all
report back with `Success!` then things are working.

If there is an issue with one of the calls, then an `Error!` will be printed
out, and the data returned from the client will be dumped to the console.
