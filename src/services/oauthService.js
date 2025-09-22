const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const prisma = require('../utils/database');
const authService = require('./authService');

class OAuthService {
    constructor() {
        this.initializeStrategies();
    }

    initializeStrategies() {
        if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
            passport.use(new GoogleStrategy({
                clientID: process.env.GOOGLE_CLIENT_ID,
                clientSecret: process.env.GOOGLE_CLIENT_SECRET,
                callbackURL: "/api/auth/google/callback"
            }, this.handleGoogleCallback.bind(this)));
        }

        if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
            passport.use(new GitHubStrategy({
                clientID: process.env.GITHUB_CLIENT_ID,
                clientSecret: process.env.GITHUB_CLIENT_SECRET,
                callbackURL: "/api/auth/github/callback"
            }, this.handleGitHubCallback.bind(this)));
        }

        passport.serializeUser((user, done) => {
            done(null, user.id);
        });

        passport.deserializeUser(async (id, done) => {
            try {
                const user = await prisma.user.findUnique({
                    where: { id },
                    select: {
                        id: true,
                        email: true,
                        name: true,
                        createdAt: true
                    }
                });
                done(null, user);
            } catch (error) {
                done(error, null);
            }
        });
    }

    async handleGoogleCallback(accessToken, refreshToken, profile, done) {
        try {
            const email = profile.emails[0].value;
            const googleId = profile.id;
            const name = profile.displayName;

            let user = await prisma.user.findUnique({
                where: { googleId }
            });

            if (user) {
                return done(null, user);
            }

            user = await prisma.user.findUnique({
                where: { email }
            });

            if (user) {
                user = await prisma.user.update({
                    where: { id: user.id },
                    data: { googleId }
                });
                return done(null, user);
            }

            user = await prisma.user.create({
                data: {
                    email,
                    name,
                    googleId
                }
            });

            return done(null, user);

        } catch (error) {
            console.error('Google OAuth error:', error);
            return done(error, null);
        }
    }

    async handleGitHubCallback(accessToken, refreshToken, profile, done) {
        try {
            const email = profile.emails?.[0]?.value || `${profile.username}@github.local`;
            const githubId = profile.id;
            const name = profile.displayName || profile.username;

            let user = await prisma.user.findUnique({
                where: { githubId }
            });

            if (user) {
                return done(null, user);
            }

            if (profile.emails?.[0]?.value) {
                user = await prisma.user.findUnique({
                    where: { email }
                });

                if (user) {
                    user = await prisma.user.update({
                        where: { id: user.id },
                        data: { githubId }
                    });
                    return done(null, user);
                }
            }

            user = await prisma.user.create({
                data: {
                    email,
                    name,
                    githubId
                }
            });

            return done(null, user);

        } catch (error) {
            console.error('GitHub OAuth error:', error);
            return done(error, null);
        }
    }

    createTokenForOAuthUser(user) {
        const userForToken = {
            id: user.id,
            email: user.email,
            name: user.name,
            createdAt: user.createdAt
        };

        return authService.generateToken(userForToken);
    }
}

module.exports = new OAuthService();