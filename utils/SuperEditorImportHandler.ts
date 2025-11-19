// utils/SuperEditorImportHandler.ts
'use client';

interface ImportedData {
  [key: string]: any;
  content: string;
}

interface ValidationResult {
  valid: boolean;
  error?: string;
}

// Validation function
export const validateImportedData = (data: any): ValidationResult => {
  if (!data || typeof data !== 'object') {
    return { valid: false, error: 'Data must be a valid JSON object' };
  }

  if (!data.content || typeof data.content !== 'string') {
    return { valid: false, error: 'Content field is required and must be a string' };
  }

  return { valid: true };
};

// Parse CodeBlock tags
const parseCodeBlocks = (content: string): string => {
  const codeBlockRegex = /<CodeBlock\s+language="([^"]+)">([\s\S]*?)<\/CodeBlock>/gi;
  
  return content.replace(codeBlockRegex, (match, language, code) => {
    const escapedCode = code
      .trim()
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    return `
      <div class="cte-code-wrapper" data-language="${language}" data-collapsed="false">
        <div class="cte-language-select">
          <span>${getLanguageLabel(language)}</span>
          <button type="button" class="cte-collapse-button" title="Collapse code" contenteditable="false">
            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
            </svg>
          </button>
        </div>
        <div class="cte-code-content">
          <pre><code class="cte-code-block language-${language}">${escapedCode}</code></pre>
        </div>
      </div>
    `;
  });
};

// FIXED: Parse Equation tags with proper KaTeX rendering
const parseEquations = (content: string): string => {
  const equationRegex = /<Equation\s+type="(inline|display)">([\s\S]*?)<\/Equation>/gi;
  
  return content.replace(equationRegex, (match, type, latex) => {
    const isDisplay = type === 'display';
    const containerTag = isDisplay ? 'div' : 'span';
    const className = isDisplay ? 'cte-katex-block' : 'cte-katex-inline';
    
    // Clean and trim the latex
    const cleanLatex = latex.trim();
    
    // Escape for data attribute
    const escapedLatex = cleanLatex.replace(/"/g, '&quot;');
    
    // CRITICAL: Render KaTeX immediately if available, otherwise store for later
    let renderedContent = cleanLatex;
    
    // Try to render with KaTeX if available
    if (typeof window !== 'undefined' && (window as any).katex) {
      try {
        renderedContent = (window as any).katex.renderToString(cleanLatex, {
          displayMode: isDisplay,
          throwOnError: false,
          output: 'html'
        });
      } catch (e) {
        console.warn('KaTeX rendering failed during parse:', e);
        // Keep original latex as fallback
        renderedContent = cleanLatex;
      }
    }
    
    return `
      <${containerTag} 
        class="cte-katex-equation ${className}" 
        data-latex="${encodeURIComponent(cleanLatex)}" 
        data-display-mode="${isDisplay}"
        data-editable="true"
      >
        ${renderedContent}
      </${containerTag}>
    `;
  });
};

// Parse Heading tags with proper styling
const parseHeadings = (content: string): string => {
  const headingRegex = /<Heading\s+kind="([1-6])">([\s\S]*?)<\/Heading>/gi;
  
  return content.replace(headingRegex, (match, level, text) => {
    // Styling colors based on level
    const styles = {
      '1': 'font-size: 2.5rem; font-weight: 800; color: #7c3aed; margin: 1.5rem 0 1rem 0; line-height: 1.2;',
      '2': 'font-size: 2rem; font-weight: 700; color: #8b5cf6; margin: 1.25rem 0 0.875rem 0; line-height: 1.3; border-bottom: 2px solid #e9d5ff; padding-bottom: 0.5rem;',
      '3': 'font-size: 1.5rem; font-weight: 600; color: #9333ea; margin: 1rem 0 0.75rem 0; line-height: 1.4;',
      '4': 'font-size: 1.25rem; font-weight: 600; color: #a855f7; margin: 0.875rem 0 0.625rem 0; line-height: 1.4;',
      '5': 'font-size: 1.125rem; font-weight: 600; color: #c084fc; margin: 0.75rem 0 0.5rem 0; line-height: 1.4;',
      '6': 'font-size: 1rem; font-weight: 600; color: #d8b4fe; margin: 0.625rem 0 0.5rem 0; line-height: 1.4;'
    };
    
    return `<h${level} style="${styles[level as keyof typeof styles]}">${text.trim()}</h${level}>`;
  });
};

// Parse Table tags
const parseTable = (content: string): string => {
  const tableRegex = /<Table\s+style="([^"]*)"(?:\s+hasHeader="(true|false)")?\s*>([\s\S]*?)<\/Table>/gi;
  
  return content.replace(tableRegex, (match, style, hasHeader, tableContent) => {
    const hasHeaderRow = hasHeader === 'true';
    
    // Parse rows
    const rowRegex = /<Row>([\s\S]*?)<\/Row>/gi;
    const rows: string[][] = [];
    let rowMatch;
    
    while ((rowMatch = rowRegex.exec(tableContent)) !== null) {
      const cellRegex = /<Cell>([\s\S]*?)<\/Cell>/gi;
      const cells: string[] = [];
      let cellMatch;
      
      while ((cellMatch = cellRegex.exec(rowMatch[1])) !== null) {
        cells.push(cellMatch[1].trim() || '&nbsp;');
      }
      
      rows.push(cells);
    }
    
    if (rows.length === 0) return match;
    
    // Generate table HTML
    let tableClass = 'cte-table tw-w-full tw-border-collapse';
    switch (style) {
      case 'striped':
        tableClass += ' cte-table-striped';
        break;
      case 'borderless':
        tableClass += ' cte-table-borderless';
        break;
      default:
        tableClass += ' cte-table-bordered';
    }
    
    let tableHtml = `<div class="cte-table-wrapper tw-my-4 tw-overflow-x-auto"><table class="${tableClass}">`;
    
    if (hasHeaderRow && rows.length > 0) {
      tableHtml += '<thead><tr>';
      rows[0].forEach(cell => {
        tableHtml += `<th class="tw-bg-purple-100 tw-font-semibold tw-p-2 tw-border tw-border-purple-300 tw-min-h-6">${cell}</th>`;
      });
      tableHtml += '</tr></thead>';
    }
    
    tableHtml += '<tbody>';
    const startIndex = hasHeaderRow ? 1 : 0;
    
    for (let i = startIndex; i < rows.length; i++) {
      tableHtml += '<tr>';
      rows[i].forEach((cell) => {
        const cellClass = style === 'striped' && i % 2 === 0
          ? 'tw-bg-purple-50 tw-p-2 tw-border tw-border-purple-300 tw-min-h-6'
          : 'tw-p-2 tw-border tw-border-purple-300 tw-min-h-6';
        tableHtml += `<td class="${cellClass}">${cell}</td>`;
      });
      tableHtml += '</tr>';
    }
    
    tableHtml += '</tbody></table></div>';
    
    return tableHtml;
  });
};

