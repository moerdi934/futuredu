-- ================================================================
-- MIGRATION: Literasi Bahasa Inggris - Full Restructure
-- Mapel: id=145, code='LBE'
-- Flow:
--   STEP 1: INSERT section & topic baru
--   STEP 2: UPDATE questions.question_topic_type (lama → baru)
--   STEP 3: DELETE topic & section lama
-- ================================================================

BEGIN;

-- ================================================================
-- STEP 1A: INSERT kind=2 (Section) BARU
-- master_id = 145 (Literasi Bahasa Inggris)
-- ================================================================

INSERT INTO public.exam_types (name, description, code, kind, master_id, create_date)
VALUES
    (
        'Text Idea',
        'Understanding and analyzing the core ideas of a text, including main idea, purpose, detail information, inference, and author''s attitude.',
        'TI', 2, 145, NOW()
    ),
    (
        'Text Structure',
        'Analyzing how information is organized and structured in a text, including organization of ideas, transitions, coherence, and sentence function.',
        'TS', 2, 145, NOW()
    ),
    (
        'Vocabulary',
        'Understanding vocabulary in context, including synonyms, pronoun reference, paraphrase, affixes, and figurative language.',
        'VO', 2, 145, NOW()
    ),
    (
        'Text Analysis',
        'Analyzing complex text types including two-text comparison, cloze test, infographic, text reconstruction, genre-specific texts, and summary.',
        'TA', 2, 145, NOW()
    )
ON CONFLICT (master_id, code) DO UPDATE SET
    name        = EXCLUDED.name,
    description = EXCLUDED.description,
    edit_date   = NOW();


-- ================================================================
-- STEP 1B: INSERT kind=3 (Topic) BARU
-- ================================================================

-- ── Section: Text Idea (TI) ──────────────────────────────────────
INSERT INTO public.exam_types (name, description, code, kind, master_id, create_date)
VALUES
    (
        'Main Idea',
        'Identifying the main idea and topic of a text, determining the best title, and analyzing main ideas across single and multi-paragraph texts.',
        'MI', 3, (SELECT id FROM public.exam_types WHERE code = 'TI' AND master_id = 145), NOW()
    ),
    (
        'Purpose',
        'Identifying the author''s purpose in writing a text or specific paragraph, analyzing purpose across various text genres, and understanding vocabulary used to express purpose.',
        'PU', 3, (SELECT id FROM public.exam_types WHERE code = 'TI' AND master_id = 145), NOW()
    ),
    (
        'Detail Information',
        'Locating and analyzing stated and unstated information in a text, using scanning techniques, identifying paraphrased information, and handling EXCEPT/NOT TRUE question types.',
        'DI', 3, (SELECT id FROM public.exam_types WHERE code = 'TI' AND master_id = 145), NOW()
    ),
    (
        'Inference',
        'Drawing logical conclusions from implicit information, analyzing local and global inferences, and identifying common traps in inference questions.',
        'IN', 3, (SELECT id FROM public.exam_types WHERE code = 'TI' AND master_id = 145), NOW()
    ),
    (
        'Author''s Attitude',
        'Identifying the author''s opinion, tone, and attitude toward a topic, distinguishing fact from opinion, and analyzing emotional language and bias.',
        'AT', 3, (SELECT id FROM public.exam_types WHERE code = 'TI' AND master_id = 145), NOW()
    )
ON CONFLICT (master_id, code) DO UPDATE SET
    name        = EXCLUDED.name,
    description = EXCLUDED.description,
    edit_date   = NOW();


-- ── Section: Text Structure (TS) ────────────────────────────────
INSERT INTO public.exam_types (name, description, code, kind, master_id, create_date)
VALUES
    (
        'Organization of Ideas',
        'Analyzing how information is organized in a text using various patterns such as chronological, cause-effect, problem-solution, and compare-contrast, as well as relationships between paragraphs.',
        'OI', 3, (SELECT id FROM public.exam_types WHERE code = 'TS' AND master_id = 145), NOW()
    ),
    (
        'Transition Questions',
        'Predicting the content of preceding and following paragraphs based on logical flow, transition words, and common organizational patterns in texts.',
        'TQ', 3, (SELECT id FROM public.exam_types WHERE code = 'TS' AND master_id = 145), NOW()
    ),
    (
        'Text Coherence',
        'Analyzing coherence and cohesion in a text through pronoun reference, transition words, parallel structures, logical flow between sentences, and paragraph unity.',
        'TC', 3, (SELECT id FROM public.exam_types WHERE code = 'TS' AND master_id = 145), NOW()
    ),
    (
        'Sentence Function',
        'Identifying the function of sentences within a paragraph, including topic sentences, supporting sentences, and concluding sentences, and analyzing different paragraph development patterns.',
        'SF', 3, (SELECT id FROM public.exam_types WHERE code = 'TS' AND master_id = 145), NOW()
    )
