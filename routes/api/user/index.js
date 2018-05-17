const router = require('express').Router();
const controller = require('./user.controller');

router.get('/me', controller.getMyInfo);
router.get('/admin', controller.checkIfAdmin);

module.exports = router;
