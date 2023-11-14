
var express = require("express");

var userController = require("../controllers/userController");

var auth = require("../midlewars/auth");

exports.router = (function(){
    var userRouter = express.Router(); // Utilisez une fonction ici

    userRouter.route("/register").post(userController.register);

    userRouter.route("/test/").get(userController.test);

    userRouter.route("/login/").post(userController.login);

    userRouter.route("/liste/").get(auth, userController.liste);

    userRouter.route("/delete/:id").delete(userController.deleteuser);

    userRouter.route("/update/").put(auth, userController.updateuser);

    userRouter.route("/updatepassword/").put(auth, userController.updatePassword);

    userRouter.route("/one/").get(auth, userController.oneuser);

    userRouter.route("/deconnexion/").post(auth, userController.logout);


    return userRouter;
})();