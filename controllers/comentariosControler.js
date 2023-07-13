
const Comentarios = require('../models/Comentarios.js')
const Meeti = require('../models/Meeti.js')

exports.agregarComentario = async (req, res, next) => {

    // obtener el comentario
    const { comentario } = req.body

    await Comentarios.create({
        mensaje: comentario,
        usuarioId: req.user.id,
        meetiId: req.params.id
    })

    res.redirect('back')
    next()
}

exports.eliminarComentario = async (req, res, next) => {
    
    const { comentarioId } = req.body

    const comentario = await Comentarios.findOne({
        where: {id: comentarioId}
    })
    
    if(!comentario){
        res.status(404).send('Acción no valida')
        return next()
    }

     // consultar el comentario
     const meeti = await Meeti.findOne({
        where: {id: comentario.meetiId}
    })

    // validar que la persona que borra el comentario sea la misma que lo creo
    // o el creador del meeti podra eliminar todos los comentarios del meeti
    if(comentario.usuarioId === req.user.id || meeti.usuarioId === req.user.id){
        
        await Comentarios.destroy({
            where: {id: comentario.id}
        })
        res.status(200).send('Eliminado Correctamente')
        return next()
    }
    else{
        res.status(403).send('Acción no valida')
        return next()
    }
}