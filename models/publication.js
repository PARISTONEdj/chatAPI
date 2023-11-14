const mongoose = require('mongoose');

const publicationSchema = mongoose.Schema({

    titre: { type: String, required: true},
    description : {type : String, required : false},
    contenu: { type: String, required: true},
    pubimage : {type: String, required : false},
    datepub : {type : String, required : false},
    like : {type : Number, required : false},
    // userId : {type : String, required : false},
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User' // Référence au modèle User
    }

})

module.exports = mongoose.model('Publication', publicationSchema);