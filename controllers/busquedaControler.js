const Meeti = require('../models/Meeti.js')
const Grupos = require('../models/Grupos.js')
const Usuarios = require('../models/Usuarios.js')

const Sequelize = require('sequelize')
const Op = Sequelize.Op
const moment = require('moment')

exports.resultadosBusqueda = async (req, res) => {
    
    // leo los parametros enviados por GET con req.query
    const { categoria, titulo, ciudad, pais} = req.query

    // si el usuario no selecciona ninguna categoria
    let meetis 

    if(categoria === ''){     
    
     meetis = await Meeti.findAll({
        where: {
            titulo: { [Op.iLike]: '%'+ titulo +'%'},
            ciudad: { [Op.iLike]: '%'+ ciudad +'%'},
            pais: {[Op.iLike]: '%'+ pais +'%'}
        },
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
    }
    else{
        
         meetis = await Meeti.findAll({
            where: {
                titulo: { [Op.iLike]: '%'+ titulo +'%'},
                ciudad: { [Op.iLike]: '%'+ ciudad +'%'},
                pais: {[Op.iLike]: '%'+ pais +'%'}
            },
            include: [
                {
                    model: Grupos,
                    where: {
                        categoriaId : { [Op.eq]: categoria}
                    }              
                },
                {
                    model: Usuarios,
                    attributes: ['id', 'nombre', 'imagen']
                }
            ]
        })

    }

    res.render('busqueda', {
        pagina: 'Resultados Busqueda',
        meetis,
        moment
    })
}