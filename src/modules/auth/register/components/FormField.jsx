export default function FormField({ label, ...inputProps }) {
  return (
    <label
      style={{
        display: "block",
        marginBottom: 14,
        color: "#374151",
        fontSize: 14,
        fontWeight: 600,
      }}
    >
      {label}
      <input
        {...inputProps}
        required
        style={{
          width: "100%",
          boxSizing: "border-box",
          marginTop: 7,
          padding: "10px 12px",
          border: "1px solid #d1d5db",
          borderRadius: 4,
          background: "#f9fafb",
          color: "#111827",
        }}
      />
    </label>
  );
}
