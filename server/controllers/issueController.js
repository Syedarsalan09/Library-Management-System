import Issue from "../models/Issue.js";
import Book from "../models/Book.js";
import User from "../models/User.js";
import { matchesBookSearch } from "../utils/bookSearch.js";
import nodemailer from "nodemailer";
import { isValidObjectId } from "../utils/validation.js";


// ===============================
// Issue a Book
// ===============================
export const issueBook = async (req, res) => {
  try {
    // Admin cannot issue books
    if (req.user.role === "admin") {
      return res.status(403).json({
        message: "Admins cannot issue books.",
      });
    }

    const { bookId } = req.body;

    if (!bookId) {
      return res.status(400).json({
        message: "Book ID is required.",
      });
    }

    if (!isValidObjectId(bookId)) {
      return res.status(400).json({
        message: "Invalid book ID.",
      });
    }

    // Find book
    const book = await Book.findById(bookId);

    if (!book) {
      return res.status(404).json({
        message: "Book not found.",
      });
    }

    // Check whether this student already has this book
    const alreadyIssued = await Issue.findOne({
      user: req.user.id,
      book: bookId,
      status: "issued",
    });

    if (alreadyIssued) {
      return res.status(400).json({
        message: "You have already issued this book.",
      });
    }

    // Check student's current issued-book limit
    const issuedCount = await Issue.countDocuments({
      user: req.user.id,
      status: "issued",
    });

    if (issuedCount >= 3) {
      return res.status(400).json({
        message: "You can issue a maximum of 3 books.",
      });
    }

    // Atomically reserve one available copy
    const updatedBook = await Book.findOneAndUpdate(
      {
        _id: bookId,
        availableCopies: { $gt: 0 },
      },
      {
        $inc: { availableCopies: -1 },
      },
      {
        returnDocument: "after"
      }
    );

    // If no book was updated, no copy was available
    if (!updatedBook) {
      return res.status(400).json({
        message: "Book is not available.",
      });
    }

    // Calculate due date
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 7);

    // Create issue record
    let issue;

try {
  issue = await Issue.create({
    user: req.user.id,
    book: updatedBook._id,

    bookSnapshot: {
      title: updatedBook.title,
      author: updatedBook.author,
      category: updatedBook.category,
      publisher: updatedBook.publisher,
      publishedYear: updatedBook.publishedYear,
      isbn: updatedBook.isbn,
      coverImage: updatedBook.coverImage,
    },

    dueDate,
  });
} catch (issueError) {
  // Roll back the reserved book copy
  await Book.findByIdAndUpdate(bookId, {
    $inc: { availableCopies: 1 },
  });

  throw issueError;
}

    // Get student details
    const user = await User.findById(req.user.id);

    // Create email transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Send issue confirmation email
    try {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: user.email,
        subject: "Book Issued Successfully",
        html: `
          <h2>Hello ${user.name},</h2>

          <p>Your book has been issued successfully.</p>

          <h3>Book Details</h3>

          <p><strong>Title:</strong> ${updatedBook.title}</p>
          <p><strong>Author:</strong> ${updatedBook.author}</p>

          <p>
            <strong>Issue Date:</strong>
            ${new Date(issue.issueDate).toDateString()}
          </p>

          <p>
            <strong>Due Date:</strong>
            ${new Date(issue.dueDate).toDateString()}
          </p>

          <p>
            Please return the book before the due date
            to avoid late fines.
          </p>

          <p>Library Management System</p>
        `,
      });
    } catch (emailError) {
      console.log("EMAIL ERROR:");
      console.log(emailError);
    }

    res.status(201).json({
      message: "Book Issued Successfully",
      issue,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// ===============================
// Return Book
// ===============================
export const returnBook = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.issueId)) {
      return res.status(400).json({
        message: "Invalid issue ID.",
      });
    }

    const issue = await Issue.findById(req.params.issueId);

    if (!issue) {
      return res.status(404).json({
        message: "Issue record not found.",
      });
    }

    if (issue.user.toString() !== req.user.id) {
      return res.status(403).json({
        message: "Unauthorized.",
      });
    }

    if (issue.status === "returned") {
      return res.status(400).json({
        message: "Book has already been returned.",
      });
    }

    const today = new Date();

    issue.returnDate = today;
    issue.status = "returned";

    const dueDate = new Date(issue.dueDate);

    const todayMidnight = new Date(today);
    todayMidnight.setHours(0, 0, 0, 0);

    const dueMidnight = new Date(dueDate);
    dueMidnight.setHours(0, 0, 0, 0);

    const lateDays = Math.max(
      0,
      Math.floor(
        (todayMidnight - dueMidnight) /
          (1000 * 60 * 60 * 24)
      )
    );

    issue.fine = lateDays * 5;

    await issue.save();

    // Book may already be deleted
    const book = await Book.findById(issue.book);

    if (book) {
      book.availableCopies++;

      if (book.availableCopies > book.totalCopies) {
        book.availableCopies = book.totalCopies;
      }

      await book.save();
    }

        const user = await User.findById(req.user.id);

        try {
          if (!user) {
            throw new Error("The account for this return could not be found.");
          }

          const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
              user: process.env.EMAIL_USER,
              pass: process.env.EMAIL_PASS,
            },
          });

          await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: user.email,
            subject: "Book Returned Successfully",
            html: `
              <h2>Hello ${user.name},</h2>
              <p>Your book has been returned successfully.</p>
              <h3>Book Details</h3>
              <p><strong>Title:</strong> ${book ? book.title : issue.bookSnapshot.title}</p>
              <p><strong>Author:</strong> ${book ? book.author : issue.bookSnapshot.author}</p>
              <p><strong>Return Date:</strong> ${new Date(issue.returnDate).toDateString()}</p>
              <p><strong>Fine:</strong> ₹${issue.fine}</p>
              ${
                issue.fine > 0
                  ? "<p>Please pay the outstanding fine to the library.</p>"
                  : "<p>No fine has been charged. Thank you for returning the book on time.</p>"
              }
              <br/>
              <p>Library Management System</p>
            `,
          });
        } catch (emailError) {
          console.error(
            "Return confirmation email delivery failed:",
            emailError.code || emailError.message
          );
        }


    res.status(200).json({
      message:
        issue.fine > 0
          ? `Book Returned Successfully. Fine: ₹${issue.fine}`
          : "Book Returned Successfully.",
      issue,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// ===============================
// Student Books
// ===============================
export const getMyIssuedBooks = async (req, res) => {
  try {
    const page = Math.max(
      Number(req.query.page) || 1,
      1
    );

    const limit = Math.min(
      Math.max(
        Number(req.query.limit) || 5,
        1
      ),
      50
    );

    const keyword =
      req.query.keyword?.trim() || "";

    const category =
      req.query.category?.trim() || "All";

    const sort =
      req.query.sort || "newest";

    const skip = (page - 1) * limit;

    // ===============================
    // Get User's Issues
    // ===============================

    const userIssues = await Issue.find({
      user: req.user.id,
    })
      .populate("book")
      .sort({
        createdAt: -1,
      });

    // ===============================
    // Search + Category Filter
    // ===============================

    let filteredIssues = userIssues;

    if (keyword) {
      filteredIssues =
        filteredIssues.filter((issue) => {
          const book = issue.book?.toObject
            ? issue.book.toObject()
            : issue.bookSnapshot;

          return matchesBookSearch(book, keyword);
        });
    }

    if (
      category &&
      category !== "All"
    ) {
      filteredIssues =
        filteredIssues.filter((issue) => {
          const issueCategory =
            issue.book?.category ||
            issue.bookSnapshot?.category ||
            "";

          return (
            issueCategory.toLowerCase() ===
            category.toLowerCase()
          );
        });
    }

    // ===============================
    // Sorting
    // ===============================

    if (sort === "titleAsc") {
      filteredIssues.sort((a, b) => {
        const titleA =
          a.book?.title ||
          a.bookSnapshot?.title ||
          "";

        const titleB =
          b.book?.title ||
          b.bookSnapshot?.title ||
          "";

        return titleA.localeCompare(titleB);
      });
    }

    if (sort === "titleDesc") {
      filteredIssues.sort((a, b) => {
        const titleA =
          a.book?.title ||
          a.bookSnapshot?.title ||
          "";

        const titleB =
          b.book?.title ||
          b.bookSnapshot?.title ||
          "";

        return titleB.localeCompare(titleA);
      });
    }

    if (sort === "newest") {
      filteredIssues.sort(
        (a, b) =>
          new Date(b.createdAt) -
          new Date(a.createdAt)
      );
    }

    if (sort === "oldest") {
      filteredIssues.sort(
        (a, b) =>
          new Date(a.createdAt) -
          new Date(b.createdAt)
      );
    }

    // ===============================
    // Pagination
    // ===============================

    const total = filteredIssues.length;

    const totalPages = Math.ceil(
      total / limit
    );

    const issues = filteredIssues.slice(
      skip,
      skip + limit
    );

    // ===============================
    // Response
    // ===============================

    res.status(200).json({
      currentPage: page,
      totalPages,
      total,
      issues,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// ===============================
// Admin Issued Books
// ===============================
export const getAllIssuedBooks = async (req, res) => {
  try {
    const issues = await Issue.find()
      .populate("user", "name email role")
      .populate("book")
      .sort({
        createdAt: -1,
      });

    res.status(200).json({
      total: issues.length,
      issues,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};