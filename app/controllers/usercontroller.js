import jwt from 'jwt-simple';
import dotenv from 'dotenv';

import User from '../models/usermodel';

// configuring the environmental variables
dotenv.config({ silent: true });

// encodes a new token for a user object
function tokenForUser(user) {
  const timestamp = new Date().getTime();
  return jwt.encode({ sub: user.id, iat: timestamp }, process.env.AUTH_SECRET);
}

const cleanUser = (user) => {
  return {
    id: user._id,
    email: user.email,
    username: user.username,
    fullname: user.fullname,
    password: user.password,
    city: user.city,
    zip: user.zip,
    Street: user.Street,
    DateOfBirth: user.DateOfBirth,
  };
};

export const signin = (req, res, next) => {
  res.send({ token: tokenForUser(req.user) });
};

export const signup = (req, res, next) => {
  const { username, password } = req.body;
  if (!password || !username) {
    return res.status(422).send('You must provide email, fullname, username, and password');
  }
  User.findOne({ username })
    .then((user) => {
      if (user) {
        return res.status(409).send('User for this email already exists');
      }
      const newUser = new User({ username, password });
      return newUser.save();
    })
    .then((newUser) => {
      res.json({ token: tokenForUser(newUser) });
    })
    .catch((err) => {
      res.status(500).send({ err });
    });
};

export const getUser = (req, res, next) => {
  User.findById(req.user._id).then((user) => {
    res.json({ user: cleanUser(user) });
  }).catch((error) => {
    res.status(500).send({ error });
  });
};

export const updateUser = (req, res, next) => {
  if (`${req.params.id}` !== `${req.user._id}`) {
    res.status(401).send('You are not authorized to update this user.');
  }
  const promises = [];
  promises.push(User.find({ username: req.body.username }));
  promises.push(User.find({ email: req.body.email }));
  promises.push(User.findById(req.params.id));
  Promise.all(promises).then((values) => {
    const sameUsername = values[0];
    const sameEmail = values[1];
    const user = values[2];
    if (sameUsername.length === 1 && `${sameUsername[0]._id}` !== `${user._id}`) {
      res.status(422).send('There is another user with that username');
    } else if (sameEmail.length === 1 && `${sameEmail[0]._id}` !== `${user._id}`) {
      res.status(422).send('There is another user with that email');
    } else {
      user.update(req.body).then((result) => {
        res.send('User updated!');
      }).catch((error) => {
        res.status(500).send({ error });
      });
    }
  });
};
