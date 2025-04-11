import { jsPDF } from "jspdf";
import * as XLSX from "xlsx";
import { Project } from "@/types/project";
import { System } from "@/types/system";
import { Subsystem } from "@/types/subsystem";
import { ITR } from "@/types/itr";
import { TestPack, Tag } from "@/types/testPack";
import { logDatabaseActivity } from "@/services/logService";

// Helper function to convert object data to table rows
function objectToArray(obj: any): any[] {
  return Object.entries(obj).map(([key, value]) => {
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      return { key: key, value: JSON.stringify(value) };
    }
    return { key: key, value: String(value) };
  });
}

export async function exportToPdf<T>(
  data: T[],
  title: string,
  entityType: string,
  columns?: { field: keyof T, header: string }[]
): Promise<Blob> {
  // Create a new PDF document
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 10;
  const usableWidth = pageWidth - 2 * margin;
  
  // Add title
  doc.setFontSize(16);
  doc.text(title, margin, 20);
  doc.setFontSize(10);
  
  // Add date of export
  const exportDate = new Date().toLocaleString();
  doc.text(`Exported: ${exportDate}`, margin, 27);
  doc.setLineWidth(0.5);
  doc.line(margin, 30, pageWidth - margin, 30);
  
  let y = 40;
  const rowHeight = 7;
  const colWidth = usableWidth / (columns?.length || 2);
  
  // Add header row
  doc.setFont("helvetica", "bold");
  if (columns) {
    columns.forEach((column, index) => {
      doc.text(String(column.header), margin + index * colWidth, y);
    });
  } else {
    doc.text("Property", margin, y);
    doc.text("Value", margin + colWidth, y);
  }
  doc.setFont("helvetica", "normal");
  y += rowHeight;
  
  // Add data rows
  for (const item of data) {
    if (columns) {
      // If columns are specified, use them to format the data
      columns.forEach((column, index) => {
        const value = item[column.field];
        doc.text(String(value === null || value === undefined ? "" : value), 
          margin + index * colWidth, y);
      });
      y += rowHeight;
      
      // Check if we need a new page
      if (y > doc.internal.pageSize.getHeight() - 20) {
        doc.addPage();
        y = 20;
      }
    } else {
      // Otherwise display object properties
      const rows = objectToArray(item);
      for (const row of rows) {
        doc.text(row.key, margin, y);
        
        // Handle long text with wrapping
        const textLines = doc.splitTextToSize(row.value, colWidth - 5);
        doc.text(textLines, margin + colWidth, y);
        
        y += rowHeight * Math.max(1, textLines.length);
        
        // Check if we need a new page
        if (y > doc.internal.pageSize.getHeight() - 20) {
          doc.addPage();
          y = 20;
        }
      }
      
      // Add spacing between items
      y += rowHeight;
      doc.setDrawColor(200, 200, 200);
      doc.line(margin, y - 3, pageWidth - margin, y - 3);
      
      // Check if we need a new page
      if (y > doc.internal.pageSize.getHeight() - 20) {
        doc.addPage();
        y = 20;
      }
    }
  }
  
  // Log the export activity
  await logDatabaseActivity(
    'EXPORT_PDF',
    entityType,
    'bulk',
    { count: data.length, title }
  );
  
  // Return the PDF as a blob
  return doc.output("blob");
}

export async function exportToExcel<T>(
  data: T[],
  filename: string,
  entityType: string,
  worksheetName?: string
): Promise<Blob> {
  // Create a new workbook
  const wb = XLSX.utils.book_new();
  
  // Convert data to worksheet
  const ws = XLSX.utils.json_to_sheet(data);
  
  // Add the worksheet to the workbook
  XLSX.utils.book_append_sheet(wb, ws, worksheetName || "Data");
  
  // Write the workbook to a buffer
  const wbout = XLSX.write(wb, { type: "array", bookType: "xlsx" });
  
  // Log the export activity
  await logDatabaseActivity(
    'EXPORT_EXCEL',
    entityType,
    'bulk',
    { count: data.length, filename }
  );
  
  // Return the Excel file as a blob
  return new Blob([wbout], { type: "application/octet-stream" });
}

export function downloadBlob(blob: Blob, filename: string): void {
  // Create a URL for the blob
  const url = URL.createObjectURL(blob);
  
  // Create a download link
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  
  // Trigger the download
  a.click();
  
  // Clean up
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 0);
}
