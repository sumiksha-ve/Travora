/**
 * Utility to export tabular data to CSV format and trigger browser download.
 */
export function exportToCsv(filename: string, headers: string[], rows: (string | number | boolean | null | undefined)[][]) {
  const sanitize = (value: unknown): string => {
    if (value === null || value === undefined) return '""';
    const stringVal = String(value);
    if (stringVal.includes('"') || stringVal.includes(',') || stringVal.includes('\n')) {
      return `"${stringVal.replace(/"/g, '""')}"`;
    }
    return `"${stringVal}"`;
  };

  const headerRow = headers.map(sanitize).join(",");
  const dataRows = rows.map((row) => row.map(sanitize).join(","));
  const csvContent = [headerRow, ...dataRows].join("\r\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
