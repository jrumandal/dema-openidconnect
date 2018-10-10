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



(function (app) {
    var session = require('express-session');
    var passport = require('passport');
    const { Issuer, Strategy } = require('openid-client');
    const params = {
        issuer: 'https://jrumandal.eu.auth0.com',
        authorization_endpoint: 'https://jrumandal.eu.auth0.com/authorize',
        token_endpoint: 'https://jrumandal.eu.auth0.com/oauth/token',
        userinfo_endpoint: 'https://jrumandal.eu.auth0.com/userinfo',
        
        openIdConfig: 'https://jrumandal.eu.auth0.com/.well-known/openid-configuration',
        jwks: 'https://jrumandal.eu.auth0.com/.well-known/jwks.json',

        client_id: '7CqxCzXTC7av5pdk_ai6dO9CndYggpZs',
        client_secret_basic: 'A5Fh6ypZa5pXHAUMAzKfp3KePx4FYGIhThbuxdBhuxmvAzM7aIgQGs3ygxjF9v_-',
        redirect_uri: 'https://dema-auth-test.herokuapp.com/callback' || 'http://localhost:3000/callback',
        scope: 'profile offline_access name given_name family_name nickname email email_verified picture created_at identities phone address'
    };

    /** @type {Issuer} */
    const OpenIDIssuer = new Issuer({
        issuer: params.issuer,
        authorization_endpoint: params.authorization_endpoint,
        token_endpoint: params.token_endpoint,
        userinfo_endpoint: params.userinfo_endpoint
    });

    const OpenIDClient = new OpenIDIssuer.Client({
        client_id: params.client_id,
        client_secret_basic: params.client_secret_basic,
        scope: params.scope
    });

    OpenIDClient.authorizationUrl({
        redirect_uri: params.redirect_uri,
        scope: params.scope
    })

    
    app.use(session({
        secret: 'keyboard cat',
        resave: false,
        saveUninitialized: true,
        cookie: { secure: false, maxAge: 60000 }
    }));
    app.use(passport.initialize());
    app.use(passport.session());

    passport.use('oidc', new Strategy({
        client: OpenIDClient,
        params: {
            redirect_uri: params.redirect_uri
        }
    }, (tokenset, tokenSecret, profile, done) => {
        try {
            console.log('tokenset', tokenset);
            console.log('access_token', tokenset.access_token);
            console.log('id_token', tokenset.id_token);
            console.log('claims', tokenset.claims);
            console.log('tokenSecret', tokenset.tokenSecret);
            console.log('userinfo', profile);
        } catch (e) {
            console.error(e);
        } finally {
            if(err) {
                return done(err);
            }
            return done(null, profile);
        }
    }));

    passport.serializeUser(function (user, done) {
        console.log("SERIALIZED", user);
        done(null, user);
    });

    passport.deserializeUser(function (user, done) {
        console.log("DESERIALIZED. id:", user)
        done(null, user);
    });

    
    app.get('/auth', passport.authenticate('oidc', { session: true }));
    app.get('/callback', (req, res, next) => { console.log(req.query); next(); }, passport.authenticate('oidc', { successRedirect: '/', failureRedirect: '/error' }));
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
