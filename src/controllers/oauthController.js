const passport = require('passport');
const oauthService = require('../services/oauthService');

class OAuthController {
    googleAuth(req, res, next) {
        passport.authenticate('google', {
            scope: ['profile', 'email']
        })(req, res, next);
    }

    googleCallback(req, res, next) {
        passport.authenticate('google', { session: false }, (err, user) => {
            if (err) {
                console.error('Google OAuth callback error:', err);
                return res.redirect(`${process.env.FRONTEND_URL}?error=oauth_error`);
            }

            if (!user) {
                return res.redirect(`${process.env.FRONTEND_URL}?error=oauth_failed`);
            }

            try {
                const token = oauthService.createTokenForOAuthUser(user);

                res.redirect(`${process.env.FRONTEND_URL}?token=${token}`);
            } catch (error) {
                console.error('Token creation error:', error);
                res.redirect(`${process.env.FRONTEND_URL}?error=token_error`);
            }
        })(req, res, next);
    }

    githubAuth(req, res, next) {
        passport.authenticate('github', {
            scope: ['user:email']
        })(req, res, next);
    }

    githubCallback(req, res, next) {
        passport.authenticate('github', { session: false }, (err, user) => {
            if (err) {
                console.error('GitHub OAuth callback error:', err);
                return res.redirect(`${process.env.FRONTEND_URL}?error=oauth_error`);
            }

            if (!user) {
                return res.redirect(`${process.env.FRONTEND_URL}?error=oauth_failed`);
            }

            try {
                const token = oauthService.createTokenForOAuthUser(user);

                res.redirect(`${process.env.FRONTEND_URL}?token=${token}`);
            } catch (error) {
                console.error('Token creation error:', error);
                res.redirect(`${process.env.FRONTEND_URL}?error=token_error`);
            }
        })(req, res, next);
    }
}

module.exports = new OAuthController();