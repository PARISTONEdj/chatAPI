
var express = require("express");

var publicationController = require("../controllers/publicationController");

const auth = require("../midlewars/auth");

const multer = require("../midlewars/multer_config");

const commentaireController = require("../controllers/commentaireController");


exports.router = (function(){
    var userRouter = express.Router(); // Utilisez une fonction ici

    userRouter.route("/creer").post(auth, publicationController.creer);

    userRouter.route("/creerPub",  multer).post(auth, publicationController.creerPub);

    userRouter.route("/find/:id").get(auth, publicationController.one);

    userRouter.route("/liste/").get(auth, publicationController.all);

    userRouter.route("/mespub/").get(auth, publicationController.Mespub);

    userRouter.route("/userpub/:id").get(auth, publicationController.userpub);

    userRouter.route("/delete/:id").delete(auth, publicationController.supprimer);

    userRouter.route("/update/:id").put(auth, publicationController.modifier);

    userRouter.route("/comment/").post(auth, commentaireController.savecomment);

    userRouter.route("/commentliste/:publicationId").get(auth, commentaireController.listecomment);

    return userRouter;
})();