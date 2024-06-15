const express = require('express');
const router = express.Router();
const bookCtrl = require('../controllers/book');
const auth = require('../middleware/auth');
const multer = require('../middleware/multer-config');

router.get('/bestrating', bookCtrl.bestThreeBooks);
router.post('/', auth, multer, bookCtrl.createBook);
router.get('/' + '', bookCtrl.getAllBooks);
router.get('/:id', bookCtrl.getOneBook);
router.put('/:id', auth, multer, bookCtrl.updateBook);
router.delete('/:id', auth, bookCtrl.deleteOneBook);
router.post('/:id/rating', auth, bookCtrl.userRating)

module.exports = router;