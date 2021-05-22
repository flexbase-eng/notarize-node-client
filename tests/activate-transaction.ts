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
    console.log('activating the new transaction...')
    const two = await client.transaction.activate(one.transaction!.id)
    if (two.success && two.transaction!.status === 'sent') {
      console.log('Success!')
    } else {
      console.log('Error! I was unable to activate the transaction, or was unable to verify it:')
      console.log(two)
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
