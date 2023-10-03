const express = require("express");
const router = express.Router();
const { ensureAuthenticated, forwardAuthenticated} = require("../config/auth");
const User = require("../models/User");
const Organization = require("../models/Organization");
const Comment = require("../models/Comment");
const fs = require("fs");
const mongoose = require("mongoose")
const bcrypt = require("bcryptjs");
const passport = require("passport");

router.post('/comment/:id', ensureAuthenticated, async (req, res, next) => {
  try {
    const user = req.user;

    await new Comment({
      sender: user.f_name,
      receiver: 'organization.organization_name',
      commentBody: req.body.commentBody
    })
    .save(async(err, comment)=>{
      if(err) console.log(err);
      console.log(comment)
    })
    res.redirect('/users/organizationprofilepage/:id')
    } catch (error) {
       console.error(error)
    }
  })


// Dashboard

router.get("/dashboard", ensureAuthenticated, async(req, res) =>{
  try{
    Organization.find().exec((err, organizations) => {
        res.render("dashboard", {
          organizations: organizations,
          user: req.user
        });
    });
  } catch(err){
    console.log("Error in retrieving organization list:" + err);
  }
  

});

router.get("/viewprofile/:id",(req, res) => {
  if (!req.isAuthenticated()) {
    res.redirect('/login')
  }
  let id = req.params.id;
 User.findById(id, (err, user) => {
   if (err ) {
     console.log(err)
     return res.redirect("/users/dashboard")
    };
   res.render("profile", { user: user});
   console.log(user)
 })
});


router.get('/organizationprofilepage/:id', ensureAuthenticated, async(req, res) => {
  
  try{
    let id = req.params.id;
   Organization.findById(id).exec((err, organization) =>{
    if(err){
      console.log(err);
    } else{
      res.render('organizationprofilepage', {organization:organization});
    }
  })

  } catch(err){
    console.log(err);
  }
 
});

router.get("/editprofile/:id", (req, res) => {
  
  let id = req.params.id;
  //finding the specific user on the User model
  User.findById(id, (err, user) => {
    if (err) {
      res.redirect("/users/dashboard");
    } else {
      if (user == null) {
        res.redirect("/users/dashboard");
      } else {
        res.render("editdetails", {
          title: "Edit profile details",
          user: user,
        });
      }
    }
  });
});


module.exports = router;