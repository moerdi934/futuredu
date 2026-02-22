/**
 * SuperEditor Content Parser Utilities
 * 
 * This module provides comprehensive parsing utilities to convert SuperEditor
 * custom tags into rendered HTML. These utilities can be reused across any
 * feature that needs to import or process SuperEditor content.
 * 
 * @module contentParser
 */

import katex from 'katex';

/**
 * Parse Equation tags (both inline and display modes) and render using KaTeX
 * 
 * Supports:
 * - <Equation type="inline">LaTeX</Equation>
 * - <Equation type="display">LaTeX</Equation>
 * - Legacy <equation>LaTeX</equation> format (backward compatible)
 * - Multiline LaTeX with \\ line breaks
 * 
 * @param content - HTML string containing Equation tags
 * @returns HTML string with equations rendered using KaTeX
 */
export function parseEquationTags(content: string): string {
  if (!content) return content;
  
  console.log('🧮 Starting equation parsing...');
  let equationCount = 0;
  
  // Parse new format: <Equation type="inline|display">...</Equation>
  const newFormatRegex = /<Equation\s+type=["']?(inline|display)["']?\s*>([\s\S]*?)<\/Equation>/gi;
  content = content.replace(newFormatRegex, (match, type, latex) => {
    equationCount++;
    const cleanLatex = latex.trim();
    const hasLineBreaks = cleanLatex.includes('\\\\');
    
    console.log(`  📐 Parsing Equation ${equationCount}: type="${type}", latex="${cleanLatex.substring(0, 50)}${cleanLatex.length > 50 ? '...' : ''}", hasLineBreaks=${hasLineBreaks}`);
    
    try {
      const displayMode = type === 'display';
      const rendered = katex.renderToString(cleanLatex, {
        displayMode,
        throwOnError: false,
        trust: true
      });
      
      const containerTag = displayMode ? 'div' : 'span';
      return `<${containerTag} class="cte-katex-equation ${displayMode ? 'cte-katex-block' : 'cte-katex-inline'}" data-latex="${encodeURIComponent(cleanLatex)}" data-display-mode="${displayMode}" data-editable="true">${rendered}</${containerTag}>`;
    } catch (error) {
      console.error(`  ❌ KaTeX error on Equation ${equationCount}:`, error);
      return match;
    }
  });
  
  // Parse old format: <equation>...</equation> (backward compatible)
  const oldFormatRegex = /<equation>([\s\S]*?)<\/equation>/gi;
  content = content.replace(oldFormatRegex, (match, latex) => {
    equationCount++;
    const cleanLatex = latex.trim();
    
    console.log(`  📐 Parsing legacy equation ${equationCount}: latex="${cleanLatex.substring(0, 50)}${cleanLatex.length > 50 ? '...' : ''}"`);
    
    try {
      const rendered = katex.renderToString(cleanLatex, {
        displayMode: false,
        throwOnError: false,
        trust: true
      });
      return `<span class="cte-katex-equation cte-katex-inline" data-latex="${encodeURIComponent(cleanLatex)}" data-display-mode="false" data-editable="true">${rendered}</span>`;
    } catch (error) {
      console.error(`  ❌ KaTeX error on legacy equation ${equationCount}:`, error);
      return match;
    }
  });
  
  console.log(`✅ Equation parsing complete: ${equationCount} equations processed`);
  return content;
}

/**
 * Parse Table tags with Row and Cell components
 * 
 * Supports:
 * - <Table style="bordered|striped|borderless" hasHeader="true|false">
 * - <Row> and <Cell> components
 * - Automatic header detection
 * 
 * @param content - HTML string containing Table tags
 * @returns HTML string with tables rendered as HTML tables
 */
export function parseTableMarkup(content: string): string {
  if (!content) return content;
  
  console.log('📊 Starting table parsing...');
  let tableCount = 0;
  
  const tableRegex = /<Table\s+style=["']?(\w+)["']?\s+hasHeader=["']?(true|false)["']?\s*>([\s\S]*?)<\/Table>/gi;
  
  content = content.replace(tableRegex, (match, style, hasHeaderStr, tableContent) => {
    tableCount++;
    const hasHeader = hasHeaderStr === 'true';
    
    console.log(`  📋 Parsing Table ${tableCount}: style="${style}", hasHeader=${hasHeader}`);
    
    // Parse rows
    const rowRegex = /<Row>([\s\S]*?)<\/Row>/gi;
    const rows: string[] = [];
    let rowMatch;
    let rowCount = 0;
    
    while ((rowMatch = rowRegex.exec(tableContent)) !== null) {
      rowCount++;
      const rowContent = rowMatch[1];
      
      // Parse cells
      const cellRegex = /<Cell>([\s\S]*?)<\/Cell>/gi;
      const cells: string[] = [];
      let cellMatch;
      
      while ((cellMatch = cellRegex.exec(rowContent)) !== null) {
        cells.push(cellMatch[1].trim());
      }
      
      // Create row HTML
      const isFirstRow = rows.length === 0 && hasHeader;
      const cellTag = isFirstRow ? 'th' : 'td';
      const cellsHtml = cells.map(cell => `<${cellTag}>${cell}</${cellTag}>`).join('');
      rows.push(`<tr>${cellsHtml}</tr>`);
    }
    
    console.log(`    ✓ Parsed ${rowCount} rows`);
    
    // Determine table classes based on style
    let tableClass = 'cte-table';
    if (style === 'bordered') {
      tableClass += ' cte-table-bordered';
    } else if (style === 'striped') {
      tableClass += ' cte-table-striped';
    } else if (style === 'borderless') {
      tableClass += ' cte-table-borderless';
    }
    
    return `<table class="${tableClass}">${rows.join('')}</table>`;
  });
  
  console.log(`✅ Table parsing complete: ${tableCount} tables processed`);
  return content;
}

/**
 * Parse all SuperEditor custom tags (Heading, KeyConcept, StyledList, CardGrid, CodeBlock)
 * 
 * @param content - HTML string containing custom tags
 * @returns HTML string with custom tags rendered
 */
export function parseCustomTags(content: string): string {
  if (!content) return content;
  
  console.log('📑 Starting custom tags parsing...');
  
  const tagCounts = {
    heading: 0,
    keyConcept: 0,
    styledList: 0,
    cardGrid: 0,
    codeBlock: 0
  };
  
  // 1. Parse Heading tags
  const headingRegex = /<Heading\s+kind=["']?(\d)["']?\s*>([\s\S]*?)<\/Heading>/gi;
  content = content.replace(headingRegex, (match, level, headingContent) => {
    tagCounts.heading++;
    console.log(`  📑 Parsing Heading ${tagCounts.heading}: level ${level}`);
    return `<h${level} class="cte-heading cte-heading-${level}">${headingContent.trim()}</h${level}>`;
  });
  
  // 2. Parse KeyConcept tags
  const keyConceptRegex = /<KeyConcept\s+style=["']?(\w+)["']?\s*>([\s\S]*?)<\/KeyConcept>/gi;
  content = content.replace(keyConceptRegex, (match, style, keyContent) => {
    tagCounts.keyConcept++;
    console.log(`  💡 Parsing KeyConcept ${tagCounts.keyConcept}: style="${style}"`);
    return `<div class="cte-key-concept-block cte-key-concept-${style}">${keyContent.trim()}</div>`;
  });
  
  // 3. Parse StyledList with ListItem
  const styledListRegex = /<StyledList>([\s\S]*?)<\/StyledList>/gi;
  content = content.replace(styledListRegex, (match, listContent) => {
    tagCounts.styledList++;
    console.log(`  📝 Parsing StyledList ${tagCounts.styledList}`);
    
    // Parse ListItem within StyledList
    const listItemRegex = /<ListItem\s+style=["']?(\w+)["']?\s*>([\s\S]*?)<\/ListItem>/gi;
    const processedList = listContent.replace(listItemRegex, (itemMatch: string, itemStyle: string, itemContent: string) => {
      return `<div class="cte-styled-list-item cte-styled-list-${itemStyle}">${itemContent.trim()}</div>`;
    });
    
    return `<div class="cte-styled-list-block">${processedList}</div>`;
  });
  
  // 4. Parse CardGrid with Card
  const cardGridRegex = /<CardGrid\s+style=["']?(\w+)["']?\s+columns=["']?(\d)["']?\s*>([\s\S]*?)<\/CardGrid>/gi;
  content = content.replace(cardGridRegex, (match, gridStyle, columns, gridContent) => {
    tagCounts.cardGrid++;
    console.log(`  🎴 Parsing CardGrid ${tagCounts.cardGrid}: style="${gridStyle}", columns=${columns}`);
    
    // Parse Card within CardGrid
    const cardRegex = /<Card\s+title=["']([^"']+)["']>([\s\S]*?)<\/Card>/gi;
    const processedCards = gridContent.replace(cardRegex, (cardMatch: string, cardTitle: string, cardContent: string) => {
      return `<div class="cte-card-grid-item cte-card-grid-${gridStyle}">
        <div class="cte-card-grid-title">${cardTitle}</div>
        <div class="cte-card-grid-content">${cardContent.trim()}</div>
      </div>`;
    });
    
    return `<div class="cte-card-grid-block cte-card-grid-${gridStyle} cte-card-grid-cols-${columns}">${processedCards}</div>`;
  });
  
  // 5. Parse CodeBlock tags
  const codeBlockRegex = /<CodeBlock\s+language=["']?(\w+)["']?\s*>([\s\S]*?)<\/CodeBlock>/gi;
  content = content.replace(codeBlockRegex, (match, language, code) => {
    tagCounts.codeBlock++;
    console.log(`  💻 Parsing CodeBlock ${tagCounts.codeBlock}: language="${language}"`);
    
    // Escape HTML in code content
    const escapedCode = code
      .trim()
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
    
    return `<pre class="cte-code-block language-${language.toLowerCase()}"><code>${escapedCode}</code></pre>`;
  });
  
  console.log(`📊 Custom tags summary:`, tagCounts);
  return content;
}

/**
 * Normalize paragraph spacing by ensuring proper <p> tags
 * 
 * @param content - HTML string
 * @returns HTML string with normalized paragraph spacing
 */
export function normalizeParagraphSpacing(content: string): string {
  // Add any paragraph normalization logic here
  return content;
}

/**
 * Main content processor that orchestrates all parsing functions
 * Processes content in the correct order to avoid tag conflicts
 * 
 * @param content - Raw HTML string with SuperEditor custom tags
 * @returns Fully parsed HTML string ready for rendering
 */
export function processContent(content: string): string {
  if (!content) return '';
  
  console.log('🎯 ===== STARTING CONTENT PROCESSING =====');
  console.log('📝 Original content length:', content.length);
  
  // Check what tags are present
  console.log('🔍 Detecting tags in content:');
  console.log('  - Has <Heading>:', /<Heading/i.test(content));
  console.log('  - Has <KeyConcept>:', /<KeyConcept/i.test(content));
  console.log('  - Has <StyledList>:', /<StyledList/i.test(content));
  console.log('  - Has <CardGrid>:', /<CardGrid/i.test(content));
  console.log('  - Has <CodeBlock>:', /<CodeBlock/i.test(content));
  console.log('  - Has <Table>:', /<Table/i.test(content));
  console.log('  - Has <Equation>:', /<Equation/i.test(content));
  
  // Process in correct order to avoid conflicts
  let processed = content;
  
  // 1. Parse custom tags first (Heading, KeyConcept, StyledList, CardGrid, CodeBlock)
  processed = parseCustomTags(processed);
  
  // 2. Parse tables
  processed = parseTableMarkup(processed);
  
  // 3. Parse equations (do this after other tags to avoid LaTeX conflicts)
  processed = parseEquationTags(processed);
  
  // 4. Normalize spacing
  processed = normalizeParagraphSpacing(processed);
  
  console.log('✅ Final content length:', processed.length);
  
  // Verify rendered classes are present
  console.log('🔍 Verifying rendered output:');
  console.log('  - Has cte-heading:', /cte-heading/i.test(processed));
  console.log('  - Has cte-key-concept:', /cte-key-concept/i.test(processed));
  console.log('  - Has cte-styled-list:', /cte-styled-list/i.test(processed));
  console.log('  - Has cte-card-grid:', /cte-card-grid/i.test(processed));
  console.log('  - Has cte-code-block:', /cte-code-block/i.test(processed));
  console.log('  - Has cte-table:', /cte-table/i.test(processed));
  console.log('  - Has cte-katex-equation:', /cte-katex-equation/i.test(processed));
  
  console.log('🎯 ===== CONTENT PROCESSING COMPLETE =====\n');
  
  return processed;
}

/**
 * Export all parser functions for individual use
 */
export default {
  parseEquationTags,
  parseTableMarkup,
  parseCustomTags,
  normalizeParagraphSpacing,
  processContent
};
