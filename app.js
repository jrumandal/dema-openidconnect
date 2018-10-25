var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


var session = require('express-session');

app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false, maxAge: 60000 }
}));

var passport = require('passport');
passport.serializeUser(function (user, done) {
    console.log("SERIALIZED", user);
    done(null, user);
});

passport.deserializeUser(function (user, done) {
    console.log("DESERIALIZED. id:", user)
    done(null, user);
});
/** Isolation */
(function (app) {
    const { Issuer, Strategy } = require('openid-client');
    const myDomain = process.env.REMOTE_DOMAIN || 'http://localhost:3000/';
    /** @type {Object} Configuration for OpenID Client */
    let config = undefined;
    if (process.env.NODE_ENV === 'production') {
        config = {
            issuer: process.env.ISSUER,
            authorization_endpoint: process.env.AUTHORIZATION_ENDPOINT,
            token_endpoint: process.env.TOKEN_ENDPOINT,
            userinfo_endpoint: process.env.USERINFO_ENDPOINT,
            audience: process.env.AUDIENCE,
            response_type: process.env.RESPONSE_TYPE,
            grant_type: process.env.GRANT_TYPE,
    
            'openid-configuration': process.env.OPEN_CONFIGURATION,
            jwks_uri: process.env.JWKS_URI,
            jwks: process.env.JWKS,
            // leeway: 1112000,
    
            client_id: process.env.CLIENT_ID,
            client_secret: process.env.CLIENT_SECRET,
            redirect_uri: process.env.REDIRECT_URI || `${myDomain}callback`,
            redirect_url: process.env.REDIRECT_URI || `${myDomain}callback`,
            scope: process.env.SCOPE,
            profile: true
        };
    } else {
        config = require('./private/openidconfig.js');
    }
    const params = config;


    /** @type {Issuer} */
    const OpenIDIssuer = new Issuer({
        issuer: params.issuer,
        authorization_endpoint: params.authorization_endpoint,
        token_endpoint: params.token_endpoint,
        userinfo_endpoint: params.userinfo_endpoint,
        jwks: params.jwks,
        jwks_uri: params.jwks_uri
    });

    const OpenIDClient = new OpenIDIssuer.Client({
        client_id: params.client_id,
        client_secret: params.client_secret
    });

    OpenIDClient.authorizationUrl({
        redirect_uri: params.redirect_uri,
        scope: params.scope
    })
    OpenIDClient.CLOCK_TOLERANCE = process.env.CLOCK_TOLERANCE || 15; // to allow a 5 second skew. Increase if returns 'Token generated in future'


    const passReqToCallback = false; // optional, defaults to false, when true req is passed as a first
                                 // argument to verify fn
    const usePKCE = process.env.USE_PKCE || 'S256'; // optional, defaults to false, when true the code_challenge_method will be
                      // resolved from the issuer configuration, instead of true you may provide
                      // any of the supported values directly, i.e. "S256" (recommended) or "plain"
    passport.use('oidc', new Strategy({
        client: OpenIDClient,
        params: {
            redirect_uri: params.redirect_uri,
            scope: params.scope
        },
        usePKCE,
        passReqToCallback
    }, (tokenset, userinfo, done) => {
        try {
            console.log('tokenset', tokenset);
            console.log('access_token', tokenset.access_token);
            console.log('id_token', tokenset.id_token);
            console.log('claims', tokenset.claims);
            console.log('tokenSecret', tokenset.tokenSecret);
            console.log('userinfo', userinfo);
        } catch (e) {
            console.error(e);
            return done(e);
        } finally {
            return done(null, userinfo);
        }
    }));
    app.use(passport.initialize());
    app.use(passport.session());

    // Define path entities required for authentication system
    app.get('/auth', passport.authenticate('oidc', { session: true }));
    app.get('/callback', passport.authenticate('oidc', { failureRedirect: '/error', successRedirect: '/' }));
    app.get('/openid/callback', passport.authenticate('oidc', { failureRedirect: '/error', successRedirect: '/' }));
    app.get('/logout', (req, res, next) => {
        req.logout();
        res.redirect(`${params.issuer}logout?returnTo=${myDomain}`);
    });
})(app);

app.use((req, res, next) => {
    console.log(req.session);
    console.log(req.user);
    next();
});

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/error', (req, res, next) => {
    next();
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
