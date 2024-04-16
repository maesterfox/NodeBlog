const express = require("express");
const router = express.Router();
const Post = require("../models/Post");
const Quote = require("../models/Quote"); // You need to create this model

// Quote Generator
router.get("/random-quote", async (req, res) => {
  try {
    const quote = await Quote.aggregate([{ $sample: { size: 1 } }]);
    res.json(quote[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("", async (req, res) => {
  try {
    const locals = {
      title:
        "David Fox's Tech Blog | Insights into Full Stack Development with MERN",
      description:
        "Join me, David Fox, on my tech blog as I explore the world of Full Stack Development, sharing insights and experiences with the MERN stack (MongoDB, Express, React, Node.js). Dive into a variety of topics from coding challenges to the latest trends in web development.",
    };

    let perPage = 10;
    let page = req.query.page || 1;

    const data = await Post.aggregate([{ $sort: { createdAt: -1 } }])
      .skip(perPage * page - perPage)
      .limit(perPage)
      .exec();

    const count = await Post.countDocuments({});
    const nextPage = parseInt(page) + 1;
    const hasNextPage = nextPage <= Math.ceil(count / perPage);

    res.render("index", {
      query: req.query, // Add this line
      locals,
      data,
      current: page,
      nextPage: hasNextPage ? nextPage : null,
      currentRoute: "/",
    });
  } catch (error) {
    console.log(error);
  }
});

// router.get('', async (req, res) => {
//   const locals = {
//     title: "NodeJs Blog",
//     description: "Simple Blog created with NodeJs, Express & MongoDb."
//   }

//   try {
//     const data = await Post.find();
//     res.render('index', { locals, data });
//   } catch (error) {
//     console.log(error);
//   }

// });

/**
 * GET /
 * Post :id
 */
router.get("/post/:id", async (req, res) => {
  try {
    let slug = req.params.id;

    const data = await Post.findById({ _id: slug });

    const locals = {
      title: data.title,
      description: "Blog created with NodeJs, Express & MongoDb.",
    };

    res.render("post", {
      locals,
      data,
      currentRoute: `/post/${slug}`,
    });
  } catch (error) {
    console.log(error);
  }
});

/**
 * POST /
 * Post - searchTerm
 */
router.post("/search", async (req, res) => {
  try {
    const locals = {
      title: "Search",
      description: "Blog created with NodeJs, Express & MongoDb.",
    };

    let searchTerm = req.body.searchTerm;
    const searchNoSpecialChar = searchTerm.replace(/[^a-zA-Z0-9 ]/g, "");

    const data = await Post.find({
      $or: [
        { title: { $regex: new RegExp(searchNoSpecialChar, "i") } },
        { body: { $regex: new RegExp(searchNoSpecialChar, "i") } },
      ],
    });

    res.render("search", {
      data,
      locals,
      currentRoute: "/",
    });
  } catch (error) {
    console.log(error);
  }
});

/**
 * GET /
 * About
 */
router.get("/about", (req, res) => {
  res.render("about", {
    currentRoute: "/about",
  });
});

/**
 * GET /
 * Contact
 */
router.get("/contact", (req, res) => {
  res.render("contact", {
    currentRoute: "/contact",
    query: req.query, // Pass the query parameters to the EJS template
  });
});

/**
 * GET /
 * About
 */
router.get("/layouts/admin.ejs", (req, res) => {
  res.render("/admin", {
    currentRoute: "/admin",
  });
});

// API endpoint to get a random quote
router.get("/random-quote", async (req, res) => {
  try {
    const quote = await Quote.aggregate([{ $sample: { size: 1 } }]);
    res.json(quote[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching quote");
  }
});

module.exports = router;
