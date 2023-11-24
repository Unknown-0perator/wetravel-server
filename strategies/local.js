const passport = require('passport');
const { Strategy } = require('passport-local');
const knex = require('knex')(require('../knexfile'));
const { comparePassword } = require('../utils/encrypt_decrypt-password');

module.exports = (passport) => {
    passport.use(
        new Strategy(
            {
                usernameField: 'email',
            },
            (email, password, done) => {
                knex('users')
                    .where({ email: email })
                    .then(response => {
                        const user = response[0];
                        if (!user) throw new Error('User not found');
                        if (comparePassword(password, user.password)) {
                            done(null, user);
                        } else {
                            done(null, false, { message: 'Incorrect password' });
                        }
                    })
                    .catch(err => done(err, false));
            }
        )
    );

    passport.serializeUser((user, cb) => cb(null, user.user_id));

    passport.deserializeUser((user_id, cb) => {
        knex('users')
            .where({ user_id: user_id })
            .then(response => {
                const user = response[0];
                if (!user) throw new Error('User not found');
                cb(null, user);
            })
            .catch(err => cb(err, null));
    });
}




