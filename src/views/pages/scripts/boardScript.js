$(document).ready(function(){
    // Obtener la tabla y las cells
    const board = document.getElementById('board');

    // Establecer el ancho y alto de la tabla
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    let size = Math.min(windowWidth, windowHeight) * 0.8;
    board.style.width = (size) + 'px';
    board.style.height = (size) + 'px';

    // Obtener todas las imágenes y casillas de la tabla
    const images = document.querySelectorAll(".cellType");
    const cells = document.querySelectorAll(".cell");

    // Agregar event listener a cada imagen
    images.forEach((image) => {
        image.addEventListener("dragstart", dragStart);
    });

    // Agregar event listener a cada casilla de la tabla
    cells.forEach((cell) => {
        cell.addEventListener("dragover", dragOver);
        cell.addEventListener("dragenter", dragEnter);
        cell.addEventListener("dragleave", dragLeave);
        cell.addEventListener("drop", dragDrop);
    });

    function dragStart(event) {
        // Obtener el id de la imagen que se está arrastrando
        const id = event.target.id;
        
        // Establecer la información del arrastre (en este caso, solo el id de la imagen)
        event.dataTransfer.setData("text/plain", id);
    }
      
    function dragOver(event) {
        // Prevenir el comportamiento por defecto del navegador (no permitir soltar)
        event.preventDefault();
    }
      
    function dragEnter(event) {
        // Agregar clase "drag-enter" a la casilla
        event.target.classList.add("drag-enter");
    }
      
     function dragLeave(event) {
        // Remover clase "drag-enter" de la casilla
        event.target.classList.remove("drag-enter");
    }
      
    function dragDrop(event) {
        // Obtener el id de la imagen que se está arrastrando
        const id = event.dataTransfer.getData("text");

        // Obtener la imagen y agregarla a la casilla
        const image = document.getElementById(id);
        event.target.style.backgroundImage = `url(${image.src})`;
        event.target.style.backgroundSize = "cover";

        // tranformamos el nombre de la imgen y el id de la celda en JSON
        let data = {
            imageName: id
        };
        let targetObj = JSON.parse(event.target.id);
        data = Object.assign({}, data, targetObj);
        
        // realizamos un post al back para actualizar las casillas
        fetch('/boards/:id', {
            method: 'POST',
            body: JSON.stringify(data),
            headers: {
              'Content-Type': 'application/json'
            }
          })
          .then(response => response.json())
          .then(data => console.log(data))
          .catch(error => console.error(error));

        // Remover clase "drag-enter" de la casilla
        event.target.classList.remove("drag-enter");
    }      
});