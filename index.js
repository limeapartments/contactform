const fs = require('fs')
const https = require('https')
const http = require('http')
const nodemailer = require('nodemailer')
const express = require('express')
const path = require('path')
const validator = require('email-validator')

// If we have local credentials load them
if (fs.existsSync('./credentials.js')) {
  require('./credentials')
}

if (!process.env.RECEIVER_EMAILS) {
  console.log('No receiver emails specified')
  return process.exit(1)
}

const receivers = process.env.RECEIVER_EMAILS.split(',')

// Validate supplied receiver emails
for (const email of receivers) {
  if (validator.validate(email)) continue
  console.log(`Invalid email "${email}" supplied, exiting`)
  return process.exit(1)
}

const app = express()
app.use(express.json())

// CORS
app.use((_, res, next) => {
  res.set('Access-Control-Allow-Origin', '*')
  res.set('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')
  res.set('Access-Control-Allow-Headers', 'content-type')
  next()
})

const sslPath = '/ssl'

const server = fs.existsSync(sslPath) ? https.createServer({
  key: fs.readFileSync(path.join(sslPath, 'privkey.pem')),
  cert: fs.readFileSync(path.join(sslPath, 'fullchain.pem')),
}, app) : http.createServer(app)

app.post('/send', async (req, res) => {
  try {
    const transport = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.SENDER_EMAIL,
        pass: process.env.SENDER_PASSWORD,
      }
    })
    const info = await transport.sendMail({
      from: 'contact@limeapartments.com',
      to: receivers,
      subject: 'New Contact',
      html: `First Name: ${req.body.firstname} ${req.body.lastname}
Email Address: ${req.body.email}
Lead Channel: Lime Apartments
Comments: ${req.body.comments}`,
    })
  } catch (err) {
    console.log('Error sending email', err)
    res.status(500).send('Error sending email')
  } finally {
    res.status(204).end()
  }
})

app.get('/ping', (req, res) => res.send('pong'))

// Bind to 443 at the vm abstraction level
server.listen(4000, () => {
  console.log('Listening for emails at', receivers.join(','))
})
