const passport = require('passport');
const { Strategy } = require('passport-local');
const mysql = require('mysql2');

const db_host = process.env.DB_HOST || "localhost";
const db_user = process.env.DB_USER || "node";
const db_password = process.env.DB_PASSWORD || "node";
const db_name = process.env.DB_NAME || "mapster";
const db_port = process.env.DB_PORT || 3306;

module.exports = function localStrategy() {
    passport.use(new Strategy({
        usernameField: 'username',
        passwordField: 'password'
    },
    (username, password, done) => {

        let db = mysql.createConnection({
            host: db_host,
            user: db_user,
            password: db_password ,
            port: db_port,
            database: db_name
        });
        
        db.connect(function(err) {
            if (err) throw err;
        }); 

        try { 
            db.query("SELECT * FROM user WHERE username = ?", [username], function (err, userResults, fields) {
                if (err) throw err;
                if (userResults.length === 0) {
                    console.error('El usuario no se encuentra en la base de datos');
                    return done(null, false, { message: 'Usuario o contraseña incorrectos' });
                }
                if (userResults[0].password === password) {
                    return done(null, userResults);
                } else {
                    console.error('La contraseña es incorrecta');
                    return done(null, false, { message: 'Usuario o contraseña incorrectos' });
                }
            });
        } catch (error) {
            console.error(error);
            done(error, false);
        }
    }
));    
}
