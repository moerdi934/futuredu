/**
 * SuperEditor Utilities
 * 
 * Export all SuperEditor utility functions and templates
 * for easy importing across the application.
 * 
 * @example
 * // Import parser functions
 * import { processContent, parseEquationTags } from '@/components/supereditor/utils';
 * 
 * @example
 * // Import format templates
 * import { FORMAT_TEMPLATES, EXAMPLE_QUESTION_IMPORT } from '@/components/supereditor/utils';
 */

// Export all parser functions
export {
  parseEquationTags,
  parseTableMarkup,
  parseCustomTags,
  normalizeParagraphSpacing,
  processContent
} from './contentParser';

// Export all format templates and constants
export {
  SUPPORTED_TAGS,
  HEADING_LEVELS,
  KEY_CONCEPT_STYLES,
  STYLED_LIST_COLORS,
  CARD_GRID_STYLES,
  CARD_GRID_COLUMNS,
  TABLE_STYLES,
  SUPPORTED_LANGUAGES,
  EQUATION_TYPES,
  FORMAT_TEMPLATES,
  EXAMPLE_QUESTION_IMPORT,
  MINIMAL_QUESTION_IMPORT,
  validateImportFormat
} from './importFormats';

// Default export with everything
export { default as contentParser } from './contentParser';
export { default as importFormats } from './importFormats';
