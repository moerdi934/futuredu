// Import highlight.js core
import hljs from 'highlight.js/lib/core';

// Import individual languages
import ada from 'highlight.js/lib/languages/ada';
import apache from 'highlight.js/lib/languages/apache';
import arduino from 'highlight.js/lib/languages/arduino';
import xml from 'highlight.js/lib/languages/xml';
import asciidoc from 'highlight.js/lib/languages/asciidoc';
import autohotkey from 'highlight.js/lib/languages/autohotkey';
import bash from 'highlight.js/lib/languages/bash';
import basic from 'highlight.js/lib/languages/basic';
import c from 'highlight.js/lib/languages/c';
import cmake from 'highlight.js/lib/languages/cmake';
import cpp from 'highlight.js/lib/languages/cpp';
import crystal from 'highlight.js/lib/languages/crystal';
import csharp from 'highlight.js/lib/languages/csharp';
import css from 'highlight.js/lib/languages/css';
import markdown from 'highlight.js/lib/languages/markdown';
import dart from 'highlight.js/lib/languages/dart';
import delphi from 'highlight.js/lib/languages/delphi';
import django from 'highlight.js/lib/languages/django';
import dns from 'highlight.js/lib/languages/dns';
import dockerfile from 'highlight.js/lib/languages/dockerfile';
import elixir from 'highlight.js/lib/languages/elixir';
import ruby from 'highlight.js/lib/languages/ruby';
import erlang from 'highlight.js/lib/languages/erlang';
import excel from 'highlight.js/lib/languages/excel';
import fortran from 'highlight.js/lib/languages/fortran';
import fsharp from 'highlight.js/lib/languages/fsharp';
import go from 'highlight.js/lib/languages/go';
import golo from 'highlight.js/lib/languages/golo';
import gradle from 'highlight.js/lib/languages/gradle';
import graphql from 'highlight.js/lib/languages/graphql';
import haml from 'highlight.js/lib/languages/haml';
import haskell from 'highlight.js/lib/languages/haskell';
import http from 'highlight.js/lib/languages/http';
import java from 'highlight.js/lib/languages/java';
import javascript from 'highlight.js/lib/languages/javascript';
import json from 'highlight.js/lib/languages/json';
import julia from 'highlight.js/lib/languages/julia';
import kotlin from 'highlight.js/lib/languages/kotlin';
import latex from 'highlight.js/lib/languages/latex';
import lua from 'highlight.js/lib/languages/lua';
import mathematica from 'highlight.js/lib/languages/mathematica';
import matlab from 'highlight.js/lib/languages/matlab';
import maxima from 'highlight.js/lib/languages/maxima';
import perl from 'highlight.js/lib/languages/perl';
import nginx from 'highlight.js/lib/languages/nginx';
import nim from 'highlight.js/lib/languages/nim';
import nix from 'highlight.js/lib/languages/nix';
import objectivec from 'highlight.js/lib/languages/objectivec';
import pgsql from 'highlight.js/lib/languages/pgsql';
import php from 'highlight.js/lib/languages/php';
import plaintext from 'highlight.js/lib/languages/plaintext';
import powershell from 'highlight.js/lib/languages/powershell';
import purebasic from 'highlight.js/lib/languages/purebasic';
import python from 'highlight.js/lib/languages/python';
import r from 'highlight.js/lib/languages/r';
import rust from 'highlight.js/lib/languages/rust';
import sas from 'highlight.js/lib/languages/sas';
import scala from 'highlight.js/lib/languages/scala';
import scilab from 'highlight.js/lib/languages/scilab';
import scss from 'highlight.js/lib/languages/scss';
import shell from 'highlight.js/lib/languages/shell';
import sql from 'highlight.js/lib/languages/sql';
import swift from 'highlight.js/lib/languages/swift';
import yaml from 'highlight.js/lib/languages/yaml';
import typescript from 'highlight.js/lib/languages/typescript';
import vbnet from 'highlight.js/lib/languages/vbnet';
import vbscript from 'highlight.js/lib/languages/vbscript';
import vim from 'highlight.js/lib/languages/vim';
import wasm from 'highlight.js/lib/languages/wasm';
import x86asm from 'highlight.js/lib/languages/x86asm';
import xl from 'highlight.js/lib/languages/xl';
import xquery from 'highlight.js/lib/languages/xquery';
import zephir from 'highlight.js/lib/languages/zephir';

