const express = require('express');
const router = express.Router();
const {check, validationResult} = require('express-validator')

const auth = require('../../middleware/auth')
const Profile = require('../../models/Profile')


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


// @route   POST api/profile/me
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


module.exports = router;
