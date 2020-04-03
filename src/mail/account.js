const sgMail = require('@sendgrid/mail')
sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const sendWelcomeEmail = (email, name) => {
  sgMail.send({
    to: email,
    from: 'lucasarbexmb@gmail.com',
    subject: 'Thanks for joining in.',
    text: `Welcome to the app, ${name}.`
  })
}

const sendCancelationEmail = (email, name) => {
  sgMail.send({
    to: email,
    from: 'lucasarbexmb@gmail.com',
    subject: 'Your account has been canceled.',
    text: `I am sorry to see you leave, ${name}.`
  })
}

module.exports = {
  sendWelcomeEmail,
  sendCancelationEmail
}
