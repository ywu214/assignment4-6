const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Room = require('../modal/room');
const User = require('../modal/user');

router.get('/', async function(req, res, next) {
  let rooms;
  if (req.session.admin) {
    rooms = await Room.find().exec();
  } else {
    const currentUser = req.session.user;
    const userId = currentUser._id;
    const user = await User.findOne({_id: userId}).exec();
    let roomIds = user.rooms;
    if (roomIds && roomIds.length > 0) {
      const ids = [];
      for (const id of roomIds) {
        ids.push(mongoose.Types.ObjectId(id))
      }
      rooms = await Room.find({
        '_id': {
          $in: ids
        }
      }).exec();
    }
  }
  res.render('dashboard', {
    rooms,
    user: req.session.user,
    loggedIn: req.session.loggedIn,
    isAdmin:req.session.admin });
});
module.exports = router;
