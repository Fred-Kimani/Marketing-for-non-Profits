//contains all direct routes for the app
const express = require("express");
const router = express.Router();
const { ensureAuthenticated, forwardAuthenticated, ensureAuthenticated2, forwardAuthenticated2} = require("../config/auth");
const User = require("../models/User");
const Organization = require("../models/Organization");
const Comment = require("../models/Comment");
const Reply = require("../models/Reply");

var NodeGeocoder = require('node-geocoder');
/**const Pledged = require("../models/Pledged");*/
const multer = require("multer");
const fs = require("fs");
const mongoose = require("mongoose")
const bcrypt = require("bcryptjs");
const passport = require("passport");
const db = require("../config/keys").mongoURI;


var storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./uploads");
  },
  filename: (req, file, cb) => {
    cb(null, file.fieldname + "_" + Date.now() + "_" + file.originalname);
  },
});
var upload = multer({
  storage: storage,
}).single("image");

var storage2 = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./uploads");
  },
  filename: (req, file, cb) => {
    cb(null, file.fieldname + "_" + Date.now() + "_" + file.originalname);
  },
});
var upload2 = multer({
  storage: storage2,
}).single("image");

router.get('/organizationprofilepage/:id', async(req, res) => {
  
  try{

    let id = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).send('Invalid ObjectId format');
    }
    const organization = await Organization.findOne({_id: mongoose.Types.ObjectId(id)}).exec();
    const comments = await Comment.find({receiver: id }).exec();

    res.render('organizationprofilepage', {
      organization: organization,
      comments: comments,
      user: req.user
    })
  } catch(err){
    console.log(err);
  }
});

router.post('/comment', ensureAuthenticated, async(req,res) =>{
  try{

    let user = req.user;
    const organizationId = req.body.organizationId;
    const commentObject = await new Comment({
    sender: user.f_name+" "+user.l_name,
    commentBody: req.body.commentBody,
    receiver: organizationId, 
  })
  await commentObject.save();
  }catch(err){
    console.log(err)
    res.status(500).json({ error: 'An error occurred on our side while saving the comment.' });

  }
});

router.get('/info', (req, res)=>{
  res.render('info')
})

router.post('/reply/:id', ensureAuthenticated2)

// Login Page
router.get("/login", forwardAuthenticated, (req, res) => res.render("login"));
//Users on Admin Page
router.get("/admin_users", (req, res) => {
  User.find().exec((err, users) => {
    if (!err) {
      res.render("admin_users", {
        users: users,
      });
    } else {
      console.log("Error in retrieving user list:" + err);
    }
  });
});

router.get("/admin_organizations", async(req, res) => {
  try{
    const organizations = await Organization.find({isApproved: true}).exec()
    res.render('admin_organizations',
    {organizations: organizations}
    )
 } catch(err){
   console.log("Error in retrieving organization list:" + err);
 }
});

// Register Page
router.get("/register", forwardAuthenticated, (req, res) =>
  res.render("register")
);

// Register
router.post("/register", upload, (req, res) => {
  const { f_name, l_name, email, password, password2, roles, image } = req.body;
  let errors = [];

  if (!f_name || !l_name || !email || !password || !password2) {
    errors.push({ msg: "Please enter all fields" });
  }

  if (password != password2) {
    errors.push({ msg: "Passwords do not match" });
  }

  if (password.length < 6) {
    errors.push({ msg: "Password must be at least 6 characters" });
  }

  if (errors.length > 0) {
    res.render("register", {
      errors,
      f_name,
      l_name,
      email,
      password,
      password2,
      roles,
      image,
    });
  } else {
    User.findOne({ email: email }).then((user) => {
      if (user) {
        errors.push({ msg: "Email already exists" });
        res.render("register", {
          errors,
          f_name,
          l_name,
          email,
          password,
          password2,
          roles,
          image,
        });
      } else {
        const newUser = new User({
          f_name: req.body.f_name,
          l_name: req.body.l_name,
          email: req.body.email,
          password: req.body.password,
          roles: req.body.roles,
          image: req.file.filename,
        });

        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(newUser.password, salt, (err, hash) => {
            if (err) throw err;
            newUser.password = hash;
            newUser
              .save()
              .then((user) => {
                req.flash(
                  "success_msg",
                  "You are now registered and can log in"
                );
                res.redirect("/login");
              })
              .catch((err) => console.log(err));
          });
        });
      }
    });
  }
});

//Redirect to edit page route
router.get("/edit/:id", (req, res) => {
  let id = req.params.id;
  User.findById(id, (err, user) => {
    if (err) {
      res.redirect("/admin_users");
    } else {
      if (user == null) {
        res.redirect("/admin_users");
      } else {
        res.render("edit_users", {
          title: "Edit User",
          user: user,
        });
      }
    }
  });
});

router.get("/edit_organization/:id", (req, res) => {
  let id = req.params.id;
  Organization.findById(id, (err, organization) => {
    if (err) {
      res.redirect("/admin_organizations");
    } else {
      if (organization == null) {
        res.redirect("/admin_organizations");
      } else {
        res.render("edit_organizations", {
          title: "Edit Organization",
          organization: organization,
        });
      }
    }
  });
});

