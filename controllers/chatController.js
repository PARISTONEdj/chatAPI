
var auth = require("../midlewars/auth");

var Chat = require("../models/chat");

module.exports = {
    
    createChat: function(req, res, next) {
        const userId = req.auth.userId;
        const members = [userId, ...req.body.members];

        // Recherchez un chat existant avec les mêmes membres
        Chat.findOne({ members: { $all: members } })
            .then(existingChat => {
                if (existingChat) {
                    // Si un chat avec les mêmes membres existe déjà, renvoyez son ID
                    res.status(200).json({ id: existingChat._id });
                } else {
                    // Créez un nouveau chat si aucun chat existant n'a été trouvé
                    const chat = new Chat({ members: members });
                    chat.save()
                        .then(savedChat => {
                            res.status(201).json({ id: savedChat._id });
                        })
                        .catch(error => {
                            res.status(400).json({ error: error.message });
                        });
                }
            })
            .catch(error => {
                res.status(400).json({ error: error.message });
            });
    },

    findUserChat: function(req, res, next) {
        // const userId = req.params.userId;
        const userId = req.auth.userId;
        Chat
        .find({ members: { $elemMatch: { $eq: userId } } })
        .populate('members', 'username')
            .then(existingChat => {
                if (existingChat) {
                    res.status(200).json(existingChat);
                    console.log(existingChat);
                } else {
                    res.status(404).json({ message: "Aucun chat trouvé pour cet utilisateur." });
                }
            })
            .catch(error => {
                res.status(500).json({ error: error.message });
        });
    },

    findChat: function(req, res, next) {
        const userId = req.auth.userId;
        const members = [userId, ...req.body.members];

        Chat.findOne({ members: { $all: members } })
            .then(existingChat => {
                if (existingChat) {
                    res.status(200).json(existingChat);
                } else {
                    res.status(404).json({ message: "Aucun chat trouvé pour ces membres." });
                }
            })
            .catch(error => {
                res.status(500).json({ error: error.message });
        });
    },

    findOneChat : function(req, res, next){
        var chatId = req.params.chatId;
        Chat.findOne({ _id: chatId })
        .populate('members', 'username')
        .then(existingChat => {
            if (existingChat) {
                res.status(200).json(existingChat);
            } else {
                res.status(404).json({ message: "Aucun chat trouver bro." });
            }
        })
        .catch(error => {
            res.status(500).json({ error: error.message });
    });
    }
}