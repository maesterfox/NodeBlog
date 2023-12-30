require("dotenv").config();

const express = require("express");
const expressLayout = require("express-ejs-layouts");
const methodOverride = require("method-override");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const nodemailer = require("nodemailer");

const connectDB = require("./server/config/db");
const { isActiveRoute } = require("./server/helpers/routeHelpers");

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to DB
connectDB();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(methodOverride("_method"));

app.use(
  session({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URI,
    }),
    //cookie: { maxAge: new Date ( Date.now() + (3600000) ) }
  })
);

app.use(express.static("public"));

// Templating Engine
app.use(expressLayout);
app.set("layout", "./layouts/main");
app.set("view engine", "ejs");

app.locals.isActiveRoute = isActiveRoute;

app.use("/", require("./server/routes/main"));
app.use("/", require("./server/routes/admin"));

// Create reusable transporter object using SMTP transport
const transporter = nodemailer.createTransport({
  host: "smtp.ionos.co.uk", // SMTP Host
  port: 465, // SMTP Port
  secure: true, // Use SSL
  auth: {
    user: process.env.EMAIL_USERNAME, // SMTP username from environment variable
    pass: process.env.EMAIL_PASSWORD, // SMTP password from environment variable
  },
});

// Route to handle contact form submission
app.post("/send-contact", (req, res) => {
  // Extract data from req.body
  const { name, email, message } = req.body;

  // Setup email data
  const mailOptions = {
    from: "david.fox@davidfoxdev.co.uk",
    to: "david.fox@davidfoxdev.co.uk",
    subject: `New contact from ${name}`,
    text: `Message: ${message}\nFrom: ${email}`,
    // more options...
  };

  // Send email
  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
      res.redirect("/contact?status=error");
    } else {
      console.log("Email sent: " + info.response);
      res.redirect("/contact?status=success");
    }
  });
});

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});
