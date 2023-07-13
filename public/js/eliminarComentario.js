
const Swal  = require('sweetalert2')
const axios = require('axios')

document.addEventListener('DOMContentLoaded', () => {

    const formsEliminar = document.querySelectorAll('.eliminar-comentario')
    
    if(formsEliminar.length > 0){
        formsEliminar.forEach( form => {
            form.addEventListener('submit', eliminar)
        })
    }

} )

function eliminar(e){
    e.preventDefault()
      
      Swal.fire({
        title: 'Eliminar Comentario?',
        text: "Un comentario eliminado no se puede recuperar!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Si, Borrar',
        cancelButtonText: 'No, cancelar',
        reverseButtons: true
      }).then((result) => {
        if (result.isConfirmed) {

            // tomar id del comentario a eliminar 
            // this.children son los input hidden que estan dentro del formulario
            const comentarioId = this.children[0].value;
            
            // objeto que pasamos
            const datos = {
                comentarioId
            }
            // primer parametro la ruta de tipo post (que invoca el controlador)
            // segundo parametro los datos que envio a ese controlador
            axios.post(this.action, datos) // this se refere al formulario
                .then(respuesta => {
                    Swal.fire(
                        'Eliminado!',
                        respuesta.data,
                        'success'
                      )
                    // eliminar comentario del dom
                     this.parentElement.parentElement.remove() 
                }).catch(error => {
                    if(error.response.status === 403 || error.response.status === 404){
                        Swal.fire('Error', error.response.data, 'error')
                    }
                }) 

           
        } else if (
          /* Read more about handling dismissals below */
          result.dismiss === Swal.DismissReason.cancel
        ) {
            Swal.fire(
            'Cancelado',
            'El Comentario no se elimino :)',
            'error'
          )
        }
      })

   
}
