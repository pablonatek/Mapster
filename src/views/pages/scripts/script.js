$(document).ready(function(){
    $("#signup").click(function(){
        window.location.replace("http://localhost:3000/signup");
    });

    $("#navImg").click(function(){
        window.location.replace("http://localhost:3000");
    });

    var message = $('#prompt').text().trim();
      
    if (message !== '') {
        $('#prompt').addClass('alert alert-danger');
    } else {
        $('#prompt').removeClass('alert alert-danger');
    }
});