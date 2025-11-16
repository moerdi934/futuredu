import katex from 'katex';

/**
 * SuperEditor Import Handler Utility
 * Handles parsing and conversion of custom XML tags to HTML for SuperEditor
 */

// Language mapping for code blocks
const LANGUAGE_MAP: { [key: string]: string } = {
  'javascript': 'JavaScript',
  'typescript': 'TypeScript',
  'python': 'Python',
  'java': 'Java',
  'cpp': 'C++',
  'c': 'C',
  'csharp': 'C#',
  'php': 'PHP',
  'ruby': 'Ruby',
  'go': 'Go',
  'rust': 'Rust',
  'swift': 'Swift',
  'kotlin': 'Kotlin',
  'dart': 'Dart',
  'scala': 'Scala',
  'r': 'R',
  'matlab': 'MATLAB',
  'sql': 'SQL',
  'html': 'HTML',
  'css': 'CSS',
  'scss': 'SCSS',
  'xml': 'XML',
  'json': 'JSON',
  'yaml': 'YAML',
  'markdown': 'Markdown',
  'bash': 'Bash',
  'shell': 'Shell',
  'powershell': 'PowerShell',
  'dockerfile': 'Dockerfile',
  'nginx': 'Nginx',
  'apache': 'Apache',
  'plaintext': 'Plain Text'
};

// Key concept styles configuration
const KEY_CONCEPT_STYLES = {
  classic: { 
    borderColor: '#9333EA', 
    bgColor: '#FAF5FF', 
    iconBgColor: '#9333EA', 
    textColor: '#581C87', 
    emoji: '💡', 
    name: 'Classic',
    iconSvg: '<path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>'
  },
  important: { 
    borderColor: '#2563EB', 
    bgColor: '#EFF6FF', 
    iconBgColor: '#2563EB', 
    textColor: '#1E3A8A', 
    emoji: '⭐', 
    name: 'Important',
    iconSvg: '<path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/>'
  },
  highlight: { 
    borderColor: '#4F46E5', 
    bgColor: '#EEF2FF', 
    iconBgColor: '#4F46E5', 
    textColor: '#312E81', 
    emoji: '✨', 
    name: 'Highlight',
    iconSvg: '<path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM14 11a1 1 0 011 1v1h1a1 1 0 110 2h-1v1a1 1 0 11-2 0v-1h-1a1 1 0 110-2h1v-1a1 1 0 011-1z"/>'
  },
  warning: { 
    borderColor: '#7C3AED', 
    bgColor: '#F5F3FF', 
    iconBgColor: '#7C3AED', 
    textColor: '#4C1D95', 
    emoji: '⚠️', 
    name: 'Warning',
    iconSvg: '<path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>'
  },
  insight: { 
    borderColor: '#0891B2', 
    bgColor: '#ECFEFF', 
    iconBgColor: '#0891B2', 
    textColor: '#164E63', 
    emoji: '⚡', 
    name: 'Insight',
    iconSvg: '<path fill-rule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clip-rule="evenodd"/>'
  },
  definition: { 
    borderColor: '#0284C7', 
    bgColor: '#F0F9FF', 
    iconBgColor: '#0284C7', 
    textColor: '#0C4A6E', 
    emoji: '📖', 
    name: 'Definition',
    iconSvg: '<path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z"/>'
  },
  goal: { 
    borderColor: '#1D4ED8', 
    bgColor: '#DBEAFE', 
    iconBgColor: '#1D4ED8', 
    textColor: '#1E3A8A', 
    emoji: '🎯', 
    name: 'Goal',
    iconSvg: '<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clip-rule="evenodd"/>'
  },
  info: { 
    borderColor: '#A855F7', 
    bgColor: '#F3E8FF', 
    iconBgColor: '#A855F7', 
    textColor: '#581C87', 
    emoji: 'ℹ️', 
    name: 'Info',
    iconSvg: '<path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/>'
  }
};

// Styled list styles configuration
const STYLED_LIST_STYLES = {
  blue: { borderColor: '#2196f3', bgColor: '#e3f2fd', textColor: '#0d47a1', emoji: '📘' },
  green: { borderColor: '#4caf50', bgColor: '#c8e6c9', textColor: '#1b5e20', emoji: '✅' },
  yellow: { borderColor: '#ffc107', bgColor: '#fff9c4', textColor: '#f57f17', emoji: '⚠️' },
  orange: { borderColor: '#ff9800', bgColor: '#ffe0b2', textColor: '#e65100', emoji: '💡' },
  red: { borderColor: '#f44336', bgColor: '#ffcdd2', textColor: '#b71c1c', emoji: '❗' },
  purple: { borderColor: '#9c27b0', bgColor: '#f3e5f5', textColor: '#4a148c', emoji: '🔮' },
  teal: { borderColor: '#009688', bgColor: '#b2dfdb', textColor: '#004d40', emoji: '📝' },
  pink: { borderColor: '#e91e63', bgColor: '#f8bbd0', textColor: '#880e4f', emoji: '✨' }
};

