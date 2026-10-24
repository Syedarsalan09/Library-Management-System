import api from "./api";

export const sendReminderEmails = async () => {
  const response = await api.post(
    "/reminders/send"
  );

  return response.data;
};