const passport = require('passport');
const { Strategy } = require('passport-local');

module.exports = function localStrategy() {
    passport.use(new Strategy({
        usernameField: 'username',
        passwordField: 'password'
    },
    (username, password, done) => {
        const user = {username: 'username', password: 'pass', name: 'Ricardo' };
        console.log('User log');
        done(null, user);
    }
    ));    
}
