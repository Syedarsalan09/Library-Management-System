import api from "./api";

export const getBooks = (
  page = 1,
  limit = 5,
  sort = "newest",
  keyword = "",
  category = "All"
) =>
  api.get(
    `/books?page=${page}&limit=${limit}&sort=${sort}&keyword=${encodeURIComponent(keyword)}&category=${encodeURIComponent(category)}`
  );

export const getAllBooks = () =>
  api.get("/books/all");

export const getAdminBooks = (
  page = 1,
  limit = 5,
  keyword = ""
) =>
  api.get(
    `/books/admin?page=${page}&limit=${limit}&keyword=${encodeURIComponent(keyword)}`
  );

export const getBookById = (id) =>
  api.get(`/books/${id}`);

export const getCategories = () =>
  api.get("/books/categories");

export const createBook = (bookData) =>
  api.post("/books", bookData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

export const updateBook = (id, bookData) =>
  api.put(`/books/${id}`, bookData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

export const deleteBook = (id) =>
  api.delete(`/books/${id}`);