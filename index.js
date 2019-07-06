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
      First Name: ${req.body.firstname}

      Last Name: ${req.body.lastname}

      Email: ${req.body.email}

      Phone: ${req.body.phone}

      Comments:
      ${req.body.comments}
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
