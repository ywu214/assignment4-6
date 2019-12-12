const express = require('express');
const router = express.Router();

router.get('/', function(req, res, next) {
  res.render('index', {
    user: req.session.user,
    loggedIn: req.session.loggedIn,
    isAdmin:req.session.admin });
});

router.get('/login', function(req, res, next) {
  res.render('login');
});

module.exports = router;
