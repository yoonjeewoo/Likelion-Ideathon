const router = require('express').Router();
const auth = require('./auth');
const idea = require('./idea');
const authMiddleware = require('../../middlewares/auth');

router.use('/auth', auth);

router.use('/idea', authMiddleware);
router.use('/idea', idea);

module.exports = router;
