import { useState, useEffect } from "react";
import { issueBook as issueBookAPI } from "../services/issueService";
import { getCategories } from "../services/bookService";
import BookCard from "../components/BookCard";

const Books = ({
  books,
  myBooks,
  loadBooks,
  loadMyBooks,
  user,
  isLoggedIn,
  loadingBooks,
  currentPage,
  totalPages,
  totalBooks,
}) => {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [sortBy, setSortBy] = useState("newest");
  const [categories, setCategories] = useState(["All"]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadBooks(1, search, category, sortBy);
    }, 300);

    return () => clearTimeout(timer);
  }, [search, category, sortBy, loadBooks]);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await getCategories();

        setCategories(["All", ...response.data.categories]);
      } catch (error) {
        console.error("Failed to load categories:", error);
      }
    };

    loadCategories();
  }, []);

  const issueBook = async (book) => {
    if (user.role === "admin") {
      return;
    }

    const activeBooks = myBooks.filter(
      (item) => item.status === "issued"
    );

    if (activeBooks.length >= 3) {
      alert("You can issue a maximum of 3 books.");
      return;
    }

    if (
      activeBooks.some(
        (item) => item.book?._id === book._id
      )
    ) {
      alert("You have already issued this book.");
      return;
    }

    if (book.availableCopies <= 0) {
      alert("Book is out of stock.");
      return;
    }

    try {
      await issueBookAPI({
        bookId: book._id,
      });

      await loadBooks(
  currentPage,
  search,
  category,
  sortBy
);
      await loadMyBooks();

      alert("Book issued successfully!");
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Failed to issue book."
      );
    }
  };



  const availableCopies = books.reduce(
    (sum, book) => sum + book.availableCopies,
    0
  );

  const myIssuedBooks = myBooks.filter(
    (book) => book.status === "issued"
  ).length;

  return (
    <>
      <h2 className="text-center mb-4">
        📚 Library Books
      </h2>

      <div className="row mb-4">

        <div className="col-md-5">
          <input
            className="form-control"
            placeholder="🔍 Search by title, author, category, publisher or ISBN..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />
        </div>

        <div className="col-md-4">
          <select
            className="form-select"
            value={category}
            onChange={(e) =>
              setCategory(e.target.value)
            }
          >
            {categories.map((cat) => (
              <option
                key={cat}
                value={cat}
              >
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div className="col-md-3">
          <select
            className="form-select"
            value={sortBy}
            onChange={(e) =>
              setSortBy(e.target.value)
            }
          >
            <option value="newest">
  Sort By
</option>

<option value="titleAsc">
  Title A-Z
</option>

<option value="titleDesc">
  Title Z-A
</option>
          </select>
        </div>

      </div>

      <div className="row mb-4">

        <div className="col-md-4">
          <div className="card shadow border-primary">
            <div className="card-body text-center">
              <h5>Total Titles</h5>
              <h2>{totalBooks}</h2>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card shadow border-success">
            <div className="card-body text-center">
              <h5>Available Copies</h5>
              <h2>{availableCopies}</h2>
            </div>
          </div>
        </div>

        {isLoggedIn && user.role !== "admin" && (
          <div className="col-md-4">
            <div className="card shadow border-warning">
              <div className="card-body text-center">
                <h5>My Issued Books</h5>
                <h2>{myIssuedBooks}</h2>
              </div>
            </div>
          </div>
        )}

      </div>

      <div className="row">

        {loadingBooks ? (
          <div className="col-12 text-center mt-4">
            <div
              className="spinner-border"
              role="status"
            >
              <span className="visually-hidden">
                Loading...
              </span>
            </div>
            <p className="mt-3">Loading books...</p>
          </div>
        ) : books.length ? (
          books.map((book) => (
            <BookCard
              key={book._id}
              book={book}
              issueBook={issueBook}
              user={user}
              isLoggedIn={isLoggedIn}
            />
          ))
        ) : (
          <div className="text-center mt-5">
            <h4>No books found.</h4>
          </div>
        )}

      </div>

      {totalPages > 1 && (
        <nav aria-label="Books pagination">
          <ul className="pagination justify-content-center mt-4">

            <li
              className={`page-item ${
                currentPage === 1
                  ? "disabled"
                  : ""
              }`}
            >
              <button
                className="page-link"
                onClick={() =>
                 loadBooks(
                 currentPage - 1,
                 search,
                 category,
                 sortBy
                )
               }
                disabled={currentPage === 1}
              >
                Previous
              </button>
            </li>

            {Array.from(
              { length: totalPages },
              (_, index) => index + 1
            ).map((page) => (
              <li
                key={page}
                className={`page-item ${
                  currentPage === page
                    ? "active"
                    : ""
                }`}
              >
                <button
                  className="page-link"
                  onClick={() =>
                    loadBooks(
                      page,
                      search,
                      category,
                      sortBy
                    )
                  }
                >
                  {page}
                </button>
              </li>
            ))}

            <li
              className={`page-item ${
                currentPage === totalPages
                  ? "disabled"
                  : ""
              }`}
            >
              <button
                className="page-link"
                onClick={() =>
                  loadBooks(
                    currentPage + 1,
                     search,
                     category,
                     sortBy
                   )
                 }
                disabled={
                  currentPage === totalPages
                }
              >
                Next
              </button>
            </li>

          </ul>
        </nav>
      )}

    </>
  );
};

export default Books;