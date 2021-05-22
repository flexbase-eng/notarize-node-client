const delay = require('delay')

import { Notarize } from '../src/index'

(async () => {
  const client = new Notarize(process.env.NOTARIZE_API_KEY!)
  console.log('creating a new transaction...')
  const one = await client.transaction.create({
    draft: true,
    transactionName: 'Testing Node Client',
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
      { email: process.env.NOTARIZE_TEST_EMAIL! },
    ],
  })
  if (one.success) {
    console.log('Success!')
  } else {
    console.log('Error! Creating a new transaction failed, and the output is:')
    console.log(one)
  }

  console.log('looking at the first document...')
  const docOne = one.transaction!.documents[0]
  if (docOne.id && docOne.requirement && docOne.processingState) {
    console.log('Success!')
  } else {
    console.log('Error! It looks like the documents were created properly on the transaction!')
    console.log(docOne)
  }

  if (one.success) {
    console.log('pausing for 5sec to let service process new transaction...')
    await delay(10 * 1000)
    console.log('retrieving the same document to validate get()')
    const chk = await client.document.get(one.transaction!.id, docOne.id)
    if (chk.success && chk.document!.trackingId === null) {
      console.log('Success!')
    } else {
      console.log('Error! I was unable to pull the original document:')
      console.log(chk)
     }
  }

  if (one.success) {
    console.log('updating the first document on the new transaction...')
    const two = await client.document.update(
      docOne.id,
      {
        trackingId: '11-222-333-44',
      }
    )
    if (two.document!.trackingId === '11-222-333-44') {
      console.log('Success!')
    } else {
      console.log('Error! We were not able to update the first document on the transaction.')
      console.log(two)
    }
  }

  if (one.success) {
    console.log('retrieving the updated document to validate change')
    const chk = await client.document.get(one.transaction!.id, docOne.id)
    if (chk.success && chk.document!.trackingId === '11-222-333-44') {
      console.log('Success!')
    } else {
      console.log('Error! I was unable to pull the updated document, or it was not updated:')
      console.log(chk)
    }
  }

  if (one.success) {
    console.log('deleting the new transaction...')
    const tre = await client.transaction.delete(one.transaction!.id)
    if (tre.success) {
      console.log('Success!')
    } else {
      console.log('Error! Deleting the new transaction failed, and the output is:')
      console.log(tre)
    }
  }
})()
