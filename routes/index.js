var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express', user: req.user, sessionUser: JSON.stringify(req.user), sessionInfo: JSON.stringify(req.session), action: req.session.action, code: req.session.action });
  req.session.action = undefined;
  req.session.code = undefined;
});

router.use('/API/:action/:code', (req, res, next) => {
    req.session.action = req.params.action;
    req.session.code = req.params.code;
    res.redirect('/auth');
});

module.exports = router;
