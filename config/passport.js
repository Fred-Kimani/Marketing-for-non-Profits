const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');

// Load User model
const User = require('../models/User');
const Organization= require('../models/Organization');

function SessionConstructor(userId, userGroup, details) {
  this.userId = userId;
  this.userGroup = userGroup;
  this.details = details;
}

module.exports = function(passport) {
  passport.use('user-local',new LocalStrategy({ usernameField: 'email' }, (email, password, done) => {
      // Match user
      User.findOne({
        email: email
      }).then(user => {
        if (!user) {
          return done(null, false, { message: 'That email is not registered' });
        }

        // Match password
        bcrypt.compare(password, user.password, (err, isMatch) => {
          if (err) throw err;
          if (isMatch) {
            return done(null, user);
          } else {
            return done(null, false, { message: 'Password incorrect' });
          }
        });
      });
    })
  );

  passport.use('organization-local',
    new LocalStrategy({ usernameField: 'email' }, (email, password, done) => {
      // Match user
      Organization.findOne({
        email: email
      }).then(organization => {
        if (!organization) {
          return done(null, false, { message: 'That email is not registered' });
        }

        // Match password
        bcrypt.compare(password, organization.password, (err, isMatch) => {
          if (err) throw err;
          if (isMatch) {
            return done(null, organization);
          } else {
            return done(null, false, { message: 'Password incorrect' });
          }
        });
      });
    })
  );

  passport.serializeUser(function(userObject, done) {
    let userGroup = "userModel";
    let userPrototype = Object.getPrototypeOf(userObject);

    if(userPrototype === User.prototype){
      userGroup = "userModel";
    } else if (userPrototype === Organization.prototype){
      userGroup = "organizationModel"
    }

    let sessionConstructor = new SessionConstructor(userObject.id, userGroup, '');
    done(null, sessionConstructor);
  });

  passport.deserializeUser(function (sessionConstructor, done) {

    if (sessionConstructor.userGroup == 'userModel') {
      User.findOne({
          _id: sessionConstructor.userId
      }, '-localStrategy.password', function (err, user) { // When using string syntax, prefixing a path with - will flag that path as excluded.
          done(err, user);
      });
    } else if (sessionConstructor.userGroup == 'organizationModel') {
      Organization.findOne({
          _id: sessionConstructor.userId
      }, '-localStrategy.password', function (err, organization) { // When using string syntax, prefixing a path with - will flag that path as excluded.
          done(err, organization);
      });
    }

  });


}
