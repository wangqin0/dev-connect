const express = require('express');
const router = express.Router();
const {check, validationResult} = require('express-validator');

const auth = require('../../middleware/auth');
const User = require('../../models/User')
const Post = require('../../models/Post')


// @route   GET api/posts
// @desc    Get all posts
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const posts = await Post.find().sort({date: -1});
    res.json(posts);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});


// @route   GET api/posts/:post_id
// @desc    Get a post by post_id
// @access  Private
router.get('/:post_id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.post_id);

    if (!post) {
      return res.status(404).json({msg: 'Post not found'});
    }
    res.json(post);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({msg: 'Post not found'});
    }
    res.status(500).send('Server error');
  }
});


// @route   POST api/posts
// @desc    Create a post
// @access  Private
router.post('/', [auth, [
  check('text', 'text is required').not().isEmpty(),
]], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({errors: errors.array()});
  }

  try {
    const user = await User.findById(req.user.id).select('-password');

    const newPost = new Post({
      text: req.body.text,
      name: user.name,
      avatar: user.avatar,
      userId: req.user.id,
    });

    const post = await newPost.save();
    res.json(post);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});


// @route   DELETE api/posts/:post_id
// @desc    Delete a post by post_id
// @access  Private
router.delete('/:post_id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.post_id);

    if (!post) {
      return res.status(404).json({msg: 'Post not found'});
    }

    // check ownership
    if (post.userId.toString() !== req.user.id) {
      return res.status(401).json({msg: 'User not authorized'});
    }

    await post.remove();

    res.json({msg: 'Post deleted'});
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({msg: 'Post not found'});
    }
    res.status(500).send('Server error');
  }
});


// @route   PUT api/posts/like/:post_id
// @desc    Like a post
// @access  Private
router.put('/like/:post_id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.post_id);

    if (!post) {
      return res.status(404).json({msg: 'Post not found'});
    }

    // check if the post has already been liked
    if (post.likes.filter(like => like.userId.toString() === req.user.id).length > 0) {
      // found
      return res.status(400).json({msg: 'Post already liked'});
    }

    post.likes.push({userId: req.user.id});

    await post.save();
    res.json(post.likes);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});


// @route   PUT api/posts/unlike/:post_id
// @desc    Remove like from a post
// @access  Private
router.put('/unlike/:post_id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.post_id);

    if (!post) {
      return res.status(404).json({msg: 'Post not found'});
    }

    console.log(post);
    // get remove index
    const removeIndex = post.likes
      .map(like => like.userId.toString())
      .indexOf(req.user.id);
    console.log(removeIndex);
    if (removeIndex < 0 || removeIndex >= post.likes.length) {
      return res.status(400).json({msg: 'You have not put a like on this post yet'});
    }
    post.likes.splice(removeIndex, 1);

    await post.save();
    res.json(post.likes);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});


// @route   POST api/posts/comment/:post_id
// @desc    Create a comment on a post
// @access  Private
router.post('/comment/:post_id', [auth, [
  check('text', 'text is required').not().isEmpty(),
]], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({errors: errors.array()});
  }

  try {
    const post = await Post.findById(req.params.post_id);
    const user = await User.findById(req.user.id).select('-password');

    const newComment = {
      text: req.body.text,
      name: user.name,
      avatar: user.avatar,
      userId: req.user.id,
    };

    post.comments.push(newComment);
    await post.save();

    res.json(post.comments);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});


// @route   DELETE api/posts/comment/:post_id/:comment_id
// @desc    Delete a comment from a post by their ids
// @access  Private
router.delete('/comment/:post_id/:comment_id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.post_id);

    if (!post) {
      return res.status(404).json({msg: 'Post not found'});
    }

    console.log(post.userId);
    console.log(req.user.id);
    console.log(post.comments);

    const removeIndex = post.comments
      .map(comment => comment.id.toString())
      .indexOf(req.params.comment_id);
    console.log(removeIndex);
    if (removeIndex < 0 || removeIndex >= post.comments.length) {
      return res.status(400).json({msg: 'the comment on that post is not found'});
    }

    // check ownership
    if (post.userId.toString() !== req.user.id
      && post.comments[removeIndex].userId.toString() !== req.user.id) {
      return res.status(400).json({msg: 'You can only delete your comments or comments in your posts'});
    }

    post.comments.splice(removeIndex, 1);

    await post.save();

    res.json(post.comments);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({msg: 'Post not found'});
    }
    res.status(500).send('Server error');
  }
});


module.exports = router;
