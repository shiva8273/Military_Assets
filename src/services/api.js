import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http:127.0.0.1:8000";

const api = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 15000,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const data = error?.response?.data;

    let message = "An unexpected error occurred. Please try again.";

    if (!error.response) {
      message =
        "Unable to connect to the server. Please check the API is running.";
    } else if (status === 400) {
      if (data && typeof data === "object") {
        const msgs = Object.entries(data)
          .map(
            ([field, errs]) =>
              `${field}: ${Array.isArray(errs) ? errs.join(", ") : errs}`,
          )
          .join(" | ");

        message = msgs || "Invalid data submitted.";
      } else {
        message = data?.detail || "Invalid data submitted.";
      }
    } else if (status === 401) {
      message = "Your session has expired. Please log in again.";
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    } else if (status === 403) {
      message = "You do not have permission to perform this action.";
    } else if (status === 404) {
      message = "The requested resource was not found.";
    } else if (status === 409) {
      message = data?.detail || "A conflict occurred with the current state.";
    } else if (status >= 500) {
      message = "A server error occurred. Please try again later.";
    }

    error.friendlyMessage = message;
    return Promise.reject(error);
  },
);

export const loginUser = (credentials) => api.post("/api/login/", credentials);

export const getUsers = (params) => api.get("/api/users/", { params });
export const createUser = (data) => api.post("/api/users/", data);
export const updateUser = (id, data) => api.patch(`/api/users/${id}/`, data);
export const deleteUser = (id) => api.delete(`/api/users/${id}/`);

export const getBases = (params) => api.get("/api/bases/", { params });
export const createBase = (data) => api.post("/api/bases/", data);
export const updateBase = (id, data) => api.patch(`/api/bases/${id}/`, data);

export const getEquipmentTypes = (params) =>
  api.get("/api/eq_type/", { params });
export const createEquipmentType = (data) => api.post("/api/eq_type/", data);
export const updateEquipmentType = (id, data) =>
  api.patch(`/api/eq_type/${id}/`, data);

export const getOpeningBalances = (params) =>
  api.get("/api/opening-balances/", { params });
export const createOpeningBalance = (data) =>
  api.post("/api/opening-balances/", data);

export const getPurchases = (params) => api.get("/api/purchases/", { params });
export const createPurchase = (data) => api.post("/api/purchases/", data);

export const getTransfers = (params) => api.get("/api/transfers/", { params });
export const createTransfer = (data) => api.post("/api/transfers/", data);

export const getAssignments = (params) =>
  api.get("/api/assignments/", { params });
export const createAssignment = (data) => api.post("/api/assignments/", data);

export const getExpenditures = (params) =>
  api.get("/api/expenditures/", { params });
export const createExpenditure = (data) => api.post("/api/expenditures/", data);

export const getInventory = (params) => api.get("/api/inventory/", { params });

export const getDashboardSummary = (params) =>
  api.get("/api/dashboard/summary/", { params });

export const getAuditLogs = (params) => api.get("/api/audit-logs/", { params });

export default api;
