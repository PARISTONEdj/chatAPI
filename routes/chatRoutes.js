
var express = require("express");

var auth = require("../midlewars/auth");

var chatController = require("../controllers/chatController");

var messageController = require("../controllers/messageController");

var appelController = require("../controllers/appelController");

exports.router = (function(){
    var userRouter = express.Router(); 

    userRouter.route("/creerchat").post(auth, chatController.createChat);

    userRouter.route("/findchat/:chatId").get(auth, chatController.findOneChat);

    userRouter.route("/listechat/").get(auth, chatController.findUserChat);

    userRouter.route("/creermessage/").post(auth, messageController.creerMessage);

    userRouter.route("/findmessage/:chatId").get(auth, messageController.listeMessage);

    // userRouter.route("/delete/:id").delete(auth, publicationController.supprimer);

    userRouter.route("/updatemessage/:messageId").put(auth, messageController.updateUnRead);

    // userRouter.route("/comment/").post(auth, commentaireController.savecomment);

    userRouter.route("/readmessage/:chatId").get(auth, messageController.readMessage);

    userRouter.route("/creerappel").post(auth, appelController.creerAppel);

    return userRouter;
})();