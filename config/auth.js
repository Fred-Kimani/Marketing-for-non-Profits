
module.exports = {
  ensureAuthenticated: function (req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    }
    req.flash("error_msg", "Please log in to perform that action");
    res.redirect("/login");
  },
  forwardAuthenticated: function (req, res, next) {
    if (!req.isAuthenticated()) {
      return next();
    }
    res.redirect("/");
  },

  ensureAuthenticated2: function (req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    }
    req.flash("error_msg", "Please log in to perform that action");
    res.redirect("/organization_login");
  },
  forwardAuthenticated2: function (req, res, next) {
    if (!req.isAuthenticated()) {
      return next();
    }
    res.redirect("/organization_dashboard");
  },
 
};
