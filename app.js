const express = require('express');
const path = require('path');

const app = express();

app.use(express.static(path.join(__dirname, '/src/views/pages')));

app.set('views', './src/views/pages');
app.set('view engine', 'ejs');

app.get('/',(req, res)=>{
    res.render('index');
});

app.get('/login',(req, res)=>{
    res.render('login');
});

app.get('/signup',(req, res)=>{
    res.render('signup');
});

app.listen(3000, ()=>{
    console.log('adios con dios');
});