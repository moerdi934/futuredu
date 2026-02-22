/**
 * SuperEditor Import Format Templates and Examples
 * 
 * This module provides comprehensive documentation and templates for importing
 * content into SuperEditor. Use these templates as reference when building
 * import features.
 * 
 * @module importFormats
 */

/**
 * Supported SuperEditor Custom Tags
 */
export const SUPPORTED_TAGS = {
  HEADING: 'Heading',
  KEY_CONCEPT: 'KeyConcept',
  STYLED_LIST: 'StyledList',
  LIST_ITEM: 'ListItem',
  CARD_GRID: 'CardGrid',
  CARD: 'Card',
  CODE_BLOCK: 'CodeBlock',
  TABLE: 'Table',
  ROW: 'Row',
  CELL: 'Cell',
  EQUATION: 'Equation'
} as const;

/**
 * Heading Levels (1-6)
 */
export const HEADING_LEVELS = [1, 2, 3, 4, 5, 6] as const;

/**
 * KeyConcept Styles
 */
export const KEY_CONCEPT_STYLES = [
  'classic',
  'important',
  'highlight',
  'warning',
  'insight',
  'definition',
  'goal',
  'info'
] as const;

/**
 * StyledList Colors
 */
export const STYLED_LIST_COLORS = [
  'blue',
  'green',
  'yellow',
  'orange',
  'red',
  'purple',
  'teal',
  'pink'
] as const;

/**
 * CardGrid Styles
 */
export const CARD_GRID_STYLES = [
  'blue',
  'green',
  'purple',
  'orange',
  'teal',
  'pink',
  'indigo',
  'amber'
] as const;

/**
 * CardGrid Column Options
 */
export const CARD_GRID_COLUMNS = [1, 2, 3, 4] as const;

/**
 * Table Styles
 */
export const TABLE_STYLES = [
  'bordered',
  'striped',
  'borderless'
] as const;

/**
 * Supported Programming Languages for CodeBlock
 */
export const SUPPORTED_LANGUAGES = [
  'javascript',
  'typescript',
  'python',
  'java',
  'cpp',
  'c',
  'csharp',
  'php',
  'ruby',
  'go',
  'rust',
  'swift',
  'kotlin',
  'sql',
  'html',
  'css',
  'scss',
  'json',
  'xml',
  'yaml',
  'markdown',
  'bash',
  'shell',
  'powershell',
  'r',
  'matlab',
  'latex',
  'plaintext'
] as const;

/**
 * Equation Display Types
 */
export const EQUATION_TYPES = ['inline', 'display'] as const;

/**
 * Format Templates - Use these as reference for your import JSON
 */
export const FORMAT_TEMPLATES = {
  /**
   * Heading Tag Template
   * Usage: <Heading kind="1">Your Title</Heading>
   */
  heading: {
    tag: 'Heading',
    attributes: {
      kind: 'number (1-6)'
    },
    example: '<Heading kind="2">Introduction to Mathematics</Heading>'
  },

  /**
   * KeyConcept Tag Template
   * Usage: <KeyConcept style="classic">Important concept here</KeyConcept>
   */
  keyConcept: {
    tag: 'KeyConcept',
    attributes: {
      style: 'classic | important | highlight | warning | insight | definition | goal | info'
    },
    example: '<KeyConcept style="important">This is a key concept that students must understand.</KeyConcept>'
  },

  /**
   * StyledList Tag Template
   * Usage: <StyledList><ListItem style="blue">Item 1</ListItem></StyledList>
   */
  styledList: {
    tag: 'StyledList',
    children: 'ListItem',
    listItemAttributes: {
      style: 'blue | green | yellow | orange | red | purple | teal | pink'
    },
    example: `<StyledList>
  <ListItem style="blue">First important point</ListItem>
  <ListItem style="green">Second important point</ListItem>
  <ListItem style="purple">Third important point</ListItem>
</StyledList>`
  },

  /**
   * CardGrid Tag Template
   * Usage: <CardGrid style="blue" columns="2"><Card title="Title">Content</Card></CardGrid>
   */
  cardGrid: {
    tag: 'CardGrid',
    attributes: {
      style: 'blue | green | purple | orange | teal | pink | indigo | amber',
      columns: 'number (1-4)'
    },
    children: 'Card',
    cardAttributes: {
      title: 'string'
    },
    example: `<CardGrid style="indigo" columns="2">
  <Card title="Option A">Description for option A</Card>
  <Card title="Option B">Description for option B</Card>
</CardGrid>`
  },

  /**
   * CodeBlock Tag Template
   * Usage: <CodeBlock language="python">print("Hello")</CodeBlock>
   */
  codeBlock: {
    tag: 'CodeBlock',
    attributes: {
      language: 'javascript | python | java | cpp | etc.'
    },
    example: `<CodeBlock language="python">
def factorial(n):
    if n <= 1:
        return 1
    return n * factorial(n - 1)
</CodeBlock>`
  },

  /**
   * Table Tag Template
   * Usage: <Table style="bordered" hasHeader="true"><Row><Cell>Data</Cell></Row></Table>
   */
  table: {
    tag: 'Table',
    attributes: {
      style: 'bordered | striped | borderless',
      hasHeader: 'true | false'
    },
    children: 'Row',
    rowChildren: 'Cell',
    example: `<Table style="bordered" hasHeader="true">
  <Row>
    <Cell>Header 1</Cell>
    <Cell>Header 2</Cell>
  </Row>
  <Row>
    <Cell>Data 1</Cell>
    <Cell>Data 2</Cell>
  </Row>
</Table>`
  },

  /**
   * Equation Tag Template
   * Usage: <Equation type="inline">x^2 + y^2 = z^2</Equation>
   */
  equation: {
    tag: 'Equation',
    attributes: {
      type: 'inline | display'
    },
    note: 'Use LaTeX syntax. Support multiline with \\\\ line breaks',
    example: `<Equation type="inline">E = mc^2</Equation>
<Equation type="display">\\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}</Equation>
<Equation type="display">
\\begin{cases}
x + y = 5 \\\\
2x - y = 1
\\end{cases}
</Equation>`
  }
};

