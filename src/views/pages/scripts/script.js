$(document).ready(function(){
    $("#signup").click(function(){
        window.location.replace("https://mapster-production.up.railway.app/signup");
    });

    $("#navImg").click(function(){
        window.location.replace("https://mapster-production.up.railway.app");
    });

    var message = $('#prompt').text().trim();
      
    if (message !== '') {
        $('#prompt').addClass('alert alert-danger');
    } else {
        $('#prompt').removeClass('alert alert-danger');
    }
});