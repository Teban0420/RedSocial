const express = require('express')
const expressLayouts = require('express-ejs-layouts')
const router = require('./routes/index.js')
const bodyParser = require('body-parser')
const flash = require('connect-flash')
const session = require('express-session')
const cookieParser = require('cookie-parser')
const passport = require('./config/passport.js')
const path = require('path')

// modelos y db
const db = require('./config/db.js')
require('./models/Usuarios.js')
require('./models/Categorias.js')
require('./models/Grupos.js')
require('./models/Comentarios.js')
require('./models/Meeti.js')
db.sync().then(() => console.log('DB conectada correctamente')).catch((error) => console.log(error))

// variables de entorno
require('dotenv').config({path: 'variables.env'})

// aplicacion principal
const app = express()

// body parser leer formularios
app.use( bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))


// Habilitar EJS como template engine
app.use(expressLayouts)
app.set('view engine', 'ejs')

// ubicacion de las vistas
app.set('views', path.join(__dirname, './views'))

// archivos estaticos
app.use(express.static('public'))

// habilitar cookie parser
app.use(cookieParser())

// agrega flash messages
app.use(flash())

// crear la sesion
app.use(session({
    secret: process.env.SECRET,
    key: process.env.KEY,
    resave: false,
    saveUninitialized: false
}))

// inicializar passport 
app.use( passport.initialize())
app.use( passport.session())


// middleware (usuario logueado, flash messages, fecha actual)
app.use((req, res, next) => {
    res.locals.usuario = {...req.user} || null
    res.locals.mensajes = req.flash()
    const fecha = new Date()
    res.locals.year = fecha.getFullYear()
    next()
})

// Routing
app.use('/', router())

//leer host y puerto que asigne el servidor
const host = process.env.HOST || '0.0.0.0'
const port = process.env.PORT || 5000


app.listen(port, host, () => {
    console.log('El servidor esta funcionando')
})