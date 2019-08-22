const nodemailer = require('nodemailer')
const express = require('express')
const validator = require('email-validator')

const app = express()
app.use(express.json())

// CORS
app.use((_, res, next) => {
  res.set('Access-Control-Allow-Origin', '*')
  res.set('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')
  res.set('Access-Control-Allow-Headers', 'content-type')
  next()
})

app.post('/send', async (req, res) => {
  if (!process.env.RECEIVER_EMAILS) {
    console.log('No receiver emails specified')
    return res.status(500).end()
  }
  const receivers = process.env.RECEIVER_EMAILS.split(',')
  // Validate supplied receiver emails
  for (const email of receivers) {
    if (validator.validate(email)) continue
    console.log(`Invalid email "${email}" supplied, exiting`)
    return res.status(500).end()
  }

  try {
    const transport = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.SENDER_EMAIL,
        pass: process.env.SENDER_PASSWORD,
      }
    })
    const {
      name: _name,
      email,
      firstname,
      lastname,
      comments,
      _receiver
    } = req.body
    const name = _name || `${firstname} ${lastname}`
    const info = await transport.sendMail({
      from: 'contact@limeapartments.com',
      to: /* _receiver || */ receivers,
      subject: 'Lime Apartments',
      html: `Name: ${name}
Email Address: ${email}
Lead Channel: Lime Apartments
Comments: ${comments}`,
    } )
  } catch (err) {
    console.log('Error sending email', err)
    res.status(500).send('Error sending email')
  } finally {
    res.status(204).end()
  }
})

module.exports = app