// Card grid styles configuration
const CARD_GRID_STYLES = {
  blue: { borderColor: '#2196f3', bgColor: '#ffffff', headerBg: '#2196f3', textColor: '#212121', headerTextColor: '#ffffff' },
  green: { borderColor: '#4caf50', bgColor: '#ffffff', headerBg: '#4caf50', textColor: '#212121', headerTextColor: '#ffffff' },
  purple: { borderColor: '#9c27b0', bgColor: '#ffffff', headerBg: '#9c27b0', textColor: '#212121', headerTextColor: '#ffffff' },
  orange: { borderColor: '#ff9800', bgColor: '#ffffff', headerBg: '#ff9800', textColor: '#212121', headerTextColor: '#ffffff' },
  teal: { borderColor: '#009688', bgColor: '#ffffff', headerBg: '#009688', textColor: '#212121', headerTextColor: '#ffffff' },
  pink: { borderColor: '#e91e63', bgColor: '#ffffff', headerBg: '#e91e63', textColor: '#212121', headerTextColor: '#ffffff' },
  indigo: { borderColor: '#3f51b5', bgColor: '#ffffff', headerBg: '#3f51b5', textColor: '#212121', headerTextColor: '#ffffff' },
  amber: { borderColor: '#ffc107', bgColor: '#ffffff', headerBg: '#ffc107', textColor: '#212121', headerTextColor: '#212121' }
};

/**
 * Get language label for display
 */
export const getLanguageLabel = (lang: string): string => {
  return LANGUAGE_MAP[lang] || lang.toUpperCase();
};

/**
 * Parse equation tags to HTML with KaTeX rendering
 */
export const parseEquations = (content: string): string => {
  return content.replace(
    /<equation\s+type="(inline|multiline)">(.*?)<\/equation>/gs,
    (match, type, latex) => {
      const displayMode = type === 'multiline';
      const cleanLatex = latex.trim();
      
      try {
        const renderedEquation = katex.renderToString(cleanLatex, {
          displayMode: displayMode,
          throwOnError: false,
          output: 'html'
        });

        const containerTag = displayMode ? 'div' : 'span';
        const className = displayMode ? 'cte-katex-equation cte-katex-block' : 'cte-katex-equation cte-katex-inline';
        
        return `<${containerTag} class="${className}" data-latex="${encodeURIComponent(cleanLatex)}" data-display-mode="${displayMode}" data-editable="true">${renderedEquation}</${containerTag}>`;
      } catch (error) {
        console.error('KaTeX rendering error:', error);
        return `<span class="katex-error" style="color: red;">${cleanLatex}</span>`;
      }
    }
  );
};

/**
 * Parse codeblock tags to HTML with syntax highlighting support
 */
export const parseCodeBlocks = (content: string): string => {
  return content.replace(
    /<codeblock\s+language="([^"]+)">(.*?)<\/codeblock>/gs,
    (match, language, code) => {
      const cleanCode = code.trim()
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'");
      
      const languageLabel = getLanguageLabel(language);
      
      return `
        <div class="cte-code-wrapper" data-language="${language}" data-collapsed="false">
          <div class="cte-language-select">
            <span>${languageLabel}</span>
            <button type="button" class="cte-collapse-button" title="Collapse code" contenteditable="false">
              <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </button>
          </div>
          <div class="cte-code-content">
            <pre><code class="cte-code-block language-${language}">${cleanCode}</code></pre>
          </div>
        </div>
      `;
    }
  );
};

/**
 * Parse key-concept tags to HTML
 */
export const parseKeyConcepts = (content: string): string => {
  return content.replace(
    /<key-concept\s+style="(classic|important|highlight|warning|insight|definition|goal|info)">(.*?)<\/key-concept>/gs,
    (match, styleId, conceptContent) => {
      const style = KEY_CONCEPT_STYLES[styleId as keyof typeof KEY_CONCEPT_STYLES] || KEY_CONCEPT_STYLES.classic;

      return `
        <div class="cte-key-concept-block tw-my-4 tw-rounded-lg tw-shadow-sm tw-transition-all" 
             style="border-left: 4px solid ${style.borderColor}; background-color: ${style.bgColor};" 
             data-style="${styleId}">
          <div class="tw-p-4">
            <div class="tw-flex tw-items-center tw-mb-3">
              <div class="tw-rounded-lg tw-p-2 tw-mr-2 tw-flex tw-items-center tw-justify-center" 
                   style="background-color: ${style.iconBgColor};">
                <svg class="tw-w-5 tw-h-5 tw-text-white" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  ${style.iconSvg}
                </svg>
              </div>
              <h4 class="tw-text-base tw-font-semibold tw-m-0" style="color: ${style.textColor};">
                ${style.name}
              </h4>
            </div>
            <div class="tw-rounded-lg tw-p-3">
              <div class="tw-leading-relaxed cte-key-concept-content" 
                   contenteditable="true" 
                   style="min-height: 2.5rem; max-height: none; height: auto; outline: none; overflow: visible; background: transparent; color: ${style.textColor};">
                ${conceptContent.trim()}
              </div>
            </div>
          </div>
        </div>
      `;
    }
  );
};

