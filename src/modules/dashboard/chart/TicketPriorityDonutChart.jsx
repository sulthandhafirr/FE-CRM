import { useTranslation } from "react-i18next";
import DonutChart from "./DonutChart";

const PRIORITY_ORDER = ["low", "normal", "high", "critical"];
const PRIORITY_COLORS = ["#10B981", "#3B82F6", "#F59E0B", "#EF4444"];

export default function TicketPriorityDonutChart({ ticketByPriority, loading, height }) {
  const { t } = useTranslation();

  const data = PRIORITY_ORDER.map((priority, i) => ({
    label: t(`pages.dashboard.ticketPriorityLabels.${priority}`),
    value: Number(ticketByPriority?.[priority] ?? 0),
    color: PRIORITY_COLORS[i],
  }));

  return (
    <DonutChart
      title={t("pages.dashboard.ticketPriority")}
      subtitle={t("pages.dashboard.donutSubtitle")}
      data={data}
      loading={loading}
      emptyMessage={t("pages.dashboard.noTicketPriorityData")}
      height={height}
    />
  );
}
