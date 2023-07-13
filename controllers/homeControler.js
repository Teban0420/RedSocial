const Categorias = require('../models/Categorias.js')
const Meeti = require('../models/Meeti.js')
const Grupos = require('../models/Grupos.js')
const Usuarios = require('../models/Usuarios.js')
const moment = require('moment') // para el manejo de fechas
const Sequelize = require('sequelize')
const Op = Sequelize.Op

exports.home = async(req, res) => {
    
    const consultas = []
    consultas.push( Categorias.findAll())
    consultas.push (Meeti.findAll({
        attributes: ['slug', 'titulo', 'fecha', 'hora'], // los atributos que deseo mostrar
        where: {
            fecha: {[Op.gte] : moment(new Date()).format("YYYY-MM-DD")} // FECHA POSTERIOR AL DIA ACTUAL
        },
        limit: 3,
        order: [['fecha', 'ASC']],
        include : [{ // similar a un join.... uno los resultados con la tabla grupos
            model: Grupos,
            attributes: ['imagen']
        },
        {
            model: Usuarios,
            attributes: ['nombre', 'imagen']
        }]

    }))

    const [ categorias, meetis ] = await Promise.all(consultas)
    res.render('home', {
        pagina: 'Inicio',
        categorias,
        meetis,
        moment
    })
}