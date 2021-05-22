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

  if (one.success) {
    console.log('deleting the first document on the new transaction...')
    const two = await client.document.delete(one.transaction!.documents[0].id)
    if (two.success) {
      console.log('Success!')
    } else {
      console.log('Error! I was unable to delete the document from the new transaction:')
      console.log(two)
    }
  }

  if (one.success) {
    console.log('pulling back the updated transaction...')
    const chk = await client.transaction.retrieve(one.transaction!.id)
    if (chk.success && chk.transaction!.documents.length == 1) {
      console.log('Success!')
    } else {
      console.log('Error! I was unable to verify that the transaction has only one document left:')
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
