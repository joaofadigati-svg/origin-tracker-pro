export default defineEventHandler((event) => {
  const auth = getRequestHeader(event, 'authorization') ?? ''
  
  if (auth.startsWith('Basic ')) {
    const decoded = Buffer.from(auth.slice(6), 'base64').toString()
    const [user, pass] = decoded.split(':')
    if (user === 'admin' && pass === '!Claw2020') return
  }

  setResponseHeader(event, 'WWW-Authenticate', 'Basic realm="Tags Origens"')
  throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
})
