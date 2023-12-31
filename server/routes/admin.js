const express = require("express");
const router = express.Router();
const Post = require("../models/Post");
const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const adminLayout = "../views/layouts/admin";
const jwtSecret = process.env.JWT_SECRET;

/**
 *
 * Check Login
 */
const authMiddleware = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const decoded = jwt.verify(token, jwtSecret);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(401).json({ message: "Unauthorized" });
  }
};

/**
 * GET /
 * Admin - Login Page
 */
router.get("/admin", async (req, res) => {
  try {
    const token = req.cookies.token;
    if (token) {
      try {
        jwt.verify(token, jwtSecret);
        return res.redirect("/dashboard"); // User is already logged in
      } catch (error) {
        // Invalid token, proceed to login page
      }
    }

    const locals = {
      title: "Admin",
      description: "Simple Blog created with NodeJs, Express & MongoDb.",
    };
    res.render("admin/index", { locals, layout: adminLayout });
  } catch (error) {
    console.log(error);
  }
});

/**
 * POST /
 * Admin - Check Login
 */
router.post("/admin", async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      // Render the login page with an error message
      const locals = {
        title: "Admin",
        error: "Invalid credentials",
        description: "Simple Blog created with NodeJs, Express & MongoDb.",
      };
      return res.render("admin/index", { locals, layout: adminLayout });
    }

    const token = jwt.sign({ userId: user._id }, jwtSecret);
    res.cookie("token", token, { httpOnly: true });
    // Redirect to dashboard with a success message
    return res.redirect("/dashboard?success=true");
  } catch (error) {
    console.log(error);
    res.status(500).send("An error occurred");
  }
});

/**
 * GET /
 * Admin Dashboard
 */
router.get("/dashboard", authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId);

    // Determine the success message to display
    let successMessage = "";
    if (req.query.success === "true" && user) {
      successMessage = `Login successful, hello ${user.username}`;
    } else if (req.query.updateSuccess === "true") {
      successMessage = "Post updated successfully";
    }

    const locals = {
      title: "Dashboard",
      description: "Simple Blog created with NodeJs, Express & MongoDb.",
      successMessage: successMessage, // Use the determined success message here
    };

    const data = await Post.find().populate("author", "username");

    res.render("admin/dashboard", {
      query: req.query,
      locals,
      data,
      layout: adminLayout,
    });
  } catch (error) {
    console.log(error);
  }
});

/**
 * GET /
 * Admin - Create New Post
 */
router.get("/add-post", authMiddleware, async (req, res) => {
  try {
    const locals = {
      title: "Add Post",
      description: "Simple Blog created with NodeJs, Express & MongoDb.",
    };

    const data = await Post.find();
    res.render("admin/add-post", {
      locals,
      layout: adminLayout,
    });
  } catch (error) {
    console.log(error);
  }
});

/**
 * POST /
 * Admin - Submit New Post
 */
router.post("/add-post", authMiddleware, async (req, res) => {
  try {
    const userId = req.userId; // Get the logged-in user's ID set by authMiddleware

    // Find the user by their ID to get the username
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).send("User not found");
    }

    await Post.create({
      title: req.body.title,
      body: req.body.body,
      author: userId, // Set the author field to the logged-in user's ID
      createdAt: new Date(),
    });

    res.redirect("/dashboard?createSuccess=true");
  } catch (error) {
    console.log(error);
    res.redirect(
      "/add-post?createError=" + encodeURIComponent("Error creating post")
    );
  }
});

/**
 * GET /
 * Admin - Create New Post
 */
router.get("/edit-post/:id", authMiddleware, async (req, res) => {
  try {
    const post = await Post.findOne({ _id: req.params.id });

    // Check if the logged-in user is the author of the post
    if (post && post.author.toString() === req.userId) {
      const locals = {
        title: "Edit Post",
        description: "Free NodeJs User Management System",
      };

      if (!(post && post.author.toString() === req.userId)) {
        res.redirect("/dashboard?error=Unauthorized");
      }

      res.render("admin/edit-post", {
        locals,
        data: post,
        layout: adminLayout,
      });
    } else {
      // Redirect or show an error message if not authorized
      res.redirect("/dashboard?error=Unauthorized");
    }
  } catch (error) {
    console.log(error);
  }
});

/**
 * PUT /
 * Admin - Create New Post
 */
router.put("/edit-post/:id", authMiddleware, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (post && post.author.toString() === req.userId) {
      await Post.findByIdAndUpdate(req.params.id, {
        title: req.body.title,
        body: req.body.body,
        updatedAt: new Date(),
      });

      if (!(post && post.author.toString() === req.userId)) {
        res.redirect(`/edit-post/${req.params.id}?error=Unauthorized`);
      }

      res.redirect("/dashboard?updateSuccess=true");
    } else {
      res.redirect(`/edit-post/${req.params.id}?error=Unauthorized`);
    }
  } catch (error) {
    console.log(error);
  }
});

router.post("/admin", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (req.body.username === "admin" && req.body.password === "password") {
      res.send("You are logged in.");
    } else {
      res.send("Wrong username or password");
    }
  } catch (error) {
    console.log(error);
  }
});

/**
 * POST /
 * Admin - Register
 */
router.post("/register", async (req, res) => {
  try {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
      await User.create({ username, password: hashedPassword });
      // Render the admin page with a registration success message
      return res.render("admin/index", {
        registrationSuccessMessage: "User Created Successfully",
        layout: adminLayout,
      });
    } catch (error) {
      let registrationErrorMessage = "Internal server error";

      if (error.code === 11000) {
        registrationErrorMessage = "Username already in use";
      }
      // Render the admin page with a registration error message
      return res.render("admin/index", {
        registrationErrorMessage: registrationErrorMessage,
        layout: adminLayout,
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).send("An error occurred");
  }
});

/**
 * DELETE /
 * Admin - Delete Post
 */
router.delete("/delete-post/:id", authMiddleware, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    // Check if the logged-in user is the author of the post
    if (post && post.author.toString() === req.userId) {
      await Post.deleteOne({ _id: req.params.id });
      res.redirect("/dashboard?deleteSuccess=true");
    } else {
      // Redirect or show an error message if not authorized
      res.redirect("/dashboard?deleteError=Unauthorized");
    }
  } catch (error) {
    console.log(error);
  }
});

/**
 * GET /
 * Admin Logout
 */
router.get("/logout", (req, res) => {
  res.clearCookie("token");
  res.redirect("/?logoutSuccess=true");
});

module.exports = router;
