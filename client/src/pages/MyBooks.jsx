import { useState, useEffect } from "react";

import { returnBook as returnBookAPI } from "../services/issueService";
import { getCategories } from "../services/bookService";

const API_BASE_URL = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/$/, "");

const MyBooks = ({
  myBooks,
  loadMyBooks,
  loadBooks,
  loadingMyBooks,
  currentPage,
  totalPages,
  totalBooks,
}) => {

  const [search, setSearch] = useState("");

  const [category, setCategory] =
    useState("All");

  const [sortBy, setSortBy] =
    useState("newest");

  const [categories, setCategories] =
    useState(["All"]);

  useEffect(() => {
  const timer = setTimeout(() => {
    loadMyBooks(
      1,
      search,
      category,
      sortBy
    );
  }, 300);

  return () => clearTimeout(timer);
}, [
  search,
  category,
  sortBy,
  loadMyBooks
]);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response =
          await getCategories();

        setCategories([
          "All",
          ...response.data.categories,
        ]);
      } catch (error) {
        console.error(
          "Failed to load categories:",
          error
        );
      }
    };

    loadCategories();
  }, []);

  const returnBook = async (issueId) => {
    try {
      const data =
        await returnBookAPI(issueId);

      await loadMyBooks(
        currentPage,
        search,
        category,
        sortBy
      );

      await loadBooks();

      alert(data.message);
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Failed to return book."
      );
    }
  };

  const issuedBooks = myBooks.filter(
    (book) =>
      book.status === "issued"
  ).length;

  const totalFines = myBooks.reduce(
    (total, book) =>
      total + (book.fine || 0),
    0
  );

  return (
    <div className="container mt-5">

      <h2 className="mb-4">
        📖 My Books
      </h2>

      <div className="row mb-4">

        <div className="col-md-5">

      <input
  type="text"
  className="form-control"
  placeholder="🔍 Search by title, author, category, publisher or ISBN..."
  value={search}
  onChange={(e) => setSearch(e.target.value)}
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

            <option value="newest">
              Newest First
            </option>

            <option value="oldest">
              Oldest First
            </option>

          </select>

        </div>

      </div>

      <div className="row mb-4">

        <div className="col-md-4">

          <div className="card shadow border-primary">

            <div className="card-body text-center">

              <h5>Total Books</h5>

              <h2>{totalBooks}</h2>

            </div>

          </div>

        </div>

        <div className="col-md-4">

          <div className="card shadow border-warning">

            <div className="card-body text-center">

              <h5>Currently Issued</h5>

              <h2>{issuedBooks}</h2>

            </div>

          </div>

        </div>

        <div className="col-md-4">

          <div className="card shadow border-danger">

            <div className="card-body text-center">

              <h5>Total Fine</h5>

              <h2>₹{totalFines}</h2>

            </div>

          </div>

        </div>

      </div>

      {loadingMyBooks ? (
        <div className="text-center mt-5">
          <div
            className="spinner-border text-primary"
            role="status"
          >
            <span className="visually-hidden">
              Loading...
            </span>
          </div>
          <p className="mt-3">Loading your books...</p>
        </div>
      ) : myBooks.length === 0 ? (

        <div className="text-center mt-5">

          <h4>
            No Books Found
          </h4>

          <p>
            Try changing your search or
            category filter.
          </p>

        </div>

      ) : (

        <div className="row">

          {myBooks.map((issue) => {

            const title =
              issue.book?.title ||
              issue.bookSnapshot?.title ||
              "Unknown Book";

            const author =
              issue.book?.author ||
              issue.bookSnapshot?.author ||
              "Unknown Author";

            const issueCategory =
              issue.book?.category ||
              issue.bookSnapshot?.category ||
              "Unknown Category";

            const publisher =
              issue.book?.publisher ||
              issue.bookSnapshot?.publisher ||
              "Unknown Publisher";

            const coverImage =
              issue.book?.coverImage
                ? `${API_BASE_URL}${issue.book.coverImage}`
                : issue.bookSnapshot?.coverImage
                ? `${API_BASE_URL}${issue.bookSnapshot.coverImage}`
                : "/images/default-book.jpg";

            return (

              <div
                className="col-md-4 mb-4"
                key={issue._id}
              >

                <div
                  className="card shadow-lg border-0 h-100"
                  style={{
                    borderRadius: "15px",
                  }}
                >

                  <img
                    src={coverImage}
                    alt={title}
                    className="card-img-top"
                    style={{
                      height: "250px",
                      objectFit: "cover",
                      borderTopLeftRadius: "15px",
                      borderTopRightRadius: "15px",
                    }}
                    onError={(e) => {
                      e.target.src =
                        "/images/default-book.jpg";
                    }}
                  />

                  <div className="card-body d-flex flex-column">

                    <h5>
                      {title}
                    </h5>

                    {!issue.book && (
                      <div className="mb-2">

                        <span className="badge bg-secondary">
                          Removed from Library
                        </span>

                      </div>
                    )}

                    <p>
                      <strong>
                        Author:
                      </strong>{" "}
                      {author}
                    </p>

                    <p>
                      <strong>
                        Category:
                      </strong>{" "}
                      {issueCategory}
                    </p>

                    <p>
                      <strong>
                        Publisher:
                      </strong>{" "}
                      {publisher}
                    </p>

                    <p>
                      <strong>
                        Issued On:
                      </strong>{" "}

                      {new Date(
                        issue.issueDate
                      ).toLocaleDateString(
                        "en-GB",
                        {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        }
                      )}

                    </p>

                    <p>
                      <strong>
                        Return By:
                      </strong>{" "}

                      {new Date(
                        issue.dueDate
                      ).toLocaleDateString(
                        "en-GB",
                        {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        }
                      )}

                    </p>

                    <p>
                      <strong>
                        Status:
                      </strong>{" "}

                      {issue.status ===
                      "issued" ? (

                        <span className="badge bg-warning text-dark">
                          Issued
                        </span>

                      ) : (

                        <span className="badge bg-success">
                          Returned
                        </span>

                      )}

                    </p>

                    <p>
                      <strong>
                        Fine:
                      </strong>{" "}

                      {issue.fine > 0 ? (

                        <span className="text-danger fw-bold">
                          ₹{issue.fine}
                        </span>

                      ) : (

                        <span className="text-success">
                          ₹0
                        </span>

                      )}

                    </p>

                    <button
                      className="btn btn-danger w-100 mt-auto"
                      disabled={
                        issue.status ===
                        "returned"
                      }
                      onClick={() =>
                        returnBook(
                          issue._id
                        )
                      }
                    >

                      <i className="bi bi-arrow-return-left"></i>{" "}

                      {issue.status ===
                      "returned"
                        ? "Returned"
                        : "Return Book"}

                    </button>

                  </div>

                </div>

              </div>

            );
          })}

        </div>

      )}

      {totalPages > 1 && (

        <nav
          aria-label="My books pagination"
        >

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
                  loadMyBooks(
                    currentPage - 1,
                    search,
                    category,
                    sortBy
                  )
                }
                disabled={
                  currentPage === 1
                }
              >
                Previous
              </button>

            </li>

            {Array.from(
              {
                length: totalPages,
              },
              (_, index) =>
                index + 1
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
                    loadMyBooks(
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
                currentPage ===
                totalPages
                  ? "disabled"
                  : ""
              }`}
            >

              <button
                className="page-link"
                onClick={() =>
                  loadMyBooks(
                    currentPage + 1,
                    search,
                    category,
                    sortBy
                  )
                }
                disabled={
                  currentPage ===
                  totalPages
                }
              >
                Next
              </button>

            </li>

          </ul>

        </nav>

      )}

    </div>
  );
};

export default MyBooks;