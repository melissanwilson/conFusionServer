const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const authenticate = require('../authenticate');
const cors = require('./cors');

const Favorites = require('../models/favorites');
const Dishes = require('../models/dishes');

const favoriteRouter = express.Router();

favoriteRouter.use(bodyParser.json());

favoriteRouter.route('/')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.corsWithOptions, authenticate.verifyUser, (req,res,next) => {
    Favorites.findOne({'postedBy': req.user._id})
        .populate('postedBy')
        .populate('dishes')
        .then((favorites) => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(favorites);
        }, (err) => next(err))
        .catch((err) => next(err));  
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({'postedBy': req.user._id})
    .then((favorites) => {
        req.body.postedBy = req.user._id;

        //checks to see if any favorites for user exist, if not, creates new favorite document 
        if(favorites != null){     
            for (var i = (favorites.dishes.length - 1); i >= 0; i--) {
                favoriteExists = favorites.dishes[i] == req.body._id;
                if (favoriteExists) break;
            }
        
            //if favorite already exists, throws an error, if not, pushes new favorite to array
            if(favoriteExists){
                err = new Error('Favorite: ' + req.body._id + ' already exists');
                err.status = 403;
            return next(err);  
            } else {
                favorites.dishes.push(req.body._id);
                favorites.save()
                .then((favorites) => {
                    Favorites.find({'postedBy': req.user._id})
                        .populate('postedBy')
                        .populate('dishes')
                        .then((favorites) => {
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.json(favorites);
                        })
                }, (err) => next(err))
                .catch((err) => next(err)); 
            }
        } else {
            Favorites.create({postedBy: req.body.postedBy})
            .then((favorites) => {
                favorites.dishes.push(req.body._id);
                favorites.save()
                .then((favorites) => {
                    Favorites.findOne({'postedBy': req.user._id})
                        .populate('postedBy')
                        .populate('dishes')
                        .then((favorites) => {
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.json(favorites);
                        })
                }, (err) => next(err))
                .catch((err) => next(err));
            }, (err) => next(err))
            .catch((err) => next(err));
        };
    }, (err) => next(err))
    .catch((err) => next(err));
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /favorites');
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.remove({'postedBy': req.user._id})
    .then((resp) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(resp);
    }, (err) => next(err))
    .catch((err) => next(err));    
});

// favoriteRouter.route('/:favoriteId')
// .options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
// .get(cors.corsWithOptions, (req,res,next) => {
//     Favorites.findById(req.params.favoriteId)
//     .then((favorite) => {
//         res.statusCode = 200;
//         res.setHeader('Content-Type', 'application/json');
//         res.json(favorite);
//     }, (err) => next(err))
//     .catch((err) => next(err));
// })
// .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
//     Favorites.create(req.body)
//     .then((dish) => {
//         if (dish != null) {
//             req.body.user = req.user._id;
//             req.body.dish = req.dish._id;
//             favorites.push(req.body);
//             dish.save()
//             .then((favorite) => {
//                 Favorites.findById(favorite._id)
//                     .populate('user')
//                     .populate('dish')
//                     .then((favorite) => {
//                         res.statusCode = 200;
//                         res.setHeader('Content-Type', 'application/json');
//                         res.json(dish);   
//                     })           
//             }, (err) => next(err));
//         }
//         else {
//             err = new Error('Dish ' + req.params.dishId + ' not found');
//             err.status = 404;
//             return next(err);
//         }
//     }, (err) => next(err))
//     .catch((err) => next(err));
// })
// .put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
//     Favorites.findByIdAndUpdate(req.params.favoriteId, {
//         $set: req.body
//     }, { new: true })
//     .then((favorite) => {
//         res.statusCode = 200;
//         res.setHeader('Content-Type', 'application/json');
//         res.json(favorite);
//     }, (err) => next(err))
//     .catch((err) => next(err));
// })
// .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
//     Favorites.findByIdAndRemove(req.params.favoriteId)
//     .then((resp) => {
//         res.statusCode = 200;
//         res.setHeader('Content-Type', 'application/json');
//         res.json(resp);
//     }, (err) => next(err))
//     .catch((err) => next(err));
// });

module.exports = favoriteRouter;