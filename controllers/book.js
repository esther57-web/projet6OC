
//const book = require('../models/book');
const Book = require('../models/book');
const fs = require('fs');

//Initialise averageRating à 0 et le ratings avec un tableau vide
// optimisation
exports.createBook = (req, res, next) => {
  const bookObject = JSON.parse(req.body.book);
  delete bookObject._id;
  delete bookObject._userId;
  myRate = bookObject.ratings
  //bookObject.ratings = []
  //bookObject.averageRating = 0
  
  
  function averageCalcul(ratings) {
    const totalGrade = ratings.reduce((total, rate) => total + rate.grade, 0);
    const average = totalGrade / ratings.length;
    return average;
  }

  const averageRatingValue = averageCalcul(bookObject.ratings);

  const book = new Book({
      ...bookObject,
      userId: req.auth.userId,
      imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
      averageRating: averageRatingValue
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
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
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
              fs.unlink(`images/${filename}`, () => {
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

// L'ID de l'utilisateur et la note doivent être ajoutés au 
//tableau "rating" afin de ne pas laisser un utilisateur
// noter deux fois le même livre.
// Il n’est pas possible de modifier une note.
// La note moyen de "averageRating" doit être tenue à jour, et le livre renvoyé en réponse de la requête.


exports.userRating = (req, res, next ) => {
  const oneRating = req.body
  delete oneRating._userId
  //delete oneRating._id
  oneRating.userId = req.auth.userId
 
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
          .then(() => {
            res.status(200).json(book);
          })
          .catch(error => res.status(401).json({ error }));
      }
    })
  .catch( error => {
    res.status(500).json({ error });
});
};

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

