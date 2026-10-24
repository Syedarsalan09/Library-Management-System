import { useState, useEffect } from "react";
import {
  createBook,
  updateBook as updateBookAPI,
  deleteBook as deleteBookAPI,
  getCategories,
} from "../services/bookService";

const API_BASE_URL = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/$/, "");

import {
  downloadUsersReport,
  downloadBooksReport,
  downloadIssuedBooksReport,
  downloadFinesReport,
} from "../services/reportService";
import { sendReminderEmails } from "../services/reminderService";

  const Admin = ({
  books,
  loadBooks,
  loadingBooks,
  currentPage,
  totalPages,
  totalBooks,
}) => {
  const [search, setSearch] = useState("");
  const [categories, setCategories] = useState([]);
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [category, setCategory] = useState("");

  const [isbn, setIsbn] = useState("");
  const [publisher, setPublisher] = useState("");
  const [publishedYear, setPublishedYear] = useState("");
  const [description, setDescription] = useState("");

  const [quantity, setQuantity] = useState("");
  const [image, setImage] = useState(null);

  const [editId, setEditId] = useState(null);
  const [isBookFormOpen, setIsBookFormOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadBooks(1, search);
    }, 300);

  return () => clearTimeout(timer);
}, [search, loadBooks]);

useEffect(() => {
  const loadCategories = async () => {
    try {
      const response = await getCategories();
      setCategories(response.data.categories);
    } catch (error) {
      console.error("Failed to load categories:", error);
    }
  };

  loadCategories();
}, []);

  const resetBookForm = () => {
    setEditId(null);
    setTitle("");
    setAuthor("");
    setCategory("");
    setQuantity("");
    setIsbn("");
    setPublisher("");
    setPublishedYear("");
    setDescription("");
    setImage(null);
    setIsBookFormOpen(false);
  };

  const addBook = async (e) => {
    e.preventDefault();
if (
  !title ||
  !author ||
  !category ||
  !isbn ||
  !publisher ||
  !publishedYear ||
  Number(quantity) <= 0
) {
  alert("Please fill all required fields.");
  return;
}

      try {
      const formData = new FormData();

formData.append("title", title);
formData.append("author", author);
formData.append("category", category);
formData.append("isbn", isbn);
formData.append("publisher", publisher);
formData.append("publishedYear", publishedYear);
formData.append("totalCopies", quantity);
formData.append("description", description);

if (image) {
  formData.append("coverImage", image);
}

await createBook(formData);

     await loadBooks(currentPage, search);
    } catch (error) {
     alert(
    error.response?.data?.message || "Failed to add book."
    );
    return;
  }

    resetBookForm();
    alert("Book Added Successfully!");
  };

    const deleteBook = async (id) => {
    const confirmDelete = window.confirm(
    "Are you sure you want to delete this book?"
    );

    if (!confirmDelete) return;

      try {
      await deleteBookAPI(id);

const nextPage =
  currentPage > 1 && books.length === 1
    ? currentPage - 1
    : currentPage;

await loadBooks(nextPage, search);

alert("Book Deleted Successfully!");
    }     catch (error) {
      alert(error.response?.data?.message || "Failed to delete book.");
    }

   };

    const editBook = (book) => {
    setEditId(book._id);
    setIsBookFormOpen(true);
    setImage(null);
    setTitle(book.title);
    setAuthor(book.author);
    setCategory(book.category);
    setQuantity(book.totalCopies);
    setIsbn(book.isbn);
    setPublisher(book.publisher);
    setPublishedYear(book.publishedYear);
    setDescription(book.description);
   };

   const updateBook = async (e) => {
  e.preventDefault();

  if (
    !title ||
    !author ||
    !category ||
    !isbn ||
    !publisher ||
    !publishedYear ||
    Number(quantity) <= 0
  ) {
    alert("Please fill all required fields.");
    return;
  }

  try {
    const formData = new FormData();

    formData.append("title", title);
    formData.append("author", author);
    formData.append("category", category);
    formData.append("isbn", isbn);
    formData.append("publisher", publisher);
    formData.append("publishedYear", publishedYear);
    formData.append("totalCopies", quantity);
    formData.append("description", description);

    if (image instanceof File) {
      formData.append("coverImage", image);
    }

    await updateBookAPI(editId, formData);

    await loadBooks(currentPage, search);

    resetBookForm();

    alert("Book Updated Successfully!");
  } catch (error) {
    alert(
      error.response?.data?.message ||
      "Failed to update book."
    );
  }
};  

  const totalTitles = totalBooks;
  const totalCopies = books.reduce(
    (total, book) => total + book.availableCopies,
0);

const totalCategories = categories.length;

const downloadFile = (blob, fileName) => {
  const url = window.URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;

  document.body.appendChild(link);
  link.click();

  link.remove();
  window.URL.revokeObjectURL(url);
};

