const passport = require('passport');
const { Strategy } = require('passport-local');

module.exports = function localStrategy() {
    passport.use(new Strategy({
        usernameFiel: 'username',
        passwordField: 'password'
    },
    (username, password, done) => {
        const user = { username, password, name: 'Ricardo' };
        console.log('User log');
        done(null, user);
    }
    ));
}