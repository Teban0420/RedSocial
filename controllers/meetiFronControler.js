const Meeti = require('../models/Meeti.js')
const Grupos = require('../models/Grupos.js')
const Usuarios = require('../models/Usuarios.js')
const Categorias = require('../models/Categorias.js')
const Comentarios = require('../models/Comentarios.js')
const moment = require('moment')
const Sequelize = require('sequelize')
const Op = Sequelize.Op


exports.mostrarMeeti = async (req, res) => {

    const meeti = await Meeti.findOne({
        where: {
            slug: req.params.slug
        },
        include: [{
            model: Grupos // traigo el grupo al que pertenece el meeti
        },
        {
            model: Usuarios,
            attributes: ['id', 'nombre', 'imagen']
        }]
    })

    if(!meeti){
        res.redirect('/')
    } 

    // consultar por meeti's cercanos
    const ubicacion = Sequelize.literal(`ST_GeomFromText( 
        'POINT( ${meeti.ubicacion.coordinates[0]} ${meeti.ubicacion.coordinates[1]} )' )`)

    // ST_DISTANCE_Sphere = retorna una linea en metros
    const distancia = Sequelize.fn('ST_DistanceSphere', Sequelize.col('ubicacion'), 
    ubicacion)

    // encontrar meeti's cercanos
    const cercanos = await Meeti.findAll({

        order: distancia, // ordena los meetis por el mas cercano        
        where: Sequelize.where(distancia, { [Op.lte] : 2000 }), // busco el mas cerca, q este a 2kms o menos
        limit: 3, // maximo 3 meeti's cercanos
        offset: 1, // a partir del segundo mas cercano
        include: [
            {
                model: Grupos
            },
            {
                model: Usuarios,
                attributes: ['id', 'nombre', 'imagen']
            }
        ]
    })

    // si existe el meeti, consultar comentarios asociados al meeti 
    const comentarios = await Comentarios.findAll({
        where: {meetiId: meeti.id},
        include: [{
            model: Usuarios,
            attributes: ['id', 'nombre', 'imagen']
        }]
    })

    console.log(comentarios)
    res.render('mostrar-meeti', {
        pagina: `meeti.titulo`,
        meeti,
        comentarios,
        cercanos,
        moment
    })
}

exports.confirmarAsistencia = async (req, res) => {

    console.log(req.body)

    const { accion } = req.body

    if(accion === 'confirmar'){
        // se agrega el usuario
        Meeti.update(
            {
                'interesados': Sequelize.fn('array_append', Sequelize.col('interesados'), req.user.id)
            },
            {
                'where': {'slug': req.params.slug}
            })

            res.send('Has confirmado tu asistencia')
    }
    else{
        // cancelar asistencia
        Meeti.update(
            {
                'interesados': Sequelize.fn('array_remove', Sequelize.col('interesados'), req.user.id)
            },
            {
                'where': {'slug': req.params.slug}
            })

            res.send('Has cancelado tu asistencia')
    }
   
}

exports.mostrarAsistentes = async (req, res) => {

    const meeti = await Meeti.findOne({
        where: {
            slug: req.params.slug
        },
        attributes: ['interesados']
    })

    const { interesados } = meeti
    const asistentes = await Usuarios.findAll({
        
        attributes: ['nombre', 'imagen'],
        where : {
            id: interesados
        }
    })

    res.render('asistentes-meeti', {
        pagina: 'Listado Asistentes Meeti',
        asistentes
    })
}

exports.mostrarCategoria = async (req, res, next) => {

    const categoria = await Categorias.findOne({
        attributes: ['id', 'nombre'],
        where: {slug: req.params.categoria}
    })

    const meetis = await Meeti.findAll({
        order: [
            ['fecha', 'ASC'],
            ['hora', 'ASC']
        ],
        include: [
            {
                model: Grupos,
                where: {categoriaId: categoria.id}
            },
            {
                model: Usuarios
            }
        ]
    })

    res.render('categoria', {
        pagina: `Categoria: ${categoria.nombre}`,
        meetis,
        moment
    })
}