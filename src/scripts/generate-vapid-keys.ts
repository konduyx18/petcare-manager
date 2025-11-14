import webpush from 'web-push'

const vapidKeys = webpush.generateVAPIDKeys()

console.log('Public Key:', vapidKeys.publicKey)
console.log('Private Key:', vapidKeys.privateKey)

console.log('\n📋 Add these to your .env.local file:')
console.log(`VITE_VAPID_PUBLIC_KEY=${vapidKeys.publicKey}`)
console.log(`VAPID_PRIVATE_KEY=${vapidKeys.privateKey}`)

