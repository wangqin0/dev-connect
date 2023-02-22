const express = require('express');
const router = express.Router();
const {check, validationResult} = require('express-validator')

const auth = require('../../middleware/auth')
const Profile = require('../../models/Profile')
const User = require('../../models/User')


// @route   GET api/profile/me
// @desc    Get current users profile
// @access  Private
router.get('/me', auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({userId: req.user.id}).populate('userId', ['name', 'avatar']);
    if (!profile) {
      return res.status(400).json({msg: 'No profile for this user'});
    }
    res.json(profile);
    console.log('[GET api/profile/me] current user profile returned')
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error.');
  }
});


// @route   POST api/profile
// @desc    Create or update current users profile
// @access  Private
router.post('/', [auth, [
  check('status', 'status is required').not().isEmpty(),
  check('skills', 'skills is required').not().isEmpty(),
]], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({errors: errors.array()});
  }

  const {
    company,
    website,
    location,
    bio,
    status,
    githubUsername,
    skills,
    youtube,
    facebook,
    twitter,
    instagram,
    linkedin,
  } = req.body;

  // build Profile object
  const profileFields = {};
  profileFields.userId = req.user.id;
  if (company) profileFields.company = company;
  if (website) profileFields.website = website;
  if (location) profileFields.location = location;
  if (bio) profileFields.bio = bio;
  if (status) profileFields.status = status;
  if (githubUsername) profileFields.githubUsername = githubUsername;

  if (skills) {
    profileFields.skills = skills.split(',').map(skill => skill.trim());
    console.log(profileFields.skills);
  }

  // build social object
  profileFields.social = {};
  if (youtube) profileFields.social.youtube = youtube;
  if (facebook) profileFields.social.facebook = facebook;
  if (twitter) profileFields.social.twitter = twitter;
  if (instagram) profileFields.social.instagram = instagram;
  if (linkedin) profileFields.social.linkedin = linkedin;

  // save to MongoDB
  try {
    let profile = await Profile.findOne({userId: req.user.id});

    if (profile) {
      profile = await Profile.findOneAndUpdate(
        {userId: req.user.id},
        {$set: profileFields},
        {new: true}
      );

      return res.json(profile);
    }
    // profile not found
    profile = new Profile(profileFields);

    await profile.save();
    return res.json(profile);
  } catch (err) {
    console.error(err.message);
    return res.status(500).send('Server Error');
  }
});


// @route   GET api/profile
// @desc    Get all profiles
// @access  Public
router.get('/', async (req, res) => {
  try {
    const profiles = await Profile.find().populate('userId', ['name', 'avatar']);
    res.json(profiles);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/profile/user/:user_id
// @desc    Get profile by userId
// @access  Public
router.get('/user/:user_id', async (req, res) => {
  try {
    const profile = await Profile.findOne({userId: req.params.user_id}).populate('userId', ['name', 'avatar']);
    if (!profile) {
      return res.status(400).json({msg: 'No profile for this user'});
    }
    res.json(profile);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(400).json({msg: 'No profile for this user'});
    }
    res.status(500).send('Server error');
  }
});


// @route   DELETE api/profile
// @desc    Delete profile, user & posts
// @access  Private
router.delete('/', auth, async (req, res) => {
  try {
    // TODO: Remove user posts

    // remove profile
    await Profile.findOneAndRemove({userId: req.user.id});

    //
    await User.findOneAndRemove({_id: req.user.id});

    res.json({msg: 'User deleted'});
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error')
  }
});


// @route   DELETE api/profile/experience
// @desc    Add profile experience
// @access  Private
router.put('/experience', [auth, [
  check('title', 'title is required').not().isEmpty(),
  check('company', 'company is required').not().isEmpty(),
  check('from', 'from is required').not().isEmpty(),
]], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({errors: errors.array()});
  }

  const {
    title,
    company,
    location,
    from,
    to,
    current,
    description
  } = req.body;

  const newExp = {
    title,
    company,
    location,
    from,
    to,
    current,
    description,
  };

  console.log(newExp);

  try {
    const profile = await Profile.findOne({userId: req.user.id});

    console.log(req.user.id);
    console.log(profile);

    profile.experience.unshift(newExp);
    await profile.save();

    res.json(profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});


// @route   DELETE api/profile/experience
// @desc    Delete profile experience by id
// @access  Private
router.delete('/experience/:exp_id', [auth], async (req, res) => {
  try {
    const profile = await Profile.findOne({userId: req.user.id});

    // get remove index
    const removeIndex = profile.experience
      .map(item => item.id)
      .indexOf(req.params.exp_id);
    if (removeIndex < 0 || removeIndex >= profile.experience.length) {
      return res.status(400).json({msg: 'exp_id not present'});
    }
    profile.experience.splice(removeIndex, 1);

    await profile.save();

    res.json(profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});


// @route   PUT api/profile/education
// @desc    Add education to profile
// @access  Private
router.put('/education', [auth, [
    check('school', "school is required").not().isEmpty(),
    check('degree', "degree is required").not().isEmpty(),
    check('fieldOfStudy', "fieldOfStudy is required").not().isEmpty(),
    check('from', "from date is required").not().isEmpty(),
  ]], async (req, res) => {
    const errors = validationResult(req);

    // Check Validation
    if (!errors.isEmpty()) {
      return res.status(400).json(errors);
    }

    const {
      school,
      degree,
      fieldOfStudy,
      from,
      to,
      current,
      description,
    } = req.body;

    const newEdu = {
      school,
      degree,
      fieldOfStudy,
      from,
      to,
      current,
      description,
    };

    try {
      const profile = await Profile.findOne({userId: req.user.id});
      profile.education.unshift(newEdu);

      await profile.save();
      res.json(profile);
    } catch (err) {
      console.error(err.messages);
      res.status(500).send('Server error');
    }
  }
);


// @route   DELETE api/profile/education/:edu_id
// @desc    Delete profile education by id
// @access  Private
router.delete('/education/:edu_id', [auth], async (req, res) => {
  try {
    const profile = await Profile.findOne({userId: req.user.id});

    // get remove index
    const removeIndex = profile.education
      .map(item => item.id)
      .indexOf(req.params.edu_id);
    if (removeIndex < 0 || removeIndex >= profile.education.length) {
      return res.status(400).json({msg: 'exp_id not present'});
    }
    profile.education.splice(removeIndex, 1);

    await profile.save();

    res.json(profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});


module.exports = router;
