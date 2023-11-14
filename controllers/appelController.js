
var Appel = require("../models/appel");

var auth = require("../midlewars/auth");

const io = require("socket.io")();


module.exports = {
    creerAppel : function(req, res, next){
        var chatId = req.body.chatId;
        var id = req.auth.userId;

        var appeler = new Appel({
            senderId : id,
            chatId : chatId,
        });

        appeler
        .save()
        .then(savedAppel => {
            res.status(201).json({ id: savedAppel._id });
            console.log("Avant io.emit : ", savedAppel);
            io.emit("Appel", savedAppel);
            console.log("Après io.emit : ", savedAppel);
        })
        .catch(function (err) {
            return res.status(500).json({ "error": "Appele echouer" });
        })

    },


    decrocherAppel : function(req, res, next){
        const appelId = req.body.appelId;
        Appel.findOne({_id : appelId})
        .then(function(appelfound){
          if(appelfound){
            User.updateOne({_id : appelId}, { iscall: true, _id : appelId})
                .then(()=>res.status(200).json({"message" : "Appel decrochet"}))
                .catch(function(err){
                  return res.status(500).json({"error" : "erreur appel"});
                })
          }
          else{
            return res.status(500).json({"error" : "Appel introuvable"});
          }
        })
        .catch(
          function(err){
            return res.status(500).json({ "error": "Appel introuvable" });
          }
        )
    }

}