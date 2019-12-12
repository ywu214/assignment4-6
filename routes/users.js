require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const sgTransport = require('nodemailer-sendgrid-transport');
const bcrypt = require('bcryptjs');
const User = require('../modal/user');
const router = express.Router();
var mailer = nodemailer.createTransport(sgTransport({
  auth: {
    api_key: process.env.SEND_GRID
  }
}));

router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.post('/create', async function (req, res, next) {
  const username = req.body.username;
  const firstName = req.body.firstName;
  const lastName = req.body.lastName;
  const password = req.body.password;
  const email = req.body.email;

  if (!firstName) {
    return errorResponse(res, 'firstName can not be empty');
  }
  if (!lastName) {
    return errorResponse(res, 'lastName can not be empty');
  }
  if (!username) {
    return errorResponse(res, 'username can not be empty');
  }
  if (!email) {
    return errorResponse(res, 'email can not be empty');
  }
  if (!password) {
    return errorResponse(res, 'password can not be empty');
  }
  const existedUser = await findByUsername(username);
  if (existedUser) {
    return errorResponse(res, `${username} is already existed`);
  }
  const user = new User({
    email,
    username,
    password: bcrypt.hashSync(password, 8),
    firstName,
    lastName
  });
  user.save(function (err, user) {
    if (err) {
      return errorResponse(res, err);
    }
    const emailSendConfig = {
      to: [email],
      from: 'admin@airbb.com',
      subject: 'Welcome to Airbb',
      text: 'Welcome to Airbb',
      html: '<b>Welcome to Airbb</b>'
    };
    console.info(emailSendConfig);
    mailer.sendMail(emailSendConfig, function(err, res) {
      if (err) {
        console.log(err)
      }
      console.log(res);
    });
    return successResponse(res, user);
  });
});

async function findByUsername(username) {
  const queryUsername = User.where({username: username});
  return await queryUsername.findOne().exec();
}

function errorResponse (res, errorMessage) {
  return res.status(500).json({error: errorMessage});
}

function successResponse (res, data) {
  return res.status(200).json(data);
}

module.exports = router;
