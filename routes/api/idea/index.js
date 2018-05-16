const router = require('express').Router();
const controller = require('./idea.controller');

router.post('', controller.createIdea);
router.put('/:idea_id', controller.editIdea);
router.get('', controller.getIdeaList);

router.post('/vote/now', controller.voteIdea);
module.exports = router;