// Parse KeyConcept tags
const parseKeyConcepts = (content: string): string => {
  const keyConceptRegex = /<KeyConcept\s+style="([^"]+)">([\s\S]*?)<\/KeyConcept>/gi;
  
  const styleMap: { [key: string]: any } = {
    classic: { borderColor: '#9333EA', bgColor: '#FAF5FF', iconBgColor: '#9333EA', textColor: '#581C87', icon: 'lightbulb' },
    important: { borderColor: '#2563EB', bgColor: '#EFF6FF', iconBgColor: '#2563EB', textColor: '#1E3A8A', icon: 'star' },
    highlight: { borderColor: '#4F46E5', bgColor: '#EEF2FF', iconBgColor: '#4F46E5', textColor: '#312E81', icon: 'sparkles' },
    warning: { borderColor: '#7C3AED', bgColor: '#F5F3FF', iconBgColor: '#7C3AED', textColor: '#4C1D95', icon: 'alert-circle' },
    insight: { borderColor: '#0891B2', bgColor: '#ECFEFF', iconBgColor: '#0891B2', textColor: '#164E63', icon: 'zap' },
    definition: { borderColor: '#0284C7', bgColor: '#F0F9FF', iconBgColor: '#0284C7', textColor: '#0C4A6E', icon: 'book-open' },
    goal: { borderColor: '#1D4ED8', bgColor: '#DBEAFE', iconBgColor: '#1D4ED8', textColor: '#1E3A8A', icon: 'target' },
    info: { borderColor: '#A855F7', bgColor: '#F3E8FF', iconBgColor: '#A855F7', textColor: '#581C87', icon: 'info' }
  };
  
  const iconSvgMap: { [key: string]: string } = {
    'lightbulb': '<path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z"/>',
    'star': '<path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>',
    'sparkles': '<path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM14 11a1 1 0 011 1v1h1a1 1 0 110 2h-1v1a1 1 0 11-2 0v-1h-1a1 1 0 110-2h1v-1a1 1 0 011-1z"/>',
    'alert-circle': '<path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/>',
    'zap': '<path fill-rule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clip-rule="evenodd"/>',
    'book-open': '<path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z"/>',
    'target': '<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clip-rule="evenodd"/>',
    'info': '<path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/>'
  };
  
  return content.replace(keyConceptRegex, (match, styleId, text) => {
    const style = styleMap[styleId] || styleMap.classic;
    const iconSvg = iconSvgMap[style.icon] || iconSvgMap.lightbulb;
    
    return `
      <div class="cte-key-concept-block tw-my-4 tw-rounded-lg tw-shadow-sm tw-transition-all" 
           style="border-left: 4px solid ${style.borderColor}; background-color: ${style.bgColor};" 
           data-style="${styleId}">
        <div class="tw-p-4">
          <div class="tw-flex tw-items-center tw-mb-3">
            <div class="tw-rounded-lg tw-p-2 tw-mr-2 tw-flex tw-items-center tw-justify-center" 
                 style="background-color: ${style.iconBgColor};">
              <svg class="tw-w-5 tw-h-5 tw-text-white" fill="currentColor" viewBox="0 0 20 20">
                ${iconSvg}
              </svg>
            </div>
            <h4 class="tw-text-base tw-font-semibold tw-m-0" style="color: ${style.textColor};">
              ${styleId.charAt(0).toUpperCase() + styleId.slice(1)}
            </h4>
          </div>
          
          <div class="tw-rounded-lg tw-p-3">
            <div class="tw-leading-relaxed cte-key-concept-content" 
                 contenteditable="true" 
                 style="min-height: 2.5rem; max-height: none; height: auto; outline: none; overflow: visible; background: transparent; color: ${style.textColor};">
              ${text.trim()}
            </div>
          </div>
        </div>
      </div>
    `;
  });
};

