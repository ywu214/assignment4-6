require('dotenv').config();
const mongoose = require('mongoose');
const express = require('express');
const Room = require('../modal/room');
const User = require('../modal/user');
const router = express.Router();

router.get('/', async function(req, res, next) {
  const location = req.query.location;
  const q = {};
  if (location) {
    q.location = location;
  }
  const rooms = await Room.find(q).exec();
  console.info(req.session.user);
  res.render('rooms', {
    rooms,
    user: req.session.user,
    loggedIn: req.session.loggedIn,
    isAdmin:req.session.admin });
});

router.get('/list', async function(req, res, next) {
  const rooms = await Room.find().exec();
  return successResponse(res, rooms);
});

router.get('/get', async function(req, res, next) {
  const id = req.query.id;
  const room = await Room.findOne({_id: id}).exec();
  return successResponse(res, room);
});

router.post('/create', async function (req, res, next) {
  const title = req.body.title;
  const price = req.body.price;
  const detail = req.body.detail;
  const location = req.body.location;
  const picture = req.body.picture;
  if (!title) {
    return errorResponse(res, 'title can not be empty');
  }
  if (!price) {
    return errorResponse(res, 'price can not be empty');
  }
  if (!detail) {
    return errorResponse(res, 'detail can not be empty');
  }
  if (!location) {
    return errorResponse(res, 'location can not be empty');
  }
  if (!picture) {
    return errorResponse(res, 'picture can not be empty');
  }
  const room = new Room({
    title,
    price,
    detail,
    location,
    picture
  });
  room.save(function (err, room) {
    if (err) {
      return errorResponse(res, err);
    }
    return successResponse(res, room);
  });
});

router.post('/update', async function (req, res, next) {
  const id = req.body.id;
  const title = req.body.title;
  const price = req.body.price;
  const detail = req.body.detail;
  const location = req.body.location;
  const picture = req.body.picture;
  if (!title) {
    return errorResponse(res, 'title can not be empty');
  }
  if (!price) {
    return errorResponse(res, 'price can not be empty');
  }
  if (!detail) {
    return errorResponse(res, 'detail can not be empty');
  }
  if (!location) {
    return errorResponse(res, 'location can not be empty');
  }
  if (!picture) {
    return errorResponse(res, 'picture can not be empty');
  }
  const room = await Room.where({_id: id}).findOne().exec();
  if (room) {
    room.title = title;
    room.price = price;
    room.detail = detail;
    room.location = location;
    room.picture = picture;
    const roomUpdate = new Room(room);
    await roomUpdate.save();
    successResponse(res, await Room.where({_id: id}).findOne().exec());
  } else {
    return errorResponse(res, 'room is not existed');
  }
});

router.post('/booking', async function (req, res, next) {
  const userId = req.session.user._id;
  const roomId = req.body.roomId;
  if (!userId) {
    return errorResponse(res, 'userId can not be empty');
  }
  if (!roomId) {
    return errorResponse(res, 'roomId can not be empty');
  }
  const user = await User.findOne({_id: userId}).exec();
  if (!user) {
    return errorResponse(res, 'user not existed');
  }
  if (!user.rooms) {
    user.rooms = [];
  }
  if (!user.rooms.find((v)=>{return v === roomId})) {
    user.rooms.push(roomId);
    await user.save();
  }
  return successResponse(res, await User.findOne({_id: userId}));
});

router.get('/myBooking', async function (req, res, next) {
  const userId = req.query.userId;
  if (!userId) {
    return errorResponse(res, 'userId can not be empty');
  }
  const user = await User.findOne({_id: userId}).exec();
  if (!user) {
    return errorResponse(res, 'user not existed');
  }
  let rooms = user.rooms;
  if (!rooms || rooms.length === 0) {
    return successResponse(res, [])
  }
  const ids = [];
  for (const id of rooms) {
    ids.push(mongoose.Types.ObjectId(id))
  }
  return successResponse(res, await Room.find({
    '_id': {
      $in: ids
    }
  }).exec());
});



function errorResponse (res, errorMessage) {
  return res.status(500).json({error: errorMessage});
}

function successResponse (res, data) {
  return res.status(200).json(data);
}

module.exports = router;
