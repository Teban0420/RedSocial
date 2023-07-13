const Sequelize = require('sequelize')
const db = require('../config/db.js')
const slug = require('slug')
const shortid = require('shortid')

const Usuarios = require('../models/Usuarios.js')
const Grupos = require('../models/Grupos.js')

const Meeti = db.define('meeti', {

    id: {
        type: Sequelize.UUID,
        primaryKey: true,
        allowNull: false
    },

    titulo: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
            notEmpty: {
                msg: 'El nombre no puede ir vacio'
            }
        }
    },

    slug: {
        type: Sequelize.STRING
    },

    invitado: Sequelize.STRING,

    cupo: {
        type: Sequelize.INTEGER,
        defaultValue: 0
    },

    descripcion : {
        type: Sequelize.TEXT,
        allowNull: false,
        validate: {
            notEmpty: {
                msg: 'Agrega una descripción'
            }
        }
    },

    fecha: {
        type: Sequelize.DATEONLY,
        allowNull: false,
        validate: {
            notEmpty: {
                msg: 'Agrega una fecha'
            }
        }
    },

    hora: {
        type: Sequelize.TIME,
        allowNull: false,
        notEmpty: {
            msg: 'Agrega una hora para el meeti'
        }
    },

    direccion: {
        type: Sequelize.STRING,
        allowNull: false,
        notEmpty: {
            msg: 'Agrega una dirección'
        }
    },

    ciudad: {
        type: Sequelize.STRING,
        allowNull: false,
        notEmpty: {
            msg: 'Agrega una ciudad'
        }
    },

    estado: {
        type: Sequelize.STRING,
        allowNull: false,
        notEmpty: {
            msg: 'Agrega un estado'
        }
    },

    pais: {
        type: Sequelize.STRING,
        allowNull: false,
        notEmpty: {
            msg: 'Agrega un país'
        }
    },

    ubicacion: {
        // almaceno latitud y longitud en un solo campo
        type: Sequelize.GEOMETRY('POINT')
    },

    interesados: {
        // arreglo de enteros
        type: Sequelize.ARRAY(Sequelize.INTEGER),
        defaultValue: []
    }

}, {
    // antes de guardar el meeti creamos una url unica
    hooks: {
        async beforeCreate(meeti) {
            const url = slug(meeti.titulo).toLowerCase()
            meeti.slug = `${url}-${shortid.generate()}`
        }
    }
})

Meeti.belongsTo(Usuarios)
Meeti.belongsTo(Grupos)

module.exports = Meeti