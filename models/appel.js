
const mongoose = require("mongoose");

const appelSchema = mongoose.Schema({
    senderId : {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    chatId : {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Chat'
    },
    debut: { type: Date, default: Date.now },

    fin: { type: Date, required : false },

    iscall: { type: Boolean, default: false },
})

module.exports = mongoose.model('Appel', appelSchema);