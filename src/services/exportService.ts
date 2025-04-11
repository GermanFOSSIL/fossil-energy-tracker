
import { jsPDF } from "jspdf";
import * as XLSX from "xlsx";
import { Project } from "@/types/project";
import { System } from "@/types/system";
import { Subsystem } from "@/types/subsystem";
import { ITR } from "@/types/itr";
import { TestPack, Tag } from "@/types/testPack";
import { logDatabaseActivity } from "@/services/logService";
import i18next from "i18next";

// Helper function to convert object data to table rows
function objectToArray(obj: any): any[] {
  return Object.entries(obj).map(([key, value]) => {
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      return { key: key, value: JSON.stringify(value) };
    }
    return { key: key, value: String(value) };
  });
}

// Helper function to translate field names
function translateField(fieldName: string, entityType: string): string {
  const fieldMappings: Record<string, Record<string, string>> = {
    projects: {
      id: 'ID',
      name: i18next.t('projects.name'),
      location: i18next.t('projects.location'),
      start_date: i18next.t('projects.startDate'),
      end_date: i18next.t('projects.endDate'),
      status: i18next.t('projects.status'),
      progress: i18next.t('projects.progress'),
      created_at: i18next.t('common.create') + ' ' + i18next.t('exports.generatedOn'),
      updated_at: i18next.t('common.edit') + ' ' + i18next.t('exports.generatedOn')
    },
    itrs: {
      id: 'ID',
      name: i18next.t('itrs.name'),
      subsystem_id: i18next.t('itrs.subsystem'),
      status: i18next.t('itrs.status'),
      progress: i18next.t('itrs.progress'),
      quantity: i18next.t('itrs.quantity'),
      start_date: i18next.t('itrs.startDate'),
      end_date: i18next.t('itrs.endDate'),
      assigned_to: i18next.t('itrs.assignedTo')
    },
    systems: {
      id: 'ID',
      name: i18next.t('systems.name'),
      project_id: i18next.t('systems.project'),
      start_date: i18next.t('systems.startDate'),
      end_date: i18next.t('systems.endDate'),
      completion_rate: i18next.t('systems.completionRate')
    },
    subsystems: {
      id: 'ID',
      name: i18next.t('subsystems.name'),
      system_id: i18next.t('subsystems.system'),
      start_date: i18next.t('subsystems.startDate'),
      end_date: i18next.t('subsystems.endDate'),
      completion_rate: i18next.t('subsystems.completionRate')
    },
    testpacks: {
      id: 'ID',
      nombre_paquete: i18next.t('testPacks.name'),
      sistema: i18next.t('testPacks.system'),
      subsistema: i18next.t('testPacks.subsystem'),
      estado: i18next.t('testPacks.status'),
      itr_asociado: i18next.t('testPacks.associatedItr')
    },
    users: {
      id: 'ID',
      full_name: i18next.t('users.name'),
      email: i18next.t('users.email'),
      role: i18next.t('users.role')
    }
  };

  return fieldMappings[entityType]?.[fieldName] || fieldName;
}

// Helper function to translate column headers for exports
function translateColumns<T>(columns: { field: keyof T, header: string }[], entityType: string): { field: keyof T, header: string }[] {
  return columns.map(column => ({
    field: column.field,
    header: translateField(column.field as string, entityType)
  }));
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
  const exportDate = new Date().toLocaleString(i18next.language === 'es' ? 'es-ES' : 'en-US');
  doc.text(`${i18next.t('exports.generatedOn')}: ${exportDate}`, margin, 27);
  doc.setLineWidth(0.5);
  doc.line(margin, 30, pageWidth - margin, 30);
  
  let y = 40;
  const rowHeight = 7;
  const colWidth = usableWidth / (columns?.length || 2);
  
  // Add header row
  doc.setFont("helvetica", "bold");
  if (columns) {
    // Translate column headers
    const translatedColumns = translateColumns(columns, entityType);
    translatedColumns.forEach((column, index) => {
      doc.text(String(column.header), margin + index * colWidth, y);
    });
  } else {
    doc.text(i18next.t('common.name'), margin, y);
    doc.text(i18next.t('common.value'), margin + colWidth, y);
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
        const translatedKey = translateField(row.key, entityType);
        doc.text(translatedKey, margin, y);
        
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
  
  // Add page numbers
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.text(
      `${i18next.t('exports.page')} ${i} ${i18next.t('exports.of')} ${pageCount}`, 
      pageWidth - margin, 
      doc.internal.pageSize.getHeight() - 10
    );
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
  
  // Translate field names for Excel headers
  const translatedData = data.map(item => {
    const translatedItem: Record<string, any> = {};
    for (const key in item) {
      if (Object.prototype.hasOwnProperty.call(item, key)) {
        const translatedKey = translateField(key, entityType);
        translatedItem[translatedKey] = (item as any)[key];
      }
    }
    return translatedItem;
  });
  
  // Convert data to worksheet
  const ws = XLSX.utils.json_to_sheet(translatedData);
  
  // Add the worksheet to the workbook
  XLSX.utils.book_append_sheet(wb, ws, worksheetName || i18next.t('exports.title'));
  
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
