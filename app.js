const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const mongoose = require("mongoose");
const passport = require("passport");
const flash = require("connect-flash");
const session = require("express-session");
const app = express();
/**var otherRoutes = require('./routes/other');
var elderRoutes = require('./routes/elderly_care');
var healthRoutes = require('./routes/health_care');
var reliefRoutes = require('./routes/relief');
var disabledRoutes = require('./routes/disabled');*/
var filterRoutes = require('./routes/filter');
var falseRoutes = require('./routes/approvals');

// Passport Config
require("./config/passport")(passport);


// DB Config
const db = require("./config/keys").mongoURI;

// Connecting  to MongoDB
mongoose
  .connect(db, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

// EJS and scripts
app.use(expressLayouts);
app.set("view engine", "ejs");
app.use('/public', express.static('public'));

// Express body parser
app.use(express.urlencoded({ extended: true }));

// Express session
app.use(
  session({
    secret: "secret",
    resave: true,
    saveUninitialized: true,
  })
);

//setting 'uploads' folder as a static folder
app.use(express.static("uploads"));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Connect flash
app.use(flash());

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Global variables
app.use(function (req, res, next) {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  res.locals.error = req.flash("error");
  next();
});

// Routes
//app.use("/users", require("./routes/users.js"));
app.use("/", require("./routes/index.js"));

/**app.use('/elderly_care', elderRoutes);
app.use('/health_care', healthRoutes);
app.use('/relief', reliefRoutes);
app.use('/other', otherRoutes);
app.use('/disabled', disabledRoutes);*/

app.use('/approvals', falseRoutes)
app.use('/organizations', filterRoutes)

const PORT = process.env.PORT || 7500;

app.listen(PORT, console.log(`Server running on  ${PORT}`));
