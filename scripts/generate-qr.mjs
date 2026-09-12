// Generates a scannable QR code PNG for the actual deployed HTTPS URL.
// Usage: npm run qr -- https://your-deployed-url.example.com
// Does NOT fabricate a URL — it errors out if none is given.
import QRCode from 'qrcode'
import { writeFile } from 'node:fs/promises'

const url = process.argv[2]
if (!url) {
  console.error('Usage: npm run qr -- <deployed HTTPS URL>')
  console.error('No URL was provided — refusing to generate a QR code for a fabricated address.')
  process.exit(1)
}
if (!url.startsWith('https://')) {
  console.error('Expected an https:// URL. Got:', url)
  process.exit(1)
}

const outPath = 'yaadri-qr.png'
await QRCode.toFile(outPath, url, { width: 512, margin: 2 })
console.log(`QR code for ${url} written to ${outPath}`)
console.log('Test it by scanning with a phone camera before the demo.')
