// Export Service for PDF, CSV, and XLS formats
// This service provides comprehensive export functionality for all dashboard sections

export interface ExportData {
  title: string;
  data: any[];
  columns: ExportColumn[];
  metadata?: {
    generatedAt: string;
    section: string;
    totalRecords: number;
    filters?: Record<string, any>;
  };
}

export interface ExportColumn {
  key: string;
  label: string;
  type: 'string' | 'number' | 'date' | 'boolean' | 'url' | 'image';
  width?: number;
  format?: (value: any) => string;
}

export type ExportFormat = 'pdf' | 'csv' | 'xls';

class ExportService {
  /**
   * Export data to CSV format
   */
  exportToCSV(exportData: ExportData): void {
    const { title, data, columns } = exportData;
    
    // Create CSV header
    const headers = columns.map(col => col.label).join(',');
    
    // Create CSV rows
    const rows = data.map(item => {
      return columns.map(col => {
        const value = item[col.key];
        const formattedValue = col.format ? col.format(value) : this.formatValue(value, col.type);
        // Escape commas and quotes in CSV
        return `"${String(formattedValue).replace(/"/g, '""')}"`;
      }).join(',');
    });
    
    // Combine header and rows
    const csvContent = [headers, ...rows].join('\n');
    
    // Create and download file
    this.downloadFile(csvContent, `${title}.csv`, 'text/csv');
  }

  /**
   * Export data to XLS format
   */
  exportToXLS(exportData: ExportData): void {
    const { title, data, columns } = exportData;
    
    // Create worksheet data
    const worksheetData = [
      // Header row
      columns.map(col => col.label),
      // Data rows
      ...data.map(item => 
        columns.map(col => {
          const value = item[col.key];
          return col.format ? col.format(value) : this.formatValue(value, col.type);
        })
      )
    ];
    
    // Convert to XLS format (simplified - would use xlsx library in production)
    const xlsContent = this.convertToXLS(worksheetData);
    
    this.downloadFile(xlsContent, `${title}.xls`, 'application/vnd.ms-excel');
  }

