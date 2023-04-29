const express = require('express');
const path = require('path');
const passport = require('passport');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const mysql = require('mysql');

let db = mysql.createConnection({
    host: "localhost",
    user: "node",
    password: "node",
    database: "mapster"
  });

  db.connect(function(err) {
    if (err) throw err;
    console.log("Db connected!");
  });

const app = express();

app.use(express.static(path.join(__dirname, '/src/views/pages')));
app.use(express.json());
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

app.get('/boards',(req, res)=>{
    const boards = db.query(
        "SELECT * FROM board", function (err, results, fields) {
        if (err) throw err;
        console.log(results);
        res.render('boards', {boards: results});
    });
});

app.get('/boards/:id', (req, res) => {
    const id = req.params.id;
    db.query("SELECT * FROM board WHERE id = " + id, function (err, results, fields) {
      if (err) throw err;
      console.log(results);
      res.render('board', { board: results });
    });
  });
  

app.get('/signup',(req, res)=>{
    console.log('signup');
    res.render('signup');
});

app.post('/signup',(req, res)=>{
    console.log('postSignUp');
    console.log(req.user);
    res.json(req.body);
});

app.get('/signup/profile',(req, res)=>{
    console.log('/signup/profile');
    console.log(req.user);
});

app.listen(3000, ()=>{
    console.log('Mapster Start');
});