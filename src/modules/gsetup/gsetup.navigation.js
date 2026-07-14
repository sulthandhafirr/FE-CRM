import { MdBolt, MdBusiness, MdChecklist, MdGavel, MdGroup, MdPsychology } from "react-icons/md";
import { ROUTE } from "../../app/routes";

export const GENERAL_SETUP_MODULES = [
  {
    key: "intentManagement",
    badge: "AI",
    title: "Intent Management",
    description: "Manage labels, descriptions, priorities, and manual override controls for ticket intents.",
    icon: MdPsychology,
    accentBg: "#fff4ee",
    to: ROUTE.adminGeneralSetupIntents,
  },
  {
    key: "urgencyManagement",
    badge: "Urgency",
    title: "Urgency Management",
    description: "Control AI urgency thresholds, sentiment boost, keyword boost, and intent mapping.",
    icon: MdBolt,
    accentBg: "#fef3c7",
    to: ROUTE.adminGeneralSetupUrgency,
  },
  {
    key: "ticketStatus",
    badge: "Workflow",
    title: "Ticket Status",
    description: "Edit statuses, colors, reopen behavior, and auto-close policy for ticket flow.",
    icon: MdChecklist,
    accentBg: "#dbeafe",
    to: ROUTE.adminGeneralSetupTicketStatus,
  },
  {
    key: "slaRules",
    badge: "SLA",
    title: "SLA Rules",
    description: "Set first response and resolution targets per priority and SLA notifications.",
    icon: MdGavel,
    accentBg: "#ede9fe",
    to: ROUTE.adminGeneralSetupSla,
  },
  {
    key: "roleManagement",
    badge: "Access",
    title: "Role Management",
    description: "Create roles and manage permissions for ticket, AI, administration, and reports.",
    icon: MdGroup,
    accentBg: "#dcfce7",
    to: ROUTE.adminGeneralSetupRoles,
  },
  {
    key: "companySettings",
    badge: "Org",
    title: "Company Settings",
    description: "Configure company profile, locale defaults, working days, and ticket numbering.",
    icon: MdBusiness,
    accentBg: "#cffafe",
    to: ROUTE.adminGeneralSetupCompany,
  },
];
