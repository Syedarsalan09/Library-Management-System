import { useState, useEffect, useCallback, useRef } from "react";
import { Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";

import Home from "./pages/Home";
import Books from "./pages/Books";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import MyBooks from "./pages/MyBooks";
import Admin from "./pages/Admin";
import BookDetails from "./pages/BookDetails";
import IssuedBooks from "./pages/IssuedBooks";
import NotFound from "./pages/NotFound";
import ChangePassword from "./pages/ChangePassword";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

import {
  getBooks,
  getAdminBooks,
} from "./services/bookService";
import { getMyBooks } from "./services/issueService";

function App() {
const [currentPage, setCurrentPage] = useState(1);
const [totalPages, setTotalPages] = useState(1);
const [totalBooks, setTotalBooks] = useState(0);

const [books, setBooks] = useState([]);
const booksRequestId = useRef(0);
const adminBooksRequestId = useRef(0);
const myBooksRequestId = useRef(0);

const [adminBooks, setAdminBooks] = useState([]);
const [adminCurrentPage, setAdminCurrentPage] = useState(1);
const [adminTotalPages, setAdminTotalPages] = useState(1);
const [adminTotalBooks, setAdminTotalBooks] = useState(0);
const [myBooks, setMyBooks] = useState([]);

const [myBooksCurrentPage, setMyBooksCurrentPage] =
  useState(1);

const [myBooksTotalPages, setMyBooksTotalPages] =
  useState(1);

const [myBooksTotal, setMyBooksTotal] =
  useState(0);

const [loadingBooks, setLoadingBooks] =
  useState(true);

const [loadingAdminBooks, setLoadingAdminBooks] =
  useState(true);

const [loadingMyBooks, setLoadingMyBooks] =
  useState(true);

  const [isLoggedIn, setIsLoggedIn] = useState(
  localStorage.getItem("isLoggedIn") === "true" &&
    Boolean(localStorage.getItem("token"))
);

 
const [user, setUser] = useState(() => {
  try {
    const savedUser = localStorage.getItem("user");

    if (!savedUser || savedUser === "undefined") {
      return { name: "", role: "" };
    }

    const parsedUser = JSON.parse(savedUser);

    return parsedUser && typeof parsedUser === "object"
      ? parsedUser
      : { name: "", role: "" };
  } catch {
    return { name: "", role: "" };
  }
});

useEffect(() => {
  const handleUnauthorized = () => {
    setIsLoggedIn(false);
    setUser({ name: "", role: "" });
  };

  window.addEventListener("auth:unauthorized", handleUnauthorized);
  return () => {
    window.removeEventListener("auth:unauthorized", handleUnauthorized);
  };
}, []);


const loadBooks = useCallback(
  async (
    page = 1,
    keyword = "",
    category = "All",
    sort = "newest"
  ) => {
    const requestId = ++booksRequestId.current;

    try {
      setLoadingBooks(true);

      const response = await getBooks(
        page,
        5,
        sort,
        keyword,
        category
      );

      if (requestId !== booksRequestId.current) {
        return;
      }

      setBooks(response.data.books);

      setCurrentPage(response.data.currentPage);
      setTotalPages(response.data.totalPages);
      setTotalBooks(response.data.totalBooks);
    } catch (error) {
      if (requestId === booksRequestId.current) {
        console.error(error);
      }
    } finally {
      if (requestId === booksRequestId.current) {
        setLoadingBooks(false);
      }
    }
  },
  []
);

const loadAdminBooks = useCallback(
  async (
    page = 1,
    keyword = ""
  ) => {
    const requestId = ++adminBooksRequestId.current;

    try {
      setLoadingAdminBooks(true);

      const response = await getAdminBooks(
        page,
        5,
        keyword
      );

      if (requestId !== adminBooksRequestId.current) {
        return;
      }

      setAdminBooks(response.data.books);

      setAdminCurrentPage(
        response.data.currentPage
      );

      setAdminTotalPages(
        response.data.totalPages
      );

      setAdminTotalBooks(
        response.data.totalBooks
      );
    } catch (error) {
      if (
        requestId === adminBooksRequestId.current &&
        error.response?.status !== 401
      ) {
        console.error(error);
      }
    } finally {
      if (requestId === adminBooksRequestId.current) {
        setLoadingAdminBooks(false);
      }
    }
  },
  []
);

  const loadMyBooks = useCallback(
  async (
    page = 1,
    keyword = "",
    category = "All",
    sort = "newest"
  ) => {
    const requestId = ++myBooksRequestId.current;

    if (user.role === "admin") {
      setMyBooks([]);
      setLoadingMyBooks(false);
      return;
    }

    try {
      setLoadingMyBooks(true);

      const response = await getMyBooks(
        page,
        5,
        keyword,
        category,
        sort
      );

      if (requestId !== myBooksRequestId.current) {
        return;
      }

      setMyBooks(response.issues);

      setMyBooksCurrentPage(
        response.currentPage
      );

      setMyBooksTotalPages(
        response.totalPages
      );

      setMyBooksTotal(
        response.total
      );
    } catch (error) {
      if (
        requestId === myBooksRequestId.current &&
        error.response?.status !== 401
      ) {
        console.error(error);
      }
    } finally {
      if (requestId === myBooksRequestId.current) {
        setLoadingMyBooks(false);
      }
    }
  },
  [user.role]
);

useEffect(() => {
  const timer = setTimeout(() => {
    void loadBooks(1);

    if (isLoggedIn && user.role === "admin") {
      void loadAdminBooks(1);
    } else if (isLoggedIn) {
      void loadMyBooks(1);
    }
  }, 0);

  return () => clearTimeout(timer);
}, [
  isLoggedIn,
  user.role,
  loadBooks,
  loadMyBooks,
  loadAdminBooks,
]);

  useEffect(() => {
    localStorage.setItem(
      "isLoggedIn",
      isLoggedIn
    );
  }, [isLoggedIn]);

  useEffect(() => {
    localStorage.setItem(
      "user",
      JSON.stringify(user)
    );
  }, [user]);

  return (
    <>
     <Navbar
  isLoggedIn={isLoggedIn}
  setIsLoggedIn={setIsLoggedIn}
  user={user}
  setUser={setUser}
/>

      <main className="flex-grow-1">

        <Routes>

          <Route
            path="/"
            element={
              <Home
                books={books}
                loadingBooks={loadingBooks}
                isLoggedIn={isLoggedIn}
             />
            }
          />

          <Route
            path="/books"
            element={
              <Books
  books={books}
  loadingBooks={loadingBooks}
  myBooks={myBooks}
  isLoggedIn={isLoggedIn}
  loadBooks={loadBooks}
  loadMyBooks={loadMyBooks}
  user={user}
  currentPage={currentPage}
  totalPages={totalPages}
  totalBooks={totalBooks}
/>
            }
          />

          <Route
            path="/books/:id"
            element={
              <BookDetails/>
            }
          />

          <Route
            path="/login"
            element={
              <Login
                setIsLoggedIn={setIsLoggedIn}
                setUser={setUser}
              />
            }
          />

          <Route
               path="/forgot-password"
               element={<ForgotPassword />}
            />

            <Route
               path="/reset-password/:token"
               element={<ResetPassword />}
            />

          <Route
            path="/register"
            element={<Register />}
          />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute
                isLoggedIn={isLoggedIn}
                user={user}
              >
                <Dashboard user={user} />
              </ProtectedRoute>
            }
          />

          <Route
  path="/change-password"
  element={
    <ProtectedRoute
      isLoggedIn={isLoggedIn}
      user={user}
    >
      <ChangePassword />
    </ProtectedRoute>
  }
/>

          <Route
  path="/mybooks"
  element={
    <ProtectedRoute
      isLoggedIn={isLoggedIn}
      user={user}
    >
      <MyBooks
        myBooks={myBooks}
        loadBooks={loadBooks}
        loadMyBooks={loadMyBooks}
        loadingMyBooks={loadingMyBooks}
        currentPage={myBooksCurrentPage}
        totalPages={myBooksTotalPages}
        totalBooks={myBooksTotal}
      />
    </ProtectedRoute>
  }
/>


          <Route
            path="/admin"
            element={
              <ProtectedRoute
                isLoggedIn={isLoggedIn}
                user={user}
                adminOnly
              >
                <Admin
  books={adminBooks}
  loadBooks={loadAdminBooks}
  loadingBooks={loadingAdminBooks}
  currentPage={adminCurrentPage}
  totalPages={adminTotalPages}
  totalBooks={adminTotalBooks}
/>
              </ProtectedRoute>
            }
          />

          <Route
            path="/issued-books"
            element={
              <ProtectedRoute
                isLoggedIn={isLoggedIn}
                user={user}
                adminOnly
              >
                <IssuedBooks />
              </ProtectedRoute>
            }
          />

          <Route
            path="*"
            element={<NotFound />}
          />

        </Routes>

      </main>

      <Footer />
    </>
  );
}

export default App;