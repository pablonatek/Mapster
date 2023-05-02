const passport = require('passport');
const { Strategy } = require('passport-local');
const mysql = require('mysql');

module.exports = function localStrategy() {
    passport.use(new Strategy({
        usernameField: 'username',
        passwordField: 'password'
    },
    (username, password, done) => {
        /*const user = {username, password, 'name': 'Ricardo' };
        console.log('User log');
        done(null, user);*/

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
