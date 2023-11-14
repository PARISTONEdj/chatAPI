const mongoose = require('mongoose');

const commentaireSchema = mongoose.Schema({
    comments : { type: String, required: true},
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User' 
    },
    publicationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Publication'
    },
    date : {type : String, required : false},
    heure : {type : String, required : false}
})

module.exports = mongoose.model('Commentaire', commentaireSchema);