const { check, validationResult } = require('express-validator')
const passport = require("passport");
const Grupos = require('../models/Grupos.js')
const Meeti = require('../models/Meeti.js')
const { v4: uuidv4 } = require('uuid');
const { UUIDv4 } = require('uuid-v4-validator')

exports.formNuevoMeeti =  async(req, res) => {

    const grupos = await Grupos.findAll({where : {usuarioId : req.user.id}})

    res.render('nuevo-meeti', {
        pagina: 'Crear Nuevo Meeti',
        grupos
    })
}

exports.sanitizarMeeti = (req, res, next) => {

     check('grupoId').escape().run(req)
     check('titulo').escape().run(req)
     check('invitado').escape().run(req)
     check('fecha').escape().run(req)
     check('hora').escape().run(req)
     check('direccion').escape().run(req)
     check('ciudad').escape().run(req)
     check('estado').escape().run(req)
     check('pais').escape().run(req)
     check('lat').escape().run(req)
     check('lng').escape().run(req)
     check('grupoId').escape().run(req)

     next()
}

exports.crearMeeti = async (req, res) => {

    const meeti = req.body
    meeti.usuarioId = req.user.id
    // almacenar ubicación en un point
    const point = { type: 'Point', coordinates: [ parseFloat(req.body.lat), parseFloat(req.body.lng)]}
    meeti.ubicacion = point

    if(req.body.cupo === ''){
        meeti.cupo = 0;
    }

    meeti.id = uuidv4()

    await check('grupoId').notEmpty().withMessage('Selecciona un grupo').escape().run(req)
    await check('titulo').notEmpty().withMessage('El titulo es obligatorio').escape().run(req)
    await check('invitado').notEmpty().withMessage('El invitado es obligatorio').escape().run(req)
    await check('fecha').notEmpty().withMessage('Selecciona una fecha').escape().run(req)
    await check('hora').notEmpty().withMessage('Selecciona una hora').escape().run(req)
    
    let errores = validationResult(req)

    if(!errores.isEmpty()){
        const errors = errores.array().map(err => err.msg)
        req.flash('error', errors)
        return res.redirect('/nuevo-meeti')
    }

    try {

       await Meeti.create(meeti)
       req.flash('exito', 'Meeti creado correctamente')
       res.redirect('/administracion')
        
    } catch (error) {
        console.log(error)
        req.flash('error', error)
        res.redirect('/nuevo-meeti')
        
    }
    
}

exports.formEditarMeeti = async ( req, res, next) => {

    const consultas = []
    consultas.push( Grupos.findAll({ where: {usuarioId: req.user.id }}))
    consultas.push( Meeti.findByPk(req.params.id))

    const [grupos, meeti] = await Promise.all(consultas)

    if(!grupos || !meeti){
        req.flash('error', 'Operación no valida')
        res.redirect('/administracion')
        return next()
    }

    res.render('editar-meeti', {
        pagina: `Editar Meeti: ${meeti.titulo}`,
        grupos,
        meeti
    })
}

exports.EditarMeeti = async (req, res, next) => {

    // busco el meeti por los parametros que recibo en la url
    const meeti = await Meeti.findOne({where: {id: req.params.id, usuarioId: req.user.id}})

    if(!meeti){
        req.flash('error', 'Operación no valida')
        res.redirect('/administracion')
        return next()
    }

    const { grupoId, titulo, invitado, fecha, hora, cupo, descripcion, direccion, 
            ciudad, estado, pais, lat, lng } = req.body
    
    meeti.grupoId = grupoId  
    meeti.titulo = titulo  
    meeti.invitado = invitado  
    meeti.fecha = fecha  
    meeti.hora = hora  
    meeti.cupo = cupo  
    meeti.descripcion = descripcion  
    meeti.direccion = direccion  
    meeti.ciudad = ciudad  
    meeti.estado = estado  
    meeti.pais = pais  

    // asignar el point ubicacion
    const point = { type: 'Point', coordinates: [parseFloat(lat), parseFloat(lng)]}
    meeti.ubicacion = point

    await meeti.save()
    req.flash('exito', 'Cambios Guardados Correctamente')
    res.redirect('/administracion')

}

exports.formEliminarMeeti = async (req, res, next) => {

    const idValid = UUIDv4.validate(req.params.id)

    if(!idValid){
        req.flash('error', 'Operación no valida')
        res.redirect('/administracion')
        return next()
    }

    const meeti = await Meeti.findOne({where: {id: req.params.id, usuarioId: req.user.id}})  
    

    if(!meeti){
        req.flash('error', 'Operación no valida')
        res.redirect('/administracion')
        return next()
    }

    res.render('eliminar-meeti', {
        pagina: `Eliminar Meeti: ${meeti.titulo}`
    })
}