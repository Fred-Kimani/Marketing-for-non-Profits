//defines the layout of the db schema
const mongoose = require('mongoose');


const CommentSchema =  mongoose.Schema({

  sender:{
    type: String

  },
  commentBody: { 
      type: String,
      required: false,
    },
    date: {
      type: Date,
      default: Date.now
    },
    receiver:{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization'
    }
  })


  CommentSchema.statics.getComments= async function () {
    try {
      const comments = await this.find();
      return comments ;
    } catch (error) {
      throw error;
    }
  }

  const Comment= mongoose.model('Comment', CommentSchema);
  module.exports = Comment;

