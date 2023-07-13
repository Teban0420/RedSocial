const Sequelize = require('sequelize')
const db = require('../config/db.js')
const Categorias = require('./Categorias.js')
const Usuarios = require('./Usuarios.js')

const Grupos = db.define('grupos', {

    id: {
        type: Sequelize.UUID,
        primaryKey: true,
        allowNull: false
    },

    nombre: {
        type: Sequelize.TEXT(100),
        allowNull: false,

    },

    descripcion: {
        type: Sequelize.TEXT,
        allowNull: false,        
    },

    url: {
        type:Sequelize.TEXT
    },

    imagen: {
        type: Sequelize.TEXT
    }
})

// RELACION ENTRE GRUPOS Y CATEGORIA 1:1
// RELACION ENTRE GRUPOS Y USUARIOS 1:1
Grupos.belongsTo(Categorias)
Grupos.belongsTo(Usuarios)

module.exports = Grupos
