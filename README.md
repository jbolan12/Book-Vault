# Book-Vault

# Book Tracker App

A simple web application built with **Node.js**, **Express.js**, and **PostgreSQL** for tracking books in your personal library. This app allows you to search for books, add new ones, edit and delete them, and view details like title, author, rating, and personal notes. It integrates with the **Open Library API** to fetch book details, including cover images.

## Features

- **Search Books**: Search for books using the Open Library API.
- **Add Books**: Add books to your library with details such as title, author, rating, date read, and personal notes.
- **Edit Books**: Edit the details of books already in your library.
- **Delete Books**: Remove books from your collection.
- **Sort Books**: Sort your book collection by title, rating, or date read.
- **View Book Details**: View detailed information about a book including its cover image and personal notes.
  
## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL
- **API Integration**: Open Library API for fetching book details
- **View Engine**: EJS (Embedded JavaScript Templating)
- **CSS**: Custom CSS for styling

## Installation

### Prerequisites

- **Node.js** (with npm)
- **PostgreSQL** database installed and running on your local machine.

### Steps to Set Up

1. **Clone the repository**:

   ```bash
   git clone https://github.com/jbolan12/BookVault-App.git

**Install dependencies:**

Run the following command to install the necessary Node.js packages:

bash
npm install

## Set up PostgreSQL database:

**Create a new PostgreSQL database called book_tracker.**

Run the following SQL query to set up the Books table:
sql

CREATE TABLE Books (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  author VARCHAR(255) NOT NULL,
  cover_url TEXT,
  rating INT,
  date_read DATE,
  notes TEXT
);

**Configure the PostgreSQL connection:**

Open the index.js file and configure the PostgreSQL database credentials:

javascript

const db = new pg.Client({
  user: "your_username",     // Replace with your PostgreSQL username
  host: "localhost",
  database: "book_tracker",  // Database name you created
  password: "your_password", // Replace with your PostgreSQL password
  port: 5432,
});

**Run the application:**

Once everything is set up, start the server with:

bash
npm start
The application will run on http://localhost:3000.

## Usage

**Home Page:**
**Visit the Home Page to get started. This page provides basic navigation links to the book collection and search functionality:**
- View and Sort Books
- The Books List page shows all books in your collection.
- You can sort the books by Title, Rating, or Date Read using the available sorting options.
**Add a Book:**
- Add Book page allows you to input new books to the collection by providing the title, author, ISBN, rating, date read, and notes.
- If you provide an ISBN, the app will automatically fetch the book’s cover image from the Open Library API.
**Edit Book:**
- Each book in your collection has an Edit button, which opens a form pre-filled with the current book details. You can update the information and save it.
**Delete Book:**
- You can delete books directly from the Books List page. Deleting a book will remove it permanently from the database.
**Search for Books:**
- Use the Search feature to find books by title, author, or ISBN using the Open Library API.
**Book Details:**
- Clicking on a book’s title will take you to the Book Details page, where you can view more information about the book, including the cover image and notes.

## API Routes
- GET /: Home page
- GET /books: List all books, with sorting functionality.
- GET /book/:id: View details of a single book.
- GET /add-book: Render the form to add a new book.
- POST /add-book: Add a new book to the collection.
- GET /edit-book/:id: Edit an existing book’s details.
- POST /edit-book/:id: Save updates to an existing book.
- POST /delete-book/:id: Delete a book from the collection.
- GET /search-results: Search for books by query string.

## Helper Functions
- fetchBookDetails(isbn): Fetches book details like title, author, and cover image from the Open Library API using the ISBN.
- searchBooks(query): Searches for books based on a query string (title, author, or other keywords) through the Open Library API.
**Screenshots:**
- Include any screenshots or UI mockups of your application here (optional).

## License
This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments
- Open Library API: For providing the book data and cover images.
- PostgreSQL: For the database that stores the book collection.