ON CONFLICT (master_id, code) DO UPDATE SET
    name        = EXCLUDED.name,
    description = EXCLUDED.description,
    edit_date   = NOW();


-- ── Section: Vocabulary (VO) ─────────────────────────────────────
INSERT INTO public.exam_types (name, description, code, kind, master_id, create_date)
VALUES
    (
        'Synonym',
        'Identifying synonyms and nearest meanings using context clues, understanding multiple meanings of words, and analyzing vocabulary across different word classes and academic registers.',
        'SY', 3, (SELECT id FROM public.exam_types WHERE code = 'VO' AND master_id = 145), NOW()
    ),
    (
        'Reference',
        'Identifying pronoun references and their antecedents, including personal, demonstrative, and relative pronouns, and resolving ambiguous references using contextual clues.',
        'RF', 3, (SELECT id FROM public.exam_types WHERE code = 'VO' AND master_id = 145), NOW()
    ),
    (
        'Paraphrase',
        'Recognizing paraphrased information through synonym substitution and structural changes, and identifying common traps in restatement questions.',
        'PP', 3, (SELECT id FROM public.exam_types WHERE code = 'VO' AND master_id = 145), NOW()
    ),
    (
        'Affixes',
        'Understanding word formation through common prefixes, suffixes, and root words to infer the meaning of unfamiliar vocabulary.',
        'AF', 3, (SELECT id FROM public.exam_types WHERE code = 'VO' AND master_id = 145), NOW()
    ),
    (
        'Idiom',
        'Interpreting figurative language including idioms, metaphors, similes, connotation vs denotation, and other figurative devices such as personification, hyperbole, and irony.',
        'ID', 3, (SELECT id FROM public.exam_types WHERE code = 'VO' AND master_id = 145), NOW()
    )
ON CONFLICT (master_id, code) DO UPDATE SET
    name        = EXCLUDED.name,
    description = EXCLUDED.description,
    edit_date   = NOW();


-- ── Section: Text Analysis (TA) ──────────────────────────────────
INSERT INTO public.exam_types (name, description, code, kind, master_id, create_date)
VALUES
    (
        'Two Texts Comparison',
        'Analyzing and comparing two related texts to identify similarities, differences, and relationships such as complementary, contradictory, elaborative, or sequential.',
        'TT', 3, (SELECT id FROM public.exam_types WHERE code = 'TA' AND master_id = 145), NOW()
    ),
    (
        'Cloze Test',
        'Filling in blanks in a text based on grammar rules, vocabulary, and logical connectors to ensure coherence and accuracy.',
        'CT', 3, (SELECT id FROM public.exam_types WHERE code = 'TA' AND master_id = 145), NOW()
    ),
    (
        'Infographic',
        'Reading and interpreting visual data including bar charts, pie charts, line graphs, and tables to extract information and make inferences.',
        'IG', 3, (SELECT id FROM public.exam_types WHERE code = 'TA' AND master_id = 145), NOW()
    ),
    (
        'Text Reconstruction',
        'Completing missing sentences in a text and ordering jumbled sentences using coherence, logical flow, and transition markers.',
        'TR', 3, (SELECT id FROM public.exam_types WHERE code = 'TA' AND master_id = 145), NOW()
    ),
    (
        'Genre-Specific Text Analysis',
        'Analyzing different text genres in SNBT including general interest, literary, scientific/technical, and social humanities texts, each with distinct language and structural characteristics.',
        'GS', 3, (SELECT id FROM public.exam_types WHERE code = 'TA' AND master_id = 145), NOW()
    ),
    (
        'Summary',
        'Identifying and synthesizing the essential points of a single paragraph or multi-paragraph text, distinguishing main points from supporting details.',
        'SM', 3, (SELECT id FROM public.exam_types WHERE code = 'TA' AND master_id = 145), NOW()
    )
ON CONFLICT (master_id, code) DO UPDATE SET
    name        = EXCLUDED.name,
    description = EXCLUDED.description,
    edit_date   = NOW();


-- ================================================================
-- STEP 2: UPDATE questions.question_topic_type (lama → baru)
--
-- id=150 Main Idea           → Main Idea (MI)            [TI]
-- id=151 Text Details        → Detail Information (DI)    [TI]
-- id=152 Logical Inference   → Inference (IN)             [TI]
-- id=153 Author Analysis     → Author's Attitude (AT)     [TI]
-- id=154 Text Coherence      → Text Coherence (TC)        [TS]
-- id=155 Analogy/Comparison  → Two Texts Comparison (TT)  [TA]
-- id=157 Vocabulary          → Synonym (SY)               [VO]
-- id=159 Hypothesis Formation→ Inference (IN)             [TI]
-- ================================================================

