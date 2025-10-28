// utils/questionTransform.ts
import katex from 'katex';

interface TransformResult {
  html: string;
  equations: Array<{latex: string, displayMode: boolean}>;
  tables: Array<{html: string, data: string[][], hasHeader: boolean, style: string}>;
}

/**
 * Transform equation tags to KaTeX HTML
 * Supports: <equation type="inline">...</equation> and <equation type="display">...</equation>
 */
export const transformEquationsToKatex = (content: string): string => {
  // Pattern untuk equation tags
  const equationPattern = /<equation\s+type="(inline|display)">(.*?)<\/equation>/gs;
  
  let transformed = content;
  let match;
  
  while ((match = equationPattern.exec(content)) !== null) {
    const [fullMatch, type, latex] = match;
    const displayMode = type === 'display';
    
    try {
      // Render dengan KaTeX
      const rendered = katex.renderToString(latex.trim(), {
        displayMode,
        throwOnError: false
      });
      
      // Buat container sesuai tipe
      const containerTag = displayMode ? 'div' : 'span';
      const className = displayMode ? 'cte-katex-equation cte-katex-block' : 'cte-katex-equation cte-katex-inline';
      
      const katexHtml = `<${containerTag} class="${className}" data-latex="${encodeURIComponent(latex.trim())}" data-display-mode="${displayMode}" data-editable="true">${rendered}</${containerTag}>`;
      
      transformed = transformed.replace(fullMatch, katexHtml);
    } catch (error) {
      console.error('Error rendering equation:', error);
      // Jika error, biarkan equation tag tetap ada
    }
  }
  
  return transformed;
};

/**
 * Transform KaTeX HTML back to equation tags
 */
export const transformKatexToEquationTags = (content: string): string => {
  const katexPattern = /<(div|span)\s+class="[^"]*cte-katex-equation[^"]*"\s+data-latex="([^"]+)"\s+data-display-mode="(true|false)"[^>]*>.*?<\/\1>/gs;
  
  let transformed = content;
  let match;
  
  while ((match = katexPattern.exec(content)) !== null) {
    const [fullMatch, , encodedLatex, displayMode] = match;
    const latex = decodeURIComponent(encodedLatex);
    const type = displayMode === 'true' ? 'display' : 'inline';
    
    const equationTag = `<equation type="${type}">${latex}</equation>`;
    transformed = transformed.replace(fullMatch, equationTag);
  }
  
  return transformed;
};

/**
 * Transform table HTML untuk export
 * Mengubah table HTML menjadi struktur yang lebih sederhana
 */
export const transformTableForExport = (content: string): string => {
  // Untuk export, kita simpan table HTML as is
  // Karena table HTML sudah cukup portable
  return content;
};

/**
 * Parse table dari HTML untuk mendapatkan data mentah
 */
export const parseTableData = (tableHtml: string): {data: string[][], hasHeader: boolean, style: string} | null => {
  if (typeof window === 'undefined') return null;
  
  const parser = new DOMParser();
  const doc = parser.parseFromString(tableHtml, 'text/html');
  const table = doc.querySelector('table');
  
  if (!table) return null;
  
  const tableRows = Array.from(table.querySelectorAll('tr'));
  const hasHeader = table.querySelector('thead') !== null;
  const data: string[][] = [];
  
  tableRows.forEach((row) => {
    const cells = Array.from(row.querySelectorAll('td, th'));
    const rowData: string[] = [];
    cells.forEach(cell => {
      // Transform equation dan clean HTML
      let cellContent = cell.innerHTML || '';
      cellContent = transformKatexToEquationTags(cellContent);
      rowData.push(cellContent);
    });
    data.push(rowData);
  });
  
  const tableClasses = table.className;
  let style = 'bordered';
  if (tableClasses.includes('cte-table-striped')) style = 'striped';
  else if (tableClasses.includes('cte-table-borderless')) style = 'borderless';
  
  return { data, hasHeader, style };
};