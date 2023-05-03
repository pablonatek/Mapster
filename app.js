const express = require('express');
const path = require('path');
const passport = require('passport');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const mysql = require('mysql2');
const { error } = require('console');
const flash = require('connect-flash');
const { isUndefined } = require('util');

const port = process.env.PORT || 3000;
const db_host = process.env.DB_HOST || "localhost";
const db_user = process.env.DB_USER || "node";
const db_password = process.env.DB_PASSWORD || "node";
const db_name = process.env.DB_NAME || "mapster";
const db_port = process.env.DB_PORT || 3306;

let db = mysql.createConnection({
    host: db_host,
    user: db_user,
    password: db_password,
    port: db_port,
    database: db_name
});

try {
    db.connect(function(err) {
        if (err) {
            console.error('Error al conectarse a la base de datos: ' + err.stack);
            return;
        }
    });
} catch (error) {
    console.error('Error al conectar con la base de datos: ' + error.stack);
}

const app = express();

app.use(express.static(path.join(__dirname, '/src/views/pages')));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({secret: 'mapster',
    resave: false,
    saveUninitialized: false
}));
app.use(flash());

require('./src/config/passport.js')(app);

app.set('views', './src/views/pages');
app.set('view engine', 'ejs');

app.listen(port, ()=>{
});

app.get('/',(req, res)=>{
    res.render('index');
});

app.get('/signup',(req, res)=>{
    res.render('signup');
});

app.post('/signup', (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    db.query("SELECT * FROM user WHERE username = ?", [username], (err, results, fields) => {
        if (err) throw err;

        if (results.length > 0) {
            // El usuario ya existe, enviar mensaje de error
            res.render('signup', { message: 'Username already taken' });
        } else {
            // El usuario no existe, insertar en la base de datos
            db.query("INSERT INTO user SET username = ?, password = ?", [username, password], (err, userResults, fields) => {
                if (err) throw err;

                // Iniciar sesión con el nuevo usuario y redirigir a la página de tableros
                req.logIn(userResults, () => {
                    res.redirect('/boards');
                });
            });
        }
    });
});

app.get('/signin', (req, res) => {
    res.render('signin', { message: req.flash('error') });
});
  
app.post('/signin', passport.authenticate('local', {
    successRedirect: '/boards',
    failureRedirect: '/signin',
    failureFlash: true 
}));

app.get('/boards',(req, res)=>{
    if (!req.user || !req.user[0]) {
        return res.redirect('/signin');
    }
    try {
        const boards = db.query(
            "SELECT * FROM board WHERE userFk = ?", [req.user[0].id], function (err, results, fields) {
            if (err) throw err;
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
            "LEFT JOIN celltype ct ON ct.id = c.typeFk " +
        "WHERE c.boardFk = ?;" 
    const id = req.params.id;
    let board, cells, cellTypes;
    try{
        db.query("SELECT * FROM board WHERE id = ?", [id], function (err, boardResults, fields) {
            if (err) throw err;
            board = boardResults;
            db.query("SELECT * FROM celltype", function (err, cellTypeResults, fields) {
                if (err) throw err;
                cellTypes = cellTypeResults;
                db.query(cst, [id], function (err, cellsResults, fields) {
                    if (err) throw err;
                    cells = cellsResults.map((cell) => Object.assign({}, cell));
                    res.render('board', {board: board, cells: cells, cellTypes: cellTypes});
                });
            });
            
        });
    } catch (error) {
        console.error('Ocurrió un error al ejecutar la consulta: ', error);
    }
});

app.get('/new',(req, res)=>{
    res.render('newBoard');
});

app.post('/new',(req, res)=>{
    //comprobamos que el usario este logeado
    if (!req.user) {
        req.flash('error', 'Debes iniciar sesión para crear un nuevo tablero');
        //lo enviamos a la pagina de signin
        return res.redirect('/signin');
    } else {
        try {
            const cst = "INSERT INTO mapster.board " +
                    "(userFk, name, thick, `length`, description, urlImage) " +
                    "VALUES(?, ?, ?, ?, ?, ?);"
            db.query(cst,[req.user[0].id, req.body.boardName, req.body.size, req.body.size, req.body.description, req.body.urlImage], function (err, newBoardResults, fields) {
                if (err) throw err;
                res.redirect('/boards');
            });
        } catch (error) {
            console.error('Ocurrió un error al ejecutar la consulta: ', error);
            res.redirect('/boards');
        }
    }
});


app.post('/boards/:id', (req, res) => {
    try{
        db.query("SELECT id FROM celltype WHERE image =  ?",[req.body.imageName], function (err, imageResults, fields) {
            if (err) throw err;
            const cst = "UPDATE cell SET typeFk = ? WHERE x = ? AND y = ? AND boardFk = ?";
            const cstNull = "UPDATE cell SET typeFk = NULL WHERE x = ? AND y = ? AND boardFk = ?";
            if (req.body.imageName === "null") {
                db.query(cstNull, [req.body.x,req.body.y,req.body.board], function (err, cellsResults, fields) {
                    if (err) throw err;
                });
            }else{
                db.query(cst, [imageResults[0].id, req.body.x, req.body.y, req.body.board], function (err, cellsResults, fields) {
                    if (err) throw err;
                });
            }
        });
    } catch (error) {
        console.error('Ocurrió un error al ejecutar la consulta: ', error);
    }
});