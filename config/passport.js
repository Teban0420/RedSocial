const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy // permite iniciar sesion con un user y pass de db
const Usuarios = require('../models/Usuarios.js')

passport.use(new LocalStrategy({

    // campos con los que se autentica el usuario
    usernameField: 'email',
    passwordField: 'password'
    },
    async (email, password, next) => {
        // se ejecuta al llenar el formulario
        const usuario = await Usuarios.findOne({ 
                where: { email, activo: 1 }})
        
        if(!usuario) return next(null, false, {
            message: 'No existe el usuario'
        })

        const verificarPass = usuario.validarPassword(password)
        
        if(!verificarPass) return next(null, false, {
            message: 'Contraseña incorrecta'
        })

        return next(null, usuario)

    }

))

passport.serializeUser(function(usuario, callback) {
    callback(null, usuario)
})

passport.deserializeUser(function(usuario, callback) {
    callback(null, usuario)
})

module.exports = passport