const exportUsers = async () => {
  try {
    const file = await downloadUsersReport();
    downloadFile(file, "Users.xlsx");
  } catch {
    alert("Failed to export users.");
  }
};

const exportBooks = async () => {
  try {
    const file = await downloadBooksReport();
    downloadFile(file, "Books.xlsx");
  } catch {
    alert("Failed to export books.");
  }
};

const exportIssuedBooks = async () => {
  try {
    const file = await downloadIssuedBooksReport();
    downloadFile(file, "IssuedBooks.xlsx");
  } catch {
    alert("Failed to export issued books.");
  }
};

const exportFines = async () => {
  try {
    const file = await downloadFinesReport();
    downloadFile(file, "Fines.xlsx");
  } catch {
    alert("Failed to export fines.");
  }
};

const handleSendReminders = async () => {
  try {
    const response = await sendReminderEmails();

    alert(response.message);

  } catch (error) {
    alert(
      error.response?.data?.message ||
      "Failed to send reminder emails."
    );
  }
};

  return (
    <div className="container mt-5">
      <h2 className="mb-4 text-center">Admin Panel</h2>
      <div className="card shadow-sm p-3 mb-4">

     <div className="mb-3">
       <input
         type="text"
         className="form-control"
         placeholder="🔍 Search by title, author, category, publisher or ISBN..."
         value={search}
         onChange={(e) => setSearch(e.target.value)}
       />
     </div>

     <div className="row mb-0">

  <div className="col-md-4">

    <div className="card shadow border-primary">

      <div className="card-body text-center">

        <h5>Total Titles</h5>

        <h2>{totalTitles}</h2>

      </div>

    </div>

  </div>

  <div className="col-md-4">

    <div className="card shadow border-success">

      <div className="card-body text-center">

        <h5>Available Copies</h5>

        <h2>{totalCopies}</h2>

      </div>

    </div>

  </div>

  <div className="col-md-4">

    <div className="card shadow border-warning">

      <div className="card-body text-center">

        <h5>Categories</h5>

        <h2>{totalCategories}</h2>

      </div>

    </div>

  </div>

</div>

    </div>



      {isBookFormOpen && (
        <>
          <div
            className="modal-backdrop fade show"
            onClick={resetBookForm}
          ></div>
          <div
            className="modal fade show d-block"
            role="dialog"
            aria-modal="true"
            aria-labelledby="book-form-title"
            tabIndex="-1"
            onClick={resetBookForm}
            onKeyDown={(event) => {
              if (event.key === "Escape") {
                resetBookForm();
              }
            }}
          >
            <div
              className="modal-dialog modal-dialog-centered modal-lg modal-dialog-scrollable"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="modal-content">
                <form onSubmit={editId ? updateBook : addBook}>
                  <div className="modal-header">
                    <h5 className="modal-title" id="book-form-title">
                      {editId ? "Edit Book" : "Add Book"}
                    </h5>
                    <button
                      type="button"
                      className="btn-close"
                      aria-label="Close"
                      onClick={resetBookForm}
                    ></button>
                  </div>
                  <div className="modal-body p-3">
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="form-label">Book Title</label>
                        <input
                          type="text"
                          className="form-control"
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          required
                        />
                      </div>

                      <div className="col-md-6">
                        <label className="form-label">Author</label>
                        <input
                          type="text"
                          className="form-control"
                          value={author}
                          onChange={(e) => setAuthor(e.target.value)}
                          required
                        />
                      </div>

                      <div className="col-md-6">
                        <label className="form-label">ISBN</label>
                        <input
                          type="text"
                          className="form-control"
                          value={isbn}
                          onChange={(e) => setIsbn(e.target.value)}
                          placeholder="9780061122415"
                          required
                        />
                      </div>

                      <div className="col-md-6">
                        <label className="form-label">Publisher</label>
                        <input
                          type="text"
                          className="form-control"
                          value={publisher}
                          onChange={(e) => setPublisher(e.target.value)}
                          placeholder="HarperOne"
                          required
                        />
                      </div>

                      <div className="col-md-6">
                        <label className="form-label">Published Year</label>
                        <input
                          type="number"
                          className="form-control"
                          value={publishedYear}
                          onChange={(e) => setPublishedYear(e.target.value)}
                          placeholder="1988"
                          required
                        />
                      </div>

                      <div className="col-md-6">
                        <label className="form-label">Category</label>
                        <select
                          className="form-select"
                          value={category}
                          onChange={(e) => setCategory(e.target.value)}
                          required
                        >
                          <option value="">Select Category</option>
                          <option value="Programming">Programming</option>
                          <option value="MongoDB">MongoDB</option>
                          <option value="Database">Database</option>
                          <option value="Networking">Networking</option>
                          <option value="Artificial Intelligence">Artificial Intelligence</option>
                        </select>
                      </div>

                      <div className="col-md-6">
                        <label className="form-label">Quantity</label>
                        <input
                          type="number"
                          min="1"
                          className="form-control"
                          value={quantity}
                          onChange={(e) => setQuantity(e.target.value)}
                          required
                        />
                      </div>

                      <div className="col-md-6">
                        <label className="form-label">Book Cover Image</label>
                        <input
                          type="file"
                          accept="image/*"
                          className="form-control"
                          onChange={(e) => setImage(e.target.files[0])}
                        />
                      </div>

                      <div className="col-12">
                        <label className="form-label">Description</label>
                        <textarea
                          className="form-control"
                          rows="2"
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          placeholder="Enter book description..."
                        />
                      </div>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-outline-secondary" onClick={resetBookForm}>
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-success">
                      <i className={`bi ${editId ? "bi-pencil-square" : "bi-plus-circle"} me-1`}></i>
                      {editId ? "Update Book" : "Add Book"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </>
      )}

      <div className="card shadow mt-4 mb-5">
  <div className="card-body">
    <h4 className="mb-4">📊 Reports</h4>

    <div className="d-flex flex-wrap gap-3">
      <button
        className="btn btn-primary"
        onClick={exportUsers}
      >
         <i className="bi bi-download"></i>Export Users
      </button>

      <button
  className="btn btn-success"
  onClick={exportBooks}
>
  <i className="bi bi-download me-2"></i>
  Export Books
</button>

      <button
  className="btn btn-warning"
  onClick={exportIssuedBooks}
>
  <i className="bi bi-download me-2"></i>
  Export Issued Books
</button>

      <button
  className="btn btn-danger"
  onClick={exportFines}
>
  <i className="bi bi-download me-2"></i>
  Export Fines
</button>

<button
  className="btn btn-warning me-2 mt-2"
  onClick={handleSendReminders}
>
  📧 Send Reminder Emails
</button>

    </div>
  </div>
</div>

      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 p-3 mb-3 bg-light border rounded-3 shadow-sm">
        <div>
          <h3 className="mb-1">Library Books</h3>
          <p className="text-muted mb-0">Manage your library collection</p>
        </div>
        <button
          type="button"
          className="btn btn-primary btn-lg px-4 shadow-sm"
          onClick={() => setIsBookFormOpen(true)}
        >
          <i className="bi bi-plus-circle me-2"></i>
          Add Book
        </button>
      </div>

     <div className="row">

       {loadingBooks ? (
  <div className="text-center mt-5 w-100">
    <div
      className="spinner-border"
      role="status"
    >
      <span className="visually-hidden">
        Loading...
      </span>
    </div>

    <p className="mt-2">
      Loading books...
    </p>
  </div>
) : books.length > 0 ? (
  books.map((book) => (

      <div className="col-md-4 mb-4" key={book._id}>

     <div
       className="card shadow-lg border-0"
       style={{
       borderRadius: "15px",
       transition: "0.3s",
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
  width: "100%",
  objectFit: "cover",
  borderTopLeftRadius: "15px",
  borderTopRightRadius: "15px",
}}
    />

      <div className="card-body">

      <h5>{book.title}</h5>

      <p>
         <strong>Author:</strong> {book.author}
      </p>

      <p>
        <strong>Category:</strong> {book.category}
      </p>

      <p>
       <strong>Available Copies:</strong> {book.availableCopies}
      </p>

         <button
          className="btn btn-primary w-100 mb-2"
          onClick={() => editBook(book)}
        >
        <i className="bi bi-pencil-square"></i> Edit Book
        </button>

        <button
  className="btn btn-danger w-100"
  disabled={!book.canDelete}
  title={
    !book.canDelete
      ? "Book is currently issued."
      : "Delete Book"
  }
  onClick={() => deleteBook(book._id)}
>
        <i className="bi bi-trash"></i> Delete Book
        </button>
        {!book.canDelete && (
  <small className="text-danger d-block mt-2">
    This book is currently issued and cannot be deleted.
  </small>
)}
        </div>

      </div>

    </div>

             ))
       ) : (
    <div className="text-center mt-5">
      <h4>No books found.</h4>
    </div>
  )}

  </div>

{totalPages > 1 && (
  <nav aria-label="Admin books pagination">
    <ul className="pagination justify-content-center mt-4">

      <li
        className={`page-item ${
          currentPage === 1 ? "disabled" : ""
        }`}
      >
        <button
          className="page-link"
          onClick={() =>
  loadBooks(currentPage - 1, search)
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
            currentPage === page ? "active" : ""
          }`}
        >
          <button
            className="page-link"
            onClick={() => loadBooks(page, search)}
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
          loadBooks(currentPage + 1, search)
        }
          disabled={currentPage === totalPages}
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

export default Admin;