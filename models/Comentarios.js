const Sequelize = require('sequelize')
const db = require('../config/db.js')
const  Usuarios = require('./Usuarios.js')
const Meeti = require('./Meeti.js')

const Comentarios = db.define('comentarios', {
    
    id:{
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },

    mensaje: Sequelize.TEXT
})

// relacion 1:1 Usuario => Comentario
// relacion 1:1 Comentario => Meeti
Comentarios.belongsTo(Usuarios)
Comentarios.belongsTo(Meeti)

module.exports = Comentarios