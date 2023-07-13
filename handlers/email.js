const nodemailer = require('nodemailer')
const emailConfig = require('../config/email.js')
const fs = require('fs')
const util = require('util')
const ejs = require('ejs')
const env = require('process')

let transport = nodemailer.createTransport({
    host: emailConfig.host,
    port: emailConfig.port,
    auth: {
      user: emailConfig.user,
      pass: emailConfig.pass
    }
  });

  exports.Email = async (opciones) => {
   
    const archivo = __dirname + `/../views/emails/${opciones.archivo}.ejs`

    // leer y compilar contenido del archivo
    const compilado = ejs.compile(fs.readFileSync(archivo, 'utf-8'))

    // crear html
    const html = compilado({url : opciones.url })

    // opciones del email
    const optEmail = {
        from : 'Meeti <noreply@meeti.com>',
        to: opciones.usuario.email,
        subject: opciones.subject,
        html
    }
    // enviar email
    const enviarE = util.promisify(transport.sendMail, transport)
    return enviarE.call(transport, optEmail)
  }
