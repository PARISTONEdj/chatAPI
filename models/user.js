
const mongoose = require('mongoose');

const uniqueValidator = require('mongoose-unique-validator');

const userSchema = mongoose.Schema({
  email: { type: String, required: false, unique:true },
  password: { type: String, required: true },
  imageUrl: { type: String, required: false },
  username: { type: String, required: true },
  bio: { type: String, required: false },
  isAdmin : {type : Boolean, required: true },
  telephone : {type : Number, required : false},
  datecreation : {type : String, require : false},
  active : {type: Boolean, default:false}
});

userSchema.plugin(uniqueValidator);


module.exports = mongoose.model('User', userSchema);