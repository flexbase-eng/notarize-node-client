import { Notarize } from '../src/index'

(async () => {
  const client = new Notarize(process.env.NOTARIZE_API_KEY!, {
    host: process.env.NOTARIZE_HOST,
    webhookUrl: process.env.NOTARIZE_WEBHOOK,
  })
  console.log('creating a new transaction...')
  const one = await client.transaction.create({
    draft: true,
    transactionName: 'Testing Node Client',
    documents: [
      {
        resource: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        requirement: 'notarization',
        customerCanAnnotate: false
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

  if (one.success) {
    console.log('adding a new document to the new transaction...')
    const two = await client.transaction.addDocument(
      one.transaction!.id,
      {
        resource: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        requirement: 'notarization',
        customerCanAnnotate: true
      }
    )
    if (two.success) {
      console.log('Success!')
    } else {
      console.log('Error! I was unable to add a new document to the new transaction:')
      console.log(two)
    }
  }

  if (one.success) {
    console.log('pulling back the updated transaction...')
    const chk = await client.transaction.retrieve(one.transaction!.id)
    if (chk.success && chk.transaction!.documents.length == 2) {
      console.log('Success!')
    } else {
      console.log('Error! I was unable to verify that the transaction has two document now:')
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
