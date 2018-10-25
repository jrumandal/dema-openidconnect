# Example OpenID Connect - Using OpenID Client
This is a test login & auth with Auth0, OpenID Connect


You must provide the following parameters to let it work!

* process.env.ISSUER
* process.env.AUTHORIZATION_ENDPOINT
* process.env.TOKEN_ENDPOINT
* process.env.REDIRECT_URI (which configures also REDIRECT_URL)
* process.env.USERINFO_ENDPOINT
* process.env.AUDIENCE
* process.env.RESPONSE_TYPE
* process.env.GRANT_TYPE
* process.env.OPEN_CONFIGURATION
* process.env.JWKS_URI
* process.env.JWKS
* process.env.CLIENT_ID
* process.env.CLIENT_SECRET
* process.env.SCOPE
* process.env.CLOCK_TOLERANCE // default 15(seconds) 
* process.env.USE_PKCE // default 'S256'
