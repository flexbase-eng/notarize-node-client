import { Notarize } from '../src/index'

(async () => {
  const client = new Notarize(process.env.NOTARIZE_API_KEY!)
  const hook = await client.transaction.retrieveMeetingRecord('me_dj3xbkx')
  console.log(hook)
})()
