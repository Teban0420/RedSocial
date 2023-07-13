const Grupos = require('../models/Grupos.js')
const Meeti = require('../models/Meeti.js')
const Sequelize = require('sequelize')
const Op = Sequelize.Op
const moment = require('moment')

exports.panelAdministracion = async (req, res) => {
    
    const consultas = []

    consultas.push( Grupos.findAll({ where: { usuarioId: req.user.id } }))

    // busco por fecha del dia actual o superior
    consultas.push( Meeti.findAll({ where: { usuarioId: req.user.id,
    fecha: { [Op.gte] : moment(new Date()).format("YYYY-MM-DD") } },
    order: [['fecha', 'ASC']]
 }))

    // meetis anteriores
    consultas.push( Meeti.findAll({ where: { usuarioId: req.user.id,
        fecha: { [Op.lt] : moment(new Date()).format("YYYY-MM-DD") } } }))
    
    const [ grupos, meeti, anteriores] = await Promise.all(consultas)

    res.render('administracion', {
        pagina: 'Panel de Administración',
        grupos,
        meeti,
        anteriores,
        moment
    })
}