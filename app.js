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



((app)=>{
    var session = require('express-session');
    var passport = require('passport');
    const { Issuer, Strategy } = require('openid-client');
    const params = {
        // https://samples.auth0.com/authorize?
        // client_id = kbyuFDidLLm280LIwVFiazOqjO3ty8KH
        // & redirect_uri= https://openidconnect.net/callback 
        // &scope=openid profile email phone address
        // & response_type=code
        // & state=0975fbd748c56d8475f4dba1dfa843a930c2b109
    };

    /** @type {Issuer} */
    const OpenIDIssuer = new Issuer({
        issuer: 'https://dema-test.eu.auth0.com',
        authorization_endpoint: 'https://dema-test.eu.auth0.com/authorize',
        token_endpoint: 'https://dema-test.eu.auth0.com/oauth/token',
    userinfo_endpoint: 'https://dema-test.eu.auth0.com/userinfo'
        // jwks_uri: 'https://www.googleapis.com/oauth2/v3/certs'
    });

    const OpenIDClient = new OpenIDIssuer.Client({
        client_id: '6o6rrUedx7WmQ3WxFw7QhHLvFieWbx66',
        // client_id: 'kbyuFDidLLm280LIwVFiazOqjO3ty8KH',
        client_secret: 'eQ-vSNkbuXK3TpD-VhhXLQj6uBADFxIbfNaUL4gR3syXCxQjmL_1BVNq5IeGxmfu',
        // client_secret: '60Op4HFM0I8ajz0WdiStAbziZ-VFQttXuxixHHs2R7r7-CW8GR79l-mmLqMhc-Sa',
        scope: 'profile offline_access name given_name family_name nickname email email_verified picture created_at identities phone address'
    });

    // OpenIDClient.authorizationUrl({
    //     redirect_uri: 'https://dema-auth-test.herokuapp.com/callback',
    //     scope: 'profile offline_access name given_name family_name nickname email email_verified picture created_at identities phone address'
    // })

    passport.serializeUser(function (user, done) {
        console.log("SERIALIZED", user);
        done(null, user);
    });

    passport.deserializeUser(function (user, done) {
        console.log("DESERIALIZED. id:", user)
        done(null, user);
    });

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
            redirect_uri: 'https://dema-auth-test.herokuapp.com/callback'
        }
    }, (tokenset, tokenSecret, profile, done) => {
        console.log('tokenset', tokenset);
        console.log('access_token', tokenset.access_token);
        console.log('id_token', tokenset.id_token);
        console.log('claims', tokenset.claims);
        console.log('tokenSecret', tokenset.tokenSecret);
        console.log('userinfo', profile);

        if(err) {
            return done(err);
        }
        return done(null, profile);
    }));

    
    app.get('/auth', passport.authenticate('oidc'));
    app.get('/callback', passport.authenticate('oidc', { successRedirect: '/', failureRedirect: '/error' }));
})(app);

app.use((req, res, next) => {
    console.log(req.session);
    console.log(req.user);
    next();
});

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/error', (req, res) => {
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