/**
 * Complete Example: Question Import with Passage
 * This is a full example showing all supported tags
 */
export const EXAMPLE_QUESTION_IMPORT = {
  passage: {
    passageTitle: "Example Passage with All Tags",
    passageText: `<Heading kind="2">Understanding Mathematical Concepts</Heading>

<p>This passage demonstrates all available SuperEditor formatting tags that you can use when importing content.</p>

<KeyConcept style="important">Important: All tags are case-sensitive. Make sure to use the exact capitalization shown in the examples.</KeyConcept>

<CardGrid style="blue" columns="2">
  <Card title="Visual Learning">Use tables and diagrams to enhance understanding</Card>
  <Card title="Practice">Regular practice is key to mastery</Card>
</CardGrid>

<Heading kind="3">Key Points to Remember</Heading>

<StyledList>
  <ListItem style="blue">Always read the question carefully</ListItem>
  <ListItem style="green">Show your work step by step</ListItem>
  <ListItem style="purple">Double-check your calculations</ListItem>
</StyledList>

<Table style="bordered" hasHeader="true">
  <Row>
    <Cell>Concept</Cell>
    <Cell>Formula</Cell>
    <Cell>Example</Cell>
  </Row>
  <Row>
    <Cell>Area of Circle</Cell>
    <Cell><Equation type="inline">A = \\pi r^2</Equation></Cell>
    <Cell>For r=5: <Equation type="inline">A = 25\\pi</Equation></Cell>
  </Row>
</Table>

<Heading kind="3">Sample Code</Heading>

<CodeBlock language="python">
def calculate_area(radius):
    import math
    return math.pi * radius ** 2
</CodeBlock>

<p>The quadratic formula is shown below:</p>

<Equation type="display">
x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}
</Equation>`
  },
  question: {
    level: 3,
    questionType: "single-choice",
    questionText: "<p>What is the value of <Equation type=\"inline\">2^3 + 3^2</Equation>?</p>",
    bidang: "Penalaran Matematika",
    bidang_code: "PM1",
    topik: "Aljabar",
    topic_code: "AL",
    subtopic: "Eksponen",
    subtopic_code: "EX",
    subtopic_id: 301,
    passageTitle: "Example Passage with All Tags",
    options: [
      "<p>15</p>",
      "<p>17</p>",
      "<p>19</p>",
      "<p>21</p>",
      "<p>23</p>"
    ],
    correctAnswer: [1],
    explanation: `<Heading kind="3">Step-by-Step Solution</Heading>

<StyledList>
  <ListItem style="blue">First, calculate <Equation type="inline">2^3 = 2 \\times 2 \\times 2 = 8</Equation></ListItem>
  <ListItem style="green">Then, calculate <Equation type="inline">3^2 = 3 \\times 3 = 9</Equation></ListItem>
  <ListItem style="purple">Finally, add them: <Equation type="inline">8 + 9 = 17</Equation></ListItem>
</StyledList>

<KeyConcept style="classic">The answer is <strong>17</strong>.</KeyConcept>`
  }
};

/**
 * Minimal Import Example (Without Passage)
 */
export const MINIMAL_QUESTION_IMPORT = {
  level: 2,
  questionType: "single-choice",
  questionText: "<p>What is 5 + 3?</p>",
  bidang: "Penalaran Matematika",
  bidang_code: "PM1",
  topik: "Aritmatika",
  topic_code: "AR",
  subtopic: "Penjumlahan",
  subtopic_code: "PJ",
  subtopic_id: 101,
  options: [
    "<p>6</p>",
    "<p>7</p>",
    "<p>8</p>",
    "<p>9</p>",
    "<p>10</p>"
  ],
  correctAnswer: [2],
  explanation: "<p>5 + 3 = 8</p>"
};

/**
 * Helper function to validate import data structure
 */
export function validateImportFormat(data: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Check if it's an array
  if (!Array.isArray(data)) {
    errors.push('Import data must be an array');
    return { valid: false, errors };
  }

  // Validate each item
  data.forEach((item, index) => {
    // Check if it's a passage or question
    if (item.passageTitle && item.passageText) {
      // It's a passage - validate passage fields
      if (!item.passageTitle.trim()) {
        errors.push(`Item ${index}: Passage title is empty`);
      }
      if (!item.passageText.trim()) {
        errors.push(`Item ${index}: Passage text is empty`);
      }
    } else {
      // It's a question - validate required fields
      if (!item.questionText) {
        errors.push(`Item ${index}: Missing questionText`);
      }
      if (!item.questionType) {
        errors.push(`Item ${index}: Missing questionType`);
      }
      if (!item.level) {
        errors.push(`Item ${index}: Missing level`);
      }
      if (!item.options || !Array.isArray(item.options)) {
        errors.push(`Item ${index}: Missing or invalid options array`);
      }
      if (!item.correctAnswer || !Array.isArray(item.correctAnswer)) {
        errors.push(`Item ${index}: Missing or invalid correctAnswer array`);
      }
    }
  });

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Export default object with all templates and examples
 */
export default {
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
};
