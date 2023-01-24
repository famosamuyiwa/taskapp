const sgMail = require("@sendgrid/mail")


const msg = {
    to : "famosaoluwamuyiwa@gmail.com",
    from: "nenling19@gmail.com",
    subject: "Your first official email",
    text:   "Hello, how you doing???",
    html:"<b>Body</b>"
}

// sgMail.setApiKey(sendGridAPIKey)
// sgMail
//   .send(msg)
//   .then(() => {
//     console.log('Email sent')
//   })
//   .catch((error) => {
//     console.error(error)
//   })