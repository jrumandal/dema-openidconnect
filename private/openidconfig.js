/** domain */
let myDomain = 'http://localhost:3000/';
/* configuration used for offline testing 
*  put your keys here without commit it
*/
const config = {
    audience: '',
    authorization_endpoint: '',
    client_id: '',
    client_secret: '',
    
    grant_type: '',
    issuer: '',
    jwks_uri: '',
    jwks: '',

    'openid-configuration': '',
    // leeway: '',
    response_type: '',
    scope: '',
    token_endpoint: '',
    userinfo_endpoint: '',
    redirect_uri: '',
    redirect_url: '',
    profile: true || false
};
module.exports = config;