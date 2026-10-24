import Book from "../models/Book.js";
import Issue from "../models/Issue.js";
import { isValidObjectId } from "../utils/validation.js";
import { buildBookSearchFilter } from "../utils/bookSearch.js";

// ==============================
// Add New Book
// ==============================
export const addBook = async (req, res) => {
  try {
    const {
  title,
  author,
  category,
  isbn,
  publisher,
  publishedYear,
  totalCopies,
  availableCopies,
  description,
} = req.body;

const normalizedIsbn = isbn?.trim();

// Get uploaded image path
const coverImage = req.file
  ? `/uploads/${req.file.filename}`
  : "";

    if (
      !title ||
      !author ||
      !category ||
      !isbn ||
      !publisher ||
      !publishedYear ||
      !totalCopies
    ) {
      return res.status(400).json({
        message: "Please fill all required fields.",
      });
    }

   const existingBook = await Book.findOne({
  isbn: normalizedIsbn,
});

    if (existingBook) {
      return res.status(400).json({
        message: "Book already exists.",
      });
    }

    const book = await Book.create({
      title,
      author,
      category,
      isbn: normalizedIsbn,
      publisher,
      publishedYear,
      totalCopies,
      availableCopies:
      availableCopies ?? totalCopies,
      description,
      coverImage,
    });

    res.status(201).json({
      message: "Book Added Successfully",
      book,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};


// // ==============================
// // Get All Books
// // ==============================
// export const getBooks = async (req, res) => {
//   try {
//     const page = Math.max(
//       Number(req.query.page) || 1,
//       1
//     );

//     const limit = Math.min(
//       Math.max(Number(req.query.limit) || 5, 1),
//       50
//     );

//     const sort = req.query.sort || "newest";
//     const keyword = req.query.keyword?.trim() || "";
//     const category = req.query.category?.trim() || "";

//     const skip = (page - 1) * limit;


//     // ==============================
//     // Search / Filter Conditions
//     // ==============================

//     const filter = {};

//     if (keyword) {
//       filter.$or = [
//         {
//           title: {
//             $regex: keyword,
//             $options: "i",
//           },
//         },
//         {
//           author: {
//             $regex: keyword,
//             $options: "i",
//           },
//         },
//         {
//           category: {
//             $regex: keyword,
//             $options: "i",
//           },
//         },
//       ];
//     }

//     if (category && category !== "All") {
//       filter.category = {
//         $regex: `^${category}$`,
//         $options: "i",
//       };
//     }

//     // ==============================
//     // Sorting
//     // ==============================

//     let sortOption = {};

//     switch (sort) {
//       case "oldest":
//         sortOption = { createdAt: 1 };
//         break;

//       case "titleAsc":
//         sortOption = { title: 1 };
//         break;

//       case "titleDesc":
//         sortOption = { title: -1 };
//         break;

//       default:
//         sortOption = { createdAt: -1 };
//     }

//     // ==============================
//     // Count Matching Books
//     // ==============================

//     const totalBooks = await Book.countDocuments(filter);

//     // ==============================
//     // Get Current Page
//     // ==============================

//     const books = await Book.find(filter)
//       .sort(sortOption)
//       .skip(skip)
//       .limit(limit);

//     // ==============================
//     // Add Issue Status
//     // ==============================

//     const booksWithDeleteStatus = await Promise.all(
//       books.map(async (book) => {
//         const activeIssue = await Issue.findOne({
//           book: book._id,
//           status: "issued",
//         });

//         const alreadyIssued = await Issue.findOne({
//           user: req.user.id,
//           book: book._id,
//           status: "issued",
//         });

//         return {
//           ...book.toObject(),
//           canDelete: !activeIssue,
//           alreadyIssued: !!alreadyIssued,
//         };
//       })
//     );

//     res.status(200).json({
//       currentPage: page,
//       totalPages: Math.ceil(totalBooks / limit),
//       totalBooks,
//       books: booksWithDeleteStatus,
//     });

//   } catch (error) {
//     res.status(500).json({
//       message: error.message,
//     });
//   }
// };

// ==============================
// Get All Books
// ==============================
export const getBooks = async (req, res) => {
  try {
    const page = Math.max(
      Number(req.query.page) || 1,
      1
    );

    const limit = Math.min(
      Math.max(Number(req.query.limit) || 5, 1),
      50
    );

    const sort = req.query.sort || "newest";
    const keyword = req.query.keyword?.trim() || "";
    const category = req.query.category?.trim() || "";

    const skip = (page - 1) * limit;

    // ==============================
    // Search / Filter Conditions
    // ==============================

    const filter = buildBookSearchFilter(keyword);

    if (category && category !== "All") {
      filter.category = {
        $regex: `^${category}$`,
        $options: "i",
      };
    }

    // ==============================
    // Sorting
    // ==============================

    let sortOption = {};

    switch (sort) {
      case "oldest":
        sortOption = { createdAt: 1 };
        break;

      case "titleAsc":
        sortOption = { title: 1 };
        break;

      case "titleDesc":
        sortOption = { title: -1 };
        break;

      default:
        sortOption = { createdAt: -1 };
    }

    // ==============================
    // Count Matching Books
    // ==============================

    const totalBooks = await Book.countDocuments(filter);

    // ==============================
    // Get Current Page
    // ==============================

    const books = await Book.find(filter)
      .sort(sortOption)
      .skip(skip)
      .limit(limit);

    // ==============================
    // Calculate Available Copies
    // ==============================

    const availableCopiesResult =
      await Book.aggregate([
        {
          $match: filter,
        },
        {
          $group: {
            _id: null,
            totalAvailableCopies: {
              $sum: "$availableCopies",
            },
          },
        },
      ]);

    const totalAvailableCopies =
      availableCopiesResult[0]?.totalAvailableCopies || 0;

    // ==============================
    // Add User Issue Status
    // ==============================

    const booksWithIssueStatus =
      await Promise.all(
        books.map(async (book) => {
          const alreadyIssued = req.user?.id
            ? await Issue.exists({
                user: req.user.id,
                book: book._id,
                status: "issued",
              })
            : false;

          return {
            ...book.toObject(),
            alreadyIssued: !!alreadyIssued,
          };
        })
      );

    // ==============================
    // Response
    // ==============================

    res.status(200).json({
      currentPage: page,
      totalPages: Math.ceil(
        totalBooks / limit
      ),
      totalBooks,
      totalAvailableCopies,
      books: booksWithIssueStatus,
    });

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// ==============================
// Get Book Categories
// ==============================
export const getCategories = async (req, res) => {
  try {
    const categories = await Book.distinct("category");

    res.status(200).json({
      categories,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// ==============================
// Get All Books For Admin
// ==============================
export const getAllBooks = async (req, res) => {
  try {
    const books = await Book.find().sort({ createdAt: -1 });

    const booksWithDeleteStatus = await Promise.all(
      books.map(async (book) => {
        const activeIssue = await Issue.findOne({
          book: book._id,
          status: "issued",
        });

        return {
          ...book.toObject(),
          canDelete: !activeIssue,
        };
      })
    );

    res.status(200).json({
      totalBooks: booksWithDeleteStatus.length,
      books: booksWithDeleteStatus,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// ==============================
// Get Paginated Books For Admin
// ==============================
export const getAdminBooks = async (req, res) => {
  try {
    const page = Math.max(
      Number(req.query.page) || 1,
      1
    );

    const limit = Math.min(
      Math.max(Number(req.query.limit) || 5, 1),
      50
    );

    const skip = (page - 1) * limit;

const keyword = req.query.keyword?.trim() || "";

// ==============================
// Admin Search / Filter
// ==============================

const filter = buildBookSearchFilter(keyword);

// ==============================
// Count Matching Books
// ==============================

const totalBooks = await Book.countDocuments(filter);

// ==============================
// Get Current Admin Page
// ==============================

const books = await Book.find(filter)
  .sort({ createdAt: -1 })
  .skip(skip)
  .limit(limit);

    // Check whether each book can be deleted
    const booksWithDeleteStatus = await Promise.all(
      books.map(async (book) => {
        const activeIssue = await Issue.findOne({
          book: book._id,
          status: "issued",
        });

        return {
          ...book.toObject(),
          canDelete: !activeIssue,
        };
      })
    );

    res.status(200).json({
      currentPage: page,
      totalPages: Math.ceil(totalBooks / limit),
      totalBooks,
      books: booksWithDeleteStatus,
    });

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// ==============================
// Get Single Book
// ==============================
export const getBookById = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({
        message: "Invalid book ID.",
      });
    }

    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({
        message: "Book not found.",
      });
    }

    res.status(200).json(book);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// ==============================
// Search Books
// ==============================
export const searchBooks = async (req, res) => {
  try {
    const filter = buildBookSearchFilter(req.query.keyword);
    const books = await Book.find(filter);

    res.status(200).json({
      total: books.length,
      books,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// ==============================
// Update Book
// ==============================
export const updateBook = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({
        message: "Invalid book ID.",
      });
    }

    const {
    totalCopies,
    } = req.body;

    const normalizedIsbn = req.body.isbn?.trim();

    // Keep this ONE declaration
    const updateData = {
  ...req.body,
  isbn: normalizedIsbn,
};

// Never allow the frontend to directly change
// availableCopies. It must be calculated from
// the currently issued copies.
delete updateData.availableCopies;

    if (req.file) {
      updateData.coverImage = `/uploads/${req.file.filename}`;
    }

    const book = await Book.findById(req.params.id);

if (!book) {
  return res.status(404).json({
    message: "Book not found.",
  });
}

// Check if ISBN already belongs to another book
if (normalizedIsbn && normalizedIsbn !== book.isbn) {
  const existingBook = await Book.findOne({
    isbn: normalizedIsbn,
    _id: { $ne: req.params.id },
  });

  if (existingBook) {
    return res.status(400).json({
      message: "Another book already uses this ISBN.",
    });
  }
}

  const issuedCopies =
    book.totalCopies - book.availableCopies;

     // If totalCopies is being changed, preserve the
// number of currently issued copies.
if (totalCopies !== undefined) {
  updateData.totalCopies = totalCopies;
  updateData.availableCopies =
    totalCopies - issuedCopies;
}

    if (
      totalCopies !== undefined &&
      totalCopies < 1
    ) {
      return res.status(400).json({
        message: "Total copies must be at least 1.",
      });
    } 


    if (
      totalCopies !== undefined &&
      totalCopies < issuedCopies
    ) {
      return res.status(400).json({
        message:
          "Total copies cannot be less than currently issued books.",
      });
    }

    // Directly update
    const updatedBook = await Book.findByIdAndUpdate( 
      req.params.id,
      updateData,
      {
       returnDocument: "after",
       runValidators: true,
      }
    );

    res.status(200).json({
      message: "Book Updated Successfully",
      updatedBook,
    });

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// ==============================
// Delete Book
// ==============================
export const deleteBook = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({
        message: "Invalid book ID.",
      });
    }

    const activeIssue = await Issue.findOne({
      book: req.params.id,
      status: "issued",
    });

    if (activeIssue) {
      return res.status(400).json({
        message:
          "Cannot delete a book that is currently issued.",
      });
    }

    const deletedBook =
      await Book.findByIdAndDelete(req.params.id);

    if (!deletedBook) {
      return res.status(404).json({
        message: "Book not found.",
      });
    }

    res.status(200).json({
      message: "Book Deleted Successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};