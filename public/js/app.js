// import { OpenStreetMapProvider } from 'leaflet-geosearch'
const asistencia = require('./asistencia.js')
const eliminarComentario = require('./eliminarComentario.js')

const geocodeService = L.esri.Geocoding.geocodeService(); 
// obtengo los valores de la db
const lat = document.querySelector('#lat').value || 4.9154873;
const lng = document.querySelector('#lng').value || -74.0226287;   
const direccion = document.querySelector('#direccion').value || '';
let map = L.map('mapa').setView([lat, lng], 15);

let markets = new L.FeatureGroup().addTo(map)
let marker

// colocar el pin cuando edito un meeti
if(lat && lng){

    marker = new L.marker([lat, lng], {
        draggable: true,
        autoPan: true
    })
    .addTo(map)
    .bindPopup(direccion)
    .openPopup()

    // markets.addLayer(marker)

    marker.on('moveend', function(evento){
        marker = evento.target
        const posicion = marker.getLatLng();

        // centrar el mapa
        map.panTo(new L.LatLng(posicion.lat, posicion.lng))

        // obtener informacion de las calles al soltar el pin
        geocodeService.reverse().latlng(posicion, 16).run(function(error, resultado){
            marker.bindPopup(resultado.address.LongLabel) // muestra la direccion en un mensaje arriba del pin

            llenarInputs(resultado)

            // llenar los campos con los valores 
            document.querySelector('#formbuscador').textContent = resultado?.address.Address ?? ''; // se muestra en pantalla
            document.querySelector('#formbuscador').value = resultado?.address.Address ?? ''; // re carga el valor y luego se envia a db
        })

    })
}



document.addEventListener('DOMContentLoaded', () => {

    if(marker){
        map.removeLayer(marker)
    }

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    marker = new L.marker([lat, lng], {
        draggable: true,
        autoPan: true
    })
    .addTo(map)
    
    marker.on('moveend', function(evento){

       
        marker = evento.target
        const posicion = marker.getLatLng();

        // centrar el mapa
        map.panTo(new L.LatLng(posicion.lat, posicion.lng))

        // obtener informacion de las calles al soltar el pin
        geocodeService.reverse().latlng(posicion, 16).run(function(error, resultado){
            marker.bindPopup(resultado.address.LongLabel) // muestra la direccion en un mensaje arriba del pin

            llenarInputs(resultado)

            // llenar los campos con los valores 
            document.querySelector('#formbuscador').textContent = resultado?.address.Address ?? ''; // se muestra en pantalla
            document.querySelector('#formbuscador').value = resultado?.address.Address ?? ''; // re carga el valor y luego se envia a db
        })

    })

    // const buscador = document.querySelector('#formbuscador')
    // buscador.addEventListener('input', buscarDireccion)

})


// function buscarDireccion(e){     

//     if(e.target.value.length > 8){ 
        
//         if(marker){
//             map.removeLayer(marker)
//         }
//         // utilizar el provider para buscar en el mapa direccion
//         // ingresada por el usuario        

//         const provider = new OpenStreetMapProvider()
//         provider.search({ query: e.target.value }).then(( resultado) => {
            
//             geocodeService.reverse().latlng(resultado[0].bounds[0], 16).run(function(error, resultado){

//                 //mostrar el mapa
//                 map.setView(resultado[0].bounds[0], 15)
    
//                 // agregar el pin en esa posicion
//                 marker = new L.marker(resultado[0].bounds[0], {
//                     draggable: true,
//                     autoPan: true
//                 })
//                 .addTo(map)
//                 .bindPopup(resultado[0].label)
//                 .openPopup()
    
//                 markets.addLayer(marker)
    
//                 marker.on('moveend', function(e) {
//                     marker = e.target
//                     const posicion = marker.getLatLng()
//                     map.panTo(new L.LatLng(posicion.lat, posicion.lng))
//                 })
//             })

//         })
//     }
// }

function llenarInputs(resultado){
    
    document.querySelector('#direccion').value = resultado.address.Address || ''
    document.querySelector('#ciudad').value = resultado.address.City || ''
    document.querySelector('#estado').value = resultado.address.Region || ''
    document.querySelector('#pais').value = resultado.address.CountryCode || ''
    document.querySelector('#lat').value = resultado.latlng.lat || ''
    document.querySelector('#lng').value = resultado.latlng.lng || ''
}





