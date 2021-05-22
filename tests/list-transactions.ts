import { Notarize } from '../src/index'

(async () => {
  const client = new Notarize(process.env.NOTARIZE_API_KEY!)
  const hook = await client.transaction.list()
  console.log(hook)
})()
