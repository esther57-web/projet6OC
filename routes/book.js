const express = require('express');
const router = express.Router();
const Book = require('../models/book');
const bookCtrl = require('../controllers/book');

router.post('/', bookCtrl.createBook);

router.get('/' + '', bookCtrl.getAllBooks);

router.get('/:id', bookCtrl.getOneBook);

router.put('/:id', bookCtrl.updateBook);

router.delete('/:id', bookCtrl.deleteOneBook);

module.exports = router;