// Parse StyledList tags
const parseStyledLists = (content: string): string => {
  const styledListRegex = /<StyledList>([\s\S]*?)<\/StyledList>/gi;
  
  const styleMap: { [key: string]: any } = {
    blue: { borderColor: '#2196f3', bgColor: '#e3f2fd', textColor: '#0d47a1', emoji: '📘' },
    green: { borderColor: '#4caf50', bgColor: '#c8e6c9', textColor: '#1b5e20', emoji: '✅' },
    yellow: { borderColor: '#ffc107', bgColor: '#fff9c4', textColor: '#f57f17', emoji: '⚠️' },
    orange: { borderColor: '#ff9800', bgColor: '#ffe0b2', textColor: '#e65100', emoji: '💡' },
    red: { borderColor: '#f44336', bgColor: '#ffcdd2', textColor: '#b71c1c', emoji: '❗' },
    purple: { borderColor: '#9c27b0', bgColor: '#f3e5f5', textColor: '#4a148c', emoji: '🔮' },
    teal: { borderColor: '#009688', bgColor: '#b2dfdb', textColor: '#004d40', emoji: '📝' },
    pink: { borderColor: '#e91e63', bgColor: '#f8bbd0', textColor: '#880e4f', emoji: '✨' }
  };
  
  return content.replace(styledListRegex, (match, listContent) => {
    const listId = `styled-list-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const itemRegex = /<ListItem\s+style="([^"]+)">([\s\S]*?)<\/ListItem>/gi;
    let itemsHtml = '';
    let itemMatch;
    let itemIndex = 0;
    
    while ((itemMatch = itemRegex.exec(listContent)) !== null) {
      const styleId = itemMatch[1];
      const text = itemMatch[2].trim();
      const style = styleMap[styleId] || styleMap.blue;
      const itemId = `item-${Date.now()}-${itemIndex}`;
      
      itemsHtml += `<p 
        class="cte-styled-list-item" 
        data-list-id="${listId}"
        data-item-id="${itemId}"
        data-style-id="${styleId}"
        style="background: ${style.bgColor}; color: ${style.textColor}; padding: 12px; margin: 8px 0; border-left: 4px solid ${style.borderColor}; border-radius: 4px; position: relative; cursor: text;" 
        contenteditable="true">${style.emoji} ${text}</p>`;
      
      itemIndex++;
    }
    
    return `
      <div class="cte-styled-list-block" data-list-id="${listId}" style="border: 2px solid #c084fc; border-radius: 8px; padding: 12px; margin: 16px 0; background: #faf5ff;">
        ${itemsHtml}
      </div>
    `;
  });
};

// Parse CardGrid tags
const parseCardGrids = (content: string): string => {
  const cardGridRegex = /<CardGrid\s+style="([^"]+)"\s+columns="([1-4])">([\s\S]*?)<\/CardGrid>/gi;
  
  const styleMap: { [key: string]: any } = {
    blue: { borderColor: '#2196f3', bgColor: '#ffffff', headerBg: '#2196f3', textColor: '#212121', headerTextColor: '#ffffff' },
    green: { borderColor: '#4caf50', bgColor: '#ffffff', headerBg: '#4caf50', textColor: '#212121', headerTextColor: '#ffffff' },
    purple: { borderColor: '#9c27b0', bgColor: '#ffffff', headerBg: '#9c27b0', textColor: '#212121', headerTextColor: '#ffffff' },
    orange: { borderColor: '#ff9800', bgColor: '#ffffff', headerBg: '#ff9800', textColor: '#212121', headerTextColor: '#ffffff' },
    teal: { borderColor: '#009688', bgColor: '#ffffff', headerBg: '#009688', textColor: '#212121', headerTextColor: '#ffffff' },
    pink: { borderColor: '#e91e63', bgColor: '#ffffff', headerBg: '#e91e63', textColor: '#212121', headerTextColor: '#ffffff' },
    indigo: { borderColor: '#3f51b5', bgColor: '#ffffff', headerBg: '#3f51b5', textColor: '#212121', headerTextColor: '#ffffff' },
    amber: { borderColor: '#ffc107', bgColor: '#ffffff', headerBg: '#ffc107', textColor: '#212121', headerTextColor: '#212121' }
  };
  
  return content.replace(cardGridRegex, (match, styleId, columns, cardsContent) => {
    const style = styleMap[styleId] || styleMap.blue;
    const cardRegex = /<Card\s+title="([^"]*)">([\s\S]*?)<\/Card>/gi;
    let cardsHtml = '';
    let cardMatch;
    
    while ((cardMatch = cardRegex.exec(cardsContent)) !== null) {
      const title = cardMatch[1];
      const content = cardMatch[2].trim();
      
      cardsHtml += `
        <div class="cte-card-grid-item" style="background: ${style.bgColor}; border: 2px solid ${style.borderColor}; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1); transition: all 0.3s ease;">
          <div class="cte-card-header" style="background: ${style.headerBg}; color: ${style.headerTextColor}; padding: 12px; font-weight: bold; font-size: 1rem;" contenteditable="true">
            ${title}
          </div>
          <div class="cte-card-content" style="padding: 16px; color: ${style.textColor}; font-size: 0.875rem; line-height: 1.5;" contenteditable="true">
            ${content}
          </div>
        </div>
      `;
    }
    
    return `
      <div class="cte-card-grid-block tw-my-4" data-style="${styleId}" data-columns="${columns}" style="display: grid; grid-template-columns: repeat(${columns}, 1fr); gap: 16px;">
        ${cardsHtml}
      </div>
    `;
  });
};

// Helper function to get language label
const getLanguageLabel = (lang: string): string => {
  const languageMap: { [key: string]: string } = {
    javascript: 'JavaScript',
    typescript: 'TypeScript',
    python: 'Python',
    java: 'Java',
    cpp: 'C++',
    c: 'C',
    csharp: 'C#',
    php: 'PHP',
    ruby: 'Ruby',
    go: 'Go',
    rust: 'Rust',
    swift: 'Swift',
    kotlin: 'Kotlin',
    dart: 'Dart',
    scala: 'Scala',
    r: 'R',
    matlab: 'MATLAB',
    sql: 'SQL',
    html: 'HTML',
    css: 'CSS',
    scss: 'SCSS',
    xml: 'XML',
    json: 'JSON',
    yaml: 'YAML',
    markdown: 'Markdown',
    bash: 'Bash',
    shell: 'Shell',
    powershell: 'PowerShell',
    dockerfile: 'Dockerfile',
    nginx: 'Nginx',
    apache: 'Apache',
    plaintext: 'Plain Text'
  };
  
  return languageMap[lang] || lang.toUpperCase();
};

// Main parsing function
export const parseCustomContent = (content: string): string => {
  let parsed = content;
  
  // Parse in specific order to avoid conflicts
  parsed = parseHeadings(parsed); // Parse headings first
  parsed = parseCodeBlocks(parsed);
  parsed = parseEquations(parsed); // Parse equations
  parsed = parseTable(parsed);
  parsed = parseKeyConcepts(parsed);
  parsed = parseStyledLists(parsed);
  parsed = parseCardGrids(parsed);
  
  return parsed;
};

// ENHANCED: Apply syntax highlighting and KaTeX rendering after content is inserted
export const applySyntaxHighlighting = (): void => {
  if (typeof window === 'undefined') return;
  
  // Apply highlight.js
  if ((window as any).hljs) {
    const codeBlocks = document.querySelectorAll('.cte-code-block:not(.hljs)');
    codeBlocks.forEach((block) => {
      try {
        (window as any).hljs.highlightElement(block);
      } catch (error) {
        console.warn('Error highlighting code block:', error);
      }
    });
  }
  
  // ENHANCED: Apply KaTeX rendering with better error handling
  if ((window as any).katex) {
    const equations = document.querySelectorAll('.cte-katex-equation');
    equations.forEach((equation) => {
      try {
        const latex = decodeURIComponent(equation.getAttribute('data-latex') || '');
        const displayMode = equation.getAttribute('data-display-mode') === 'true';
        
        if (latex) {
          // Render with KaTeX
          const rendered = (window as any).katex.renderToString(latex, {
            displayMode: displayMode,
            throwOnError: false,
            output: 'html'
          });
          (equation as HTMLElement).innerHTML = rendered;
        }
      } catch (error) {
        console.warn('Error rendering equation:', error);
        // Keep original latex as fallback
        const latex = decodeURIComponent(equation.getAttribute('data-latex') || '');
        (equation as HTMLElement).textContent = latex;
      }
    });
  }
};

export const generateTutorialContent = (): string => {
  return `
    <Heading kind="1">SuperEditor Import Documentation</Heading>
    
    <KeyConcept style="info">
Welcome to SuperEditor Import! This guide will help you understand how to structure your JSON files for importing rich content into SuperEditor.
    </KeyConcept>
    
    <Heading kind="2">Basic Structure</Heading>
    
    <p>Your JSON file should have the following structure:</p>
    
    <CodeBlock language="json">
{
  "title": "Your Document Title",
  "author": "Author Name",
  "isActive": true,
  "category": "Category Name",
  "tags": ["tag1", "tag2", "tag3"],
  "publishDate": "2024-01-01",
  "content": "Your HTML content with custom tags..."
}
    </CodeBlock>
    
    <Heading kind="2">Custom Tags Reference</Heading>
    
    <Heading kind="3">1. Code Blocks</Heading>
    
    <KeyConcept style="classic">
Use CodeBlock tags to insert syntax-highlighted code with support for multiple programming languages.
    </KeyConcept>
    
    <p><strong>Syntax:</strong></p>
    <CodeBlock language="html">
&lt;CodeBlock language="javascript"&gt;
function hello() {
  console.log("Hello, World!");
}
&lt;/CodeBlock&gt;
    </CodeBlock>
    
    <p><strong>Supported Languages:</strong></p>
    <StyledList>
      <ListItem style="blue">JavaScript, TypeScript, Python</ListItem>
      <ListItem style="blue">Java, C++, C, C#</ListItem>
      <ListItem style="blue">PHP, Ruby, Go, Rust</ListItem>
      <ListItem style="blue">HTML, CSS, JSON, XML</ListItem>
      <ListItem style="green">And many more!</ListItem>
    </StyledList>
    
    <Heading kind="3">2. Mathematical Equations</Heading>
    
    <KeyConcept style="important">
Use Equation tags to insert LaTeX mathematical expressions with support for inline and display modes.
    </KeyConcept>
    
    <p><strong>Inline Equation:</strong></p>
    <CodeBlock language="html">
&lt;Equation type="inline"&gt;E = mc^2&lt;/Equation&gt;
    </CodeBlock>
    
    <p><strong>Display Equation:</strong></p>
    <CodeBlock language="html">
&lt;Equation type="display"&gt;
\\begin{align*}
f(x) &= x^2 + 2x + 1 \\\\
&= (x + 1)^2
\\end{align*}
&lt;/Equation&gt;
    </CodeBlock>
    
    <p><strong>Example Result:</strong></p>
    <p>Einstein's famous equation <Equation type="inline">E = mc^2</Equation> revolutionized physics.</p>
    
    <Heading kind="3">3. Headings</Heading>
    
    <KeyConcept style="highlight">
Use Heading tags with kind attribute (1-6) instead of traditional h1-h6 tags.
    </KeyConcept>
    
    <CodeBlock language="html">
&lt;Heading kind="1"&gt;Main Title&lt;/Heading&gt;
&lt;Heading kind="2"&gt;Section Title&lt;/Heading&gt;
&lt;Heading kind="3"&gt;Subsection Title&lt;/Heading&gt;
    </CodeBlock>
    
    <Heading kind="3">4. Tables</Heading>
    
    <KeyConcept style="definition">
Create structured tables with customizable styles and optional header rows.
    </KeyConcept>
    
    <p><strong>Basic Table:</strong></p>
    <CodeBlock language="html">
&lt;Table style="bordered" hasHeader="true"&gt;
  &lt;Row&gt;
    &lt;Cell&gt;Header 1&lt;/Cell&gt;
    &lt;Cell&gt;Header 2&lt;/Cell&gt;
    &lt;Cell&gt;Header 3&lt;/Cell&gt;
  &lt;/Row&gt;
  &lt;Row&gt;
    &lt;Cell&gt;Data 1&lt;/Cell&gt;
    &lt;Cell&gt;Data 2&lt;/Cell&gt;
    &lt;Cell&gt;Data 3&lt;/Cell&gt;
  &lt;/Row&gt;
&lt;/Table&gt;
    </CodeBlock>
    
    <p><strong>Available Styles:</strong></p>
    <StyledList>
      <ListItem style="blue">bordered - Traditional bordered table</ListItem>
      <ListItem style="purple">striped - Alternating row colors</ListItem>
      <ListItem style="teal">borderless - Clean, minimal look</ListItem>
    </StyledList>
    
    <Heading kind="3">5. Key Concepts</Heading>
    
    <KeyConcept style="insight">
Highlight important information with styled Key Concept blocks.
    </KeyConcept>
    
    <CodeBlock language="html">
&lt;KeyConcept style="classic"&gt;
This is an important concept to remember!
&lt;/KeyConcept&gt;
    </CodeBlock>
    
    <p><strong>Available Styles:</strong></p>
    <CardGrid style="purple" columns="4">
      <Card title="classic">General concepts</Card>
      <Card title="important">Critical info</Card>
      <Card title="highlight">Special attention</Card>
      <Card title="warning">Caution notes</Card>
      <Card title="insight">Key insights</Card>
      <Card title="definition">Term definitions</Card>
      <Card title="goal">Learning objectives</Card>
      <Card title="info">Additional info</Card>
    </CardGrid>
    
    <Heading kind="3">6. Styled Lists</Heading>
    
    <KeyConcept style="goal">
Create visually distinct lists where each item can have its own color style.
    </KeyConcept>
    
    <CodeBlock language="html">
&lt;StyledList&gt;
  &lt;ListItem style="blue"&gt;First point (Fact)&lt;/ListItem&gt;
  &lt;ListItem style="green"&gt;Second point (Conclusion)&lt;/ListItem&gt;
  &lt;ListItem style="yellow"&gt;Third point (Warning)&lt;/ListItem&gt;
  &lt;ListItem style="orange"&gt;Fourth point (Example)&lt;/ListItem&gt;
&lt;/StyledList&gt;
    </CodeBlock>
    
    <p><strong>Available Styles:</strong></p>
    <StyledList>
      <ListItem style="blue">blue (📘) - Facts/Information</ListItem>
      <ListItem style="green">green (✅) - Conclusions/Results</ListItem>
      <ListItem style="yellow">yellow (⚠️) - Warnings/Cautions</ListItem>
      <ListItem style="orange">orange (💡) - Examples/Ideas</ListItem>
      <ListItem style="red">red (❗) - Important/Critical</ListItem>
      <ListItem style="purple">purple (🔮) - Concepts/Theory</ListItem>
      <ListItem style="teal">teal (📝) - Steps/Procedures</ListItem>
      <ListItem style="pink">pink (✨) - Highlights/Special</ListItem>
    </StyledList>
    
    <Heading kind="3">7. Card Grids</Heading>
    
    <KeyConcept style="warning">
Display information in responsive card grids with customizable layouts and colors.
    </KeyConcept>
    
    <CodeBlock language="html">
&lt;CardGrid style="blue" columns="3"&gt;
  &lt;Card title="Feature 1"&gt;
    Description of first feature
  &lt;/Card&gt;
  &lt;Card title="Feature 2"&gt;
    Description of second feature
  &lt;/Card&gt;
  &lt;Card title="Feature 3"&gt;
    Description of third feature
  &lt;/Card&gt;
&lt;/CardGrid&gt;
    </CodeBlock>
    
    <p><strong>Column Options:</strong> 1, 2, 3, or 4 columns</p>
    <p><strong>Available Styles:</strong> blue, green, purple, orange, teal, pink, indigo, amber</p>
    
    <Heading kind="2">Complete Example</Heading>
    
    <KeyConcept style="highlight">
Here's a complete example showing how to combine all elements:
    </KeyConcept>
    
    <CodeBlock language="json">
{
  "title": "Complete Tutorial Example",
  "author": "SuperEditor Team",
  "isActive": true,
  "category": "Documentation",
  "tags": ["tutorial", "guide", "documentation"],
  "publishDate": "2024-01-01",
  "content": "&lt;Heading kind=\\"1\\"&gt;My Document&lt;/Heading&gt;&lt;KeyConcept style=\\"classic\\"&gt;Important intro&lt;/KeyConcept&gt;&lt;p&gt;Some text with &lt;Equation type=\\"inline\\"&gt;x^2&lt;/Equation&gt;&lt;/p&gt;&lt;CodeBlock language=\\"javascript\\"&gt;console.log('Hello');&lt;/CodeBlock&gt;&lt;StyledList&gt;&lt;ListItem style=\\"blue\\"&gt;Point 1&lt;/ListItem&gt;&lt;ListItem style=\\"green\\"&gt;Point 2&lt;/ListItem&gt;&lt;/StyledList&gt;"
}
    </CodeBlock>
    
    <Heading kind="2">Tips & Best Practices</Heading>
    
    <StyledList>
      <ListItem style="purple">Always validate your JSON before importing</ListItem>
      <ListItem style="orange">Use appropriate styles to match your content type</ListItem>
      <ListItem style="teal">Keep nesting levels reasonable for readability</ListItem>
      <ListItem style="blue">Test with small examples first</ListItem>
      <ListItem style="green">Save your JSON templates for reuse</ListItem>
    </StyledList>
    
    <Heading kind="2">Common Errors</Heading>
    
    <Table style="striped" hasHeader="true">
      <Row>
        <Cell>Error</Cell>
        <Cell>Cause</Cell>
        <Cell>Solution</Cell>
      </Row>
      <Row>
        <Cell>Invalid JSON</Cell>
        <Cell>Malformed JSON syntax</Cell>
        <Cell>Use a JSON validator</Cell>
      </Row>
      <Row>
        <Cell>Missing content</Cell>
        <Cell>No content field</Cell>
        <Cell>Add content field to JSON</Cell>
      </Row>
      <Row>
        <Cell>Tags not parsed</Cell>
        <Cell>Incorrect tag syntax</Cell>
        <Cell>Check tag format and spelling</Cell>
      </Row>
    </Table>
    
    <KeyConcept style="goal">
You're now ready to create rich, structured content for SuperEditor! Start with simple examples and gradually build more complex documents.
    </KeyConcept>
  `;
};