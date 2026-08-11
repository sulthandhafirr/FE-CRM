import { MdStar } from "react-icons/md";

export default function RatingCell({ rating, onRateNow }) {
  if (rating == null) {
    if (onRateNow) {
      return (
        <button
          type="button"
          onClick={onRateNow}
          style={{
            background: "none",
            border: "none",
            padding: 0,
            cursor: "pointer",
            color: "#FF8040",
            fontWeight: 600,
            fontSize: "11px", // lebih kecil dari tampilan bintang (13px)
            textDecoration: "underline",
          }}
        >
          Rate now!
        </button>
      );
    }
    return <span style={{ color: "#9CA3AF", fontSize: "13px" }}>-</span>;
  }
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "4px",
        color: "#FF8040",
        fontWeight: 600,
        fontSize: "13px",
      }}
    >
      <MdStar size={15} />
      {rating.toFixed ? rating.toFixed(1) : rating}
    </span>
  );
}