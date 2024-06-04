const express = require('express');
const mongoose = require('mongoose');

const app = express();

mongoose.connect('mongodb+srv://esther57-web:kapucine9@projet6oc.fq0zlu1.mongodb.net/?retryWrites=true&w=majority&appName=projet6OC',
  {useUnifiedTopology: true })
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !'));

app.use(express.json());

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  next();
});

app.post('/api/books', (req, res, next) => {
  console.log(req.body);
  res.status(201).json({
    message: 'Objet créé !'
  });
});

app.get('/api/books', (req, res, next) => {
  const books = [
    {
      userId : '1',
      title : 'Esther Star',
      author : 'Esther K',
      imageUrl : 'https://www.google.com/imgres?q=livre&imgurl=https%3A%2F%2Fwww.lafinancepourtous.com%2Fwp-content%2Fthumbnails%2Fuploads%2F2018%2F04%2Fmarche_livre_460-tt-width-460-height-260-fill-0-crop-0-bgcolor-eeeeee.png&imgrefurl=https%3A%2F%2Fwww.lafinancepourtous.com%2Fdecryptages%2Fentreprise%2Fsecteurs-dactivites%2Fleconomie-du-livre-et-la-lecture-en-france%2Fle-marche-du-livre-une-industrie-culturelle-avec-de-fortes-specificites%2F&docid=6gUlzLYQ6K-QdM&tbnid=3c39CgBrm6G6DM&vet=12ahUKEwit64uDw8KGAxVkU6QEHWAnFnYQM3oECGcQAA..i&w=460&h=260&hcb=2&ved=2ahUKEwit64uDw8KGAxVkU6QEHWAnFnYQM3oECGcQAA',
      year : 2004,
      genre: 'drame',
      ratings : [
        {
          userId : '1',
          grade : 2
        }
                ],
      averageRating : 2
    },
    {
      userId : '2',
      title : 'Heaven Star',
      author : 'Heaven C',
      imageUrl : 'https://www.google.com/imgres?q=livre&imgurl=https%3A%2F%2Fcdn.futura-sciences.com%2Fsources%2Fimages%2Fdossier%2Frte%2F9115_livre%2520ouvert_Horia%2520Varlan%2520-flickr%2520by%252020.jpg&imgrefurl=https%3A%2F%2Fwww.futura-sciences.com%2Fplanete%2Fdossiers%2Fdeveloppement-durable-fabrication-livre-son-impact-ecologique-1335%2Fpage%2F3%2F&docid=yYinjjAiEP1P2M&tbnid=L2GZEVmhZeWLNM&vet=12ahUKEwit64uDw8KGAxVkU6QEHWAnFnYQM3oECBgQAA..i&w=640&h=427&hcb=2&ved=2ahUKEwit64uDw8KGAxVkU6QEHWAnFnYQM3oECBgQAA',
      year : 2022,
      genre: 'drame',
      ratings : [
        {
          userId : '2',
          grade : 5
        }
                ],
      averageRating : 5
    },
]
  res.status(200).json(books);
});

module.exports = app;