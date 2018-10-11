var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express', user: req.user, sessionUser: JSON.stringify(req.user), sessionInfo: JSON.stringify(req.session) });
});

module.exports = router;
