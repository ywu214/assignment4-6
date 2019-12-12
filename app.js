require('dotenv').config();
const createError = require('http-errors');
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const fileUpload = require('express-fileupload');
const request = require('request');
const qiniu = require('qiniu');
const indexRouter = require('./routes/index');
const User = require('./modal/user');
const dashboardRouter = require('./routes/dashboard');
const usersRouter = require('./routes/users');
const roomsRouter = require('./routes/rooms');
const port = 4200;
const dbUrl = `mongodb://${process.env.MONGO_HOST}/airbb`;
mongoose.connect(dbUrl, { useUnifiedTopology: true, useNewUrlParser: true });
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'mongodb connection error'));
db.once('open', console.error.bind(console, 'mongodb connected'));
const app = express();
var qiniuConfig = new qiniu.conf.Config();
qiniuConfig.zone = qiniu.zone.Zone_z0;
const accessKey = process.env.QINIU_ACCESS_KEY;
const secretKey = process.env.QINIU_SECRET_KEY;
const mac = new qiniu.auth.digest.Mac(accessKey, secretKey);
const bucket = process.env.QINIU_TEST_BUCKET;
const putPolicy = new qiniu.rs.PutPolicy({
  scope: bucket
});
const uploadToken = putPolicy.uploadToken(mac);
// 是否使用https域名
//config.useHttpsDomain = true;
// 上传是否使用cdn加速
//config.useCdnDomain = true;
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(fileUpload());
app.use(express.static(path.join(__dirname, 'public')));
app.use(
    session({
      secret: process.env.SESSION_SECRET,
      name: process.env.SESSION_NAME,
      resave: true,
      saveUninitialized: true
    })
);
async function checkUsernameAndPassword (username, password) {
  if (!username || !password) {
    return false;
  }
  const user = await User.findOne({username: username}).exec();
  if (!user) {
    return false;
  }
  return bcrypt.compareSync(password, user.password);
}

function checkLoggedIn (req, res, next) {
  if (req.session.loggedIn) {
    next();
  } else {
    res.render("login");
  }
}

app.get('/logout', async function login (req, res, next) {
  req.session.loggedIn = false;
  req.session.admin = false;
  req.session.user = undefined;
  res.redirect("/");
});

app.post('/login', async function login (req, res, next) {
  const { username, password } = req.body;
  if (await checkUsernameAndPassword(username, password)) {
    req.session.loggedIn = true;
    req.session.user = await User.findOne({username: username}).exec();
    if (username === process.env.ADMIN_USER) {
      req.session.admin = true;
    }
    res.redirect("/");
  } else {
    res.render("login", {error: "Incorrect username or password" });
  }
});
app.post('/upload', function(req, res) {
  const file = req.files.file;
  const formUploader = new qiniu.form_up.FormUploader(qiniuConfig);
  const putExtra = new qiniu.form_up.PutExtra();
  const key = file.name;
  formUploader.put(uploadToken, key, file.data, putExtra, function(respErr,
                                                                       respBody, respInfo) {
    if (respErr) {
      console.info(respErr);
      throw respErr;
    }
    if (respInfo.statusCode == 200) {
      res.json({url: `http://ehmacstatic.ehert.com/${key}`});
    } else {
      console.log(respInfo.statusCode);
      console.log(respBody);
    }
  });

});
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/rooms', roomsRouter);
app.use('/dashboard', checkLoggedIn, dashboardRouter);


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
app.listen(port, () => console.log(`app listening on port ${port}!`));
module.exports = app;
