import api from "./api";

export const issueBook = async ({ bookId }) => {
  const response = await api.post("/issues", {
    bookId,
  });

  return response.data;
};

export const returnBook = async (issueId) => {
  const response = await api.put(
    `/issues/${issueId}/return`
  );

  return response.data;
};

export const getMyBooks = async (
  page = 1,
  limit = 5,
  keyword = "",
  category = "All",
  sort = "newest"
) => {
  const response = await api.get(
    `/issues/my-books?page=${page}&limit=${limit}&keyword=${encodeURIComponent(
      keyword
    )}&category=${encodeURIComponent(
      category
    )}&sort=${sort}`
  );

  return response.data;
};

export const getAllIssues = async () => {
  const response = await api.get("/issues");

  return response.data;
};