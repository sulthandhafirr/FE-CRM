export default function CompanyIdentity({
  companyName = "Capstone CRM",
  plan = "Business Plan",
  timezone = "Asia/Jakarta",
  initials = "CC",
  logoBg = "#FFF3ED",
  logoTextColor = "#FF8040",
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "10px",
      }}
    >
      {/* Logo Mark */}
      <div
        style={{
          width: "36px",
          height: "36px",
          borderRadius: "8px",
          background: logoBg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <span
          style={{
            fontSize: "14px",
            fontWeight: 700,
            color: logoTextColor,
            lineHeight: 1,
          }}
        >
          {initials}
        </span>
      </div>

      {/* Company Info */}
      <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.3 }}>
        <span
          style={{
            fontSize: "14px",
            fontWeight: 700,
            color: "#1F2937",
          }}
        >
          {companyName}
        </span>
        <span
          style={{
            fontSize: "11px",
            color: "#9CA3AF",
          }}
        >
          {plan} &middot; {timezone}
        </span>
      </div>
    </div>
  );
}
