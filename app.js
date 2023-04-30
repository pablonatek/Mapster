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
app.use(express.urlencoded({ extended: false }));
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
    const cst = 
        "SELECT c.id, c.x, c.y, c.boardFk, ct.image " +
        "FROM cell c " +
            "LEFT JOIN cellType ct ON ct.id = c.typeFk " +
        "WHERE c.boardFk = ?;" 
    const id = req.params.id;
    let board, cells;
    db.query("SELECT * FROM board WHERE id = ?", [id], function (err, boardResults, fields) {
        if (err) throw err;
        console.log(boardResults);
        board = boardResults;
        db.query(cst, [id], function (err, cellsResults, fields) {
            if (err) throw err;
            console.log(cellsResults);
            cells = cellsResults.map((cell) => Object.assign({}, cell));
            res.render('board', {board, cells: cells});
          });
    });
});

app.get('/signup',(req, res)=>{
    console.log('signup');
    res.render('signup');
});

app.post('/signup', (req, res) => {
    // creando el usario
    const username = req.body.username;
    const password = req.body.password;
    const results =  db.query("INSERT INTO user SET username = ?, password = ?", 
        [username, password], 
        function (err, userResults, fields){
            if (err) throw err;
            // log in el usuario
            req.logIn(userResults, () => {
                res.redirect('/auth/profile')
            });
        }
    );
});

app.get('/signin', (req, res) => {
    console.log('signin');
    res.render('signin');
});
  
app.post('/signin', passport.authenticate('local', {
    successRedirect: '/auth/profile',
    failureRedirect: '/signin',
}));

app.get('/auth/profile',(req, res)=>{
    res.json(req.user);
});

app.listen(3000, ()=>{
    console.log('!Mapster Start!');
});