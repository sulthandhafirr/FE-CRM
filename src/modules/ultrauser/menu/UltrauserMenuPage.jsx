import UltrauserMenuCard from "./UltrauserMenuCard";
import { ROUTE } from "../../../app/routes";

const MENU_ITEMS = [
  {
    title: "User Management",
    description: "Manage all CRM users view, create, edit, and delete accounts.",
    link: ROUTE.ultrauserUsers,
  },
  {
    title: "Company Management",
    description: "View and manage company data registered in the CRM system.",
    link: ROUTE.ultrauserCompany,
  },
  {
    title: "System Overview",
    description: "Masih OTW fiturnya, gw masih mager.",
    link: ROUTE.ultrauserMenu,
  },
];

export default function UltrauserMenuPage() {
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
