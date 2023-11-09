const passport = require('passport');
const { Strategy } = require('passport-local');
const knex = require('knex')(require('../knexfile'));

passport.serializeUser((user, done) => done(null, user.user_id));

passport.deserializeUser((user_id, done) => {
    knex('users')
        .where({ user_id: user_id })
        .then(response => {
            const user = response[0];
            if (!user) throw new Error('User not found');
            done(null, user);
        })
        .catch(err => done(err, null));
});

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
                    if (password === user.password) {
                        done(null, user);
                    } else {
                        done(null, false, { message: 'Incorrect password' });
                    }
                })
                .catch(err => done(err, false));
        }
    )
);

module.exports = passport;