// Import highlight.js theme
import 'highlight.js/styles/felipec.min.css';

// Define the list of supported languages
export const languages = [
  { value: 'ada', label: 'Ada' },
  { value: 'apache', label: 'Apache' },
  { value: 'arduino', label: 'Arduino' },
  { value: 'xml', label: 'XML' },
  { value: 'asciidoc', label: 'AsciiDoc' },
  { value: 'autohotkey', label: 'AutoHotkey' },
  { value: 'bash', label: 'Bash' },
  { value: 'basic', label: 'Basic' },
  { value: 'c', label: 'C' },
  { value: 'cmake', label: 'CMake' },
  { value: 'cpp', label: 'C++' },
  { value: 'crystal', label: 'Crystal' },
  { value: 'csharp', label: 'C#' },
  { value: 'css', label: 'CSS' },
  { value: 'markdown', label: 'Markdown' },
  { value: 'dart', label: 'Dart' },
  { value: 'delphi', label: 'Delphi' },
  { value: 'django', label: 'Django' },
  { value: 'dns', label: 'DNS' },
  { value: 'dockerfile', label: 'Dockerfile' },
  { value: 'elixir', label: 'Elixir' },
  { value: 'ruby', label: 'Ruby' },
  { value: 'erlang', label: 'Erlang' },
  { value: 'excel', label: 'Excel' },
  { value: 'fortran', label: 'Fortran' },
  { value: 'fsharp', label: 'F#' },
  { value: 'go', label: 'Go' },
  { value: 'golo', label: 'Golo' },
  { value: 'gradle', label: 'Gradle' },
  { value: 'graphql', label: 'GraphQL' },
  { value: 'haml', label: 'Haml' },
  { value: 'haskell', label: 'Haskell' },
  { value: 'http', label: 'HTTP' },
  { value: 'java', label: 'Java' },
  { value: 'javascript', label: 'JavaScript' },
  { value: 'json', label: 'JSON' },
  { value: 'julia', label: 'Julia' },
  { value: 'kotlin', label: 'Kotlin' },
  { value: 'latex', label: 'LaTeX' },
  { value: 'lua', label: 'Lua' },
  { value: 'mathematica', label: 'Mathematica' },
  { value: 'matlab', label: 'MATLAB' },
  { value: 'maxima', label: 'Maxima' },
  { value: 'perl', label: 'Perl' },
  { value: 'nginx', label: 'Nginx' },
  { value: 'nim', label: 'Nim' },
  { value: 'nix', label: 'Nix' },
  { value: 'objectivec', label: 'Objective-C' },
  { value: 'pgsql', label: 'PostgreSQL' },
  { value: 'php', label: 'PHP' },
  { value: 'plaintext', label: 'Plain Text' },
  { value: 'powershell', label: 'PowerShell' },
  { value: 'purebasic', label: 'PureBasic' },
  { value: 'python', label: 'Python' },
  { value: 'r', label: 'R' },
  { value: 'rust', label: 'Rust' },
  { value: 'sas', label: 'SAS' },
  { value: 'scala', label: 'Scala' },
  { value: 'scilab', label: 'Scilab' },
  { value: 'scss', label: 'SCSS' },
  { value: 'shell', label: 'Shell' },
  { value: 'sql', label: 'SQL' },
  { value: 'swift', label: 'Swift' },
  { value: 'yaml', label: 'YAML' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'vbnet', label: 'VB.NET' },
  { value: 'vbscript', label: 'VBScript' },
  { value: 'vim', label: 'Vim script' },
  { value: 'wasm', label: 'WebAssembly' },
  { value: 'x86asm', label: 'x86 Assembly' },
  { value: 'xl', label: 'XL' },
  { value: 'xquery', label: 'XQuery' },
  { value: 'zephir', label: 'Zephir' }
];

