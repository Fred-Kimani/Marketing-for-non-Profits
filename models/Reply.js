//defines the layout of the db schema
const mongoose = require('mongoose');


const ReplySchema =  mongoose.Schema({

  sender:{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization'
  },
  receiver:{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  replyTo:{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Comment'

  },

  replyBody: { 
      type: String,
      required: false,
    },
    date: {
      type: Date,
      default: Date.now
    },
    receiver:{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
  })


  ReplySchema.statics.getReplys= async function () {
    try {
      const relpys = await this.find();
      return relpys ;
    } catch (error) {
      throw error;
    }
  }

  const Reply = mongoose.model('Reply', ReplySchema);
  module.exports = Reply;

