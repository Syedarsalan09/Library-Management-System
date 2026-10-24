import { Link } from "react-router-dom";

const API_BASE_URL = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/$/, "");

const Home = ({ books, loadingBooks, isLoggedIn }) => {
  const featuredBooks = books.slice(0, 4);

  return (
    <div className="home-page">
      <section className="home-hero py-5">
        <div className="container py-lg-4">
          <div className="row align-items-center g-5">
          <div className="col-lg-6">
            <span className="home-eyebrow mb-4">
              <i className="bi bi-stars me-2"></i>
              A LITTLE MORE WONDER, EVERY DAY
            </span>
            <h1 className="home-title">
              Find your next
              <span> great read.</span>
            </h1>
            <p className="home-description mt-4">
              Some stories stay with you. Explore a collection made for curious
              minds and discover the one you won’t want to put down.
            </p>
            <div className="d-flex flex-wrap align-items-center gap-3 mt-4">
              <Link to="/books" className="btn home-primary-action">
                Explore the shelves
                <i className="bi bi-arrow-up-right ms-2"></i>
              </Link>
              {isLoggedIn ? (
                <Link to="/dashboard" className="btn home-secondary-action">
                  <i className="bi bi-speedometer2 me-2"></i>My Dashboard
                </Link>
              ) : (
                <>
                  <Link to="/register" className="btn home-secondary-action">
                    Join the library
                  </Link>
                  <Link to="/login" className="home-login-link">
                    Member login <i className="bi bi-arrow-right ms-1"></i>
                  </Link>
                </>
              )}
            </div>

            <div className="home-benefits mt-5">
              <div className="home-benefit">
                <span className="home-benefit-icon"><i className="bi bi-compass"></i></span>
                <span>Find a new perspective</span>
              </div>
              <div className="home-benefit">
                <span className="home-benefit-icon"><i className="bi bi-bookmark-heart"></i></span>
                <span>Keep your reading close</span>
              </div>
            </div>
          </div>

          <div className="col-lg-6">
            <div className="home-hero-art">
              <img
                src="/images/library-hero.jpg"
                alt="A welcoming library reading space"
                className="home-hero-image"
              />
              <div className="home-image-note">
                <span className="home-note-icon"><i className="bi bi-book-half"></i></span>
                <div>
                  <span className="home-note-label">YOUR NEXT CHAPTER</span>
                  <strong>Starts with one page.</strong>
                </div>
              </div>
            </div>
          </div>
          </div>
        </div>
      </section>

      <section className="container home-collection py-5">
        <div className="d-flex flex-wrap justify-content-between align-items-end gap-3 mb-4">
          <div>
            <span className="home-section-eyebrow">
              A good place to begin
            </span>
            <h2 className="home-section-title mt-2 mb-0">Stories worth discovering</h2>
            <p className="text-secondary mt-2 mb-0">
              Pick a shelf. Follow your curiosity.
            </p>
          </div>
          <Link to="/books" className="home-view-all">
            Browse all books <i className="bi bi-arrow-right ms-2"></i>
          </Link>
        </div>

        {loadingBooks ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3 text-secondary">Finding books for you...</p>
          </div>
        ) : featuredBooks.length === 0 ? (
          <div className="home-empty-state text-center p-5">
            <i className="bi bi-journals display-4"></i>
            <p className="fs-5 text-secondary mt-3">
              No books are currently available in the collection.
            </p>
            <Link to="/books" className="btn btn-primary mt-2">
              Browse the Library
            </Link>
          </div>
        ) : (
          <div className="row g-4">
            {featuredBooks.map((book) => (
              <div className="col-sm-6 col-lg-3" key={book._id}>
                <article className="card home-book-card h-100">
                  <img
                    src={
                      book.coverImage
                        ? `${API_BASE_URL}${book.coverImage}`
                        : "/images/default-book.jpg"
                    }
                    alt={book.title}
                    className="card-img-top home-book-cover"
                    onError={(event) => {
                      event.currentTarget.src = "/images/default-book.jpg";
                    }}
                  />
                  <div className="card-body d-flex flex-column">
                    <span className="badge bg-primary align-self-start mb-2">
                      {book.category}
                    </span>
                    <h5 className="card-title fw-bold">{book.title}</h5>
                    <p className="text-secondary mb-3">{book.author}</p>
                    <div className="home-book-availability small mb-3">
                      <strong className={book.availableCopies > 0 ? "text-success" : "text-danger"}>
                        Available Copies: {book.availableCopies}
                      </strong>
                    </div>
                    <div className="mb-3">
                      {book.availableCopies > 0 ? (
                        <span className="badge bg-success">In Stock</span>
                      ) : (
                        <span className="badge bg-danger">Out of Stock</span>
                      )}
                    </div>
                    <Link
                      to={`/books/${book._id}`}
                      className="home-book-link mt-auto"
                    >
                      View Details
                      <i className="bi bi-arrow-right ms-2"></i>
                    </Link>
                  </div>
                </article>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="container pb-5">
        <div className="home-bottom-cta p-4 p-md-5">
          <div className="row align-items-center g-3">
            <div className="col-lg">
              <span className="home-cta-eyebrow">THE NEXT GREAT READ IS OUT THERE</span>
              <h2 className="fw-bold mt-2 mb-2">Let curiosity lead the way.</h2>
              <p className="mb-0">
                Browse the shelves and see where a good story takes you.
              </p>
            </div>
            <div className="col-lg-auto">
              <Link to="/books" className="btn home-cta-action">
                Find your book <i className="bi bi-arrow-up-right ms-2"></i>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
