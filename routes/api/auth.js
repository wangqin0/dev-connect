const express = require('express');
const router = express.Router();
const {check, validationResult} = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("config");

const auth = require('../../middleware/auth');
const User = require('../../models/User');


// @route   GET api/auth
// @desc    Auth route
// @access  Public
// Note: just add `auth` to argument list will make the routes protected
router.get('/', auth, async (req, res) => {
  try {
    // do not send the password back
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
    console.log("User authed");
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/auth
// @desc    Authenticate user & get token
// @access  Public
router.post('/', [
  check('email', 'Please include a valid email').isEmail(),
  check('password', 'Password is required').exists(),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({errors: errors.array()});
  }

  const {email, password} = req.body;

  try {
    // see if exists
    let user = await User.findOne({email});

    if (!user) {
      console.error('User not exists');
      return res.status(400).json({errors: [{msg: 'User not exists'}]});
    }

    // got user, make sure password matches
    // first password from req, second from the database
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ errors: [{ msg: 'Wrong credential' }]});
    }

    // return jsonwebtoken
    const payload = {
      user: {
        id: user.id,
      }
    };

    console.log('payload: ', payload);

    jwt.sign(
      payload,
      config.get('jwtSecret'),
      {expiresIn: config.get('jwtExpirationTime')},
      (err, token) => {
        if (err) {
          throw err;
        }
        res.json({token});
      }
    );

    console.log('User logged in');
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error.');
  }

});

module.exports = router;