/**router.post('/disapprove/:id', async(req, res) =>{
  try{
    let id = req.params.id;
    const disapprove = await Organization.updateOne(
      {_id: id},
      )

  } catch(err){
  }
})*/

router.post("/update/:id", upload, (req, res) => {
  let id = req.params.id;
  //defining new_image as a null variable
  let new_image = "";

  //if a new file is selected on the filepicker..
  if (req.file) {
    //the variable is assigned to the selected image
    new_image = req.file.filename;
    try {
      //removing the previous image
      fs.unlinkSync("./uploads/" + req.body.old_image);
    } catch (err) {
      console.log(err);
    }
  } else {
    //same old image variable assigned to new image variable if image is not updated
    new_image = req.body.old_image;
  }
  User.findByIdAndUpdate(
    id,
    {
      f_name: req.body.f_name,
      l_name: req.body.l_name,
      email: req.body.email,
      image: new_image,
    },
    (err, result) => {
      if (err) {
        res.json({ message: err.message, type: "danger" });
      } else {
        req.session.message = {
          type: "success",
          message: "User updated successfully!",
        };
        res.redirect("/admin_users");
      }
    }
  );
});

router.post("/update_organization/:id", (req, res) => {
  let id = req.params.id;
  Organization.findByIdAndUpdate(
    id,
    {
      organization_name: req.body.organization_name,
      email: req.body.email,
      category: req.body.category,
    },
    (err, result) => {
      if (err) {
        res.json({ message: err.message, type: "danger" });
      } else {
        req.session.message = {
          type: "success",
          message: "Organization updated successfully!",
        };
        res.redirect("/admin_organizations");
      }
    }
  );
});

router.get("/delete/:id", (req, res) => {
  let id = req.params.id;
  User.findByIdAndRemove(id, (err, result) => {
    if (err) {
      res.json({ message: err.message });
    } else {
      req.session.message = {
        type: "info",
        message: "User deleted successfully",
      };
      res.redirect("/admin_users");
    }
  });
});

router.get("/delete_organization/:id", (req, res) => {
  let id = req.params.id;
  Organization.findByIdAndRemove(id, (err, result) => {
    if (err) {
      res.json({ message: err.message });
    } else {
      req.session.message = {
        type: "info",
        message: "Organization deleted successfully",
      };
      res.redirect("/admin_organizations");
    }
  });
});

/////////////////////////////////////////
// organizationanization Register Page
router.get("/organization_register", forwardAuthenticated, (req, res) =>
  res.render("organization_register")
);

// organizationanization Register
router.post("/organization_register", upload2, (req, res) => {
  const { organization_name, category, description, email, password, password2,image } = req.body;
  let errors = [];
  let comments = [];

  if (!organization_name || !email ||  !description || !password || !password2) {
    errors.push({ msg: "Please enter all fields" });
  }

  if (password != password2) {
    errors.push({ msg: "Passwords do not match" });
  }

  if (password.length < 6) {
    errors.push({ msg: "Password must be at least 6 characters" });
  }

  if (errors.length > 0) {
    res.render("organization_register", {
      errors,
      organization_name,
      email,
      category,
      password,
      password2,
      description,
      image,
    });
  } else {
    Organization.findOne({ email: email }).then((organization) => {
      if (organization) {
        errors.push({ msg: "Email already exists" });
        res.render("organization_register", {
          errors,
          organization_name,
          email,
          category,
          password,
          password2,
          description,
          image,
        });
      } else {
        const newOrganization = new Organization({
          organization_name,
          email,
          category,
          password,
          description,
          image: req.file.filename,
          comments: comments,
        });
        console.log(newOrganization);

        console.log(password);

        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(newOrganization.password, salt, (err, hash) => {
            if (err) throw err;
            newOrganization.password = hash;
            newOrganization
              .save()
              .then((organization) => {
                req.flash(
                  "success_msg",
                  "You are now registered and need to wait for approval to log in"
                );
                res.redirect("/organization_login");
              })
              .catch((err) => console.log(err));
          });
        });
      }
    });
  }
});

// Login
router.post("/login", (req, res, next) => {
  passport.authenticate("user-local", (err, user, info) => {
    if (err) return next(err);
    if (!user) return res.redirect("/login");

    req.logIn(user, (err) => {
      if (err) return next(err);
      if (user.roles === "admin") return res.redirect("/admin");
      return res.redirect("/");
    });
  })(req, res, next);
});

router.get("/organization_login", forwardAuthenticated2, (req, res) =>
  res.render("organization_login")
);

router.post("/organization_login", (req, res, next) => {
  passport.authenticate("organization-local", (err, user, info) => {
    if (err) return next(err);
    if (!user) return res.redirect("/organization_login");

    req.logIn(user, (err) => {
      if (err) return next(err);
      return res.redirect("/organization_dashboard");
    });
  })(req, res, next);
});

// Logout user
router.get("/logout", (req, res) => {
  req.logout();
  req.flash("success_msg", "You are logged out");
  res.redirect("/login");
});

