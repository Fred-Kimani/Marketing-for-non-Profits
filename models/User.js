//defines the layout of the db schema
const mongoose = require('mongoose');
/**const PledgedSchema = require("./Pledged");*/

const UserSchema = new mongoose.Schema({
  f_name: {
    type: String,
    required: true
  },
  l_name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  roles:{
    type:String,
    enum:['normal','admin'],
    default:'normal',
    required:true
  },
  date: {
    type: Date,
    default: Date.now
  },
  image:{
    type:String,
    required:true
  },

});

UserSchema.statics.getUsers = async function () {
  try {
    const users = await this.find();
    return users;
  } catch (error) {
    throw error;
  }
}

const User = mongoose.model('User', UserSchema);
module.exports = User;

