const express = require('express');
const path = require('path');

const app = express();

app.use(express.static(path.join(__dirname, '/public/')));

app.set('views', './src/views');
app.set('view engine', 'ejs');

app.get('/',(req, res)=>{
    res.render('index');
});

app.listen(3000, ()=>{
    console.log('adios con dios');
});