// Logout organization
router.get("/organization_logout", (req, res) => {
  req.logout();
  req.flash("success_msg", "You are logged out");
  res.redirect("/organization_login");
});



// Dashboard

router.get("/",  async(req, res) => {
  try{
    const organizations = await Organization.find({isApproved : true})
    res.render('dashboard', 
    {organizations: organizations,
      user: req.user
    })
  } catch(err){
    console.log(err)
  }
});

router.get("/organization_dashboard", ensureAuthenticated2, (req, res) => {
  Organization.find().exec((err, organizations) => {
    if (!err) {
      res.render("organization_dashboard", {
        organizations: organizations,
        organization: req.user,
      });
    } else {
      console.log("Error in retrieving organization list:" + err);
    }
  });
});

// Admin
router.get("/admin", ensureAuthenticated, (req, res) =>
  res.render("admin", {
    //only renders data from the currently logged in user
    user: req.user,
  })
);

//Function to delete user
router.get("/delete/:id", (req, res) => {
  let id = req.params.id;
  User.findByIdAndRemove(id, (err, result) => {
    if (err) {
      res.json({ message: err.message });
    } else {
      req.session.message = {
        type: "info",
        message: "User deleted successfully",
      };
      res.redirect("/admin_users");
    }
  });
});

router.get("/viewprofile/:id", (req, res) => {
  if (!req.isAuthenticated()) {
    res.redirect("/login");
  }
  let id = req.params.id;
  User.findById(id, (err, user) => {
    if (err) {
      console.log(err);
      return res.redirect("/");
    }
    res.render("profile", { user: user });
    console.log(user);
  });
});



router.get("/organizationprofile/:id", async(req, res) => {

  try{
    let id = req.params.id;
    const organization = await Organization.findOne({_id: id});
    res.render('organizationprofile', 
    {organization: organization})

  } catch(err){
    console.log(err);
  } 
});

router.get("/editprofile/:id", (req, res) => {
  let id = req.params.id;
  //finding the specific user on the User model
  User.findById(id, (err, user) => {
    if (err) {
      res.redirect("/");
    } else {
      if (user == null) {
        res.redirect("/");
      } else {
        res.render("editdetails", {
          title: "Edit profile details",
          user: user,
        });
      }
    }
  });
});

router.get("/editorganizationprofile/:id", (req, res) => {
  let id = req.params.id;
  //finding the specific user on the User model
  Organization.findById(id, (err, organization) => {
    if (err) {
      res.redirect("/organization_dashboard");
    } else {
      if (organization == null) {
        res.redirect("/organization_dashboard");
      } else {
        res.render("editorganizationdetails", {
          title: "Edit profile details",
          organization: organization,
        });
      }
    }
  });
});

router.post("/updateprofile/:id", upload, (req, res) => {
  let id = req.params.id;
  //defining new_image as a null variable
  let new_image = "";
  //if a new file is selected on the filepicker..
  if (req.file) {
    //the variable is assigned to the selected image
    new_image = req.file.filename;
    try {
      //removing the previous image
      fs.unlinkSync("./uploads/" + req.body.old_image);
    } catch (err) {
      console.log(err);
    }
  } else {
    //same old image variable assigned to new image variable if image is not updated
    new_image = req.body.old_image;
  }
  User.updateOne({"_id" : id},
    {
      f_name: req.body.f_name,
      l_name: req.body.l_name,
      email: req.body.email,
      image: new_image,
    },
    (err, result) => {
      if (err) {
        res.json({ message: err.message, type: "danger" });
      } else {
        req.session.message = {
          type: "success",
          message: "Profile updated successfully!",
        };
        console.log("="+id+"=")
        res.redirect("/viewprofile/:id");
      }
    }
  );
});


router.post("/updateorganizationprofile/:id", upload2, (req, res) => {
  let id = req.params.id;
  //defining new_image as a null variable
  let new_image = "";
  //if a new file is selected on the filepicker..
  if (req.file) {
    //the variable is assigned to the selected image
    new_image = req.file.filename;
    try {
      //removing the previous image
      fs.unlinkSync("./uploads/" + req.body.old_image);
    } catch (err) {
      console.log(err);
    }
  } else {
    //same old image variable assigned to new image variable if image is not updated
    new_image = req.body.old_image;
  }
  Organization.findByIdAndUpdate(
    id,
    {
      organization_name: req.body.organization_name,
      email: req.body.email,
      category: req.body.category,
      description: req.body.description,
      image: new_image,
    },
    (err, result) => {
      if (err) {
        res.json({ message: err.message, type: "danger" });
      } else {
        req.session.message = {
          type: "success",
          message: "Profile updated successfully!",
        };
        res.redirect("/organizationprofile/:id");
      }
    }
  );
});



//filter by organization type

Organization.find({ category: "Child Care", isApproved: true }, (err, res) => {
  var childOrganizations = res;
  router.get("/child_care", (req, res) => {
    if (!err) {
      res.render("child_care", {
        childOrganizations: childOrganizations,
      });
    } else {
      console.log("Error in retrieving organization list:" + err);
    }
  });
});




module.exports = router;
