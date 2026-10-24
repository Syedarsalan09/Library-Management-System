import { Link } from "react-router-dom";

const API_BASE_URL = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/$/, "");

const BookCard = ({ book, issueBook, user, isLoggedIn }) => {
  const inStock = book.availableCopies > 0;

  return (
    <div className="col-lg-3 col-md-6 mb-4">
      <div
        className="card shadow h-100 border-0"
        style={{
          borderRadius: "15px",
        }}
      >
        <img
  src={
    book.coverImage
      ? `${API_BASE_URL}${book.coverImage}`
      : "/images/default-book.jpg"
  }
  alt={book.title}
  className="card-img-top"
  onError={(e) => {
    e.target.src = "/images/default-book.jpg";
  }}
  style={{
    height: "300px",
    objectFit: "cover",
    width: "100%",
  }}
/>

        <div className="card-body d-flex flex-column">
          <h5 className="fw-bold">{book.title}</h5>

          <p className="mb-2">
            <i className="bi bi-person-fill"></i> {book.author}
          </p>

          <p className="mb-2">
            <span className="badge bg-primary">
              {book.category}
            </span>
          </p>

          <p className="mb-2">
            <strong>Publisher:</strong> {book.publisher}
          </p>

          <p className="mb-2">
            <strong>Published Year:</strong> {book.publishedYear}
          </p>

          <p className="mb-3">
            <strong>Available Copies:</strong>{" "}
            <span className="fw-bold text-success">
              {book.availableCopies}
            </span>{" "}
            / {book.totalCopies}
          </p>

          <div className="mb-3">
            {inStock ? (
              <span className="badge bg-success">
                In Stock
              </span>
            ) : (
              <span className="badge bg-danger">
                Out of Stock
              </span>
            )}
          </div>

          {user?.role !== "admin" && (
            isLoggedIn ? (
              <button
                className="btn btn-success w-100 mb-2"
                disabled={!inStock || book.alreadyIssued}
                onClick={() => issueBook(book)}
              >
                {book.alreadyIssued
                  ? "Already Issued"
                  : inStock
                    ? "Issue Book"
                    : "Unavailable"}
              </button>
            ) : (
              inStock ? (
                <Link
                  to="/login"
                  className="btn btn-success w-100 mb-2"
                >
                  Login to Issue
                </Link>
              ) : (
                <button
                  className="btn btn-outline-secondary w-100 mb-2"
                  disabled
                >
                  Unavailable
                </button>
              )
            )
          )}

          <Link
            to={`/books/${book._id}`}
            className="btn btn-outline-dark w-100"
          >
            <i className="bi bi-eye"></i> View Details
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BookCard;