import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TableSortLabel, TablePagination } from "@mui/material";
import { useTranslation } from "react-i18next";

export default function PerformanceTable({ columns = [], rows = [], orderBy, order, onSort, page, rowsPerPage, onPageChange, onRowsPerPageChange }) {
  const { t } = useTranslation();
  const start = page * rowsPerPage;
  const pageRows = rows.slice(start, start + rowsPerPage);

  return (
    <Paper elevation={0} sx={{ borderRadius: "12px", overflow: "hidden" }}>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow sx={{ borderBottom: "2px solid #f0f0f0" }}>
              {columns.map(({ id, label, sortable = true }) => (
                <TableCell key={id} sx={{ color: "#FF8040", fontWeight: 700 }}>
                  {sortable ? (
                    <TableSortLabel active={orderBy === id} direction={orderBy === id ? order : "asc"} onClick={() => onSort(id)} sx={{ color: "#FF8040 !important", fontWeight: 700 }}>
                      {label}
                    </TableSortLabel>
                  ) : label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {pageRows.map((r) => (
              <TableRow key={r.id} sx={{ borderBottom: "1px solid #f0f0f0" }}>
                {columns.map((c) => (
                  <TableCell key={c.id} sx={{ color: "#666", fontSize: "13px" }}>{r[c.id]}</TableCell>
                ))}
              </TableRow>
            ))}
            {rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={columns.length} sx={{ textAlign: "center", py: 4, color: "#999" }}>
                  {t("pages.performance.noData")}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination component="div" count={rows.length} page={page} onPageChange={(_, p) => onPageChange(p)} rowsPerPage={rowsPerPage} onRowsPerPageChange={(e) => onRowsPerPageChange(parseInt(e.target.value, 10))} rowsPerPageOptions={[5,10,25,50]} />
    </Paper>
  );
}
