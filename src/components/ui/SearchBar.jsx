export default function SearchBar({ placeholder = "Search...", value, onChange }) {
  return (
    <>
      <style>{`
        .search-bar-container {
          flex: 1;
          max-width: 400px;
        }
        @media (max-width: 767px) {
          .search-bar-container {
            max-width: 100%;
          }
          .search-bar-input {
            padding: 10px 14px !important;
            font-size: 13px !important;
          }
        }
      `}</style>
      <div className="search-bar-container">
        <input
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className="search-bar-input"
          style={{
            width: "100%", 
            padding: "10px 15px",
            border: "1px solid #ddd", 
            borderRadius: "8px",
            fontSize: "14px", 
            outline: "none",
          }}
        />
      </div>
    </>
  );
}