// Register all languages with highlight.js
export const registerLanguages = () => {
  hljs.registerLanguage('ada', ada);
  hljs.registerLanguage('apache', apache);
  hljs.registerLanguage('arduino', arduino);
  hljs.registerLanguage('xml', xml);
  hljs.registerLanguage('asciidoc', asciidoc);
  hljs.registerLanguage('autohotkey', autohotkey);
  hljs.registerLanguage('bash', bash);
  hljs.registerLanguage('basic', basic);
  hljs.registerLanguage('c', c);
  hljs.registerLanguage('cmake', cmake);
  hljs.registerLanguage('cpp', cpp);
  hljs.registerLanguage('crystal', crystal);
  hljs.registerLanguage('csharp', csharp);
  hljs.registerLanguage('css', css);
  hljs.registerLanguage('markdown', markdown);
  hljs.registerLanguage('dart', dart);
  hljs.registerLanguage('delphi', delphi);
  hljs.registerLanguage('django', django);
  hljs.registerLanguage('dns', dns);
  hljs.registerLanguage('dockerfile', dockerfile);
  hljs.registerLanguage('elixir', elixir);
  hljs.registerLanguage('ruby', ruby);
  hljs.registerLanguage('erlang', erlang);
  hljs.registerLanguage('excel', excel);
  hljs.registerLanguage('fortran', fortran);
  hljs.registerLanguage('fsharp', fsharp);
  hljs.registerLanguage('go', go);
  hljs.registerLanguage('golo', golo);
  hljs.registerLanguage('gradle', gradle);
  hljs.registerLanguage('graphql', graphql);
  hljs.registerLanguage('haml', haml);
  hljs.registerLanguage('haskell', haskell);
  hljs.registerLanguage('http', http);
  hljs.registerLanguage('java', java);
  hljs.registerLanguage('javascript', javascript);
  hljs.registerLanguage('json', json);
  hljs.registerLanguage('julia', julia);
  hljs.registerLanguage('kotlin', kotlin);
  hljs.registerLanguage('latex', latex);
  hljs.registerLanguage('lua', lua);
  hljs.registerLanguage('mathematica', mathematica);
  hljs.registerLanguage('matlab', matlab);
  hljs.registerLanguage('maxima', maxima);
  hljs.registerLanguage('perl', perl);
  hljs.registerLanguage('nginx', nginx);
  hljs.registerLanguage('nim', nim);
  hljs.registerLanguage('nix', nix);
  hljs.registerLanguage('objectivec', objectivec);
  hljs.registerLanguage('pgsql', pgsql);
  hljs.registerLanguage('php', php);
  hljs.registerLanguage('plaintext', plaintext);
  hljs.registerLanguage('powershell', powershell);
  hljs.registerLanguage('purebasic', purebasic);
  hljs.registerLanguage('python', python);
  hljs.registerLanguage('r', r);
  hljs.registerLanguage('rust', rust);
  hljs.registerLanguage('sas', sas);
  hljs.registerLanguage('scala', scala);
  hljs.registerLanguage('scilab', scilab);
  hljs.registerLanguage('scss', scss);
  hljs.registerLanguage('shell', shell);
  hljs.registerLanguage('sql', sql);
  hljs.registerLanguage('swift', swift);
  hljs.registerLanguage('yaml', yaml);
  hljs.registerLanguage('typescript', typescript);
  hljs.registerLanguage('vbnet', vbnet);
  hljs.registerLanguage('vbscript', vbscript);
  hljs.registerLanguage('vim', vim);
  hljs.registerLanguage('wasm', wasm);
  hljs.registerLanguage('x86asm', x86asm);
  hljs.registerLanguage('xl', xl);
  hljs.registerLanguage('xquery', xquery);
  hljs.registerLanguage('zephir', zephir);
  
  // HTML uses XML highlighter
  hljs.registerLanguage('html', xml);
};


// Helper to get language label by value
export const getLanguageLabel = (value) => {
  const language = languages.find(lang => lang.value === value);
  return language ? language.label : value;
};

export default {
  languages,
  registerLanguages,
  getLanguageLabel,
  hljs
};