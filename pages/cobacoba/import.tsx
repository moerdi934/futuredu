// pages/content-importer/page.tsx
'use client';

import React, { useState, useRef, useEffect } from 'react';
import SuperEditor from '../../components/supereditor/SuperEditor';
import { ButtonGradient } from '../../components/button/ButtonTemplate';
import { Upload, FileJson, AlertCircle, CheckCircle, Download, BookOpen } from 'lucide-react';
import { 
  parseCustomContent, 
  applySyntaxHighlighting,
  validateImportedData,
  generateTutorialContent
} from '../../utils/SuperEditorImportHandler';
import 'katex/dist/katex.min.css';

// Dynamically load highlight.js
let hljsLoaded = false;

const loadHighlightJS = async () => {
  if (hljsLoaded || typeof window === 'undefined') return;
  
  try {
    const hljs = await import('highlight.js/lib/core');
    
    // Import commonly used languages
    const [
      javascript, typescript, python, java, cpp, c, csharp, php, ruby, go,
      rust, swift, kotlin, dart, scala, r, matlab, sql, html, css, scss,
      xml, json, yaml, markdown, bash, shell, powershell, dockerfile,
      nginx, apache, plaintext
    ] = await Promise.all([
      import('highlight.js/lib/languages/javascript'),
      import('highlight.js/lib/languages/typescript'),
      import('highlight.js/lib/languages/python'),
      import('highlight.js/lib/languages/java'),
      import('highlight.js/lib/languages/cpp'),
      import('highlight.js/lib/languages/c'),
      import('highlight.js/lib/languages/csharp'),
      import('highlight.js/lib/languages/php'),
      import('highlight.js/lib/languages/ruby'),
      import('highlight.js/lib/languages/go'),
      import('highlight.js/lib/languages/rust'),
      import('highlight.js/lib/languages/swift'),
      import('highlight.js/lib/languages/kotlin'),
      import('highlight.js/lib/languages/dart'),
      import('highlight.js/lib/languages/scala'),
      import('highlight.js/lib/languages/r'),
      import('highlight.js/lib/languages/matlab'),
      import('highlight.js/lib/languages/sql'),
      import('highlight.js/lib/languages/xml'),
      import('highlight.js/lib/languages/css'),
      import('highlight.js/lib/languages/scss'),
      import('highlight.js/lib/languages/xml'),
      import('highlight.js/lib/languages/json'),
      import('highlight.js/lib/languages/yaml'),
      import('highlight.js/lib/languages/markdown'),
      import('highlight.js/lib/languages/bash'),
      import('highlight.js/lib/languages/shell'),
      import('highlight.js/lib/languages/powershell'),
      import('highlight.js/lib/languages/dockerfile'),
      import('highlight.js/lib/languages/nginx'),
      import('highlight.js/lib/languages/apache'),
      import('highlight.js/lib/languages/plaintext')
    ]);

    // Register languages
    hljs.default.registerLanguage('javascript', javascript.default);
    hljs.default.registerLanguage('typescript', typescript.default);
    hljs.default.registerLanguage('python', python.default);
    hljs.default.registerLanguage('java', java.default);
    hljs.default.registerLanguage('cpp', cpp.default);
    hljs.default.registerLanguage('c', c.default);
    hljs.default.registerLanguage('csharp', csharp.default);
    hljs.default.registerLanguage('php', php.default);
    hljs.default.registerLanguage('ruby', ruby.default);
    hljs.default.registerLanguage('go', go.default);
    hljs.default.registerLanguage('rust', rust.default);
    hljs.default.registerLanguage('swift', swift.default);
    hljs.default.registerLanguage('kotlin', kotlin.default);
    hljs.default.registerLanguage('dart', dart.default);
    hljs.default.registerLanguage('scala', scala.default);
    hljs.default.registerLanguage('r', r.default);
    hljs.default.registerLanguage('matlab', matlab.default);
    hljs.default.registerLanguage('sql', sql.default);
    hljs.default.registerLanguage('html', html.default);
    hljs.default.registerLanguage('xml', xml.default);
    hljs.default.registerLanguage('css', css.default);
    hljs.default.registerLanguage('scss', scss.default);
    hljs.default.registerLanguage('json', json.default);
    hljs.default.registerLanguage('yaml', yaml.default);
    hljs.default.registerLanguage('markdown', markdown.default);
    hljs.default.registerLanguage('bash', bash.default);
    hljs.default.registerLanguage('shell', shell.default);
    hljs.default.registerLanguage('powershell', powershell.default);
    hljs.default.registerLanguage('dockerfile', dockerfile.default);
    hljs.default.registerLanguage('nginx', nginx.default);
    hljs.default.registerLanguage('apache', apache.default);
    hljs.default.registerLanguage('plaintext', plaintext.default);

    // Import CSS
    await import('highlight.js/styles/github-dark.min.css');

    (window as any).hljs = hljs.default;
    hljsLoaded = true;
  } catch (error) {
    console.error('Error loading highlight.js:', error);
  }
};

