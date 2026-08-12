export default function PlanCard({ item, prices, selected, onSelect }) {
  return (
    <label style={cardStyle(selected, item.featured)}>
      <input
        type="radio"
        name="plan"
        checked={selected}
        onChange={onSelect}
        style={hiddenRadioStyle}
      />

      {item.featured && <span style={ribbonStyle}>Most popular</span>}
      {selected && <span style={checkmarkStyle}>✓</span>}

      <span style={nameStyle}>{item.name}</span>

      <div style={priceRowStyle}>
        <span style={priceStyle}>{item.price(prices)}</span>
        <span style={periodStyle}>{item.period(prices)}</span>
      </div>

      {item.badge(prices) && (
        <span style={badgeStyle}>{item.badge(prices)}</span>
      )}

      <div style={dividerStyle} />

      <ul style={listStyle}>
        {item.benefits.map((benefit) => (
          <li key={benefit} style={benefitStyle}>
            <span style={checkStyle}>✓</span>
            {benefit}
          </li>
        ))}
      </ul>
    </label>
  );
}

const cardStyle = (selected, featured) => ({
  position: "relative",
  boxSizing: "border-box",
  display: "flex",
  flexDirection: "column",
  gap: 8,
  padding: "26px 22px 22px",
  border: `1px solid ${selected ? "#FF8040" : "#e5e7eb"}`,
  borderWidth: featured || selected ? 2 : 1,
  borderRadius: 14,
  background: selected ? "#fff8f3" : "white",
  cursor: "pointer",
  minHeight: 360,
  boxShadow: selected
    ? "0 8px 24px rgba(255,128,64,.12)"
    : "0 2px 8px rgba(15,23,42,.04)",
});

const hiddenRadioStyle = {
  position: "absolute",
  opacity: 0,
  width: 0,
  height: 0,
};

const ribbonStyle = {
  position: "absolute",
  top: -12,
  left: "50%",
  transform: "translateX(-50%)",
  background: "#FF8040",
  color: "white",
  fontSize: 10.5,
  fontWeight: 700,
  letterSpacing: "0.06em",
  textTransform: "uppercase",
  padding: "4px 12px",
  borderRadius: 999,
  whiteSpace: "nowrap",
  boxShadow: "0 4px 12px rgba(255,128,64,.35)",
};

const checkmarkStyle = {
  position: "absolute",
  top: 10,
  right: 10,
  color: "#FF8040",
  fontWeight: 700,
  fontSize: 15,
  lineHeight: 1,
};

const nameStyle = {
  fontSize: 12,
  fontWeight: 700,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  color: "#6b7280",
};

const priceRowStyle = {
  display: "flex",
  alignItems: "baseline",
  gap: 5,
};

const priceStyle = { fontSize: 24, fontWeight: 800, color: "#132440" };

const periodStyle = { fontSize: 12, color: "#6b7280" };

const badgeStyle = {
  fontSize: 11,
  fontWeight: 700,
  color: "#047857",
  background: "#d1fae5",
  padding: "2px 9px",
  borderRadius: 999,
  alignSelf: "flex-start",
};

const dividerStyle = {
  borderTop: "1px solid #eef2f7",
  margin: "4px 0 8px",
};

const listStyle = {
  margin: 0,
  padding: 0,
  listStyle: "none",
  display: "flex",
  flexDirection: "column",
  gap: 8,
  flex: 1,
};

const benefitStyle = {
  display: "flex",
  gap: 8,
  alignItems: "flex-start",
  fontSize: 12,
  color: "#4b5563",
  lineHeight: 1.4,
};

const checkStyle = {
  color: "#FF8040",
  fontWeight: 700,
  lineHeight: "17px",
};
