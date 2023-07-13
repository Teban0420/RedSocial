const { check, validationResult } = require('express-validator')
const passport = require("passport");
// const { Vonage } = require('@vonage/server-sdk')
const Usuarios = require('../models/Usuarios.js')
const enviarEmail = require('../handlers/email.js')

// const vonage = new Vonage({
//     apiKey: "662357d0",
//     apiSecret: "jxZFFdjgzgk9qryq"
// })

const multer = require('multer')
const shortid = require('shortid')
const fs = require('fs')


const configMulter = {

    limits: { fileSize: 200000}, 

    storage: fileStorage = multer.diskStorage({
        
        destination: (req, file, next) => {
            next(null, __dirname+'/../public/uploads/perfiles/')
        },

        filename: (req, file, next) => {
            const extension = file.mimetype.split('/')[1]
            next(null, `${shortid.generate()}.${extension}`)
        }
    }),

    fileFilter(req, file, next){
        if(file.mimetype === 'image/jpeg' || file.mimetype === 'image/png'){
            next(null, true)
        }else{
            next(new Error('Formato no válido'), false)
        }
    }

}
const upload = multer(configMulter).single('imagen')

exports.subirImagen = (req, res, next) => {
    
    upload(req, res, function(err) {

        if(err){
            if(err instanceof multer.MulterError){
                if(err.code === 'LIMIT_FILE_SIZE'){
                    req.flash('error', 'El archivo es muy grande')
                }
                else{
                    req.flash('error', err.message)
                }
            } 
            else if(err.hasOwnProperty('message')){
                req.flash('error', err.message)
            }
            res.redirect('back')
            return
        }
        else{
            next()
        }
    })
}
exports.formCrearCuenta = (req, res) => {
    
    res.render('crear-cuenta', {
        pagina: 'Crea Tu Cuenta'
    })
}

exports.crearNuevaCuenta = async (req, res) => {

    const {nombre, email, password} = req.body

    await check('nombre').notEmpty().withMessage('El nombre es obligatorio').escape().run(req)
    await check('email').isEmail().withMessage('Email no valido').escape().run(req)
    await check('password').isLength({min: 6}).withMessage('La contraseña debe contener minimo 6 caracteres').escape().run(req)
    await check('confirmar').notEmpty().withMessage('Confirma la contraseña').escape().run(req)
    await check('confirmar').equals('password').withMessage('Las contraseñas son diferentes').escape().run(req)
        
    // leer errores de express
    let errorExpress = validationResult(req) 
    
    if(!errorExpress.isEmpty()){
        const errores = errorExpress.array().map( err => err.msg)
        req.flash('error', errores)
        return res.redirect('/crear-cuenta')
    }
   
    const existeUser = await Usuarios.findOne({where: {email: req.body.email}})

    if(existeUser){
         req.flash('error', 'El usuario ya esta registrado')
         return res.redirect('/crear-cuenta')
    }

    try { 
        
        const usuario = await Usuarios.create({ 
            nombre,
            email,
            password
        })

        // url de confirmacion
        const url = `http://${req.headers.host}/confirmar-cuenta/${usuario.email}`

        // enviar email confirmacion 
        enviarEmail.Email({
            usuario,
            url,
            subject: 'Confirma tu cuenta de Meeti',
            archivo: 'confirmar-cuenta'
        })

        // const from = "Vonage APIs"
        // const to = "573217565884"
        // const text = 'Creaste una cuenta en Meeti'

        // async function sendSMS() {
        //     await vonage.sms.send({to, from, text})
        //         .then(resp => { console.log('Message sent successfully'); console.log(resp); })
        //         .catch(err => { console.log('There was an error sending the messages.'); console.error(err); });
        // }
        
        // sendSMS();

        req.flash('exito', 'Hemos enviado un email, confirma tu cuenta')
        res.redirect('/iniciar-sesion')

    } catch (error) {

        
        console.log(error)

        req.flash('error', error)
        res.redirect('/crear-cuenta')
    }
}

exports.confirmarCuenta = async (req, res, next) => {

    // verificar que usuario existe
    const usuario = await Usuarios.findOne({ where: {email: req.params.correo}})
    
    if(!usuario){
        req.flash('error', 'No existe ese usuario')
        res.redirect('/crear-cuenta')
        return next() // fuerza la ejecucion del middeware (finaliza)
    }

    usuario.activo = 1
    await usuario.save()

    req.flash('exito', 'La cuenta se confirmo ya puedes iniciar sesion')
    res.redirect('/iniciar-sesion')

}

exports.formIniciarSesion = (req, res) => {
    
    res.render('iniciar-sesion', {
        pagina: 'Inicia Sesión'
    })
}

exports.formEditarPerfil = async (req, res) => {

    const usuario = await Usuarios.findByPk(req.user.id)
    res.render('editar-perfil', {
        pagina: 'Editar Perfil',
        usuario
    })
}

exports.EditarPerfil = async (req, res) => {

    const usuario = await Usuarios.findByPk(req.user.id)
    
    check('nombre').escape().run(req)
    check('email').escape().run(req)

    const { nombre, descripcion, email } = req.body

    usuario.nombre = nombre
    usuario.descripcion = descripcion
    usuario.email = email

    await usuario.save()
    req.flash('exito', 'Cambios Guardados Correctamente')
    res.redirect('/administracion')
}

exports.formCambiarPassword = (req, res) => {

    res.render('cambiar-password', {
        pagina: 'Cambiar Password'
    })
}

exports.CambiarPassword = async (req, res, next) => {

    const usuario = await Usuarios.findByPk(req.user.id)

    // validar password actual
    if(!usuario.validarPassword(req.body.anterior)){
        req.flash('error', 'La Contraseña actual es incorrecta')
        res.redirect('/administracion')
        return next()
    }

    // si password es correcto hashear el nuevo
    const hash = usuario.hassPassword(req.body.nuevo)

    // asignar nuevo pass al usuario
    usuario.password = hash
    await usuario.save()

    // deslogear al usuario (metodo que provee passport)
    req.logout( req.user, err => {
        if(err) return next(err)
    }) 
    req.flash('exito', 'Contraseña Modificada correctamente, vuelve a iniciar sesión')
    res.redirect('/iniciar-sesion')
}

exports.formImagenPerfil = async(req, res) => {

    const usuario = await Usuarios.findByPk(req.user.id)

    res.render('imagen-perfil', {
        pagina: 'Subir Imagen de Perfil',
        usuario
    })
}

exports.guardarImagenPerfil = async (req, res) => {

    const usuario = await Usuarios.findByPk(req.user.id)

    // se elimina img anterior
    if(req.file && usuario.imagen){

        const anteriorPath = __dirname + `/../public/uploads/perfiles/${usuario.imagen}`

        // eliminar archivo con file system
        fs.unlink(anteriorPath, (err) => {
            if(err){
                console.log(err)
            }
            return
        })
    }

    // guardar nueva imagen
    if(req.file){
        usuario.imagen = req.file.filename
    }

    await usuario.save()
    req.flash('exito', 'Cambios Guardados Correctamente')
    res.redirect('/administracion')
}

