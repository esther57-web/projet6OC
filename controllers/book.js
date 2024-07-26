const Book = require('../models/book');
const fs = require('fs');

exports.createBook = (req, res, next) => {
  const bookObject = JSON.parse(req.body.book);
  delete bookObject._id;
  delete bookObject._userId;
  delete bookObject.ratings;
  delete bookObject.averageRating
  
  const book = new Book({
      ...bookObject,
      userId: req.auth.userId,
      imageUrl: `${req.protocol}://${req.get('host')}/images/opt_${req.file.filename}`,
      ratings: [],
      averageRating: 0
  });
  book.save()
  .then(() => res.status(201).json({ message: 'Objet enregistré !'})) 
  .catch(error => { res.status(400).json( { error })})
};

exports.getAllBooks = (req, res, next) => {
    Book.find().then(
      (books) => {
        res.status(200).json(books);
      }
    ).catch(
      (error) => {
        res.status(400).json({
          error: error
        });
      }
    );
}

// Renvoie le livre avec l’_id fourni.
exports.getOneBook = (req, res, next) => {
    Book.findOne({
      _id: req.params.id
    }).then(
      (book) => {
        res.status(200).json(book);
      }
    ).catch(
      (error) => {
        res.status(404).json({
          error: error
        });
      }
    );
  }

  exports.updateBook = (req, res, next) => {
    const bookObject = req.file ? {
        ...JSON.parse(req.body.book),
        imageUrl: `${req.protocol}://${req.get('host')}/images/opt_${req.file.filename}`
    } : { ...req.body };
  
    delete bookObject._userId;
    Book.findOne({_id: req.params.id})
        .then((book) => {
            if (book.userId != req.auth.userId) {
                res.status(401).json({ message : 'Not authorized'});
            } else {
                Book.updateOne({ _id: req.params.id}, { ...bookObject, _id: req.params.id})
                .then(() => res.status(200).json({message : 'Objet modifié!'}))
                .catch(error => res.status(401).json({ error }));
            }
        })
        .catch((error) => {
            res.status(400).json({ error });
        });
 };

 exports.deleteOneBook = (req, res, next) => {
  Book.findOne({ _id: req.params.id})
      .then(book => {
          if (book.userId != req.auth.userId) {
              res.status(401).json({message: 'Not authorized'});
          } else {
              const filename = book.imageUrl.split('/images/')[1];
              fs.unlink(`images/opt_${filename}`, () => {
                  Book.deleteOne({_id: req.params.id})
                      .then(() => { res.status(200).json({message: 'Objet supprimé !'})})
                      .catch(error => res.status(401).json({ error }));
              });
          }
      })
      .catch( error => {
          res.status(500).json({ error });
      });
};

exports.userRating = (req, res, next ) => {
  const oneRating = req.body
  delete oneRating._userId
  oneRating.userId = req.auth.userId
  function averageCalcul(ratings) {
    const totalGrade = ratings.reduce((total, rate) => total + rate.grade, 0);
    const average = totalGrade / ratings.length;
    return average;
  }
  Book.findOne({ _id: req.params.id })
    .then(book => {
      if (book.ratings.userId === req.auth.userId) {
        return res.status(400).json({ message: 'Une seule note par utilisateur est autorisée.' });
      } else {
        book.ratings.push({
          userId: oneRating.userId,
          grade: oneRating.rating
        });
        book.save()
          .then((book) => {
            const averageRatingValue = averageCalcul(book.ratings);
            Book.updateOne({ _id: req.params.id }, { $set: { averageRating: averageRatingValue } })
              .then(() => {
                book.save()
                .then(() => {
                  res.status(200).json(book);
                })
              })
              .catch(error => res.status(401).json({ error }));
          })
          .catch(error => res.status(401).json({ error }));
      }
    })
    .catch(error => {
      res.status(500).json({ error });
    });
  }

exports.bestThreeBooks = (req, res, next ) => {
  Book.find().then(
    (books) => {
      const sortedBooks = books.sort((a, b) => b.averageRating - a.averageRating); 
      const bestBooks = sortedBooks.slice(0, 3); 
      res.status(200).json(bestBooks );
    }
  ).catch(
    (error) => {
      res.status(400).json({
        error: error
      });
    }
  );
};

