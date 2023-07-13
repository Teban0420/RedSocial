const Sequelize = require('sequelize')
const bcrypt = require('bcrypt-nodejs') // hashear passwords
const db = require('../config/db.js')

const Usuarios = db.define('usuarios', {
    
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },

    nombre:{
        type: Sequelize.STRING(60),
        allowNull: false
    },

    imagen: Sequelize.STRING(60),

    descripcion: {
        type: Sequelize.TEXT
    },

    email: {
        type: Sequelize.STRING(30),
        allowNull: false
    },

    password: {
        type:Sequelize.STRING(60),
        allowNull: false
    },

    activo: {
        type: Sequelize.INTEGER,
        defaultValue: 0
    },

    tokenPassword: Sequelize.STRING,
    expiraToken: Sequelize.DATE

}, { // antes de guardar cada registro
    hooks: {
        beforeCreate(usuario) {
            usuario.password = Usuarios.prototype.hassPassword(usuario.password)
        }
    }
});

// comparar los passwords
Usuarios.prototype.validarPassword = function(password){
    return bcrypt.compareSync(password, this.password)
}

Usuarios.prototype.hassPassword = function(password){
    return bcrypt.hashSync(password, bcrypt.genSaltSync(10), null)
}

module.exports = Usuarios