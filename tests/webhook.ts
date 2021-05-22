import { Notarize } from '../src/index'

(async () => {
  const client = new Notarize(process.env.NOTARIZE_API_KEY!)
  console.log('getting the existing webhook for the API Key...')
  const orig = await client.webhook.retrieve()
  if (orig.success) {
    console.log('Success!')
  } else {
    console.log('Looks like there is no webhook for this API Key, received:')
    console.log(orig)
  }

  console.log('Setting webhook to specific URL...')
  const one = await client.webhook.update('https://mine.ngrok.io/yoyo/ma')
  if (one.success) {
    console.log('Success!')
  } else {
    console.log('Error! I was not able to set the webhook to a specific URL!')
    console.log(one)
  }

  if (one.success) {
    console.log('reading the previously set webhook - to verify...')
    const two = await client.webhook.retrieve()
    if (two.success && two.webhookUrl === 'https://mine.ngrok.io/yoyo/ma') {
      console.log('Success!')
    } else {
      console.log('Error! Either I could not read it, or it did not match what was set')
      console.log(two)
    }
  }

  if (one.success) {
    console.log('clearing the webhook entirely...')
    const tre = await client.webhook.delete()
    if (tre.success) {
      console.log('Success!')
    } else {
      console.log('Error! I was unable to clear out the webhook URL:')
      console.log(tre)
    }
  }

  if (orig.webhookUrl) {
    console.log('Putting back original webhook URL')
    const fre = await client.webhook.update(orig.webhookUrl)
    if (fre.success) {
      console.log('Success!')
    } else {
      console.log('Error! I was unable to put the original webhook URL back:')
      console.log(fre)
    }
  }
})()
