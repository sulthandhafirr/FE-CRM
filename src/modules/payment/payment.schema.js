export const getPaymentStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case "paid":
      return "#16A34A"; // Green
    case "pending":
      return "#F59E0B"; // Orange
    case "failed":
      return "#DC2626"; // Red
    default:
      return "#6B7280"; // Gray
  }
};

export const formatCurrency = (amount) => {
  if (amount == null) return "-";

  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatPaymentDate = (date) => {
  if (!date) return "-";

  return new Date(date).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const isPaymentOverdue = (payment) => {
  if (!payment?.dueDate) return false;

  if (payment.status !== "pending") return false;

  return new Date(payment.dueDate) < new Date();
};

export const formatPaymentStatus = (status) => {
  if (!status) return "-";

  return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
};