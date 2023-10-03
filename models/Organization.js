//defines the layout of the db schema
const mongoose = require('mongoose');

const OrganizationSchema = new mongoose.Schema({

  organization_name: {
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
  date: {
    type: Date,
    default: Date.now
  },
  category: {
    type: String,
    required: true
  },
  isApproved: {
    type: Boolean,
    default: false
  },
  image:{
    type:String,
    required:true
  },
  description: {
    type: String,
    required: true,
  }, 
},
//{ typeKey: '$type' }
);


OrganizationSchema.statics.getOrganizations = async function () {
  try {
    const organizations = await this.find();
    return organizations;
  } catch (error) {
    throw error;
  }
}

//defines the layout of the db schema

const Organization = mongoose.model('0rganization', OrganizationSchema);
module.exports = Organization;


