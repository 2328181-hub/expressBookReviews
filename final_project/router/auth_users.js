const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
//write code to check is the username is valid
}

const authenticatedUser = (username,password)=>{ //returns boolean
//write code to check if username and password match the one we have in records.
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  // Find user matching credentials
  const validUser = users.find(user => user.username === username && user.password === password);

  if (validUser) {
    // Generate JWT access token
    let accessToken = jwt.sign({ data: username }, 'fingerprint_customer', { expiresIn: 60 * 60 });
    
    // Store token in session authorization
    req.session.authorization = { accessToken, username };
    
    return res.status(200).json({ message: "User successfully logged in" });
  } else {
    return res.status(401).json({ message: "Invalid Login. Check username and password" });
  }
  return res.status(300).json({message: "Yet to be implemented"});
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const reviewContent = req.query.review;
  const username = req.session.authorization?.username; // Set by auth middleware

  if (!reviewContent) {
    return res.status(400).json({ message: "Review content missing in query parameter" });
  }

  if (books[isbn]) {
    // If the reviews object doesn't exist for the book, initialize it
    if (!books[isbn].reviews) {
      books[isbn].reviews = {};
    }
    
    // Add or overwrite the review under the specific user's username keys
    books[isbn].reviews[username] = reviewContent;
    
    return res.status(200).json({ message: `The review for book with ISBN ${isbn} has been added/updated.` });
  } else {
    return res.status(404).json({ message: "Book not found" });
  }
  return res.status(300).json({message: "Yet to be implemented"});
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.session.authorization?.username;

  if (books[isbn]) {
    let bookReviews = books[isbn].reviews;
    
    // Check if a review exists from this user
    if (bookReviews && bookReviews[username]) {
      delete bookReviews[username]; // Remove only this user's review entry
      return res.status(200).json({ message: `Review for ISBN ${isbn} posted by user ${username} deleted.` });
    } else {
      return res.status(404).json({ message: "No review found from this user for the given ISBN" });
    }
  } else {
    return res.status(404).json({ message: "Book not found" });
  }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
