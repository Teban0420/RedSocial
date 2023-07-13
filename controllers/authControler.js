const passport = require("passport");

exports.autenticarUsuario = passport.authenticate('local', {
   
    successRedirect: '/administracion', // autenticado
    failureRedirect: '/iniciar-sesion', // no autenticado
    failureFlash: true,
    badRequestMessage: 'Ambos campos con obligatorios'
})

// valida si usuario esta autenticado
exports.usuarioAutenticado = (req, res, next) => {

    if(req.isAuthenticated()){
        return next()
    }
    return res.redirect('/iniciar-sesion')

}

exports.cerrarSesion = (req, res) => {

    req.logout( req.user, err => {
        if(err) return next(err)
    }) 
    req.flash('exito', 'Cerraste sesión de forma correcta')
    res.redirect('/iniciar-sesion')
    next()
}
