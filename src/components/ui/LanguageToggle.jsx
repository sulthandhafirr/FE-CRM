import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { MdKeyboardArrowDown } from "react-icons/md";

export default function LanguageToggle() {
  const { t, i18n } = useTranslation();
  const selectedLanguage = (i18n.language || "en").split("-")[0];

  useEffect(() => {
    document.documentElement.lang = i18n.language || "en";
  }, [i18n.language]);

  const handleLanguageChange = (event) => {
    const lng = event.target.value;
    i18n.changeLanguage(lng);
    localStorage.setItem("language", lng);
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "flex-end",
        alignItems: "center",
        gap: "8px",
        padding: "12px 20px",
        borderBottom: "1px solid #e5e7eb",
        background: "#ffffff",
        position: "sticky",
        top: 0,
        zIndex: 50,
      }}
    >
      <span style={{ fontSize: "13px", color: "#6b7280", fontWeight: 600 }}>
        {t("common.language")}
      </span>
      <div
        style={{
          position: "relative",
          display: "inline-flex",
        }}
      >
        <select
          aria-label={t("common.language")}
          value={selectedLanguage}
          onChange={handleLanguageChange}
          style={{
            WebkitAppearance: "none",
            MozAppearance: "none",
            appearance: "none",
            cursor: "pointer",
            border: "1px solid #d1d5db",
            borderRadius: "8px",
            height: "34px",
            padding: "0 34px 0 10px",
            fontSize: "14px",
            background: "#ffffff",
            color: "#374151",
            minWidth: "120px",
          }}
        >
          <option value="en">English</option>
          <option value="id">Indonesia</option>
        </select>
        <span
          style={{
            position: "absolute",
            right: "8px",
            top: "50%",
            transform: "translateY(-50%)",
            color: "#4b5563",
            pointerEvents: "none",
          }}
        >
          <MdKeyboardArrowDown size={18} />
        </span>
      </div>
    </div>
  );
}
