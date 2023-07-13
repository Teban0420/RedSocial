const { check, validationResult } = require('express-validator')
const passport = require("passport");
const Categorias = require('../models/Categorias.js')
const Grupos = require('../models/Grupos.js')
const multer = require('multer')
const shortid = require('shortid')
const fs = require('fs')
const { v4: uuidv4 } = require('uuid');
const { UUIDv4 } = require('uuid-v4-validator')

const configMulter = {

    limits: { fileSize: 200000}, 

    storage: fileStorage = multer.diskStorage({
        
        destination: (req, file, next) => {
            next(null, __dirname+'/../public/uploads/grupos/')
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
exports.nuevoGrupo = async (req, res) => {

    const categorias = await Categorias.findAll()
    
    res.render('nuevo-grupo', {
        pagina: 'Crea Un Nuevo Grupo',
        categorias
    })
}

exports.CrearGrupo = async (req, res) => {

    const grupo = req.body
    grupo.usuarioId = req.user.id
    grupo.categoriaId = req.body.categoria

    await check('nombre').notEmpty().withMessage('El nombre del grupo es obligatorio').escape().run(req)
    await check('descripcion').notEmpty().withMessage('Agrega una descripción').escape().run(req)
    await check('categoria').notEmpty().withMessage('Selecciona una categoria').escape().run(req)

    let errores = validationResult(req)

    if(!errores.isEmpty()){
        const errors = errores.array().map(err => err.msg)
        req.flash('error', errors)
        return res.redirect('/nuevo-grupo')
    }

    if(req.file){
        grupo.imagen = req.file.filename
    }

    grupo.id = uuidv4()

    try {

        await Grupos.create(req.body)
        req.flash('exito', 'GRUPO CREADO CON EXITO')
        return res.redirect('/administracion')
        
    } catch (error) {
        console.log(error)
        req.flash('error', error)
        res.redirect('/nuevo-grupo')
    }
}

exports.formEditarGrupo = async (req, res) => {

    const consultas = []

    consultas.push( Grupos.findByPk(req.params.grupoId))
    consultas.push( Categorias.findAll())

    const [grupo, categorias] = await Promise.all(consultas)

    res.render('editar-grupo', {
        pagina: `Editar Grupo: ${grupo.nombre}`,
        grupo,
        categorias
    })
}

exports.EditarGrupo = async (req, res, next) => {

    const grupo = await Grupos.findOne({ where: {id: req.params.grupoId, usuarioId : req.user.id}})

    if(!grupo){
        req.flash('error', 'Operación no válida')
        res.redirect('/administracion')
        return next()
    }

    const { nombre, descripcion, categoriaId, url } = req.body

    // reescribo con los nuevos datos
    grupo.nombre = nombre
    grupo.descripcion = descripcion
    grupo.categoriaId = categoriaId
    grupo.url = url

    await grupo.save()
    req.flash('exito', 'Cambios Almacenados Correctamente')
    res.redirect('/administracion')

}

exports.formEditarImagen =  async (req, res) => {

    const grupo = await Grupos.findOne({ where: {id: req.params.grupoId, usuarioId : req.user.id}})

    res.render('imagen-grupo', {
        pagina: `Editar Imagen Grupo : ${grupo.nombre}`,
        grupo
    })
}

exports.editarImagen = async (req, res, next) => {
    
    const grupo = await Grupos.findOne({ where: {id: req.params.grupoId, usuarioId : req.user.id}})

    if(!grupo){
        req.flash('error', 'Operación no valida')
        res.redirect('/iniciar-sesion')
        return next()
    }

    // si hay nueva imagen y imagen anterior
    if(req.file && grupo.imagen){

        const imagenAnteriorPath = __dirname + `/../public/uploads/grupos/${grupo.imagen}`
        //elimino imagen anterior
        fs.unlink(imagenAnteriorPath, (error) => {
            if(error){
                console.log(error)
            }
            return
        })
    }

    if(req.file){
        grupo.imagen = req.file.filename
    }

    await grupo.save()
    req.flash('exito', 'Cambios Guardados Correctamente')
    res.redirect('/administracion')

}

exports.formEliminarGrupo =  async (req, res, next) => {

    const idValid = UUIDv4.validate(req.params.grupoId)

    if(!idValid){
        req.flash('error', 'Operación no valida')
        res.redirect('/administracion')
        return next()
    }

    const grupo = await Grupos.findOne({ where: { id: req.params.grupoId, usuarioId: req.user.id }})

    if(!grupo){
        req.flash('error', 'Operación no valida')
        res.redirect('/administracion')
        return next()
    }

    res.render('eliminar-grupo', {
        pagina: `Eliminar Grupo : ${grupo.nombre}`
    })
}

exports.EliminarGrupo = async (req, res, next) => {

   
    const grupo = await Grupos.findOne({ where: { id: req.params.grupoId, usuarioId: req.user.id }})

    if(!grupo){
        req.flash('error', 'Operación no valida')
        res.redirect('/administracion')
        return next()
    }

    // eliminar imagen del grupo
    if(grupo.imagen){

        const imagenAnteriorPath = __dirname + `/../public/uploads/grupos/${grupo.imagen}`
        //elimino imagen anterior
        fs.unlink(imagenAnteriorPath, (error) => {
            if(error){
                console.log(error)
            }
            return
        })
    }

    // eliminar el grupo
    await Grupos.destroy({
        
        where: {
            id: req.params.grupoId
        }
    })

    req.flash('exito', 'Grupo Eliminado')
    res.redirect('/administracion')

}