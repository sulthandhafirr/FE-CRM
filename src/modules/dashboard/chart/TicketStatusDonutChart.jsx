import { useTranslation } from "react-i18next";
import DonutChart from "./DonutChart";

const STATUS_ORDER = ["solved", "progress", "waiting"];
const STATUS_COLORS = ["#2E7D32", "#FF9800", "#42A5F5"];

export default function TicketStatusDonutChart({ ticketByStatus, loading, height, onSliceClick }) {
  const { t } = useTranslation();

  const data = STATUS_ORDER.map((status, i) => ({
    key: status,
    label: t(`pages.dashboard.ticketStatusLabels.${status}`),
    value: Number(ticketByStatus?.[status] ?? 0),
    color: STATUS_COLORS[i],
  }));

  return (
    <DonutChart
      title={t("pages.dashboard.ticketByStatus")}
      subtitle={t("pages.dashboard.donutSubtitle")}
      data={data}
      loading={loading}
      emptyMessage={t("pages.dashboard.noTicketStatusData")}
      height={height}
      onSliceClick={onSliceClick}
    />
  );
}