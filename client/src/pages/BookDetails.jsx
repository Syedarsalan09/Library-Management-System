import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getBookById } from "../services/bookService";

const API_BASE_URL = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/$/, "");

const BookDetails = () => {
  const { id } = useParams();

  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadBook = async () => {
      try {
        setLoading(true);

        const response = await getBookById(id);

        setBook(response.data);
      } catch (error) {
        console.error("Failed to load book:", error);
        setBook(null);
      } finally {
        setLoading(false);
      }
    };

    loadBook();
  }, [id]);

  if (loading) {
    return (
      <div className="container mt-5 text-center">
        <div
          className="spinner-border"
          role="status"
        >
          <span className="visually-hidden">
            Loading...
          </span>
        </div>

        <p className="mt-3">
          Loading book details...
        </p>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="container mt-5 text-center">
        <h2>📕 Book Not Found</h2>

        <Link
          to="/books"
          className="btn btn-primary mt-3"
        >
          Back to Books
        </Link>
      </div>
    );
  }

  const inStock = book.availableCopies > 0;

  return (
    <div className="container mt-5">
      <div className="card shadow-lg border-0">
        <div className="row g-0">

          <div className="col-md-4 text-center p-4">

            <img
              src={
                book.coverImage
                  ? `${API_BASE_URL}${book.coverImage}`
                  : "/images/default-book.jpg"
              }
              alt={book.title}
              className="img-fluid rounded shadow"
              onError={(e) => {
                e.target.src =
                  "/images/default-book.jpg";
              }}
              style={{
                width: "100%",
                height: "450px",
                objectFit: "cover",
              }}
            />

          </div>

          <div className="col-md-8">
            <div className="card-body">

              <h2 className="fw-bold">
                {book.title}
              </h2>

              <hr />

              <p>
                <strong>Author:</strong>{" "}
                {book.author}
              </p>

              <p>
                <strong>Category:</strong>{" "}
                <span className="badge bg-primary">
                  {book.category}
                </span>
              </p>

              <p>
                <strong>Publisher:</strong>{" "}
                {book.publisher}
              </p>

              <p>
                <strong>Published Year:</strong>{" "}
                {book.publishedYear}
              </p>

              <p>
                <strong>ISBN:</strong>{" "}
                {book.isbn}
              </p>

              <p>
                <strong>Total Copies:</strong>{" "}
                {book.totalCopies}
              </p>

              <p>
                <strong>Available Copies:</strong>{" "}
                {book.availableCopies}
              </p>

              <p>
                <strong>Status:</strong>{" "}
                {inStock ? (
                  <span className="badge bg-success">
                    In Stock
                  </span>
                ) : (
                  <span className="badge bg-danger">
                    Out of Stock
                  </span>
                )}
              </p>

              <hr />

              <h5>Description</h5>

              <p className="text-muted">
                {book.description ||
                  "No description available."}
              </p>

              <div className="mt-4">

                <Link
                  to="/books"
                  className="btn btn-outline-secondary me-2"
                >
                  ← Back to Books
                </Link>

                <button
                  className={`btn ${
                    inStock
                      ? "btn-success"
                      : "btn-danger"
                  }`}
                  disabled
                >
                  {inStock
                    ? "📚 Available"
                    : "❌ Out of Stock"}
                </button>

              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default BookDetails;