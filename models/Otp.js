
const mongoose = require('mongoose');

const OtpSchema = mongoose.Schema({
    number: { type: String, required: false, unique:true },
    otp: { type: String, required: true },
    createdAt : {type : Date, default : Date.now, index : {expires : 300}},
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User' // Référence au modèle User
    }
  },{ timestamps : true});
  
  module.exports = mongoose.model('Otp', OtpSchema);  
  