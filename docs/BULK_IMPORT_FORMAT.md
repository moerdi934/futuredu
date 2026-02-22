# Bulk Question Import - Supported Format Reference

## Overview
This document describes all supported custom tags when importing questions via JSON to the bulk question creator. All tags will be automatically parsed and converted to SuperEditor-compatible HTML.

## ✅ Fully Supported Tags

### 1. **Equation Tags** 🧮
**Inline equations:**
```html
<Equation type="inline">E = mc^2</Equation>
<Equation type="inline">\frac{-b \pm \sqrt{b^2-4ac}}{2a}</Equation>
```

**Display equations (centered, block):**
```html
<Equation type="display">
\int_{a}^{b} f(x)dx = F(b) - F(a)
</Equation>
```

**Multiline equations:**
```html
<Equation type="display">
n(\text{Pop} \cup \text{K-Pop}) = n(Pop) + n(K-Pop) - n(Pop \cap K-Pop) \\
n(\text{Pop} \cup \text{K-Pop}) = 35 + 28 - 10 \\
n(\text{Pop} \cup \text{K-Pop}) = 53
</Equation>
```

---

### 2. **Table Tags** 📊

**Syntax:**
```html
<Table style="bordered|striped|borderless" hasHeader="true|false">
  <Row>
    <Cell>Header 1</Cell>
    <Cell>Header 2</Cell>
  </Row>
  <Row>
    <Cell>Data 1</Cell>
    <Cell>Data 2</Cell>
  </Row>
</Table>
```

**Styles:**
- `bordered` - Traditional table with borders
- `striped` - Alternating row colors
- `borderless` - Clean, minimalist

**Example:**
```html
<Table style="bordered" hasHeader="true">
  <Row>
    <Cell>Nilai Ujian</Cell>
    <Cell>Frekuensi</Cell>
  </Row>
  <Row>
    <Cell>50</Cell>
    <Cell>2</Cell>
  </Row>
  <Row>
    <Cell>60</Cell>
    <Cell>4</Cell>
  </Row>
</Table>
```

---

### 3. **Heading Tags** 📑

**Syntax:**
```html
<Heading kind="1">Main Title</Heading>
<Heading kind="2">Section</Heading>
<Heading kind="3">Subsection</Heading>
<Heading kind="4-6">Deeper levels</Heading>
```

**Levels:** 1 (largest) to 6 (smallest)

---

### 4. **KeyConcept Tags** 💡

**Syntax:**
```html
<KeyConcept style="classic|important|highlight|warning|insight|definition|goal|info">
Your key concept here
</KeyConcept>
```

**Styles:**
- `classic` (Purple) - General concepts
- `important` (Blue) - Critical info
- `highlight` (Indigo) - Special emphasis
- `warning` (Violet) - Cautions
- `insight` (Cyan) - Expert tips
- `definition` (Sky Blue) - Terms
- `goal` (Dark Blue) - Objectives
- `info` (Light Purple) - Notes

**Example:**
```html
<KeyConcept style="classic">
Mean = 71,5; Median = 70; Modus = 70
</KeyConcept>
```

---

### 5. **StyledList Tags** 📝

**Syntax:**
```html
<StyledList>
  <ListItem style="blue">First item</ListItem>
  <ListItem style="green">Second item</ListItem>
  <ListItem style="purple">Third item</ListItem>
</StyledList>
```

**Styles:**
- `blue` (📘) - Facts
- `green` (✅) - Conclusions
- `yellow` (⚠️) - Warnings
- `orange` (💡) - Examples
- `red` (❗) - Critical
- `purple` (🔮) - Concepts
- `teal` (📝) - Steps
- `pink` (✨) - Special

---

### 6. **CardGrid Tags** 🎴

**Syntax:**
```html
<CardGrid style="blue|green|purple|orange|teal|pink|indigo|amber" columns="1-4">
  <Card title="Card Title 1">Content 1</Card>
  <Card title="Card Title 2">Content 2</Card>
</CardGrid>
```

**Examples:**
```html
<CardGrid style="indigo" columns="2">
  <Card title="Rekening A (Bunga Tunggal)">
    Memberikan bunga 10% per tahun
  </Card>
  <Card title="Rekening B (Bunga Majemuk)">
    Bunga berbunga, tumbuh lebih cepat
  </Card>
</CardGrid>
```

---

### 7. **CodeBlock Tags** 💻

**Syntax:**
```html
<CodeBlock language="javascript|python|html|css|...">
your code here
</CodeBlock>
```

**Supported languages:** JavaScript, Python, HTML, CSS, TypeScript, Java, C++, SQL, and 30+ more.

---

## 📦 Complete Import JSON Example

```json
{
  "level": 3,
  "questionType": "single-choice",
  "questionText": "<p>What is <Equation type=\"inline\">2 + 2</Equation>?</p>",
  "bidang": "Matematika",
  "bidang_code": "MAT",
  "topik": "Aritmatika",
  "topic_code": "ART",
  "subtopic": "Penjumlahan",
  "subtopic_code": "PEN",
  "subtopic_id": 100,
  "passageTitle": "Basic Math",
  "options": [
    "<p>3</p>",
    "<p>4</p>",
    "<p>5</p>"
  ],
  "correctAnswer": [1],
  "explanation": "<div><Heading kind=\"3\">Solution</Heading><p>Simply add:</p><Equation type=\"display\">2 + 2 = 4</Equation><KeyConcept style=\"classic\">The answer is <strong>4</strong></KeyConcept></div>"
}
```

---

## 🔍 Testing & Debugging

When importing, check browser console (F12) for detailed logs:
- 🧮 Equation parsing logs
- 📊 Table parsing logs
- 📑 Heading parsing logs
- 💡 KeyConcept parsing logs
- 📝 StyledList parsing logs
- 🎴 CardGrid parsing logs
- ✅ Success indicators
- ❌ Error messages with details

---

## ⚠️ Important Notes

1. **Case Sensitivity:** Tags are case-insensitive (`<Table>` = `<table>`)
2. **Nesting:** You can nest tags inside each other
3. **HTML Support:** Standard HTML tags (`<p>`, `<strong>`, `<em>`, `<ul>`, `<li>`) work inside custom tags
4. **Escape Characters:** Use `\\` for LaTeX line breaks in equations
5. **Passage Search:** `passageTitle` must match existing passage title exactly

---

## 🐛 Common Issues

**Problem:** Table not rendering
- ✅ Check `hasHeader` is exactly `"true"` or `"false"` (with quotes)
- ✅ Ensure proper `<Row>` and `<Cell>` structure
- ✅ Style must be one of: bordered, striped, borderless

**Problem:** Equation not rendering
- ✅ Use `type="inline"` or `type="display"` (not `kind`)
- ✅ Check LaTeX syntax is valid
- ✅ Use `\\` for line breaks, not `\n`

**Problem:** Passage not found (404)
- ✅ Create passage first with exact title
- ✅ Check API endpoint: `/questions/passage/search?search=...`

---

Generated: 2026-02-22