/**
 * Parse styled-list tags to HTML
 */
export const parseStyledLists = (content: string): string => {
  return content.replace(
    /<styled-list>(.*?)<\/styled-list>/gs,
    (match, itemsContent) => {
      const listId = `styled-list-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      const items = itemsContent.match(/<item\s+style="(blue|green|yellow|orange|red|purple|teal|pink)">(.*?)<\/item>/gs) || [];
      
      const itemsHtml = items.map((item, index) => {
        const styleMatch = item.match(/style="(\w+)"/);
        const contentMatch = item.match(/>(.*?)<\/item>/s);
        
        const styleId = styleMatch ? styleMatch[1] : 'blue';
        const itemContent = contentMatch ? contentMatch[1].trim() : `Item ${index + 1}`;
        const style = STYLED_LIST_STYLES[styleId as keyof typeof STYLED_LIST_STYLES] || STYLED_LIST_STYLES.blue;
        
        return `<p 
          class="cte-styled-list-item" 
          data-list-id="${listId}"
          data-item-id="${index}"
          data-style-id="${styleId}"
          style="background: ${style.bgColor}; color: ${style.textColor}; padding: 12px; margin: 8px 0; border-left: 4px solid ${style.borderColor}; border-radius: 4px; position: relative; cursor: text;" 
          contenteditable="true">${style.emoji} ${itemContent}</p>`;
      }).join('\n');

      return `
        <div class="cte-styled-list-block" data-list-id="${listId}" style="border: 2px solid #c084fc; border-radius: 8px; padding: 12px; margin: 16px 0; background: #faf5ff;">
          ${itemsHtml}
        </div>
      `;
    }
  );
};

/**
 * Parse card-grid tags to HTML
 */
export const parseCardGrids = (content: string): string => {
  return content.replace(
    /<card-grid\s+style="(blue|green|purple|orange|teal|pink|indigo|amber)"\s+columns="(\d+)">(.*?)<\/card-grid>/gs,
    (match, styleId, columns, cardsContent) => {
      const style = CARD_GRID_STYLES[styleId as keyof typeof CARD_GRID_STYLES] || CARD_GRID_STYLES.blue;

      const cards = cardsContent.match(/<card\s+title="([^"]*)">(.*?)<\/card>/gs) || [];
      
      const cardsHtml = cards.map((card) => {
        const titleMatch = card.match(/title="([^"]*)"/);
        const contentMatch = card.match(/>(.*?)<\/card>/s);
        
        const title = titleMatch ? titleMatch[1] : 'Card Title';
        const cardContent = contentMatch ? contentMatch[1].trim() : 'Card content';

        return `
          <div class="cte-card-grid-item" style="background: ${style.bgColor}; border: 2px solid ${style.borderColor}; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1); transition: all 0.3s ease;">
            <div class="cte-card-header" style="background: ${style.headerBg}; color: ${style.headerTextColor}; padding: 12px; font-weight: bold; font-size: 1rem;" contenteditable="true">
              ${title}
            </div>
            <div class="cte-card-content" style="padding: 16px; color: ${style.textColor}; font-size: 0.875rem; line-height: 1.5;" contenteditable="true">
              ${cardContent}
            </div>
          </div>
        `;
      }).join('\n');

      return `
        <div class="cte-card-grid-block tw-my-4" data-style="${styleId}" data-columns="${columns}" style="display: grid; grid-template-columns: repeat(${columns}, 1fr); gap: 16px;">
          ${cardsHtml}
        </div>
      `;
    }
  );
};

/**
 * Main function to parse all custom content tags
 */
export const parseCustomContent = (content: string): string => {
  let parsedContent = content;

  // Parse all custom tags in sequence
  parsedContent = parseEquations(parsedContent);
  parsedContent = parseCodeBlocks(parsedContent);
  parsedContent = parseKeyConcepts(parsedContent);
  parsedContent = parseStyledLists(parsedContent);
  parsedContent = parseCardGrids(parsedContent);

  return parsedContent;
};

/**
 * Apply syntax highlighting to code blocks after render
 */
export const applySyntaxHighlighting = () => {
  if (typeof window !== 'undefined' && (window as any).hljs) {
    const codeBlocks = document.querySelectorAll('.cte-code-block');
    codeBlocks.forEach((block) => {
      try {
        (window as any).hljs.highlightElement(block);
      } catch (error) {
        console.warn('Error highlighting code block:', error);
      }
    });
  }
};

/**
 * Validate imported JSON data structure
 */
export const validateImportedData = (data: any): { valid: boolean; error?: string } => {
  if (!data || typeof data !== 'object') {
    return { valid: false, error: 'Invalid JSON format' };
  }

  if (!data.content || typeof data.content !== 'string') {
    return { valid: false, error: 'Missing or invalid "content" field' };
  }

  return { valid: true };
};

export default {
  parseCustomContent,
  parseEquations,
  parseCodeBlocks,
  parseKeyConcepts,
  parseStyledLists,
  parseCardGrids,
  applySyntaxHighlighting,
  validateImportedData,
  getLanguageLabel
};