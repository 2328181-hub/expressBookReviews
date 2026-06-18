const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require('axios');

public_users.post("/register", (req,res) => {
    const { username, password } = req.body;
    // Check if username and password are provided
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }
    // Check if user already exists
    const userExists = users.some((user) => user.username === username);
  
    if (userExists) {
      return res.status(409).json({ message: "Username already exists" });
    }
    // Add the new user to your array/database
    users.push({ username: username, password: password });
    return res.status(201).json({ message: "User successfully registered. Now you can login" });
  return res.status(300).json({message: "Yet to be implemented"});
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
  if (books) {
    return res.status(200).send(JSON.stringify(books, null, 4));
  } else {
    return res.status(404).json({ message: "No books found" });
  }
  return res.status(300).json({message: "Yet to be implemented"});
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
    const isbn = req.params.isbn;

  axios.get(`http://localhost:5000/isbn/${isbn}`)
    .then((response) => {
      return res.status(200).json(response.data);
    })
    .catch((error) => {
      // Fallback directly to the local data object if network request fails
      const book = books[isbn];
      if (book) {
        return res.status(200).send(JSON.stringify(book, null, 4));
      }
      return res.status(404).json({ message: "Book not found" });
    });
 });
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
    const author = req.params.author;
  try {
    const response = await axios.get(`http://localhost:5000/author/${author}`);
    return res.status(200).json(response.data);
  } catch (error) {
    // Asynchronous local fallback logic
    const keys = Object.keys(books);
    let matchingBooks = {};
    keys.forEach((key) => {
      if (books[key].author.toLowerCase() === author.toLowerCase()) {
        matchingBooks[key] = books[key];
      }
    });
    return res.status(200).send(JSON.stringify(matchingBooks, null, 4));
  }
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
    const title = req.params.title;
    try {
      const response = await axios.get(`http://localhost:5000/title/${title}`);
      return res.status(200).json(response.data);
    } catch (error) {
      // Asynchronous local fallback logic
      const keys = Object.keys(books);
      let matchingBooks = {};
      keys.forEach((key) => {
        if (books[key].title.toLowerCase() === title.toLowerCase()) {
          matchingBooks[key] = books[key];
        }
      });
      return res.status(200).send(JSON.stringify(matchingBooks, null, 4));
    }
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
    const isbn = req.params.isbn;
    const book = books[isbn];
  
    if (book) {
      return res.status(200).send(JSON.stringify(book.reviews, null, 4));
    } else {
      return res.status(404).json({ message: "No reviews found for this ISBN" });
    }
  return res.status(300).json({message: "Yet to be implemented"});
});

public_users.get('/', async function (req, res) {
    try {
      // Making an asynchronous call to simulate fetching the book list
      const response = await axios.get('http://localhost:5000/');
      return res.status(200).json(response.data);
    } catch (error) {
      // Fallback directly to local books data if the external axios call hits a snag
      return res.status(200).send(JSON.stringify(books, null, 4));
    }
  });

module.exports.general = public_users;
