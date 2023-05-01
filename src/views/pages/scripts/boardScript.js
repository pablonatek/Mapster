$(document).ready(function(){
    // Obtener la tabla y las cells
    const board = document.getElementById('board');
    const cells = board.getElementsByTagName('td');

    // Establecer el ancho y alto de la tabla
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    board.style.width = (Math.min(windowWidth, windowHeight) * 0.8) + 'px';
    board.style.height = (Math.min(windowWidth, windowHeight) * 0.8) + 'px';
});