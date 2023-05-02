const express = require('express');
const path = require('path');
const passport = require('passport');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const mysql = require('mysql');
const { error } = require('console');
const flash = require('connect-flash');
const { isUndefined } = require('util');

let db = mysql.createConnection({
    host: "localhost",
    user: "node",
    password: "node",
    database: "mapster"
});

try {
    db.connect(function(err) {
        if (err) {
            console.error('Error al conectarse a la base de datos: ' + err.stack);
            return;
        }
        console.log("Mapster Db connected!");
    });
} catch (error) {
    console.error('Error al conectar con la base de datos: ' + error.stack);
}

const app = express();

app.use(express.static(path.join(__dirname, '/src/views/pages')));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({secret: 'mapster'}));
app.use(flash());

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
    console.log('boards');
    if (!req.user) {
        return res.redirect('/signin');
    }
    try {
        const boards = db.query(
            "SELECT * FROM board", function (err, results, fields) {
            if (err) throw err;
            console.log(results);
            res.render('boards', {boards: results});
        });
    } catch (error) {
        console.error('Ocurrió un error al ejecutar la consulta: ', error);
    }
});

app.get('/boards/:id', (req, res) => {
    if (!req.user) {
        return res.redirect('/signin');
    }
    const cst = 
        "SELECT c.id, c.x, c.y, c.boardFk, ct.image " +
        "FROM cell c " +
            "LEFT JOIN cellType ct ON ct.id = c.typeFk " +
        "WHERE c.boardFk = ?;" 
    const id = req.params.id;
    let board, cells, cellTypes;
    try{
        db.query("SELECT * FROM board WHERE id = ?", [id], function (err, boardResults, fields) {
            if (err) throw err;
            console.log(boardResults);
            board = boardResults;
            db.query("SELECT * FROM celltype", function (err, cellTypeResults, fields) {
                if (err) throw err;
                cellTypes = cellTypeResults;
                console.log(cellTypes);
                db.query(cst, [id], function (err, cellsResults, fields) {
                    if (err) throw err;
                    console.log(cellsResults);
                    cells = cellsResults.map((cell) => Object.assign({}, cell));
                    res.render('board', {board: board, cells: cells, cellTypes: cellTypes});
                });
            });
            
        });
    } catch (error) {
        console.error('Ocurrió un error al ejecutar la consulta: ', error);
    }
});

app.post('/boards/:id', (req, res) => {
    // creando el usario
    console.log(req.body);
    console.log(req.body.imageName);
    try{
        db.query("SELECT id FROM celltype WHERE image =  ?",[req.body.imageName], function (err, imageResults, fields) {
            if (err) throw err;
            const cst = "UPDATE cell SET typeFk = ? WHERE x = ? AND y = ? AND boardFk = ?";
            const cstNull = "UPDATE cell SET typeFk = NULL WHERE x = ? AND y = ? AND boardFk = ?";
            if (req.body.imageName === "null") {
                console.log('borrar');
                db.query(cstNull, [req.body.x,req.body.y,req.body.board], function (err, cellsResults, fields) {
                    if (err) throw err;
                    console.log(cellsResults);
                });
            }else{
                db.query(cst, [imageResults[0].id, req.body.x, req.body.y, req.body.board], function (err, cellsResults, fields) {
                    if (err) throw err;
                    console.log(cellsResults);
                });
            }
        });
    } catch (error) {
        console.error('Ocurrió un error al ejecutar la consulta: ', error);
    }
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
                res.redirect('/boards')
            });
        }
    );
});

app.get('/signin', (req, res) => {
    console.log('signin');
    res.render('signin', { message: req.flash('error') });
});
  
app.post('/signin', passport.authenticate('local', {
    successRedirect: '/boards',
    failureRedirect: '/signin',
    failureFlash: true 
}));

app.listen(3000, ()=>{
    console.log('!Mapster Start!');
});