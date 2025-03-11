const LocalStrategy = require('passport-local').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

module.exports = function(passport) {
    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    passport.deserializeUser(async (id, done) => {
        try {
            const user = await User.findByPk(id);
            done(null, user);
        } catch (err) {
            done(err, null);
        }
    });

    // Локальная стратегия
    passport.use(new LocalStrategy({ usernameField: 'email' },
        async (email, password, done) => {
            try {
                const user = await User.findOne({ where: { email } });
                
                if (!user) {
                    return done(null, false, { message: 'Неверный email или пароль' });
                }

                const isMatch = await user.validatePassword(password);
                
                if (!isMatch) {
                    return done(null, false, { message: 'Неверный email или пароль' });
                }

                return done(null, user);
            } catch (err) {
                return done(err);
            }
        }
    ));

    // Google OAuth стратегия
    passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: '/auth/google/callback'
    },
    async (accessToken, refreshToken, profile, done) => {
        try {
            let user = await User.findOne({ where: { googleId: profile.id } });

            if (!user) {
                user = await User.create({
                    googleId: profile.id,
                    email: profile.emails[0].value,
                    name: profile.displayName,
                    avatar: profile.photos[0].value,
                    isVerified: true
                });
            }

            return done(null, user);
        } catch (err) {
            return done(err, null);
        }
    }));
}; 