// Load KaTeX
const loadKaTeX = async () => {
  if (typeof window === 'undefined') return;
  if ((window as any).katex) return;
  
  try {
    const katex = await import('katex');
    (window as any).katex = katex.default;
  } catch (error) {
    console.error('Error loading KaTeX:', error);
  }
};

interface ImportedData {
  title?: string;
  author?: string;
  isActive?: boolean;
  category?: string;
  tags?: string[];
  publishDate?: string;
  content: string;
  [key: string]: any;
}

const ContentImporterPage: React.FC = () => {
  const [editorContent, setEditorContent] = useState<string>('');
  const [formData, setFormData] = useState<ImportedData>({
    title: '',
    author: '',
    isActive: true,
    category: '',
    tags: [],
    publishDate: '',
    content: ''
  });
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load highlight.js and KaTeX on component mount
  useEffect(() => {
    loadHighlightJS();
    loadKaTeX();
  }, []);

  // Load tutorial content on mount
  useEffect(() => {
    const tutorialContent = generateTutorialContent();
    setEditorContent(tutorialContent);
    setFormData(prev => ({ ...prev, content: tutorialContent }));
    
    // Apply syntax highlighting and render equations after a short delay
    setTimeout(() => {
      applySyntaxHighlighting();
    }, 500);
  }, []);

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const jsonData = JSON.parse(e.target?.result as string) as ImportedData;
        
        // Validate data structure
        const validation = validateImportedData(jsonData);
        if (!validation.valid) {
          setImportStatus('error');
          setErrorMessage(validation.error || 'Invalid JSON format');
          return;
        }

        // Parse custom tags to HTML using utility
        const parsedContent = parseCustomContent(jsonData.content);
        
        // Set form data with all fields
        setFormData({
          title: jsonData.title || '',
          author: jsonData.author || '',
          isActive: jsonData.isActive !== undefined ? jsonData.isActive : true,
          category: jsonData.category || '',
          tags: Array.isArray(jsonData.tags) ? jsonData.tags : [],
          publishDate: jsonData.publishDate || '',
          content: parsedContent,
          ...jsonData // Include any additional fields
        });
        
        setEditorContent(parsedContent);
        setImportStatus('success');
        setErrorMessage('');

        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        
        // Apply syntax highlighting and render equations after content is set
        setTimeout(() => {
          applySyntaxHighlighting();
        }, 100);

      } catch (error) {
        setImportStatus('error');
        setErrorMessage('Invalid JSON file format');
        console.error('Import error:', error);
      }
    };

    reader.onerror = () => {
      setImportStatus('error');
      setErrorMessage('Error reading file');
    };

    reader.readAsText(file);
  };

  const handleEditorChange = (content: string) => {
    setEditorContent(content);
    setFormData(prev => ({ ...prev, content }));
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleTagsChange = (value: string) => {
    const tagsArray = value.split(',').map(tag => tag.trim()).filter(tag => tag);
    setFormData(prev => ({ ...prev, tags: tagsArray }));
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const clearContent = () => {
    const tutorialContent = generateTutorialContent();
    setEditorContent(tutorialContent);
    setFormData({
      title: '',
      author: '',
      isActive: true,
      category: '',
      tags: [],
      publishDate: '',
      content: tutorialContent
    });
    setImportStatus('idle');
    setErrorMessage('');
    
    // Apply syntax highlighting and render equations
    setTimeout(() => {
      applySyntaxHighlighting();
    }, 100);
  };

  const exportToJson = () => {
    const jsonData = {
      ...formData,
      content: editorContent
    };
    
    const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `content-export-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const loadTutorial = () => {
    const tutorialContent = generateTutorialContent();
    setEditorContent(tutorialContent);
    setFormData(prev => ({ ...prev, content: tutorialContent }));
    setImportStatus('idle');
    setErrorMessage('');
    
    setTimeout(() => {
      applySyntaxHighlighting();
    }, 100);
  };

  return (
    <div className="tw-min-h-screen tw-bg-gradient-to-br tw-from-purple-50 tw-via-blue-50 tw-to-pink-50 tw-p-4 md:tw-p-8">
      <div className="tw-max-w-7xl tw-mx-auto">
        {/* Header */}
        <div className="tw-bg-white tw-rounded-2xl tw-shadow-lg tw-p-6 tw-mb-6">
          <div className="tw-flex tw-items-center tw-justify-between tw-flex-wrap tw-gap-4">
            <div>
              <h1 className="tw-text-3xl tw-font-bold tw-text-purple-700 tw-flex tw-items-center tw-gap-3">
                <FileJson className="tw-w-8 tw-h-8" />
                Content Importer
              </h1>
              <p className="tw-text-sm tw-text-gray-600 tw-mt-1">
                Import structured content with custom tags into SuperEditor
              </p>
            </div>
            
            <div className="tw-flex tw-gap-3 tw-flex-wrap">
              <ButtonGradient
                action="custom"
                customText="View Tutorial"
                customIcon={<BookOpen className="tw-w-4 tw-h-4" />}
                onClick={loadTutorial}
                size="md"
                customColors={{
                  primary: '#3B82F6',
                  secondary: '#2563EB',
                  gradient1: '#3B82F6',
                  gradient2: '#60A5FA',
                  text: '#FFFFFF'
                }}
              />

              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className="tw-hidden"
              />
              
              <ButtonGradient
                action="custom"
                customText="Import JSON"
                customIcon={<Upload className="tw-w-4 tw-h-4" />}
                onClick={triggerFileInput}
                size="md"
                customColors={{
                  primary: '#8B5CF6',
                  secondary: '#7C3AED',
                  gradient1: '#8B5CF6',
                  gradient2: '#A855F7',
                  text: '#FFFFFF'
                }}
              />

              {editorContent && (
                <>
                  <ButtonGradient
                    action="custom"
                    customText="Export JSON"
                    customIcon={<Download className="tw-w-4 tw-h-4" />}
                    onClick={exportToJson}
                    size="md"
                    customColors={{
                      primary: '#10B981',
                      secondary: '#059669',
                      gradient1: '#10B981',
                      gradient2: '#34D399',
                      text: '#FFFFFF'
                    }}
                  />

                  <ButtonGradient
                    action="delete"
                    customText="Clear"
                    onClick={clearContent}
                    size="md"
                  />
                </>
              )}
            </div>
          </div>

          {/* Status Messages */}
          {importStatus === 'success' && (
            <div className="tw-mt-4 tw-bg-green-50 tw-border-2 tw-border-green-200 tw-rounded-lg tw-p-4 tw-flex tw-items-center tw-gap-3">
              <CheckCircle className="tw-w-5 tw-h-5 tw-text-green-600 tw-flex-shrink-0" />
              <span className="tw-text-green-700 tw-font-medium">
                Content imported successfully!
              </span>
            </div>
          )}

          {importStatus === 'error' && (
            <div className="tw-mt-4 tw-bg-red-50 tw-border-2 tw-border-red-200 tw-rounded-lg tw-p-4 tw-flex tw-items-center tw-gap-3">
              <AlertCircle className="tw-w-5 tw-h-5 tw-text-red-600 tw-flex-shrink-0" />
              <span className="tw-text-red-700 tw-font-medium">
                {errorMessage}
              </span>
            </div>
          )}
        </div>

        {/* Form Fields */}
        {editorContent && (
          <div className="tw-bg-white tw-rounded-2xl tw-shadow-lg tw-p-6 tw-mb-6">
            <h2 className="tw-text-xl tw-font-bold tw-text-purple-700 tw-mb-4">
              Metadata
            </h2>
            
            <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 tw-gap-4">
              {/* Title */}
              <div>
                <label className="tw-block tw-text-sm tw-font-medium tw-text-gray-700 tw-mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={formData.title || ''}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className="tw-w-full tw-px-4 tw-py-2 tw-border tw-border-gray-300 tw-rounded-lg focus:tw-ring-2 focus:tw-ring-purple-500 focus:tw-border-transparent tw-outline-none"
                  placeholder="Enter title"
                />
              </div>

              {/* Author */}
              <div>
                <label className="tw-block tw-text-sm tw-font-medium tw-text-gray-700 tw-mb-2">
                  Author
                </label>
                <input
                  type="text"
                  value={formData.author || ''}
                  onChange={(e) => handleInputChange('author', e.target.value)}
                  className="tw-w-full tw-px-4 tw-py-2 tw-border tw-border-gray-300 tw-rounded-lg focus:tw-ring-2 focus:tw-ring-purple-500 focus:tw-border-transparent tw-outline-none"
                  placeholder="Enter author"
                />
              </div>

              {/* Category */}
              <div>
                <label className="tw-block tw-text-sm tw-font-medium tw-text-gray-700 tw-mb-2">
                  Category
                </label>
                <input
                  type="text"
                  value={formData.category || ''}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  className="tw-w-full tw-px-4 tw-py-2 tw-border tw-border-gray-300 tw-rounded-lg focus:tw-ring-2 focus:tw-ring-purple-500 focus:tw-border-transparent tw-outline-none"
                  placeholder="Enter category"
                />
              </div>

              {/* Publish Date */}
              <div>
                <label className="tw-block tw-text-sm tw-font-medium tw-text-gray-700 tw-mb-2">
                  Publish Date
                </label>
                <input
                  type="date"
                  value={formData.publishDate || ''}
                  onChange={(e) => handleInputChange('publishDate', e.target.value)}
                  className="tw-w-full tw-px-4 tw-py-2 tw-border tw-border-gray-300 tw-rounded-lg focus:tw-ring-2 focus:tw-ring-purple-500 focus:tw-border-transparent tw-outline-none"
                />
              </div>

              {/* Tags */}
              <div className="md:tw-col-span-2">
                <label className="tw-block tw-text-sm tw-font-medium tw-text-gray-700 tw-mb-2">
                  Tags (comma-separated)
                </label>
                <input
                  type="text"
                  value={formData.tags?.join(', ') || ''}
                  onChange={(e) => handleTagsChange(e.target.value)}
                  className="tw-w-full tw-px-4 tw-py-2 tw-border tw-border-gray-300 tw-rounded-lg focus:tw-ring-2 focus:tw-ring-purple-500 focus:tw-border-transparent tw-outline-none"
                  placeholder="tag1, tag2, tag3"
                />
              </div>

              {/* Is Active Toggle */}
              <div className="tw-flex tw-items-center tw-gap-3">
                <label className="tw-text-sm tw-font-medium tw-text-gray-700">
                  Is Active
                </label>
                <button
                  onClick={() => handleInputChange('isActive', !formData.isActive)}
                  className={`tw-relative tw-inline-flex tw-h-6 tw-w-11 tw-items-center tw-rounded-full tw-transition-colors ${
                    formData.isActive ? 'tw-bg-purple-600' : 'tw-bg-gray-300'
                  }`}
                >
                  <span
                    className={`tw-inline-block tw-h-4 tw-w-4 tw-transform tw-rounded-full tw-bg-white tw-transition-transform ${
                      formData.isActive ? 'tw-translate-x-6' : 'tw-translate-x-1'
                    }`}
                  />
                </button>
                <span className="tw-text-sm tw-text-gray-600">
                  {formData.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Editor */}
        <div className="tw-bg-white tw-rounded-2xl tw-shadow-lg tw-p-6">
          <h2 className="tw-text-xl tw-font-bold tw-text-purple-700 tw-mb-4">
            Content Editor
          </h2>
          
          <SuperEditor
            onChange={handleEditorChange}
            initialValue={editorContent}
            height="600px"
          />
        </div>
      </div>
    </div>
  );
};

export default ContentImporterPage;