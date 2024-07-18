const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const app = express();

// Set storage and name of picture
const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, 'images');
    },
    filename: (req, file, callback) => {
        const name = file.originalname.split(' ').join('_');
        callback(null, name + Date.now() + '.webp');
    }
});

// Make sure pictures only are sent
const filter = (req, file, callback) => {
    if (file.mimetype.split("/")[0] === 'image') {
        callback(null, true);
    } else {
        callback(new Error("Les fichiers ne peuvent être que des images"));
    }
};

// Upload picture
const upload = multer({ storage: storage, fileFilter: filter }).single('image');

const optimize = (req, res, next) => {
    if (req.file) { // check if request has a downloaded file
        const filePath = req.file.path;
        const output = path.join('images', `opt_${req.file.filename}`); // where picture will be sent, and name
        sharp.cache(false);
        sharp(filePath)         
            .resize({width: 412, height: 520,  fit: 'cover' }) // Resize picture
            .webp({ quality: 85 })
            .toFile(output) // Upload new picture 
            .then(() => {
                fs.unlink(filePath, (err) => { // Delete old picture
                    if (err) {
                        console.log(err);
                        return next(err);
                    }
                    req.file.path = output;
                    console.log("image optimisée")
                    next();
                });
            })
            .catch(err => next(err));
    } else {
        return next();
    }
};

module.exports = {
    upload,
    optimize,
};