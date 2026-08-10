import UltrauserMenuCard from "./UltrauserMenuCard";
import { useTranslation } from "react-i18next";
import { ROUTE } from "../../../app/routes";

export default function UltrauserMenuPage() {
  const { t } = useTranslation();

  const MENU_ITEMS = [
    {
      title: t("pages.ultrauserMenu.userManagement.title"),
      description: t("pages.ultrauserMenu.userManagement.description"),
      link: ROUTE.ultrauserUsers,
    },
    {
      title: t("pages.ultrauserMenu.companyManagement.title"),
      description: t("pages.ultrauserMenu.companyManagement.description"),
      link: ROUTE.ultrauserCompany,
    },
    {
      title: t("pages.ultrauserMenu.systemOverview.title"),
      description: t("pages.ultrauserMenu.systemOverview.description"),
      link: ROUTE.ultrauserMenu,
    },
  ];

  return (
    <div
      style={{
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        minHeight: "100vh",
        background: "#f9fafb",
      }}
    >
      {/* Cards Grid */}
      <div style={{ padding: "40px" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: "24px",
          }}
        >
          {MENU_ITEMS.map((item) => (
            <UltrauserMenuCard
              key={item.title}
              title={item.title}
              description={item.description}
              link={item.link}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
