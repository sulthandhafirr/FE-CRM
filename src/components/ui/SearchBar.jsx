export default function SearchBar({ placeholder = "Search...", value, onChange }) {
  return (
    <div style={{ flex: 1, maxWidth: "400px" }}>
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        style={{
          width: "100%", padding: "10px 15px",
          border: "1px solid #ddd", borderRadius: "8px",
          fontSize: "14px", outline: "none",
        }}
      />
    </div>
  );
}
