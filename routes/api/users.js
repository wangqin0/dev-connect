const express = require('express');
const router = express.Router();
const {check, validationResult} = require('express-validator');
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');

const User = require('./../../models/User');

// @route   POST api/users
// @desc    Register user
// @access  Public
router.post('/', [
  check('name', 'Name is required').not().isEmpty(),
  check('email', 'Please include a valid email').isEmail(),
  check('password', 'Please enter a password with 6 or more characters').isLength({min: 6}),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({errors: errors.array()});
  }

  const {name, email, password} = req.body;

  try {
    // see if exists
    let user = await User.findOne({email});

    if (user) {
      console.error('User already exists');
      return res.status(400).json({errors: [{msg: 'User already exists'}]});
    }

    // get users gravatar based on email
    const avatar = gravatar.url(email, {
      s: '200',
      r: 'pg',
      d: 'mp',        // Mystery Person or Mystery Man
    });

    // Encrypt password
    const salt = await bcrypt.genSalt(10);

    const encryptedPassword = await bcrypt.hash(password, salt);

    user = new User({
      name,
      email,
      avatar,
      password: encryptedPassword,
    });

    console.log('user: ', user);

    await user.save();

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
      {expiresIn: 3600},
      (err, token) => {
        if (err) {
          throw err;
        }
        res.json({token});
      }
    );

    console.log('User created');
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error.');
  }

});

module.exports = router;
