import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import axios from "axios";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";  // Import dotenv package

// Load environment variables from .env file
dotenv.config();

// Set up the Express app
const app = express();
const port = 3000;

// Set up PostgreSQL client using environment variables
const db = new pg.Client({
  user: process.env.DB_USER,           // Use the environment variable
  host: process.env.DB_HOST,           // Use the environment variable
  database: process.env.DB_NAME,       // Use the environment variable
  password: process.env.DB_PASSWORD,   // Use the environment variable
  port: process.env.DB_PORT,           // Use the environment variable
});
db.connect();

// Middleware setup
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Helper function to format date
const formatDate = (date) => {
  const d = new Date(date);
  return d.toISOString().split('T')[0];
};

// Route for the home page
app.get("/", (req, res) => {
  res.render("index"); // Render 'index.ejs' view
});

// Route to display all books with sorting functionality
app.get("/books", async (req, res) => {
  try {
    const sort = req.query.sort || 'title';
    const order = req.query.order || 'ASC';

    // Validate sort and order parameters
    const validSortOptions = ['title', 'rating', 'date_read'];
    const validOrderOptions = ['ASC', 'DESC'];
    
    if (!validSortOptions.includes(sort) || !validOrderOptions.includes(order)) {
      return res.status(400).send("Invalid sort or order parameter");
    }

    console.log(`Sorting by ${sort} ${order}`);

    // Fetch books from the database
    const result = await db.query(
      `SELECT * FROM Books ORDER BY ${sort} ${order}`
    );

    // Log the result to ensure data is fetched
    console.log(result.rows);

    // Render the books.ejs template with the fetched data
    res.render("books", { books: result.rows, sort, order });
  } catch (err) {
    console.error("Error fetching books:", err);
    res.status(500).send("Error fetching books");
  }
});

// Route to display details of a single book
app.get("/book/:id", async (req, res) => {
  try {
    const bookId = parseInt(req.params.id, 10);

    // Query the database for the specific book by ID
    const result = await db.query("SELECT * FROM Books WHERE id = $1", [bookId]);

    if (result.rows.length === 0) {
      return res.status(404).send("Book not found");
    }

    const book = result.rows[0];
    const coverUrl = book.cover_url; // Book cover URL

    // Render the book details page
    res.render("book", {
      title: book.title,
      author: book.author,
      rating: book.rating,
      date_read: formatDate(book.date_read), // Format date
      notes: book.notes,
      coverUrl: coverUrl
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching book details");
  }
});

// Route to render the form to add a new book
app.get("/add-book", (req, res) => {
  res.render("add-book"); // Render 'add-book.ejs'
});

// Function to fetch book details from Open Library API
const fetchBookDetails = async (isbn) => {
  try {
    // Fetch book details from Open Library API
    const response = await axios.get(`https://openlibrary.org/api/books?bibkeys=ISBN:${isbn}&format=json&jscmd=data`);
    const bookData = response.data[`ISBN:${isbn}`];
    return bookData;
  } catch (error) {
    console.error("Error fetching book details", error);
    return null;
  }
};

// Function to search books from Open Library API
const searchBooks = async (query) => {
  try {
    const response = await axios.get(`https://openlibrary.org/search.json?q=${encodeURIComponent(query)}`);
    return response.data;
  } catch (error) {
    console.error("Error searching books", error);
    return null;
  }
};

// Route to handle adding a new book
app.post("/add-book", async (req, res) => {
  try {
    const { title, author, isbn, rating, date_read, notes } = req.body;
    let cover_url = '';

    // Fetch book details if ISBN is provided
    if (isbn) {
      const bookDetails = await fetchBookDetails(isbn);
      if (bookDetails && bookDetails.cover && bookDetails.cover.large) {
        cover_url = bookDetails.cover.large;
      }
    }

    // Insert the book into the database
    await db.query(
      "INSERT INTO Books (title, author, cover_url, rating, date_read, notes) VALUES ($1, $2, $3, $4, $5, $6)",
      [title, author, cover_url, rating, date_read, notes]
    );
    res.redirect("/books"); // Redirect to the books list after adding
  } catch (err) {
    console.error("Error adding book:", err);
    res.status(500).send("Error adding book");
  }
});

// Route to render the form to edit a book
app.get("/edit-book/:id", async (req, res) => {
  try {
    const bookId = parseInt(req.params.id, 10);
    const result = await db.query("SELECT * FROM Books WHERE id = $1", [bookId]);

    if (result.rows.length === 0) {
      return res.status(404).send("Book not found");
    }

    const book = result.rows[0];
    book.date_read = formatDate(book.date_read); // Format date

    res.render("edit-book", { book }); // Render 'edit-book.ejs' with book data
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching book for editing");
  }
});

// Route to handle updating a book
app.post("/edit-book/:id", async (req, res) => {
  try {
    const bookId = parseInt(req.params.id, 10);
    const { title, author, isbn, rating, date_read, notes } = req.body;
    let cover_url = '';

    // Fetch book details if ISBN is provided
    if (isbn) {
      const bookDetails = await fetchBookDetails(isbn);
      if (bookDetails && bookDetails.cover && bookDetails.cover.large) {
        cover_url = bookDetails.cover.large;
      }
    }

    await db.query(
      "UPDATE Books SET title = $1, author = $2, cover_url = $3, rating = $4, date_read = $5, notes = $6 WHERE id = $7",
      [title, author, cover_url, rating, date_read, notes, bookId]
    );

    res.redirect("/books"); // Redirect to the books list after updating
  } catch (err) {
    console.error("Error updating book:", err);
    res.status(500).send("Error updating book");
  }
});

// Route to handle deleting a book
app.post("/delete-book/:id", async (req, res) => {
  try {
    const bookId = parseInt(req.params.id, 10);
    await db.query("DELETE FROM Books WHERE id = $1", [bookId]);
    res.redirect("/books"); // Redirect to the books list after deleting
  } catch (err) {
    console.error("Error deleting book:", err);
    res.status(500).send("Error deleting book");
  }
});

// Route to handle search requests and render search results
app.get("/search-results", async (req, res) => {
  try {
    const query = req.query.q; // Get the query parameter from the URL
    const data = await searchBooks(query);
    const books = data ? data.docs.map(book => ({
      title: book.title,
      author: book.author_name && book.author_name.join(', '),
      cover_url: book.cover_i ? `https://covers.openlibrary.org/b/id/${book.cover_i}-L.jpg` : ''
    })) : [];

    res.render("search-results", { query, books });
  } catch (err) {
    console.error("Error during search:", err);
    res.status(500).send("Error during search");
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
