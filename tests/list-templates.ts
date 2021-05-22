import { Notarize } from '../src/index'

(async () => {
  const client = new Notarize(process.env.NOTARIZE_API_KEY!)
  console.log('getting a list of all the templates...')
  const one = await client.template.list()
  if (one.success) {
    console.log('Success!')
  } else {
    console.log('Error! I was not able to get a list of the templates')
    console.log(one)
  }
})()
