// utils/exportUtils.ts

import { ColumnConfig } from '../types/report';

// Export to Excel (basic CSV format for simplicity)
export const exportToExcel = (
  data: any[], 
  columns: ColumnConfig[], 
  visibleColumns: string[], 
  filename: string = 'export'
) => {
  console.log('Exporting to Excel:', { dataLength: data.length, filename });
  
  const filteredColumns = columns.filter(col => visibleColumns.includes(col.key));
  
  // Create CSV content (simpler than real Excel format)
  const headers = filteredColumns.map(col => col.label).join(',');
  const rows = data.map(row => {
    return filteredColumns.map(col => {
      let value = row[col.key];
      
      // Basic formatting
      if (value == null) return '';
      if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
        value = `"${value.replace(/"/g, '""')}"`;
      }
      
      return value;
    }).join(',');
  });
  
  const csvContent = [headers, ...rows].join('\n');
  downloadFile(csvContent, `${filename}.csv`, 'text/csv');
};

// Export to PDF (simplified text format)
export const exportToPDF = (
  data: any[], 
  columns: ColumnConfig[], 
  visibleColumns: string[], 
  filename: string = 'export'
) => {
  console.log('Exporting to PDF:', { dataLength: data.length, filename });
  
  const filteredColumns = columns.filter(col => visibleColumns.includes(col.key));
  
  let content = `Report: ${filename}\n`;
  content += `Generated: ${new Date().toLocaleDateString('id-ID')}\n`;
  content += `Total Records: ${data.length}\n\n`;
  
  // Add headers
  content += filteredColumns.map(col => col.label).join('\t') + '\n';
  content += filteredColumns.map(() => '---').join('\t') + '\n';
  
  // Add data
  data.forEach(row => {
    const rowData = filteredColumns.map(col => {
      let value = row[col.key];
      if (value == null) return '-';
      return String(value).replace(/\t/g, ' ').replace(/\n/g, ' ');
    });
    content += rowData.join('\t') + '\n';
  });
  
  downloadFile(content, `${filename}.txt`, 'text/plain');
};

// Export to CSV
export const exportToCSV = (
  data: any[], 
  columns: ColumnConfig[], 
  visibleColumns: string[], 
  filename: string = 'export'
) => {
  console.log('Exporting to CSV:', { dataLength: data.length, filename });
  
  const filteredColumns = columns.filter(col => visibleColumns.includes(col.key));
  
  // Create CSV header
  const headers = filteredColumns.map(col => col.label).join(',');
  
  // Create CSV rows
  const rows = data.map(row => {
    return filteredColumns.map(col => {
      let value = row[col.key];
      
      if (value == null) return '';
      
      // Handle different data types
      if (typeof value === 'boolean') {
        value = value ? 'Ya' : 'Tidak';
      } else if (value instanceof Date) {
        value = value.toLocaleDateString('id-ID');
      } else if (typeof value === 'object') {
        value = JSON.stringify(value);
      }
      
      // Escape quotes and commas for CSV
      if (typeof value === 'string') {
        if (value.includes(',') || value.includes('"') || value.includes('\n')) {
          value = `"${value.replace(/"/g, '""')}"`;
        }
      }
      
      return value;
    }).join(',');
  });
  
  const csvContent = [headers, ...rows].join('\n');
  downloadFile(csvContent, `${filename}.csv`, 'text/csv');
};

// Helper function to download file
const downloadFile = (content: string, filename: string, mimeType: string) => {
  try {
    const blob = new Blob([content], { type: mimeType });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    console.log('File downloaded successfully:', filename);
  } catch (error) {
    console.error('Error downloading file:', error);
    alert('Gagal mengunduh file');
  }
};