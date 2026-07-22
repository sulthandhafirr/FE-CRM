import { useEffect, useState } from "react";
import { fetchCompanySettingsFromApi } from "../../modules/gsetup/gsetup.service";

export default function CompanyIdentity() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetchCompanySettingsFromApi().then((settings) => {
      if (settings) setData(settings);
    });
  }, []);

  const companyName = data?.companyName || "Capstone CRM";
  const logoUrl = data?.logoDataUrl || "";
  const initials = companyName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "CC";
  const timezone = data?.timezone || "Asia/Jakarta";

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
          background: logoUrl ? "transparent" : "#FFF3ED",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          overflow: "hidden",
        }}
      >
        {logoUrl ? (
          <img
            src={logoUrl}
            alt={companyName}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <span
            style={{
              fontSize: "14px",
              fontWeight: 700,
              color: "#FF8040",
              lineHeight: 1,
            }}
          >
            {initials}
          </span>
        )}
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
          Business Plan &middot; {timezone}
        </span>
      </div>
    </div>
  );
}
