const SEARCHABLE_BOOK_FIELDS = [
  "title",
  "author",
  "category",
  "publisher",
  "isbn",
];

const normalizeKeyword = (keyword) =>
  typeof keyword === "string" ? keyword.trim().toLowerCase() : "";

const escapeRegex = (value) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const buildBookSearchFilter = (keyword) => {
  const normalizedKeyword = normalizeKeyword(keyword);

  if (!normalizedKeyword) {
    return {};
  }

  const searchPattern = escapeRegex(normalizedKeyword);

  return {
    $or: SEARCHABLE_BOOK_FIELDS.map((field) => ({
      [field]: {
        $regex: searchPattern,
        $options: "i",
      },
    })),
  };
};

export const matchesBookSearch = (book, keyword) => {
  const normalizedKeyword = normalizeKeyword(keyword);

  if (!normalizedKeyword) {
    return true;
  }

  return SEARCHABLE_BOOK_FIELDS.some((field) =>
    String(book?.[field] ?? "")
      .toLowerCase()
      .includes(normalizedKeyword)
  );
};