-- Main Idea → Main Idea
UPDATE public.questions
SET
    question_topic_type = (
        SELECT et.id FROM public.exam_types et
        JOIN public.exam_types sec ON sec.id = et.master_id
        WHERE et.code = 'MI' AND sec.code = 'TI' AND sec.master_id = 145
    ),
    edit_date = NOW()
WHERE question_topic_type = 150;

-- Text Details → Detail Information
UPDATE public.questions
SET
    question_topic_type = (
        SELECT et.id FROM public.exam_types et
        JOIN public.exam_types sec ON sec.id = et.master_id
        WHERE et.code = 'DI' AND sec.code = 'TI' AND sec.master_id = 145
    ),
    edit_date = NOW()
WHERE question_topic_type = 151;

-- Logical Inference → Inference
UPDATE public.questions
SET
    question_topic_type = (
        SELECT et.id FROM public.exam_types et
        JOIN public.exam_types sec ON sec.id = et.master_id
        WHERE et.code = 'IN' AND sec.code = 'TI' AND sec.master_id = 145
    ),
    edit_date = NOW()
WHERE question_topic_type = 152;

-- Author Analysis → Author's Attitude
UPDATE public.questions
SET
    question_topic_type = (
        SELECT et.id FROM public.exam_types et
        JOIN public.exam_types sec ON sec.id = et.master_id
        WHERE et.code = 'AT' AND sec.code = 'TI' AND sec.master_id = 145
    ),
    edit_date = NOW()
WHERE question_topic_type = 153;

-- Text Coherence → Text Coherence
UPDATE public.questions
SET
    question_topic_type = (
        SELECT et.id FROM public.exam_types et
        JOIN public.exam_types sec ON sec.id = et.master_id
        WHERE et.code = 'TC' AND sec.code = 'TS' AND sec.master_id = 145
    ),
    edit_date = NOW()
WHERE question_topic_type = 154;

-- Analogy and Comparison → Two Texts Comparison
UPDATE public.questions
SET
    question_topic_type = (
        SELECT et.id FROM public.exam_types et
        JOIN public.exam_types sec ON sec.id = et.master_id
        WHERE et.code = 'TT' AND sec.code = 'TA' AND sec.master_id = 145
    ),
    edit_date = NOW()
WHERE question_topic_type = 155;

-- Vocabulary → Synonym
UPDATE public.questions
SET
    question_topic_type = (
        SELECT et.id FROM public.exam_types et
        JOIN public.exam_types sec ON sec.id = et.master_id
        WHERE et.code = 'SY' AND sec.code = 'VO' AND sec.master_id = 145
    ),
    edit_date = NOW()
WHERE question_topic_type = 157;

-- Hypothesis Formation → Inference
UPDATE public.questions
SET
    question_topic_type = (
        SELECT et.id FROM public.exam_types et
        JOIN public.exam_types sec ON sec.id = et.master_id
        WHERE et.code = 'IN' AND sec.code = 'TI' AND sec.master_id = 145
    ),
    edit_date = NOW()
WHERE question_topic_type = 159;


-- ================================================================
-- STEP 3: DELETE topic & section lama
-- Hapus kind=3 (topic) dulu, baru kind=2 (section)
-- ================================================================

-- Hapus semua topic lama (kind=3)
DELETE FROM public.exam_types
WHERE id IN (150, 151, 152, 153, 154, 155, 157, 159);

-- Hapus semua section lama (kind=2)
DELETE FROM public.exam_types
WHERE id IN (146, 156, 158);


-- ================================================================
-- VERIFICATION (uncomment untuk cek hasil setelah COMMIT)
-- ================================================================

-- Cek struktur baru Literasi Bahasa Inggris:
-- SELECT
--     et3.name AS mapel,
--     et2.id   AS section_id, et2.name AS section, et2.code AS section_code,
--     et.id    AS topic_id,   et.name  AS topic,   et.code  AS topic_code
-- FROM public.exam_types et
-- JOIN public.exam_types et2 ON et2.id = et.master_id
-- JOIN public.exam_types et3 ON et3.id = et2.master_id
-- WHERE et.kind = 3 AND et3.name = 'Literasi Bahasa Inggris'
-- ORDER BY et2.name, et.name;

-- Cek tidak ada questions yang masih pakai topic lama:
-- SELECT COUNT(*) FROM public.questions
-- WHERE question_topic_type IN (150,151,152,153,154,155,157,159);
-- (harusnya = 0)

-- Cek distribusi questions per topic baru:
-- SELECT et.name AS topic, et2.name AS section, COUNT(q.id) AS total_questions
-- FROM public.questions q
-- JOIN public.exam_types et  ON et.id  = q.question_topic_type
-- JOIN public.exam_types et2 ON et2.id = et.master_id
-- JOIN public.exam_types et3 ON et3.id = et2.master_id
-- WHERE et3.name = 'Literasi Bahasa Inggris'
-- GROUP BY et.name, et2.name
-- ORDER BY et2.name, et.name;

COMMIT;