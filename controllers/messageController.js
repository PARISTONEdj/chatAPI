
var Message = require("../models/message");

var auth = require("../midlewars/auth");

const io = require("socket.io")();

module.exports = {
    creerMessage: function(req, res, next) {
        const userId = req.auth.userId;
        const chatId = req.body.chatId;
    
        // Créez un nouveau message en utilisant le modèle
        const message = new Message({
            senderId: userId,
            chatId: chatId,
        });
    
        // Ajoutez le texte du message s'il est présent dans req.body
        if (req.body.message) {
            message.message = req.body.message;
        }
    
        // Ajoutez la photo du message s'il est présent dans req.body
        if (req.body.photo) {
            message.photo = req.body.photo;
        }
    
        // Ajoutez la vidéo du message s'il est présent dans req.body
        if (req.body.video) {
            message.video = req.body.video;
        }
    
        message.save()
            .then(savedMessage => {
                res.status(201).json({ id: savedMessage._id });
                console.log("Avant io.emit : ", savedMessage);
                io.emit("chatMessage", savedMessage);
                console.log("Après io.emit : ", savedMessage);
            })
            .catch(error => {
                res.status(400).json({ error: error.message });
            });
    },

    listeMessage: function(req, res, next) {
        const chatId = req.params.chatId;

        Message.find({ chatId: chatId })
            .populate('senderId', 'username')
            .then(messages => {
                if (messages && messages.length > 0) {
                    res.status(200).json(messages);
                    console.log(messages);
                } else {
                    res.status(404).json({ message: "Aucun message trouvé pour ce chat." });
                }
            })
            .catch(error => {
                res.status(500).json({ error: error.message });
            });
    },


    readMessage: function (req, res, next) {
        const chatId = req.params.chatId;
        const userId = req.auth.userId;

      
        Message.countDocuments({ chatId: chatId, isUnread: true, senderId: { $ne: userId } })
          .then(unreadMessageCount => {
            res.status(200).json({ unreadMessageCount });
            console.log(unreadMessageCount);
          })
          .catch(error => {
            res.status(500).json({ error: error.message });
          });
      },

   

    updateUnRead: function (req, res, next) {
        const messageId = req.params.messageId;
        const userId = req.auth.userId;

        Message.findOne({ _id: messageId })
          .then(function (message) {
            if (!message) {
              return res.status(404).json({ error: "Message non trouvé." });
            }
      
            if (message.senderId.toString() === userId) {
              // L'utilisateur actuel est l'auteur du message, ne mettez pas à jour
              return res.status(403).json({ error: "Vous ne pouvez pas marquer votre propre message comme lu." });
            }
      
            // Mettre à jour le message pour marquer comme lu
            Message.updateOne({ _id: messageId }, { isUnread: false })
              .then(() => res.status(200).json({ message: "Message marqué comme lu avec succès." }))
              .catch(function (err) {
                return res.status(500).json({ error: "Mise à jour échouée." });
              });
          })
          .catch(function (err) {
            return res.status(500).json({ error: "Message introuvable." });
          });
      }

}