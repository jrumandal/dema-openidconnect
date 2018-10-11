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

(function (app) {
    const { Issuer, Strategy } = require('openid-client');
    const params = {
        issuer: 'https://jrumandal.eu.auth0.com/',
        authorization_endpoint: 'https://jrumandal.eu.auth0.com/authorize',
        token_endpoint: 'https://jrumandal.eu.auth0.com/oauth/token',
        userinfo_endpoint: 'https://jrumandal.eu.auth0.com/userinfo',
        audience: 'https://jrumandal.eu.auth0.com/api/v2/',
        response_type: 'code',
        grant_type: 'authorization_code',

        'openid-configuration': 'https://jrumandal.eu.auth0.com/.well-known/openid-configuration',
        jwks_uri: 'https://jrumandal.eu.auth0.com/.well-known/jwks.json',
        jwks: 'https://jrumandal.eu.auth0.com/.well-known/jwks.json',
        // leeway: 1112000,

        client_id: 'l4VFVjxCyb7MNFFJFevaIo3u4M0sWxND',
        client_secret: 'bBq1E4S8DZgVgHOi0NAkkV9qdvtzM1UhkWTu2InSwsjtVxTrTEFLGnP1u6xibQiN',
        redirect_uri: 'http://localhost:3000/callback' || 'https://dema-auth-test.herokuapp.com/callback',
        redirect_url: 'http://localhost:3000/callback' || 'https://dema-auth-test.herokuapp.com/callback',
        scope: 'openid profile email phone address',
        profile: true
    };

    /** @type {Issuer} */
    const OpenIDIssuer = new Issuer({
        issuer: params.issuer,
        authorization_endpoint: params.authorization_endpoint,
        token_endpoint: params.token_endpoint,
        userinfo_endpoint: params.userinfo_endpoint,
        jwks: params.jwks,
        jwks_uri: params.jwks_uri
    });

    const OpenIDClient = new OpenIDIssuer.Client(params);

    OpenIDClient.authorizationUrl(params)
    OpenIDClient.CLOCK_TOLERANCE = 15; // to allow a 5 second skew
    


    const passReqToCallback = false; // optional, defaults to false, when true req is passed as a first
                                 // argument to verify fn
    const usePKCE = 'S256'; // optional, defaults to false, when true the code_challenge_method will be
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


    app.get('/auth', passport.authenticate('oidc', { session: true }));
    app.get('/callback', passport.authenticate('oidc', { failureRedirect: '/error', successRedirect: '/' }));
    // , function(arg1, arg2, arg3) {
    //     console.log('arg1', arg1)
    //     console.log('arg2', arg2)
    //     console.log('arg3', arg3)
    // }
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