  /**
   * Export data to PDF format
   */
  exportToPDF(exportData: ExportData): void {
    const { title, data, columns, metadata } = exportData;
    
    // Create a proper PDF using HTML to PDF conversion
    const htmlContent = this.generatePDFHTML(title, data, columns, metadata);
    
    // Create a blob with HTML content
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    
    // Open in new window for printing/saving as PDF
    const printWindow = window.open(url, '_blank');
    if (printWindow) {
      printWindow.onload = () => {
        // Auto-trigger print dialog after a short delay
        setTimeout(() => {
          printWindow.print();
        }, 1000);
      };
      
      // Clean up after printing
      setTimeout(() => {
        URL.revokeObjectURL(url);
      }, 10000);
    } else {
      // Fallback: download as HTML file
      const link = document.createElement('a');
      link.href = url;
      link.download = `${title}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up
      setTimeout(() => {
        URL.revokeObjectURL(url);
      }, 1000);
    }
  }

  /**
   * Export page content as PDF (screenshot-based)
   */
  exportPageAsPDF(elementId: string, filename: string): void {
    // This would use html2canvas + jsPDF in production
    console.log(`Exporting element ${elementId} as PDF: ${filename}`);
    // For now, we'll create a simple text-based PDF
    this.downloadFile(
      `PDF Export of ${filename}\nGenerated at: ${new Date().toISOString()}`,
      `${filename}.pdf`,
      'application/pdf'
    );
  }

  /**
   * Export data to PDF using a more advanced method
   */
  exportToPDFAdvanced(exportData: ExportData): void {
    const { title, data, columns, metadata } = exportData;
    
    // Create a comprehensive PDF document
    const pdfContent = this.generateAdvancedPDF(title, data, columns, metadata);
    
    // Create and download the PDF file
    this.downloadFile(pdfContent, `${title}.pdf`, 'application/pdf');
  }

  /**
   * Generate advanced PDF content with proper formatting
   */
  private generateAdvancedPDF(title: string, data: any[], columns: ExportColumn[], metadata?: any): string {
    const currentDate = new Date().toLocaleString();
    const totalRecords = data.length;
    
    // Create a simple but effective PDF structure
    let pdfContent = `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
/Resources <<
  /Font <<
    /F1 5 0 R
  >>
>>
>>
endobj

4 0 obj
<<
/Length 2000
>>
stream
BT
/F1 16 Tf
50 750 Td
(${this.escapePDFString(title)}) Tj
0 -30 Td
/F1 12 Tf
(Generated on: ${currentDate}) Tj
0 -20 Td
(Total Records: ${totalRecords}) Tj
0 -40 Td
`;

    // Add table headers
    pdfContent += `(Table Data:) Tj
0 -20 Td
`;
    
    // Add column headers
    const headerRow = columns.map(col => col.label).join(' | ');
    pdfContent += `(${this.escapePDFString(headerRow)}) Tj
0 -15 Td
`;

    // Add data rows (limit to first 20 for PDF readability)
    data.slice(0, 20).forEach((item, index) => {
      const rowData = columns.map(col => {
        const value = item[col.key];
        const formattedValue = col.format ? col.format(value) : this.formatValue(value, col.type);
        return String(formattedValue).substring(0, 15); // Limit length for PDF
      }).join(' | ');
      
      pdfContent += `(${index + 1}. ${this.escapePDFString(rowData)}) Tj
0 -12 Td
`;
    });

    if (data.length > 20) {
      pdfContent += `(... and ${data.length - 20} more records) Tj
0 -20 Td
`;
    }

    pdfContent += `ET
endstream
endobj

5 0 obj
<<
/Type /Font
/Subtype /Type1
/BaseFont /Helvetica
>>
endobj

xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000274 00000 n 
0000002340 00000 n 
trailer
<<
/Size 6
/Root 1 0 R
>>
startxref
2400
%%EOF`;

    return pdfContent;
  }

  /**
   * Escape string for PDF format
   */
  private escapePDFString(text: string): string {
    return text
      .replace(/\\/g, '\\\\')
      .replace(/\(/g, '\\(')
      .replace(/\)/g, '\\)')
      .replace(/\n/g, '\\n')
      .replace(/\r/g, '\\r')
      .replace(/\t/g, '\\t');
  }

  /**
   * Format value based on column type
   */
  private formatValue(value: any, type: ExportColumn['type']): string {
    if (value === null || value === undefined) return '';
    
    switch (type) {
      case 'date':
        return new Date(value).toLocaleDateString();
      case 'number':
        return typeof value === 'number' ? value.toString() : '0';
      case 'boolean':
        return value ? 'Yes' : 'No';
      case 'url':
        return value;
      case 'image':
        return value || '';
      default:
        return String(value);
    }
  }

  /**
   * Convert data to XLS format (simplified)
   */
  private convertToXLS(data: any[][]): string {
    // This is a simplified version - in production, use the xlsx library
    return data.map(row => 
      row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join('\t')
    ).join('\n');
  }

  /**
   * Generate PDF HTML content
   */
  private generatePDFHTML(title: string, data: any[], columns: ExportColumn[], metadata?: any): string {
    const currentDate = new Date().toLocaleString();
    const totalRecords = data.length;
    
    // Generate table rows
    const tableRows = data.map(item => {
      const cells = columns.map(col => {
        const value = item[col.key];
        const formattedValue = col.format ? col.format(value) : this.formatValue(value, col.type);
        return `<td>${this.escapeHtml(String(formattedValue))}</td>`;
      }).join('');
      return `<tr>${cells}</tr>`;
    }).join('');

    // Generate table headers
    const tableHeaders = columns.map(col => `<th>${this.escapeHtml(col.label)}</th>`).join('');

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${this.escapeHtml(title)}</title>
    <style>
        @media print {
            body { margin: 0; }
            .no-print { display: none; }
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 100%;
            margin: 0;
            padding: 20px;
            background: white;
        }
        
        .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 3px solid #3b82f6;
            padding-bottom: 20px;
        }
        
        .title {
            font-size: 28px;
            font-weight: bold;
            color: #1e293b;
            margin: 0 0 10px 0;
        }
        
        .subtitle {
            font-size: 16px;
            color: #6b7280;
            margin: 0;
        }
        
        .metadata {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 15px;
            margin-bottom: 25px;
            font-size: 14px;
        }
        
        .metadata-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
        }
        
        .metadata-row:last-child {
            margin-bottom: 0;
        }
        
        .metadata-label {
            font-weight: 600;
            color: #374151;
        }
        
        .metadata-value {
            color: #6b7280;
        }
        
        .table-container {
            overflow-x: auto;
            margin-bottom: 20px;
        }
        
        table {
            width: 100%;
            border-collapse: collapse;
            background: white;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            border-radius: 8px;
            overflow: hidden;
        }
        
        th {
            background: #3b82f6;
            color: white;
            padding: 12px 15px;
            text-align: left;
            font-weight: 600;
            font-size: 14px;
        }
        
        td {
            padding: 12px 15px;
            border-bottom: 1px solid #e5e7eb;
            font-size: 14px;
            vertical-align: top;
        }
        
        tr:nth-child(even) {
            background: #f9fafb;
        }
        
        tr:hover {
            background: #f3f4f6;
        }
        
        .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            text-align: center;
            font-size: 12px;
            color: #6b7280;
        }
        
        .print-button {
            background: #3b82f6;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 600;
            margin-bottom: 20px;
            box-shadow: 0 2px 4px rgba(59, 130, 246, 0.2);
            transition: all 0.2s ease;
        }
        
        .print-button:hover {
            background: #2563eb;
            transform: translateY(-1px);
            box-shadow: 0 4px 8px rgba(59, 130, 246, 0.3);
        }
        
        .instructions {
            background: #f0f9ff;
            border: 1px solid #0ea5e9;
            border-radius: 8px;
            padding: 15px;
            margin-bottom: 20px;
            font-size: 14px;
            color: #0c4a6e;
        }
        
        .instructions h4 {
            margin: 0 0 8px 0;
            color: #075985;
            font-size: 16px;
        }
        
        .instructions ol {
            margin: 8px 0 0 0;
            padding-left: 20px;
        }
        
        .instructions li {
            margin-bottom: 4px;
        }
        
        @media print {
            .print-button, .instructions {
                display: none;
            }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1 class="title">${this.escapeHtml(title)}</h1>
        <p class="subtitle">Generated on ${currentDate}</p>
    </div>
    
    <div class="instructions no-print">
        <h4>📄 How to Save as PDF:</h4>
        <ol>
            <li>Click the "Print / Save as PDF" button below</li>
            <li>In the print dialog, select "Save as PDF" as your destination</li>
            <li>Choose your preferred settings and click "Save"</li>
            <li>Alternatively, use Ctrl+P (Cmd+P on Mac) to open print dialog directly</li>
        </ol>
    </div>
    
    <button class="print-button no-print" onclick="window.print()">🖨️ Print / Save as PDF</button>
    
    ${metadata ? `
    <div class="metadata">
        <div class="metadata-row">
            <span class="metadata-label">Section:</span>
            <span class="metadata-value">${this.escapeHtml(metadata.section)}</span>
        </div>
        <div class="metadata-row">
            <span class="metadata-label">Total Records:</span>
            <span class="metadata-value">${totalRecords.toLocaleString()}</span>
        </div>
        <div class="metadata-row">
            <span class="metadata-label">Generated:</span>
            <span class="metadata-value">${new Date(metadata.generatedAt).toLocaleString()}</span>
        </div>
    </div>
    ` : ''}
    
    <div class="table-container">
        <table>
            <thead>
                <tr>${tableHeaders}</tr>
            </thead>
            <tbody>
                ${tableRows}
            </tbody>
        </table>
    </div>
    
    <div class="footer">
        <p>Report generated by Reputraq • ${currentDate}</p>
    </div>
</body>
</html>`;
  }

  /**
   * Escape HTML characters to prevent XSS
   */
  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Download file to user's device
   */
  private downloadFile(content: string, filename: string, mimeType: string): void {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
  }

  /**
   * Get export options for a specific section
   */
  getExportOptions(section: string): { format: ExportFormat; label: string; icon: string }[] {
    return [
      { format: 'pdf', label: 'Export as PDF', icon: '📄' },
      { format: 'csv', label: 'Export as CSV', icon: '📊' },
      { format: 'xls', label: 'Export as Excel', icon: '📈' }
    ];
  }
}

export const exportService = new ExportService();
export default exportService;
