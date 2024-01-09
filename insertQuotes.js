const mongoose = require("mongoose");

// Replace with your MongoDB connection string
const mongoURI =
  "";

mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });

// Define the Quote schema and model
const QuoteSchema = new mongoose.Schema({
  text: String,
  author: String,
});
const Quote = mongoose.model("Quote", QuoteSchema);

// Array of quotes
const quotes = [
  {
    text: "Programs must be written for people to read, and only incidentally for machines to execute.",
    author: "Harold Abelson",
  },
  {
    text: "Any fool can write code that a computer can understand. Good programmers write code that humans can understand.",
    author: "Martin Fowler",
  },
  {
    text: "First, solve the problem. Then, write the code.",
    author: "John Johnson",
  },
  {
    text: "Experience is the name everyone gives to their mistakes.",
    author: "Oscar Wilde",
  },
  {
    text: "In theory, there is no difference between theory and practice. But, in practice, there is.",
    author: "Jan L. A. van de Snepscheut",
  },
  {
    text: "The only way to learn a new programming language is by writing programs in it.",
    author: "Dennis Ritchie",
  },
  {
    text: "Sometimes it's better to leave something alone, to pause, and that's very true of programming.",
    author: "Joyce Wheeler",
  },
  {
    text: "Before software can be reusable it first has to be usable.",
    author: "Ralph Johnson",
  },
  {
    text: "The best method for accelerating a computer is the one that boosts it by 9.8 m/s².",
    author: "Anonymous",
  },
  {
    text: "It's not a bug – it's an undocumented feature.",
    author: "Anonymous",
  },
];

// Insert the quotes into the database
Quote.insertMany(quotes)
  .then(() => {
    console.log("Quotes inserted successfully!");
    mongoose.connection.close();
  })
  .catch((error) => {
    console.error("Error inserting quotes:", error);
    mongoose.connection.close();
  });
