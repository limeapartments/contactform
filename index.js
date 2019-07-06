const fs = require('fs')
const https = require('https')
const nodemailer = require('nodemailer')
const express = require('express')

const receivers = [
  'jchancehud@gmail.com',
]

const app = express()

const privateKey = fs.readFileSync('/ssl/privkey.pem')
const certificate = fs.readFileSync('/ssl/fullchain.pem')

const server = https.createServer({
  key: privateKey,
  cert: certificate,
}, app)

// If we have local credentials load them
if (fs.existsSync('./credentials.js')) {
  require('./credentials')
}

app.use(express.json())

// CORS
app.use((_, res, next) => {
  res.set('Access-Control-Allow-Origin', '*')
  res.set('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')
  res.set('Access-Control-Allow-Headers', 'content-type')
  next()
})

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
      html: `
      <p>
        First Name: ${req.body.firstname}
      </p>
      <p>
        Last Name: ${req.body.lastname}
      </p>
      <p>
        Email: ${req.body.email}
      </p>
      <p>
        Phone: ${req.body.phone}
      </p>
      <p>
        Comments:
        ${req.body.comments}
      </p>
      `,
    })
  } catch (err) {
    console.log('Error sending email', err)
    res.status(500).send('Error sending email')
  } finally {
    res.status(204).end()
  }
})

// Bind to 443 at the vm abstraction level
server.listen(4000)
