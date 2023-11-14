
const mongoose = require("mongoose");

var messageSchema = ({
    message : { type: String, required: false},
    photo : { type: String, required: false},
    video : { type: String, required: false},
    senderId : {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    chatId : {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Chat'
    },
    date: { type: Date, default: Date.now },

    isUnread: { type: Boolean, default: true },

})

module.exports = mongoose.model('Message', messageSchema);