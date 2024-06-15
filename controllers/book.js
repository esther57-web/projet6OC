
//const book = require('../models/book');
const Book = require('../models/book');
const fs = require('fs');

//Initialise averageRating à 0 et le ratings avec un tableau vide
// 1 rating max par userId
//r
exports.createBook = (req, res, next) => {
  const bookObject = JSON.parse(req.body.book);
  delete bookObject._id;
  delete bookObject._userId;
  
  function averageCalcul(ratings) {
    const totalGrade = ratings.reduce((total, rate) => total + rate.grade, 0);
    const average = totalGrade / ratings.length;
    return average;
  }

  const averageRating = averageCalcul(bookObject.ratings);

  const book = new Book({
      ...bookObject,
      userId: req.auth.userId,
      imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
      ratings: [],
      averageRating: 0
  });
  book.ratings.push(bookObject.ratings)
  book.averageRating = averageRating;
  book.save()
  .then(() => res.status(201).json({ message: 'Objet enregistré !'})) 
  .catch(error => { res.status(400).json( { error })})
};

//réponse attendue : tableau de livres
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
// La note moyen de "averageRating" doit être tenue à
// jour, et le livre renvoyé en réponse de la requête.

exports.userRating = (req, res, next ) => {
  const oneRating = req.body
  delete oneRating._id
  delete oneRating._userId
  oneRating.userId = req.auth.userId
  if(oneRating.rating > 5 || oneRating.rating < 0) {
    return res.status(400).json({ message: 'La note doit être comprise entre 0 et 5.' });
  }
  Book.findOne({ _id: req.params.id })
    .then(book => {
      if (book.ratings.userId.find(user => user === req.auth.userId)) {
        return res.status(400).json({ message: 'Une seule note par utilisateur est autorisée.' });
      } else {
        book.ratings.push({
          userId: oneRating.userId,
          grade: oneRating.rating
        });
        book.save()
        console.log(book)
          .then(() => {
            res.status(200).json({ message: 'Note ajoutée !', book });
          })
          .catch(error => res.status(401).json({ error }));
      }
    })
    console.log(book.ratings)
  .catch( error => {
    res.status(500).json({ error });
});
};

exports.bestThreeBooks = (req, res, next ) => {
  Book.find().then(
    (books) => {
      const sortedBooks = books.sort((a, b) => b.averageRating - a.averageRating); // Trie les livres par rating décroissant
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
  /*Book.find()
    .then(books => {
      const ratings = books.map(book => book.averageRating); 
      const decreaseRatings = ratings.sort((a, b) => b - a);
      const bestBooks = decreaseRatings.slice(0, 3);
      res.status(200).json({ message: 'Voici les trois meilleurs livres !', books }); 
    })
  .catch( error => {
    res.status(500).json({ error });
});*/
};

