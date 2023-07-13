const express = require('express')
const router = express.Router()
const homeControler = require('../controllers/homeControler.js')
const usuariosControler = require('../controllers/usuariosControler.js')
const usuariosFronControler = require('../controllers/usuariosFronControler.js')
const authControler = require('../controllers/authControler.js')
const adminControler = require('../controllers/adminControler.js')
const gruposControler = require('../controllers/gruposControler.js')
const gruposFronControler = require('../controllers/gruposFronControler.js')
const meetiControler = require('../controllers/meetiControler.js')
const meetiFronControler = require('../controllers/meetiFronControler.js')
const comentariosControler = require('../controllers/comentariosControler.js')
const busquedaControler = require('../controllers/busquedaControler.js')

module.exports = function() {

    router.get('/', homeControler.home)

    // muestra un meeti
    router.get('/meeti/:slug', meetiFronControler.mostrarMeeti)
    router.post('/meeti/:id', comentariosControler.agregarComentario)

    router.post('/eliminar-comentario', comentariosControler.eliminarComentario)
    // confirmar asistencia a meeti
    router.post('/confirmar-asistencia/:slug', meetiFronControler.confirmarAsistencia)

    // listado de asistentes al meeti
    router.get('/asistentes/:slug', meetiFronControler.mostrarAsistentes)

    router.get('/usuarios/:id', usuariosFronControler.mostrarUsuario)

    router.get('/grupos/:id', gruposFronControler.mostrarGrupo)

    router.get('/categoria/:categoria', meetiFronControler.mostrarCategoria)

    // busqueda
    router.get('/busqueda', busquedaControler.resultadosBusqueda )

    router.get('/crear-cuenta', usuariosControler.formCrearCuenta)
    router.post('/crear-cuenta', usuariosControler.crearNuevaCuenta)
    router.get('/confirmar-cuenta/:correo', usuariosControler.confirmarCuenta)

    router.get('/iniciar-sesion', usuariosControler.formIniciarSesion)
    router.post('/iniciar-sesion', authControler.autenticarUsuario)

    router.get('/cerrar-sesion', authControler.usuarioAutenticado, authControler.cerrarSesion)

    router.get('/administracion', authControler.usuarioAutenticado, adminControler.panelAdministracion)

    router.get('/nuevo-grupo', authControler.usuarioAutenticado, gruposControler.nuevoGrupo)
    router.post('/nuevo-grupo', authControler.usuarioAutenticado,
                  gruposControler.subirImagen, gruposControler.CrearGrupo)

    router.get('/editar-grupo/:grupoId', authControler.usuarioAutenticado, gruposControler.formEditarGrupo )
    router.post('/editar-grupo/:grupoId', authControler.usuarioAutenticado, gruposControler.EditarGrupo )

    router.get('/imagen-grupo/:grupoId', authControler.usuarioAutenticado, gruposControler.formEditarImagen)
    router.post('/imagen-grupo/:grupoId', authControler.usuarioAutenticado, gruposControler.subirImagen, 
                                            gruposControler.editarImagen)

    router.get('/eliminar-grupo/:grupoId', authControler.usuarioAutenticado, gruposControler.formEliminarGrupo)
    router.post('/eliminar-grupo/:grupoId', authControler.usuarioAutenticado, gruposControler.EliminarGrupo)
    
    // nuevos meeti
    router.get('/nuevo-meeti', authControler.usuarioAutenticado, meetiControler.formNuevoMeeti)
    router.post('/nuevo-meeti', authControler.usuarioAutenticado, meetiControler.sanitizarMeeti, meetiControler.crearMeeti)

    router.get('/editar-meeti/:id', authControler.usuarioAutenticado, meetiControler.formEditarMeeti)
    router.post('/editar-meeti/:id', authControler.usuarioAutenticado, meetiControler.EditarMeeti)
    
    router.get('/eliminar-meeti/:id', authControler.usuarioAutenticado, meetiControler.formEliminarMeeti)

    router.get('/editar-perfil', authControler.usuarioAutenticado, usuariosControler.formEditarPerfil)
    router.post('/editar-perfil', authControler.usuarioAutenticado, usuariosControler.EditarPerfil)

    router.get('/cambiar-password', authControler.usuarioAutenticado, usuariosControler.formCambiarPassword)
    router.post('/cambiar-password', authControler.usuarioAutenticado, usuariosControler.CambiarPassword)

    router.get('/imagen-perfil', authControler.usuarioAutenticado, usuariosControler.formImagenPerfil)
    router.post('/imagen-perfil', authControler.usuarioAutenticado, usuariosControler.subirImagen,
                                 usuariosControler.guardarImagenPerfil)
    
    return router
}