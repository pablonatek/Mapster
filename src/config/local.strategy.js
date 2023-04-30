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
                console.log(userResults);
                console.log(userResults[0].password);
                if(userResults && userResults[0].password === password) {
                    done(null, userResults);
                } else{
                    done(null, false);
                }
            });
        } catch (error) {
            console.error(error);
            done(error, false);
        }
    }
));    
}
