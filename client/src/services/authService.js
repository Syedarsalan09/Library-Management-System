import api from "./api";

export const login = (data) => {
  return api.post("/auth/login", data);
};

export const register = (data) => {
  return api.post("/auth/register", data);
};

export const forgotPassword = (email) => {
  return api.post("/auth/forgot-password", {
    email,
  });
};

export const resetPassword = (
  token,
  data
) => {
  return api.post(
    `/auth/reset-password/${token}`,
    data
  );
};

export const changePassword = (data) => {
  return api.put("/auth/change-password", data);
};