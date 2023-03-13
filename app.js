const express = require('express');
const path = require('path');
const passport = require('passport');
const cookieParser = require('cookie-parser');
const session = require('express-session');

const app = express();

app.use(express.static(path.join(__dirname, '/src/views/pages')));
app.use(cookieParser());
app.use(session({secret: 'mapster'}));

require('./src/config/passport.js')(app);

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

app.post('/signup/',(req, res)=>{
    console.log('ricardo');
    req.login(req.body, ()=>{
        res.redirect('/profile');
    })
});

app.get('/signup/profile',(req, res)=>{
    res.render(req.user);
});

app.listen(3000, ()=>{
    console.log('adios con dios');
});