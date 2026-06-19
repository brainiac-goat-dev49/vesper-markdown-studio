// Obsidian Lite Workspace Core Application Engine

// Initial Sample Notes
const INITIAL_NOTES = [
  {
    id: "1",
    title: "✨ Welcome to Obsidian Lite",
    content: `# Welcome to Obsidian Lite! 🪐\n\nObsidian Lite is a fast, responsive Markdown-powered editor with real-time live preview compiling, tag categorization, and **intelligent codeblock language scanning**.\n\n## 💻 Tech Language Detection\nWhen you insert code blocks, the editor automatically inspects the code block context and contents to identify the language:\n\n```\nimport React, { useState } from 'react';\nfunction Counter() {\n  const [count, setCount] = useState(0);\n  return <button onClick={() => setCount(count + 1)}>{count}</button>;\n}\n```\n\nHere's another CSS code block example:\n```\nbody {\n  background-color: #0b0f17;\n  color: #ffffff;\n  display: flex;\n}\n```\n\nAnd a Python example:\n```\ndef find_prime_numbers(limit):\n    primes = []\n    for num in range(2, limit):\n        if all(num % i != 0 for i in range(2, int(num**0.5) + 1)):\n            primes.append(num)\n    return primes\n```\n\n## active Document Features\n- **Dynamic Checklists**: Click on the items directly in the Live Preview!\n  - [x] Create a premium modern design interface\n  - [ ] Write some beautiful markdown code\n  - [ ] Filter documents by Metadata tags below\n- **Keyboard shortcuts**: Use ::Ctrl + S:: or ::Cmd + S:: to trigger quick-save validation.\n- **Custom Highlights**: Style paragraphs with ==gorgeous custom highlighting background highlights== for emphasis.\n\nEnjoy your minimalist developer workspace!`,
    tags: "welcome, markdown, demo",
    updatedAt: Date.now()
  },
  {
    id: "2",
    title: "data Project Blueprints & Specs",
    content: `# Project Specs Draft\n\nHere is a quick spec outline for our upcoming web application design.\n\n### Recommended System Stack:\n- Frontend: React / Tailwind CSS\n- Database: Supabase / PostgreSQL\n- Runtime: Node.js / Bun\n\n### Table of Deliverables:\n| Feature | Priority | Estimated Time |\n|---|---|---|\n| User Authentication | High | 3 days |\n| Real-time Collab | Medium | 5 days |\n| Markdown Export | High | 1 day |\n\n> "Simplicity is the ultimate sophistication." — Leonardo da Vinci`,
    tags: "work, planning",
    updatedAt: Date.now() - 3600000
  }
];

// Document Templates
const TEMPLATES = {
  daily: `# daily Strategy Log - ${new Date().toLocaleDateString()}\n\n## Focus Objectives for Today\n- [ ] 1. \n- [ ] 2. \n- [ ] 3. \n\n## Daily Reflection\n> Write about successes, blockers, and progress...\n\n## Quick Notes\n- `,
  weekly: `# weekly Blueprints & Action Plans\n\n## Executive Summary\n*What is the overall goal of the week?*\n\n## Milestones\n- [ ] Milestone Alpha (Design)\n- [ ] Milestone Beta (Prototype)\n- [ ] Milestone Gamma (Test)\n\n## Team Review Tracker\n- Frontend Development: Done\n- Testing Validation: In progress`,
  project: `# project Specs Draft\n\n## 1. Objectives & Background\nDefine the ultimate target...\n\n## 2. Technical Stack Requirement\n```\nconst CONFIG = {\n  port: 8080,\n  database: 'postgresql://db.local',\n  features: ['auth', 'indexing', 'cache']\n};\n```\n\n## 3. Launch Checklist\n- [ ] Setup production server environment\n- [ ] Secure SSL certificates\n- [ ] Connect custom domains`,
  meeting: `# meeting Schedule Agenda\n\n**Date:** ${new Date().toLocaleDateString()}\n**Attendees:** \n\n## Agenda\n1. Product review discussion\n2. Engineering sprint plan\n3. Feature launch sync\n\n## Action Items\n- [ ] Team: finalize sprint backlog\n- [ ] Engineering: merge active build branches`
};

// Application State
let notes = JSON.parse(localStorage.getItem('obsidian_lite_notes')) || INITIAL_NOTES;
let activeNoteId = localStorage.getItem('obsidian_lite_active_id') || "1";

// DOM References
const sidebar = document.getElementById('sidebar');
const sidebarToggleBtn = document.getElementById('sidebarToggleBtn');
const sidebarCloseBtn = document.getElementById('sidebarCloseBtn');
const noteList = document.getElementById('noteList');
const tagsFilterList = document.getElementById('tagsFilterList');
const createNoteBtn = document.getElementById('createNoteBtn');
const searchInput = document.getElementById('searchInput');

const noteTitleInput = document.getElementById('noteTitleInput');
const noteTagsInput = document.getElementById('noteTagsInput');
const templateSelect = document.getElementById('templateSelect');
const deleteNoteBtn = document.getElementById('deleteNoteBtn');
const saveIndicator = document.getElementById('saveIndicator');

const editorPane = document.getElementById('editorPane');
const editorInput = document.getElementById('editorInput');
const previewPane = document.getElementById('previewPane');
const previewPaneContainer = document.getElementById('previewPaneContainer');

const tabEdit = document.getElementById('tabEdit');
const tabPreview = document.getElementById('tabPreview');

const cheatSheetToggle = document.getElementById('cheatSheetToggle');
const cheatSheetModal = document.getElementById('cheatSheetModal');
const closeCheatsheetBtns = document.querySelectorAll('.close-cheatsheet-btn');

const statsWords = document.getElementById('statsWords');
const statsChars = document.getElementById('statsChars');
const statsReadTime = document.getElementById('statsReadTime');

// Filter states
let selectedTag = null;
let searchQuery = "";

// Initialize App
function init() {
  renderSidebarNotes();
  renderTagsFilter();
  loadActiveNote();
  setupEventListeners();
}

// Render the sidebar items list
function renderSidebarNotes() {
  noteList.innerHTML = "";
  
  const filteredNotes = notes.filter(note => {
    const matchesSearch = note.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          note.tags.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (!selectedTag) return matchesSearch;
    const noteTagsList = note.tags.split(',').map(t => t.trim().toLowerCase());
    return matchesSearch && noteTagsList.includes(selectedTag.toLowerCase());
  });

  if (filteredNotes.length === 0) {
    noteList.innerHTML = `
      <div class="text-center py-6 px-4">
        <p class="text-xs text-zinc-500 font-medium">No documents match the active filter or search query.</p>
      </div>
    `;
    return;
  }

  const sortedNotes = [...filteredNotes].sort((a, b) => b.updatedAt - a.updatedAt);

  sortedNotes.forEach(note => {
    const isActive = note.id === activeNoteId;
    const item = document.createElement('div');
    item.className = `p-3 rounded-lg cursor-pointer transition-all duration-200 group relative border ${
      isActive 
        ? 'bg-violet-600/10 border-violet-500/50 shadow-sm shadow-violet-500/5 text-white' 
        : 'bg-zinc-900/40 border-transparent hover:bg-zinc-800/40 hover:border-zinc-800 text-zinc-300'
    }`;
    
    const tagsArray = note.tags.split(',').map(t => t.trim()).filter(Boolean);
    const tagsBadges = tagsArray.map(t => `
      <span class="text-[9px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700/50">${t}</span>
    `).join('');

    const plainSummary = note.content
      .replace(/[#*`~_]/g, '')
      .substring(0, 60) + (note.content.length > 60 ? '...' : '');

    item.innerHTML = `
      <div class="flex items-start justify-between gap-2">
        <h3 class="text-xs font-bold truncate flex-1 ${isActive ? 'text-violet-300' : 'text-zinc-200 group-hover:text-white'}">
          ${note.title || 'Untitled note'}
        </h3>
        <span class="text-[9px] text-zinc-500 shrink-0 font-mono">
          ${formatTime(note.updatedAt)}
        </span>
      </div>
      <p class="text-[11px] text-zinc-500 mt-1 line-clamp-1 font-normal">
        ${plainSummary || 'Empty document body'}
      </p>
      ${tagsBadges ? `<div class="flex flex-wrap gap-1 mt-2">${tagsBadges}</div>` : ''}
    `;

    item.addEventListener('click', () => {
      selectNote(note.id);
      if (window.innerWidth < 1024) {
        sidebar.classList.add('-translate-x-full');
      }
    });

    noteList.appendChild(item);
  });
}

function formatTime(timestamp) {
  const diff = Date.now() - timestamp;
  if (diff < 60000) return 'Just now';
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return new Date(timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function renderTagsFilter() { 
  const allTags = new Set();
  notes.forEach(note => {
    note.tags.split(',').forEach(t => {
      const cleaned = t.trim();
      if (cleaned) allTags.add(cleaned.toLowerCase());
    });
  });

  tagsFilterList.innerHTML = "";
  
  const allItem = document.createElement('button');
  allItem.className = `w-full text-left text-xs py-1.5 px-2 rounded-md font-medium flex items-center justify-between transition-all ${
    !selectedTag 
      ? 'bg-zinc-800 text-violet-400 font-bold' 
      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
  }`;
  allItem.innerHTML = `
    <span class="flex items-center gap-1.5">
      <span class="w-1.5 h-1.5 rounded-full ${!selectedTag ? 'bg-violet-400' : 'bg-zinc-600'}"></span>
      All Documents
    </span>
    <span class="text-[10px] text-zinc-500 font-mono">${notes.length}</span>
  `;
  allItem.addEventListener('click', () => {
    selectedTag = null;
    renderTagsFilter();
    renderSidebarNotes();
  });
  tagsFilterList.appendChild(allItem);

  allTags.forEach(tag => {
    const count = notes.filter(n => n.tags.toLowerCase().includes(tag)).length;
    const isSelected = selectedTag === tag;
    const tagBtn = document.createElement('button');
    tagBtn.className = `w-full text-left text-xs py-1.5 px-2 rounded-md font-medium flex items-center justify-between transition-all ${
      isSelected 
        ? 'bg-violet-600/20 text-violet-300 font-bold border-l-2 border-violet-500' 
        : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
    }`;
    tagBtn.innerHTML = `
      <span class="flex items-center gap-1.5 truncate">
        <span class="text-violet-500 font-semibold font-mono">#</span>
        <span class="truncate">${tag}</span>
      </span>
      <span class="text-[10px] text-zinc-500 font-mono">${count}</span>
    `;
    tagBtn.addEventListener('click', () => {
      selectedTag = isSelected ? null : tag;
      renderTagsFilter();
      renderSidebarNotes();
    });
    tagsFilterList.appendChild(tagBtn);
  });
}

function selectNote(id) {
  activeNoteId = id;
  localStorage.setItem('obsidian_lite_active_id', id);
  loadActiveNote();
  renderSidebarNotes();
}

function loadActiveNote() {
  const note = notes.find(n => n.id === activeNoteId);
  if (!note) {
    if (notes.length > 0) {
      activeNoteId = notes[0].id;
      loadActiveNote();
    } else {
      disableWorkspace();
    }
    return;
  }

  noteTitleInput.disabled = false;
  noteTagsInput.disabled = false;
  editorInput.disabled = false;
  deleteNoteBtn.disabled = false;

  noteTitleInput.value = note.title;
  noteTagsInput.value = note.tags;
  editorInput.value = note.content;

  updatePreview();
  updateStats();
  showSavedStatus();
}

function disableWorkspace() {
  noteTitleInput.value = "";
  noteTitleInput.disabled = true;
  noteTagsInput.value = "";
  noteTagsInput.disabled = true;
  editorInput.value = "Create or select a note from the sidebar to get started!";
  editorInput.disabled = true;
  deleteNoteBtn.disabled = true;
  
  previewPane.innerHTML = `
    <div class="h-full flex flex-col items-center justify-center text-center p-8">
      <div class="w-16 h-16 rounded-full bg-zinc-800/50 border border-zinc-700/60 flex items-center justify-center mb-4">
        <svg class="w-8 h-8 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      </div>
      <h3 class="text-sm font-bold text-zinc-300">No active document</h3>
      <p class="text-xs text-zinc-500 mt-2 max-w-sm">Create a new document to start drafting Markdown or testing code blocks with real-time automatic detection.</p>
    </div>
  `;
  
  statsWords.textContent = "0";
  statsChars.textContent = "0";
  statsReadTime.textContent = "0m";
}

function classifyCodeLanguage(content) {
  const code = content.trim();
  
  if (code.includes('margin:') || code.includes('padding:') || code.includes('@import') || code.includes('display: flex') || code.includes('@media')) {
    return 'CSS / STYLES';
  }
  
  if (code.includes('<!DOCTYPE') || code.includes('<html') || code.includes('<div') || code.includes('class=') || code.includes('id=')) {
    return 'HTML / XML';
  }

  if (code.includes('import ') && (code.includes('from \'') || code.includes('from "'))) {
    return 'ES6 MODULE / JS / TS';
  }
  if (code.includes('const ') || code.includes('let ') || code.includes('function ') || code.includes('=>') || code.includes('console.log')) {
    return 'JAVASCRIPT';
  }

  if (code.includes('def ') || code.includes('import os') || code.includes('print(') || code.includes(' elif ') || code.includes('__main__')) {
    return 'PYTHON';
  }

  if (code.includes('public class ') || code.includes('System.out.println') || code.includes('public static void main')) {
    return 'JAVA';
  }

  if (code.includes('SELECT ') || code.includes('INSERT INTO ') || code.includes('CREATE TABLE ')) {
    return 'SQL DATABASE';
  }

  return 'RAW TEXT / GENERIC';
}

function updatePreview() {
  const markdownText = editorInput.value || "";
  const parsedHTML = compileMarkdown(markdownText);
  previewPane.innerHTML = parsedHTML;

  const checkBoxes = previewPane.querySelectorAll('input[type="checkbox"]');
  checkBoxes.forEach((checkbox, idx) => {
    checkbox.addEventListener('change', (e) => {
      toggleChecklistStateInMarkdown(idx, e.target.checked);
    });
  });
}

function compileMarkdown(markdown) {
  let html = markdown;

  const codeBlockRegex = /```([\s\S]*?)```/g;
  html = html.replace(codeBlockRegex, (match, codeContent) => {
    const detectedLang = classifyCodeLanguage(codeContent);
    
    const escapedCode = codeContent
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .trim();

    return `
      <div class="code-block-wrapper my-4">
        <div class="code-block-header">
          <span>🖥️ DETECTED: <strong class="text-violet-400 font-bold">${detectedLang}</strong></span>
          <button onclick="navigator.clipboard.writeText(\\\`${escapedCode.replace(/`/g, '\\\\`').replace(/\\$/g, '\\\\// Heuristic Language Scanner for Markdown Codeblocks
function detectLanguage(code) {
  const trimmed = code.trim();
  if (trimmed.startsWith('{') && trimmed.endsWith('}') && trimmed.includes('"')) return 'json';
  if (/<[a-z][\s\S]*>/i.test(trimmed) || trimmed.includes('<!DOCTYPE html>') || trimmed.includes('</div>')) return 'html';
  if (/(const|let|var|function|console\.log|import\s|export\s|document\.)/g.test(trimmed)) return 'javascript';
  if (/(def\s+[a-zA-Z_]|import\s+[a-zA-Z_]|print\s*\(|elif\s+|if\s+__name__)/g.test(trimmed)) return 'python';
  if (/(SELECT\s+|FROM\s+|WHERE\s+|INSERT\s+INTO|UPDATE\s+|DELETE\s+FROM)/i.test(trimmed)) return 'sql';
  if (/(margin:|padding:|color:|display:|background:|@media|@import)/.test(trimmed)) return 'css';
  if (/(sudo\s+|npm\s+|git\s+|echo\s+|mkdir\s+)/.test(trimmed)) return 'shell';
  return 'javascript'; // Default intelligent fallback
}

// Custom Markdown Parser with interactive elements and language scans
function parseMarkdown(md) {
  if (!md) return '<div class="text-zinc-500 italic py-8 text-center">Start writing to compile live output preview...</div>';

  let html = md
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  const codeBlocks = [];
  html = html.replace(/```([\s\S]*?)```/gm, (match, content) => {
    const lines = content.split('\n');
    let lang = lines[0].trim();
    let codeContent = '';
    if (lang && /^[a-zA-Z0-9#+-]+$/.test(lang)) {
      codeContent = lines.slice(1).join('\n');
    } else {
      lang = '';
      codeContent = content;
    }
    
    // Auto detect language with real-time heuristic content scanner
    const detected = detectLanguage(codeContent);
    const finalLang = lang || detected || 'text';
    
    const placeholder = `__CODE_BLOCK_PLACEHOLDER_${codeBlocks.length}__`;
    codeBlocks.push({
      lang: finalLang,
      content: codeContent.trim()
    });
    return placeholder;
  });

  const lines = html.split('\n');
  let result = [];
  let inList = false;
  let listType = null; 
  let inTable = false;
  let tableHeaders = [];
  let tableRows = [];

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    const isTableRow = line.trim().startsWith('|') && line.trim().endsWith('|');

    if (isTableRow) {
      if (inList) {
        result.push(`</${listType}>`);
        inList = false;
        listType = null;
      }
      
      const cells = line.split('|').map(c => c.trim()).filter((c, idx, arr) => idx > 0 && idx < arr.length - 1);
      
      if (!inTable) {
        inTable = true;
        tableHeaders = cells;
      } else {
        const isSeparator = cells.every(c => /^:?-+:?$/.test(c));
        if (!isSeparator) {
          tableRows.push(cells);
        }
      }
      continue;
    } else {
      if (inTable) {
        let tableHtml = '<table><thead><tr>';
        tableHeaders.forEach(h => {
          tableHtml += `<th>${parseInlineMarkdown(h)}</th>`;
        });
        tableHtml += '</tr></thead><tbody>';
        tableRows.forEach(row => {
          tableHtml += '<tr>';
          for (let j = 0; j < tableHeaders.length; j++) {
            tableHtml += `<td>${parseInlineMarkdown(row[j] || '')}</td>`;
          }
          tableHtml += '</tr>';
        });
        tableHtml += '</tbody></table>';
        result.push(tableHtml);
        
        inTable = false;
        tableHeaders = [];
        tableRows = [];
      }
    }

    if (/^(?:-{3,}|\*{3,}|\_{3,})$/.test(line.trim())) {
      if (inList) { result.push(`</${listType}>`); inList = false; listType = null; }
      result.push('<hr>');
      continue;
    }

    const headingMatch = line.match(/^(#{1,6})\s+(.*)$/);
    if (headingMatch) {
      if (inList) { result.push(`</${listType}>`); inList = false; listType = null; }
      const level = headingMatch[1].length;
      const content = parseInlineMarkdown(headingMatch[2]);
      result.push(`<h${level}>${content}</h${level}>`);
      continue;
    }

    const blockquoteMatch = line.match(/^&gt;\s?(.*)$/);
    if (blockquoteMatch) {
      if (inList) { result.push(`</${listType}>`); inList = false; listType = null; }
      const content = parseInlineMarkdown(blockquoteMatch[1]);
      result.push(`<blockquote><p>${content}</p></blockquote>`);
      continue;
    }

    const taskMatch = line.match(/^[-*]\s+\[([ xX])\]\s+(.*)$/);
    if (taskMatch) {
      if (inList && listType !== 'ul') {
        result.push(`</${listType}>`);
        inList = false;
      }
      if (!inList) {
        result.push('<ul class="task-list">');
        inList = true;
        listType = 'ul';
      }
      const checked = taskMatch[1].toLowerCase() === 'x';
      const content = parseInlineMarkdown(taskMatch[2]);
      result.push(`
        <li class="task-list-item ${checked ? 'task-list-item-done' : ''}">
          <input type="checkbox" data-line="${i}" ${checked ? 'checked' : ''} class="task-checkbox-interactive">
          <span>${content}</span>
        </li>
      `);
      continue;
    }

    const ulMatch = line.match(/^[-*]\s+(.*)$/);
    if (ulMatch) {
      if (inList && listType !== 'ul') {
        result.push(`</${listType}>`);
        inList = false;
      }
      if (!inList) {
        result.push('<ul>');
        inList = true;
        listType = 'ul';
      }
      const content = parseInlineMarkdown(ulMatch[1]);
      result.push(`<li>${content}</li>`);
      continue;
    }

    const olMatch = line.match(/^(\d+)\.\s+(.*)$/);
    if (olMatch) {
      if (inList && listType !== 'ol') {
        result.push(`</${listType}>`);
        inList = false;
      }
      if (!inList) {
        result.push('<ol>');
        inList = true;
        listType = 'ol';
      }
      const content = parseInlineMarkdown(olMatch[2]);
      result.push(`<li>${content}</li>`);
      continue;
    }

    if (line.trim() === '') {
      if (inList) {
        result.push(`</${listType}>`);
        inList = false;
        listType = null;
      }
      result.push('<br>');
      continue;
    }

    if (inList) {
      result.push(`</${listType}>`);
      inList = false;
      listType = null;
    }
    result.push(`<p>${parseInlineMarkdown(line)}</p>`);
  }

  if (inTable) {
    let tableHtml = '<table><thead><tr>';
    tableHeaders.forEach(h => { tableHtml += `<th>${parseInlineMarkdown(h)}</th>`; });
    tableHtml += '</tr></thead><tbody>';
    tableRows.forEach(row => {
      tableHtml += '<tr>';
      for (let j = 0; j < tableHeaders.length; j++) {
        tableHtml += `<td>${parseInlineMarkdown(row[j] || '')}</td>`;
      }
      tableHtml += '</tr>';
    });
    tableHtml += '</tbody></table>';
    result.push(tableHtml);
  }
  if (inList) {
    result.push(`</${listType}>`);
  }

  let renderedHtml = result.join('\n');
  codeBlocks.forEach((block, idx) => {
    const placeholder = `__CODE_BLOCK_PLACEHOLDER_${idx}__`;
    const escapedCode = block.content
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>');
    
    const customBlock = `
      <div class="code-block-wrapper my-6 border border-zinc-800 rounded-lg overflow-hidden bg-[#090d16]">
        <div class="codeblock-header flex items-center justify-between px-4 py-2 bg-[#111827] text-xs border-b border-zinc-800">
          <span class="codeblock-lang-badge uppercase font-bold tracking-wider text-violet-400">${block.lang}</span>
          <button class="copy-code-btn text-zinc-500 hover:text-zinc-200 flex items-center gap-1.5 transition-colors" data-code="${encodeURIComponent(escapCode)}">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
            </svg>
            <span>Copy</span>
          </button>
        </div>
        <pre class="m-0 bg-[#090d16] p-4 overflow-x-auto"><code class="language-${block.lang} text-zinc-300 font-mono text-xs leading-relaxed">${escapeHTML(escapCode)}</code></pre>
      </div>
    `;
    renderedHtml = renderedHtml.replace(placeholder, customBlock);
  });

  return renderedHtml;
}

function parseInlineMarkdown(text) {
  return text
    .replace(/\*\*([\s\S]*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([\s\S]*?)\*/g, '<em>$1</em>')
    .replace(/~~([\s\S]*?)~~/g, '<del>$1</del>')
    .replace(/==([\s\S]*?)==/g, '<mark>$1</mark>')
    .replace(/::([\s\S]*?)::/g, '<kbd>$1</kbd>')
    .replace(/`([\s\S]*?)`/g, '<code>$1</code>');
}

function escapeHTML(str) {
  return str.replace(/[&<>'"]/g, 
    tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag] || tag)
  );
}

// Preloaded Default Documents
const DEFAULT_NOTES = [
  {
    id: 'note-1',
    title: 'Welcome to Obsidian Lite',
    content: `# Welcome to Obsidian Lite 🪐
This is a premium dark-themed Markdown workspace designed for high-fidelity technical editing, blueprints, and dynamic strategizing. 

## Integrated Real-Time Scanning
This application has **disabled the external global technology dashboard** in favor of high-performance **real-time heuristic code scanning** integrated directly into the markdown compiler. 

Let's test the heuristic content language identification below:

\`\`\`
const workspace = {
  version: 2026,
  theme: "Obsidian Slate",
  features: ["Markdown Live compiler", "Autosave", "Interactive checklist Sync"]
};
console.log("Workspace initialized successfully!");
\`\`\`

> Notice how the compiler automatically scanned the JavaScript signatures and labeled the code block badge as "JAVASCRIPT" without any manually specified language identifier!

## Live Checklist Features
- [x] Create some beautiful code blocks to test heuristic scanning
- [ ] Try writing SQL queries or CSS styles and watch the compiler label them
- [ ] Connect with standard markup cheatsheets

Feel free to write tables, custom blockquotes, and explore the template injections above.`,
    tags: 'welcome, onboarding, markdown',
    updatedAt: Date.now()
  },
  {
    id: 'note-2',
    title: 'Architecture Blueprint v2026',
    content: `# Architecture Blueprint v2026

Below is a CSS codeblock. Notice how the heuristic compiler scans custom style selectors and styles them accurately under CSS labels:

\`\`\`
.obsidian-preview table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  margin: 2rem 0;
}
\`\`\`

## Schema Models
Below is a simple database model written in raw SQL. The real-time parser identifies standard statements automatically:

\`\`\`
SELECT account_id, username, email FROM system_accounts WHERE status = 'active';
\`\`\``,
    tags: 'architecture, blueprint, css',
    updatedAt: Date.now() - 3600000
  }
];

const TEMPLATES = {
  daily: `# Daily Strategy Log - ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
## Focus Areas
- [ ] Implement robust microservice endpoints
- [ ] Review system diagnostic logs
- [ ] Coordinate with architecture team

## Technical Notes
\`\`\`
const coreConfig = {
  environment: "production",
  port: 8080,
  syncInterval: 30000
};
console.log("System initialized on port", coreConfig.port);
\`\`\`

## Quick Review
What went well today? What needs attention tomorrow?`,

  weekly: `# Weekly Blueprints - Year 2026
## Deliverables Completed
- [x] Initial proof of concept parsed models
- [x] High-fidelity custom scroll integrations

## Next Objectives
- [ ] Complete heuristic language auto-detection models
- [ ] Optimize styling layouts for responsive displays

## Database Migration Script Draft
\`\`\`
SELECT user_id, email, created_at 
FROM accounts 
WHERE active = 1 
ORDER BY created_at DESC;
\`\`\`

## Summary Report`,

  project: `# Project Specs Draft - Obsidian Lite
## Core Technologies
- HTML5 Canvas & SVG Layering
- Dynamic real-time Markdown Parsing
- LocalStorage state management

## Architecture Interface Code
\`\`\`
body {
  margin: 0;
  background-color: #0b0f17;
  color: #f3f4f6;
  font-family: 'Inter', sans-serif;
}
.obsidian-preview {
  line-height: 1.7;
}
\`\`\`

## Key Milestones
- [ ] Integrate real-time code scanning heuristics
- [ ] Establish unified multi-pane layout`,

  meeting: `# Meeting Schedule Agenda
## Participants
- Lead System Engineer
- Frontend UX Architect

## Discussion Points
1. Address the live preview container scrolling issues
2. Discuss disabling global dashboard technology badges in favor of inline language codeblock heuristics

## JavaScript Action Steps
\`\`\`
function handleChecklistChange(lineIndex, isChecked) {
  const lines = currentNote.content.split('\\n');
  lines[lineIndex] = isChecked ? "- [x] Finished task" : "- [ ] Incomplete task";
}
\`\`\`

## Notes`
};

// Application State
let notes = JSON.parse(localStorage.getItem('obsidian_lite_notes')) || DEFAULT_NOTES;
let currentNoteId = localStorage.getItem('obsidian_lite_current_id') || (notes.length > 0 ? notes[0].id : null);
let selectedTagFilter = null;

// DOM Selectors
const sidebar = document.getElementById('sidebar');
const sidebarToggleBtn = document.getElementById('sidebarToggleBtn');
const sidebarCloseBtn = document.getElementById('sidebarCloseBtn');
const searchInput = document.getElementById('searchInput');
const createNoteBtn = document.getElementById('createNoteBtn');
const tagsFilterList = document.getElementById('tagsFilterList');
const noteList = document.getElementById('noteList');
const noteTitleInput = document.getElementById('noteTitleInput');
const templateSelect = document.getElementById('templateSelect');
const cheatSheetToggle = document.getElementById('cheatSheetToggle');
const saveIndicator = document.getElementById('saveIndicator');
const deleteNoteBtn = document.getElementById('deleteNoteBtn');
const noteTagsInput = document.getElementById('noteTagsInput');
const tabEdit = document.getElementById('tabEdit');
const tabPreview = document.getElementById('tabPreview');
const editorPane = document.getElementById('editorPane');
const previewPaneContainer = document.getElementById('previewPaneContainer');
const previewPane = document.getElementById('previewPane');
const statsWords = document.getElementById('statsWords');
const statsChars = document.getElementById('statsChars');
const statsReadTime = document.getElementById('statsReadTime');
const cheatSheetModal = document.getElementById('cheatSheetModal');
const closeCheatsheetBtns = document.querySelectorAll('.close-cheatsheet-btn');
const editorInput = document.getElementById('editorInput');

// Guaranteed scrollability setup
if (previewPane) {
  previewPane.style.overflowY = 'auto';
  previewPane.style.height = '100%';
  previewPane.style.webkitOverflowScrolling = 'touch';
  previewPane.style.pointerEvents = 'auto';
}

// Initialize Application
function init() {
  renderSidebarNotes();
  renderTagsFilter();
  loadNote(currentNoteId);
  setupEventListeners();
}

// Render list of note filecards
function renderSidebarNotes() {
  const query = searchInput.value.toLowerCase().trim();
  let filtered = notes;

  if (query) {
    filtered = filtered.filter(n => 
      n.title.toLowerCase().includes(query) || 
      n.content.toLowerCase().includes(query) ||
      n.tags.toLowerCase().includes(query)
    );
  }

  if (selectedTagFilter) {
    filtered = filtered.filter(n => 
      n.tags.split(',').map(t => t.trim().toLowerCase()).includes(selectedTagFilter)
    );
  }

  // Sort by updatedAt descending
  filtered.sort((a, b) => b.updatedAt - a.updatedAt);

  noteList.innerHTML = '';
  
  if (filtered.length === 0) {
    noteList.innerHTML = `
      <div class="text-center py-6 text-zinc-500 text-xs">
        No documents found
      </div>
    `;
    return;
  }

  filtered.forEach(note => {
    const isActive = note.id === currentNoteId;
    const itemCard = document.createElement('div');
    itemCard.className = `file-card p-3 rounded-lg relative cursor-pointer smooth-transition ${isActive ? 'active bg-[#1f293d]/50 border-violet-500/30' : 'hover:bg-zinc-800/40'}`;
    
    // Quick preview snippet
    const snippet = note.content
      .replace(/[#*`>_-]/g, '')
      .substring(0, 75) + (note.content.length > 75 ? '...' : '');

    // Render tags
    const tagsArr = note.tags.split(',').map(t => t.trim()).filter(Boolean);
    const tagsMarkup = tagsArr.map(t => `
      <span class="px-1.5 py-0.5 rounded text-[9px] font-mono bg-zinc-800 text-zinc-400 border border-zinc-700/50 hover:text-violet-300 transition-colors">${t}</span>
    `).join('');

    itemCard.innerHTML = `
      <div class="flex items-start justify-between gap-1.5">
        <h4 class="font-semibold text-xs text-zinc-200 truncate ${isActive ? 'text-violet-300' : ''}">${escapeHTML(note.title || 'Untitled Note')}</h4>
        <span class="text-[9px] text-zinc-500 shrink-0 font-mono">${new Date(note.updatedAt).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})}</span>
      </div>
      <p class="text-[10px] text-zinc-400 line-clamp-2 mt-1 leading-relaxed font-sans">${escapeHTML(snippet || 'No additional content')}</p>
      ${tagsMarkup ? `<div class="flex flex-wrap gap-1 mt-2">${tagsMarkup}</div>` : ''}
    `;

    itemCard.addEventListener('click', () => {
      loadNote(note.id);
      // On mobile, automatically show the preview side when selecting
      if (window.innerWidth < 1024) {
        showTab('preview');
      }
    });

    noteList.appendChild(itemCard);
  });
}

// Render dynamic tag counts and elements
function renderTagsFilter() {
  const counts = {};
  notes.forEach(note => {
    if (!note.tags) return;
    note.tags.split(',').forEach(tag => {
      const clean = tag.trim().toLowerCase();
      if (clean) {
        counts[clean] = (counts[clean] || 0) + 1;
      }
    });
  });

  tagsFilterList.innerHTML = '';

  // All category option
  const allBtn = document.createElement('button');
  allBtn.className = `w-full text-left text-[11px] py-1 px-2 rounded font-medium smooth-transition flex justify-between items-center ${!selectedTagFilter ? 'bg-violet-950/30 text-violet-300 border-l-2 border-violet-500 pl-1.5' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'}`;
  allBtn.innerHTML = `<span>📂 All Documents</span> <span class="text-[9px] font-mono opacity-60">${notes.length}</span>`;
  allBtn.addEventListener('click', () => {
    selectedTagFilter = null;
    renderTagsFilter();
    renderSidebarNotes();
  });
  tagsFilterList.appendChild(allBtn);

  // Dynamic lists tags
  Object.keys(counts).sort().forEach(tag => {
    const isSelected = tag === selectedTagFilter;
    const tagBtn = document.createElement('button');
    tagBtn.className = `w-full text-left text-[11px] py-1 px-2 rounded font-medium smooth-transition flex justify-between items-center ${isSelected ? 'bg-violet-950/30 text-violet-300 border-l-2 border-violet-500 pl-1.5' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'}`;
    tagBtn.innerHTML = `<span># ${tag}</span> <span class="text-[9px] font-mono opacity-60">${counts[tag]}</span>`;
    tagBtn.addEventListener('click', () => {
      selectedTagFilter = isSelected ? null : tag;
      renderTagsFilter();
      renderSidebarNotes();
    });
    tagsFilterList.appendChild(tagBtn);
  });
}

// Load a document into editor pane and live preview compiled
function loadNote(id) {
  const note = notes.find(n => n.id === id);
  if (!note) {
    // Fallback if currentNoteId not found
    if (notes.length > 0) {
      loadNote(notes[0].id);
    } else {
      currentNoteId = null;
      disableWorkspace();
    }
    return;
  }

  currentNoteId = id;
  localStorage.setItem('obsidian_lite_current_id', id);

  // Enable Inputs
  noteTitleInput.disabled = false;
  noteTagsInput.disabled = false;
  editorInput.disabled = false;
  deleteNoteBtn.disabled = false;

  // Bind values
  noteTitleInput.value = note.title;
  noteTagsInput.value = note.tags;
  editorInput.value = note.content;

  // Build Output Preview Compiled Live
  updatePreviewAndStats();
  renderSidebarNotes();
}

function disableWorkspace() {
  noteTitleInput.value = '';
  noteTagsInput.value = '';
  editorInput.value = '';
  noteTitleInput.disabled = true;
  noteTagsInput.disabled = true;
  editorInput.disabled = true;
  deleteNoteBtn.disabled = true;
  previewPane.innerHTML = `<div class="text-zinc-500 italic py-8 text-center">No Document Active. Click "Create New Document" to begin.</div>`;
  statsWords.innerText = '0';
  statsChars.innerText = '0';
  statsReadTime.innerText = '0m';
}

// Update compiled views, parse markdown heuristics, and calculate footers stats
function updatePreviewAndStats() {
  if (!currentNoteId) return;
  const note = notes.find(n => n.id === currentNoteId);
  if (!note) return;

  const content = editorInput.value;
  previewPane.innerHTML = parseMarkdown(content);

  // Handle Checklist change interactions in live previewcompiled 
  const checkBoxes = previewPane.querySelectorAll('.task-checkbox-interactive');
  checkBoxes.forEach(box => {
    box.addEventListener('change', (e) => {
      const lineIndex = parseInt(e.target.getAttribute('data-line'), 10);
      const lines = editorInput.value.split('\n');
      const isChecked = e.target.checked;
      
      const lineText = lines[lineIndex];
      // Replace only task state
      lines[lineIndex] = lineText.replace(/^([-*]\s+\[)([ xX])(\])/, `$1${isChecked ? 'x' : ' '}$3`);
      
      editorInput.value = lines.join('\n');
      triggerSave();
      updatePreviewAndStats();
    });
  });

  // Handle Dynamic codeblock copy buttons
  const copyButtons = previewPane.querySelectorAll('.copy-code-btn');
  copyButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const code = decodeURIComponent(btn.getAttribute('data-code'));
      navigator.clipboard.writeText(code).then(() => {
        const textSpan = btn.querySelector('span');
        const origText = textSpan.innerText;
        textSpan.innerText = 'Copied!';
        btn.classList.add('text-emerald-400');
        setTimeout(() => {
          textSpan.innerText = origText;
          btn.classList.remove('text-emerald-400');
        }, 1500);
      });
    });
  });

  // Calculate standard diagnostic content metadata counters
  const words = content ? content.trim().split(/\s+/).filter(Boolean).length : 0;
  const chars = content ? content.length : 0;
  const readTime = Math.max(1, Math.ceil(words / 200));

  statsWords.innerText = words;
  statsChars.innerText = chars;
  statsReadTime.innerText = `${readTime}m`;
}

// Auto-save mechanisms
let saveTimeout = null;
function triggerSave() {
  if (!currentNoteId) return;

  // Show active syncing status
  const indicatorIndicator = saveIndicator.querySelector('.saving-pulse');
  const indicatorText = saveIndicator.querySelector('span:last-child');
  
  indicatorIndicator.classList.remove('bg-emerald-500');
  indicatorIndicator.classList.add('bg-amber-500');
  indicatorText.innerText = 'Saving...';

  clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => {
    const note = notes.find(n => n.id === currentNoteId);
    if (note) {
      note.title = noteTitleInput.value.trim() || 'Untitled Note';
      note.tags = noteTagsInput.value.trim();
      note.content = editorInput.value;
      note.updatedAt = Date.now();

      localStorage.setItem('obsidian_lite_notes', JSON.stringify(notes));
      renderSidebarNotes();
      renderTagsFilter();

      // Complete pulse feedback state
      indicatorIndicator.classList.remove('bg-amber-500');
      indicatorIndicator.classList.add('bg-emerald-500');
      indicatorText.innerText = 'Sync Saved';
    }
  }, 600);
}

// Event Bindings
function setupEventListeners() {
  // Title / Tags Change
  noteTitleInput.addEventListener('input', triggerSave);
  noteTagsInput.addEventListener('input', triggerSave);
  editorInput.addEventListener('input', () => {
    updatePreviewAndStats();
    triggerSave();
  });

  // Document creation trigger action button
  createNoteBtn.addEventListener('click', () => {
    const newNote = {
      id: 'note-' + Date.now(),
      title: 'New Document Draft',
      content: `# New Document Draft\n\nStart writing markdown documents here...`,
      tags: 'draft',
      updatedAt: Date.now()
    };
    notes.unshift(newNote);
    localStorage.setItem('obsidian_lite_notes', JSON.stringify(notes));
    
    selectedTagFilter = null;
    renderTagsFilter();
    renderSidebarNotes();
    loadNote(newNote.id);
  });

  // Delete current active document action button
  deleteNoteBtn.addEventListener('click', () => {
    if (!currentNoteId) return;
    if (confirm('Are you absolutely sure you want to permanently delete this document?')) {
      notes = notes.filter(n => n.id !== currentNoteId);
      localStorage.setItem('obsidian_lite_notes', JSON.stringify(notes));
      
      currentNoteId = notes.length > 0 ? notes[0].id : null;
      selectedTagFilter = null;
      renderTagsFilter();
      renderSidebarNotes();
      
      if (currentNoteId) {
        loadNote(currentNoteId);
      } else {
        disableWorkspace();
      }
    }
  });

  // Live document searching
  searchInput.addEventListener('input', () => {
    renderSidebarNotes();
  });

  // Template Injection Selection trigger dropdown
  templateSelect.addEventListener('change', (e) => {
    const val = e.target.value;
    if (val && TEMPLATES[val] && currentNoteId) {
      if (confirm('Overwrite current contents with chosen template draft specifications?')) {
        editorInput.value = TEMPLATES[val];
        noteTitleInput.value = val.charAt(0).toUpperCase() + val.slice(1) + ' Workspace Log';
        updatePreviewAndStats();
        triggerSave();
      }
      e.target.value = ''; // Reset select tag index values
    }
  });

  // Sidebar Layout Collapse & Slide view actions
  sidebarToggleBtn.addEventListener('click', () => {
    sidebar.classList.toggle('-translate-x-full');
    sidebar.classList.toggle('lg:translate-x-0');
  });

  sidebarCloseBtn.addEventListener('click', () => {
    sidebar.classList.add('-translate-x-full');
  });

  // Cheatsheet Reference Manual trigger modal actions
  cheatSheetToggle.addEventListener('click', () => {
    cheatSheetModal.classList.remove('hidden');
    cheatSheetModal.classList.add('flex');
  });

  closeCheatsheetBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      cheatSheetModal.classList.add('hidden');
      cheatSheetModal.classList.remove('flex');
    });
  });

  // Mobile layout switch tabs
  tabEdit.addEventListener('click', () => showTab('edit'));
  tabPreview.addEventListener('click', () => showTab('preview'));
}

// Mobile responsive tab switcher display logic
function showTab(tab) {
  if (tab === 'edit') {
    tabEdit.classList.add('bg-zinc-800', 'text-white');
    tabEdit.classList.remove('text-zinc-400');
    tabPreview.classList.remove('bg-zinc-800', 'text-white');
    tabPreview.classList.add('text-zinc-400');

    editorPane.classList.remove('hidden');
    editorPane.classList.add('flex');
    previewPaneContainer.classList.add('hidden');
    previewPaneContainer.classList.remove('lg:flex');
  } else {
    tabPreview.classList.add('bg-zinc-800', 'text-white');
    tabPreview.classList.remove('text-zinc-400');
    tabEdit.classList.remove('bg-zinc-800', 'text-white');
    tabEdit.classList.add('text-zinc-400');

    previewPaneContainer.classList.remove('hidden');
    previewPaneContainer.classList.add('flex', 'lg:flex');
    editorPane.classList.add('hidden');
    editorPane.classList.remove('flex');
  }
}

// On DOM load complete
window.addEventListener('DOMContentLoaded', init);)}\\\`); alert('Copied source code!')" class="hover:text-white smooth-transition text-[10px]">Copy Code</button>
        </div>
        <pre><code class="font-mono text-xs block whitespace-pre overflow-x-auto">${escapedCode}</code></pre>
      </div>
    `;
  });

  html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');
  html = html.replace(/^---$/gim, '<hr class="my-6 border-zinc-800" />');
  html = html.replace(/^\\> (.*$)/gim, '<blockquote>$1</blockquote>');
  html = html.replace(/==([^==\\n]+)==/g, '<mark class="highlight">$1</mark>');
  html = html.replace(/::([^::\\n]+)::/g, '<span class="kbd-capsule font-mono font-bold">$1</span>');
  html = html.replace(/\\*\\*([^\\*\\n]+)\\*\\*/g, '<strong>$1</strong>');
  html = html.replace(/\\*([^\\*\\n]+)\\*/g, '<em>$1</em>');
  html = html.replace(/~~([^~\\n]+)~~/g, '<del>$1</del>');

  html = html.replace(/^\\- \\[[xX]\\] (.*$)/gim, `
    <div class="flex items-center gap-2.5 my-1.5">
      <input type="checkbox" checked class="rounded accent-violet-600 bg-zinc-900 border-zinc-700 w-4 h-4 cursor-pointer">
      <label class="text-xs text-zinc-400 line-through">$1</label>
    </div>
  `);
  html = html.replace(/^\\- \\[[\\s]\\] (.*$)/gim, `
    <div class="flex items-center gap-2.5 my-1.5">
      <input type="checkbox" class="rounded accent-violet-600 bg-zinc-900 border-zinc-700 w-4 h-4 cursor-pointer">
      <label class="text-xs text-zinc-200">$1</label>
    </div>
  `);

  html = html.replace(/^\\- (?!\[[ xX]\])(.*$)/gim, '<ul><li>$1</li></ul>');
  html = html.replace(/<\\/ul>\\s*<ul>/g, '');
  html = html.replace(/^\\d+\\. (.*$)/gim, '<ol><li>$1</li></ol>');
  html = html.replace(/<\\/ol>\\s*<ol>/g, '');

  const lines = html.split('\\n');
  const processedLines = lines.map(line => {
    const trimmed = line.trim();
    if (!trimmed) return '<br>';
    if (trimmed.startsWith('<h') || 
        trimmed.startsWith('<hr') || 
        trimmed.startsWith('<div') || 
        trimmed.startsWith('</div') || 
        trimmed.startsWith('<blockquote') || 
        trimmed.startsWith('<ul') || 
        trimmed.startsWith('</ul') || 
        trimmed.startsWith('<ol') || 
        trimmed.startsWith('</ol') || 
        trimmed.startsWith('<li') || 
        trimmed.startsWith('</li') || 
        trimmed.startsWith('<pre') || 
        trimmed.startsWith('</pre') || 
        trimmed.startsWith('<table') || 
        trimmed.startsWith('</table') || 
        trimmed.startsWith('<tr') || 
        trimmed.startsWith('</tr') || 
        trimmed.startsWith('<th') || 
        trimmed.startsWith('<td')
    ) {
      return line;
    }
    return `<p>${line}</p>`;
  });

  html = processedLines.join('\\n');
  html = html.replace(/<p><br><\\/p>/g, '<br>');

  return html;
}

function toggleChecklistStateInMarkdown(index, isChecked) {
  const currentNote = notes.find(n => n.id === activeNoteId);
  if (!currentNote) return;

  let checklistCounter = 0;
  const lines = currentNote.content.split('\\n');
  const modifiedLines = lines.map(line => {
    if (line.match(/^\\- \\[[xX\\s]\\]/)) {
      if (checklistCounter === index) {
        line = isChecked ? line.replace(/^\\- \\[\\s\\]/, '- [x]') : line.replace(/^\\- \\[[xX]\]/, '- [ ]');
      } 
      checklistCounter++;
    }
    return line;
  });

  currentNote.content = modifiedLines.join('\\n');
  currentNote.updatedAt = Date.now();
  
  editorInput.value = currentNote.content;
  saveData();
  updatePreview();
  renderSidebarNotes();
}

function updateStats() {
  const text = editorInput.value || "";
  const chars = text.length;
  const words = text.trim() ? text.trim().split(/\\s+/).length : 0;
  const minutes = Math.max(1, Math.round(words / 200));

  statsWords.textContent = words;
  statsChars.textContent = chars;
  statsReadTime.textContent = `${minutes}m`;
}

function saveData() {
  showSavingStatus();
  localStorage.setItem('obsidian_lite_notes', JSON.stringify(notes));
  
  setTimeout(() => {
    showSavedStatus();
  }, 400);
}

function showSavingStatus() {
  saveIndicator.innerHTML = `
    <span class="inline-block w-2.5 h-2.5 rounded-full bg-amber-500 mr-2 animate-bounce"></span>
    <span class="text-xs text-zinc-300 font-semibold tracking-wide uppercase">Syncing...</span>
  `;
}

function showSavedStatus() {
  saveIndicator.innerHTML = `
    <span class="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500 mr-2"></span>
    <span class="text-xs text-zinc-300 font-semibold tracking-wide uppercase">Sync Saved</span>
  `;
}

function setupEventListeners() {
  let autoSaveTimeout;
  editorInput.addEventListener('input', () => {
    const activeNote = notes.find(n => n.id === activeNoteId);
    if (activeNote) {
      activeNote.content = editorInput.value;
      activeNote.updatedAt = Date.now();
      
      updatePreview();
      updateStats();
      
      clearTimeout(autoSaveTimeout);
      autoSaveTimeout = setTimeout(() => {
        saveData();
        renderSidebarNotes();
      }, 1000);
    }
  });

  noteTitleInput.addEventListener('input', () => {
    const activeNote = notes.find(n => n.id === activeNoteId);
    if (activeNote) {
      activeNote.title = noteTitleInput.value || "Untitled Note";
      activeNote.updatedAt = Date.now();
      
      clearTimeout(autoSaveTimeout);
      autoSaveTimeout = setTimeout(() => {
        saveData();
        renderSidebarNotes();
      }, 1000);
    }
  });

  noteTagsInput.addEventListener('input', () => {
    const activeNote = notes.find(n => n.id === activeNoteId);
    if (activeNote) {
      activeNote.tags = noteTagsInput.value;
      activeNote.updatedAt = Date.now();
      
      clearTimeout(autoSaveTimeout);
      autoSaveTimeout = setTimeout(() => {
        saveData();
        renderSidebarNotes();
        renderTagsFilter();
      }, 1200);
    }
  });

  templateSelect.addEventListener('change', (e) => {
    const type = e.target.value;
    if (type && TEMPLATES[type]) {
      const activeNote = notes.find(n => n.id === activeNoteId);
      if (activeNote) {
        if (confirm("Incorporate the selected layout spec into your current text body?")) {
          activeNote.content += "\\n\\n" + TEMPLATES[type];
          activeNote.updatedAt = Date.now();
          editorInput.value = activeNote.content;
          
          updatePreview();
          updateStats();
          saveData();
          renderSidebarNotes();
        }
      }
    }
    templateSelect.value = "";
  });

  createNoteBtn.addEventListener('click', () => {
    const newNote = {
      id: String(Date.now()),
      title: "✨ Brand New Space Document",
      content: `# New Obsidian Document\\n\\nStart drafting beautiful markdown files right here...`,
      tags: "draft, architecture",
      updatedAt: Date.now()
    };
    notes.unshift(newNote);
    activeNoteId = newNote.id;
    
    saveData();
    renderSidebarNotes();
    renderTagsFilter();
    loadActiveNote();
    
    editorInput.focus();
  });

  deleteNoteBtn.addEventListener('click', () => {
    if (confirm("Are you sure you want to permanently delete this document? This action cannot be undone.")) {
      notes = notes.filter(n => n.id !== activeNoteId);
      if (notes.length > 0) {
        activeNoteId = notes[0].id;
      } else {
        activeNoteId = null;
      }
      
      saveData();
      renderSidebarNotes();
      renderTagsFilter();
      loadActiveNote();
    }
  });

  searchInput.addEventListener('input', (e) => {
    searchQuery = e.target.value;
    renderSidebarNotes();
  });

  tabEdit.addEventListener('click', () => {
    editorPane.classList.remove('hidden');
    previewPaneContainer.classList.add('hidden');
    
    tabEdit.className = "flex-1 py-3 text-center text-xs font-bold bg-zinc-800 text-white border-r border-zinc-800 flex items-center justify-center gap-2";
    tabPreview.className = "flex-1 py-3 text-center text-xs font-bold text-zinc-400 flex items-center justify-center gap-2";
  });

  tabPreview.addEventListener('click', () => {
    editorPane.classList.add('hidden');
    previewPaneContainer.classList.remove('hidden');
    previewPaneContainer.classList.add('flex');
    
    tabEdit.className = "flex-1 py-3 text-center text-xs font-bold text-zinc-400 border-r border-zinc-800 flex items-center justify-center gap-2";
    tabPreview.className = "flex-1 py-3 text-center text-xs font-bold bg-zinc-800 text-white flex items-center justify-center gap-2";
  });

  sidebarToggleBtn.addEventListener('click', () => {
    sidebar.classList.toggle('-translate-x-full');
  });

  sidebarCloseBtn.addEventListener('click', () => {
    sidebar.classList.add('-translate-x-full');
  });

  cheatSheetToggle.addEventListener('click', () => {
    cheatSheetModal.classList.remove('hidden');
    cheatSheetModal.classList.add('flex');
  });

  closeCheatsheetBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      cheatSheetModal.classList.add('hidden');
      cheatSheetModal.classList.remove('flex');
    });
  });

  cheatSheetModal.addEventListener('click', (e) => {
    if (e.target === cheatSheetModal) {
      cheatSheetModal.classList.add('hidden');
      cheatSheetModal.classList.remove('flex');
    }
  });

  window.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      saveData();
    }
  });
}

window.addEventListener('DOMContentLoaded', init);// Heuristic Language Scanner for Markdown Codeblocks
function detectLanguage(code) {
  const trimmed = code.trim();
  if (trimmed.startsWith('{') && trimmed.endsWith('}') && trimmed.includes('"')) return 'json';
  if (/<[a-z][\s\S]*>/i.test(trimmed) || trimmed.includes('<!DOCTYPE html>') || trimmed.includes('</div>')) return 'html';
  if (/(const|let|var|function|console\.log|import\s|export\s|document\.)/g.test(trimmed)) return 'javascript';
  if (/(def\s+[a-zA-Z_]|import\s+[a-zA-Z_]|print\s*\(|elif\s+|if\s+__name__)/g.test(trimmed)) return 'python';
  if (/(SELECT\s+|FROM\s+|WHERE\s+|INSERT\s+INTO|UPDATE\s+|DELETE\s+FROM)/i.test(trimmed)) return 'sql';
  if (/(margin:|padding:|color:|display:|background:|@media|@import)/.test(trimmed)) return 'css';
  if (/(sudo\s+|npm\s+|git\s+|echo\s+|mkdir\s+)/.test(trimmed)) return 'shell';
  return 'javascript'; // Default intelligent fallback
}

// Custom Markdown Parser with interactive elements and language scans
function parseMarkdown(md) {
  if (!md) return '<div class="text-zinc-500 italic py-8 text-center">Start writing to compile live output preview...</div>';

  let html = md
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  const codeBlocks = [];
  html = html.replace(/```([\s\S]*?)```/gm, (match, content) => {
    const lines = content.split('\n');
    let lang = lines[0].trim();
    let codeContent = '';
    if (lang && /^[a-zA-Z0-9#+-]+$/.test(lang)) {
      codeContent = lines.slice(1).join('\n');
    } else {
      lang = '';
      codeContent = content;
    }
    
    // Auto detect language with real-time heuristic content scanner
    const detected = detectLanguage(codeContent);
    const finalLang = lang || detected || 'text';
    
    const placeholder = `__CODE_BLOCK_PLACEHOLDER_${codeBlocks.length}__`;
    codeBlocks.push({
      lang: finalLang,
      content: codeContent.trim()
    });
    return placeholder;
  });

  const lines = html.split('\n');
  let result = [];
  let inList = false;
  let listType = null; 
  let inTable = false;
  let tableHeaders = [];
  let tableRows = [];

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    const isTableRow = line.trim().startsWith('|') && line.trim().endsWith('|');

    if (isTableRow) {
      if (inList) {
        result.push(`</${listType}>`);
        inList = false;
        listType = null;
      }
      
      const cells = line.split('|').map(c => c.trim()).filter((c, idx, arr) => idx > 0 && idx < arr.length - 1);
      
      if (!inTable) {
        inTable = true;
        tableHeaders = cells;
      } else {
        const isSeparator = cells.every(c => /^:?-+:?$/.test(c));
        if (!isSeparator) {
          tableRows.push(cells);
        }
      }
      continue;
    } else {
      if (inTable) {
        let tableHtml = '<table><thead><tr>';
        tableHeaders.forEach(h => {
          tableHtml += `<th>${parseInlineMarkdown(h)}</th>`;
        });
        tableHtml += '</tr></thead><tbody>';
        tableRows.forEach(row => {
          tableHtml += '<tr>';
          for (let j = 0; j < tableHeaders.length; j++) {
            tableHtml += `<td>${parseInlineMarkdown(row[j] || '')}</td>`;
          }
          tableHtml += '</tr>';
        });
        tableHtml += '</tbody></table>';
        result.push(tableHtml);
        
        inTable = false;
        tableHeaders = [];
        tableRows = [];
      }
    }

    if (/^(?:-{3,}|\*{3,}|\_{3,})$/.test(line.trim())) {
      if (inList) { result.push(`</${listType}>`); inList = false; listType = null; }
      result.push('<hr>');
      continue;
    }

    const headingMatch = line.match(/^(#{1,6})\s+(.*)$/);
    if (headingMatch) {
      if (inList) { result.push(`</${listType}>`); inList = false; listType = null; }
      const level = headingMatch[1].length;
      const content = parseInlineMarkdown(headingMatch[2]);
      result.push(`<h${level}>${content}</h${level}>`);
      continue;
    }

    const blockquoteMatch = line.match(/^&gt;\s?(.*)$/);
    if (blockquoteMatch) {
      if (inList) { result.push(`</${listType}>`); inList = false; listType = null; }
      const content = parseInlineMarkdown(blockquoteMatch[1]);
      result.push(`<blockquote><p>${content}</p></blockquote>`);
      continue;
    }

    const taskMatch = line.match(/^[-*]\s+\[([ xX])\]\s+(.*)$/);
    if (taskMatch) {
      if (inList && listType !== 'ul') {
        result.push(`</${listType}>`);
        inList = false;
      }
      if (!inList) {
        result.push('<ul class="task-list">');
        inList = true;
        listType = 'ul';
      }
      const checked = taskMatch[1].toLowerCase() === 'x';
      const content = parseInlineMarkdown(taskMatch[2]);
      result.push(`
        <li class="task-list-item ${checked ? 'task-list-item-done' : ''}">
          <input type="checkbox" data-line="${i}" ${checked ? 'checked' : ''} class="task-checkbox-interactive">
          <span>${content}</span>
        </li>
      `);
      continue;
    }

    const ulMatch = line.match(/^[-*]\s+(.*)$/);
    if (ulMatch) {
      if (inList && listType !== 'ul') {
        result.push(`</${listType}>`);
        inList = false;
      }
      if (!inList) {
        result.push('<ul>');
        inList = true;
        listType = 'ul';
      }
      const content = parseInlineMarkdown(ulMatch[1]);
      result.push(`<li>${content}</li>`);
      continue;
    }

    const olMatch = line.match(/^(\d+)\.\s+(.*)$/);
    if (olMatch) {
      if (inList && listType !== 'ol') {
        result.push(`</${listType}>`);
        inList = false;
      }
      if (!inList) {
        result.push('<ol>');
        inList = true;
        listType = 'ol';
      }
      const content = parseInlineMarkdown(olMatch[2]);
      result.push(`<li>${content}</li>`);
      continue;
    }

    if (line.trim() === '') {
      if (inList) {
        result.push(`</${listType}>`);
        inList = false;
        listType = null;
      }
      result.push('<br>');
      continue;
    }

    if (inList) {
      result.push(`</${listType}>`);
      inList = false;
      listType = null;
    }
    result.push(`<p>${parseInlineMarkdown(line)}</p>`);
  }

  if (inTable) {
    let tableHtml = '<table><thead><tr>';
    tableHeaders.forEach(h => { tableHtml += `<th>${parseInlineMarkdown(h)}</th>`; });
    tableHtml += '</tr></thead><tbody>';
    tableRows.forEach(row => {
      tableHtml += '<tr>';
      for (let j = 0; j < tableHeaders.length; j++) {
        tableHtml += `<td>${parseInlineMarkdown(row[j] || '')}</td>`;
      }
      tableHtml += '</tr>';
    });
    tableHtml += '</tbody></table>';
    result.push(tableHtml);
  }
  if (inList) {
    result.push(`</${listType}>`);
  }

  let renderedHtml = result.join('\n');
  codeBlocks.forEach((block, idx) => {
    const placeholder = `__CODE_BLOCK_PLACEHOLDER_${idx}__`;
    const escapedCode = block.content
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>');
    
    const customBlock = `
      <div class="code-block-wrapper my-6 border border-zinc-800 rounded-lg overflow-hidden bg-[#090d16]">
        <div class="codeblock-header flex items-center justify-between px-4 py-2 bg-[#111827] text-xs border-b border-zinc-800">
          <span class="codeblock-lang-badge uppercase font-bold tracking-wider text-violet-400">${block.lang}</span>
          <button class="copy-code-btn text-zinc-500 hover:text-zinc-200 flex items-center gap-1.5 transition-colors" data-code="${encodeURIComponent(escapCode)}">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
            </svg>
            <span>Copy</span>
          </button>
        </div>
        <pre class="m-0 bg-[#090d16] p-4 overflow-x-auto"><code class="language-${block.lang} text-zinc-300 font-mono text-xs leading-relaxed">${escapeHTML(escapCode)}</code></pre>
      </div>
    `;
    renderedHtml = renderedHtml.replace(placeholder, customBlock);
  });

  return renderedHtml;
}

function parseInlineMarkdown(text) {
  return text
    .replace(/\*\*([\s\S]*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([\s\S]*?)\*/g, '<em>$1</em>')
    .replace(/~~([\s\S]*?)~~/g, '<del>$1</del>')
    .replace(/==([\s\S]*?)==/g, '<mark>$1</mark>')
    .replace(/::([\s\S]*?)::/g, '<kbd>$1</kbd>')
    .replace(/`([\s\S]*?)`/g, '<code>$1</code>');
}

function escapeHTML(str) {
  return str.replace(/[&<>'"]/g, 
    tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag] || tag)
  );
}

// Preloaded Default Documents
const DEFAULT_NOTES = [
  {
    id: 'note-1',
    title: 'Welcome to Obsidian Lite',
    content: `# Welcome to Obsidian Lite 🪐
This is a premium dark-themed Markdown workspace designed for high-fidelity technical editing, blueprints, and dynamic strategizing. 

## Integrated Real-Time Scanning
This application has **disabled the external global technology dashboard** in favor of high-performance **real-time heuristic code scanning** integrated directly into the markdown compiler. 

Let's test the heuristic content language identification below:

\`\`\`
const workspace = {
  version: 2026,
  theme: "Obsidian Slate",
  features: ["Markdown Live compiler", "Autosave", "Interactive checklist Sync"]
};
console.log("Workspace initialized successfully!");
\`\`\`

> Notice how the compiler automatically scanned the JavaScript signatures and labeled the code block badge as "JAVASCRIPT" without any manually specified language identifier!

## Live Checklist Features
- [x] Create some beautiful code blocks to test heuristic scanning
- [ ] Try writing SQL queries or CSS styles and watch the compiler label them
- [ ] Connect with standard markup cheatsheets

Feel free to write tables, custom blockquotes, and explore the template injections above.`,
    tags: 'welcome, onboarding, markdown',
    updatedAt: Date.now()
  },
  {
    id: 'note-2',
    title: 'Architecture Blueprint v2026',
    content: `# Architecture Blueprint v2026

Below is a CSS codeblock. Notice how the heuristic compiler scans custom style selectors and styles them accurately under CSS labels:

\`\`\`
.obsidian-preview table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  margin: 2rem 0;
}
\`\`\`

## Schema Models
Below is a simple database model written in raw SQL. The real-time parser identifies standard statements automatically:

\`\`\`
SELECT account_id, username, email FROM system_accounts WHERE status = 'active';
\`\`\``,
    tags: 'architecture, blueprint, css',
    updatedAt: Date.now() - 3600000
  }
];

const TEMPLATES = {
  daily: `# Daily Strategy Log - ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
## Focus Areas
- [ ] Implement robust microservice endpoints
- [ ] Review system diagnostic logs
- [ ] Coordinate with architecture team

## Technical Notes
\`\`\`
const coreConfig = {
  environment: "production",
  port: 8080,
  syncInterval: 30000
};
console.log("System initialized on port", coreConfig.port);
\`\`\`

## Quick Review
What went well today? What needs attention tomorrow?`,

  weekly: `# Weekly Blueprints - Year 2026
## Deliverables Completed
- [x] Initial proof of concept parsed models
- [x] High-fidelity custom scroll integrations

## Next Objectives
- [ ] Complete heuristic language auto-detection models
- [ ] Optimize styling layouts for responsive displays

## Database Migration Script Draft
\`\`\`
SELECT user_id, email, created_at 
FROM accounts 
WHERE active = 1 
ORDER BY created_at DESC;
\`\`\`

## Summary Report`,

  project: `# Project Specs Draft - Obsidian Lite
## Core Technologies
- HTML5 Canvas & SVG Layering
- Dynamic real-time Markdown Parsing
- LocalStorage state management

## Architecture Interface Code
\`\`\`
body {
  margin: 0;
  background-color: #0b0f17;
  color: #f3f4f6;
  font-family: 'Inter', sans-serif;
}
.obsidian-preview {
  line-height: 1.7;
}
\`\`\`

## Key Milestones
- [ ] Integrate real-time code scanning heuristics
- [ ] Establish unified multi-pane layout`,

  meeting: `# Meeting Schedule Agenda
## Participants
- Lead System Engineer
- Frontend UX Architect

## Discussion Points
1. Address the live preview container scrolling issues
2. Discuss disabling global dashboard technology badges in favor of inline language codeblock heuristics

## JavaScript Action Steps
\`\`\`
function handleChecklistChange(lineIndex, isChecked) {
  const lines = currentNote.content.split('\\n');
  lines[lineIndex] = isChecked ? "- [x] Finished task" : "- [ ] Incomplete task";
}
\`\`\`

## Notes`
};

// Application State
let notes = JSON.parse(localStorage.getItem('obsidian_lite_notes')) || DEFAULT_NOTES;
let currentNoteId = localStorage.getItem('obsidian_lite_current_id') || (notes.length > 0 ? notes[0].id : null);
let selectedTagFilter = null;

// DOM Selectors
const sidebar = document.getElementById('sidebar');
const sidebarToggleBtn = document.getElementById('sidebarToggleBtn');
const sidebarCloseBtn = document.getElementById('sidebarCloseBtn');
const searchInput = document.getElementById('searchInput');
const createNoteBtn = document.getElementById('createNoteBtn');
const tagsFilterList = document.getElementById('tagsFilterList');
const noteList = document.getElementById('noteList');
const noteTitleInput = document.getElementById('noteTitleInput');
const templateSelect = document.getElementById('templateSelect');
const cheatSheetToggle = document.getElementById('cheatSheetToggle');
const saveIndicator = document.getElementById('saveIndicator');
const deleteNoteBtn = document.getElementById('deleteNoteBtn');
const noteTagsInput = document.getElementById('noteTagsInput');
const tabEdit = document.getElementById('tabEdit');
const tabPreview = document.getElementById('tabPreview');
const editorPane = document.getElementById('editorPane');
const previewPaneContainer = document.getElementById('previewPaneContainer');
const previewPane = document.getElementById('previewPane');
const statsWords = document.getElementById('statsWords');
const statsChars = document.getElementById('statsChars');
const statsReadTime = document.getElementById('statsReadTime');
const cheatSheetModal = document.getElementById('cheatSheetModal');
const closeCheatsheetBtns = document.querySelectorAll('.close-cheatsheet-btn');
const editorInput = document.getElementById('editorInput');

// Guaranteed scrollability setup
if (previewPane) {
  previewPane.style.overflowY = 'auto';
  previewPane.style.height = '100%';
  previewPane.style.webkitOverflowScrolling = 'touch';
  previewPane.style.pointerEvents = 'auto';
}

// Initialize Application
function init() {
  renderSidebarNotes();
  renderTagsFilter();
  loadNote(currentNoteId);
  setupEventListeners();
}

// Render list of note filecards
function renderSidebarNotes() {
  const query = searchInput.value.toLowerCase().trim();
  let filtered = notes;

  if (query) {
    filtered = filtered.filter(n => 
      n.title.toLowerCase().includes(query) || 
      n.content.toLowerCase().includes(query) ||
      n.tags.toLowerCase().includes(query)
    );
  }

  if (selectedTagFilter) {
    filtered = filtered.filter(n => 
      n.tags.split(',').map(t => t.trim().toLowerCase()).includes(selectedTagFilter)
    );
  }

  // Sort by updatedAt descending
  filtered.sort((a, b) => b.updatedAt - a.updatedAt);

  noteList.innerHTML = '';
  
  if (filtered.length === 0) {
    noteList.innerHTML = `
      <div class="text-center py-6 text-zinc-500 text-xs">
        No documents found
      </div>
    `;
    return;
  }

  filtered.forEach(note => {
    const isActive = note.id === currentNoteId;
    const itemCard = document.createElement('div');
    itemCard.className = `file-card p-3 rounded-lg relative cursor-pointer smooth-transition ${isActive ? 'active bg-[#1f293d]/50 border-violet-500/30' : 'hover:bg-zinc-800/40'}`;
    
    // Quick preview snippet
    const snippet = note.content
      .replace(/[#*`>_-]/g, '')
      .substring(0, 75) + (note.content.length > 75 ? '...' : '');

    // Render tags
    const tagsArr = note.tags.split(',').map(t => t.trim()).filter(Boolean);
    const tagsMarkup = tagsArr.map(t => `
      <span class="px-1.5 py-0.5 rounded text-[9px] font-mono bg-zinc-800 text-zinc-400 border border-zinc-700/50 hover:text-violet-300 transition-colors">${t}</span>
    `).join('');

    itemCard.innerHTML = `
      <div class="flex items-start justify-between gap-1.5">
        <h4 class="font-semibold text-xs text-zinc-200 truncate ${isActive ? 'text-violet-300' : ''}">${escapeHTML(note.title || 'Untitled Note')}</h4>
        <span class="text-[9px] text-zinc-500 shrink-0 font-mono">${new Date(note.updatedAt).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})}</span>
      </div>
      <p class="text-[10px] text-zinc-400 line-clamp-2 mt-1 leading-relaxed font-sans">${escapeHTML(snippet || 'No additional content')}</p>
      ${tagsMarkup ? `<div class="flex flex-wrap gap-1 mt-2">${tagsMarkup}</div>` : ''}
    `;

    itemCard.addEventListener('click', () => {
      loadNote(note.id);
      // On mobile, automatically show the preview side when selecting
      if (window.innerWidth < 1024) {
        showTab('preview');
      }
    });

    noteList.appendChild(itemCard);
  });
}

// Render dynamic tag counts and elements
function renderTagsFilter() {
  const counts = {};
  notes.forEach(note => {
    if (!note.tags) return;
    note.tags.split(',').forEach(tag => {
      const clean = tag.trim().toLowerCase();
      if (clean) {
        counts[clean] = (counts[clean] || 0) + 1;
      }
    });
  });

  tagsFilterList.innerHTML = '';

  // All category option
  const allBtn = document.createElement('button');
  allBtn.className = `w-full text-left text-[11px] py-1 px-2 rounded font-medium smooth-transition flex justify-between items-center ${!selectedTagFilter ? 'bg-violet-950/30 text-violet-300 border-l-2 border-violet-500 pl-1.5' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'}`;
  allBtn.innerHTML = `<span>📂 All Documents</span> <span class="text-[9px] font-mono opacity-60">${notes.length}</span>`;
  allBtn.addEventListener('click', () => {
    selectedTagFilter = null;
    renderTagsFilter();
    renderSidebarNotes();
  });
  tagsFilterList.appendChild(allBtn);

  // Dynamic lists tags
  Object.keys(counts).sort().forEach(tag => {
    const isSelected = tag === selectedTagFilter;
    const tagBtn = document.createElement('button');
    tagBtn.className = `w-full text-left text-[11px] py-1 px-2 rounded font-medium smooth-transition flex justify-between items-center ${isSelected ? 'bg-violet-950/30 text-violet-300 border-l-2 border-violet-500 pl-1.5' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'}`;
    tagBtn.innerHTML = `<span># ${tag}</span> <span class="text-[9px] font-mono opacity-60">${counts[tag]}</span>`;
    tagBtn.addEventListener('click', () => {
      selectedTagFilter = isSelected ? null : tag;
      renderTagsFilter();
      renderSidebarNotes();
    });
    tagsFilterList.appendChild(tagBtn);
  });
}

// Load a document into editor pane and live preview compiled
function loadNote(id) {
  const note = notes.find(n => n.id === id);
  if (!note) {
    // Fallback if currentNoteId not found
    if (notes.length > 0) {
      loadNote(notes[0].id);
    } else {
      currentNoteId = null;
      disableWorkspace();
    }
    return;
  }

  currentNoteId = id;
  localStorage.setItem('obsidian_lite_current_id', id);

  // Enable Inputs
  noteTitleInput.disabled = false;
  noteTagsInput.disabled = false;
  editorInput.disabled = false;
  deleteNoteBtn.disabled = false;

  // Bind values
  noteTitleInput.value = note.title;
  noteTagsInput.value = note.tags;
  editorInput.value = note.content;

  // Build Output Preview Compiled Live
  updatePreviewAndStats();
  renderSidebarNotes();
}

function disableWorkspace() {
  noteTitleInput.value = '';
  noteTagsInput.value = '';
  editorInput.value = '';
  noteTitleInput.disabled = true;
  noteTagsInput.disabled = true;
  editorInput.disabled = true;
  deleteNoteBtn.disabled = true;
  previewPane.innerHTML = `<div class="text-zinc-500 italic py-8 text-center">No Document Active. Click "Create New Document" to begin.</div>`;
  statsWords.innerText = '0';
  statsChars.innerText = '0';
  statsReadTime.innerText = '0m';
}

// Update compiled views, parse markdown heuristics, and calculate footers stats
function updatePreviewAndStats() {
  if (!currentNoteId) return;
  const note = notes.find(n => n.id === currentNoteId);
  if (!note) return;

  const content = editorInput.value;
  previewPane.innerHTML = parseMarkdown(content);

  // Handle Checklist change interactions in live previewcompiled 
  const checkBoxes = previewPane.querySelectorAll('.task-checkbox-interactive');
  checkBoxes.forEach(box => {
    box.addEventListener('change', (e) => {
      const lineIndex = parseInt(e.target.getAttribute('data-line'), 10);
      const lines = editorInput.value.split('\n');
      const isChecked = e.target.checked;
      
      const lineText = lines[lineIndex];
      // Replace only task state
      lines[lineIndex] = lineText.replace(/^([-*]\s+\[)([ xX])(\])/, `$1${isChecked ? 'x' : ' '}$3`);
      
      editorInput.value = lines.join('\n');
      triggerSave();
      updatePreviewAndStats();
    });
  });

  // Handle Dynamic codeblock copy buttons
  const copyButtons = previewPane.querySelectorAll('.copy-code-btn');
  copyButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const code = decodeURIComponent(btn.getAttribute('data-code'));
      navigator.clipboard.writeText(code).then(() => {
        const textSpan = btn.querySelector('span');
        const origText = textSpan.innerText;
        textSpan.innerText = 'Copied!';
        btn.classList.add('text-emerald-400');
        setTimeout(() => {
          textSpan.innerText = origText;
          btn.classList.remove('text-emerald-400');
        }, 1500);
      });
    });
  });

  // Calculate standard diagnostic content metadata counters
  const words = content ? content.trim().split(/\s+/).filter(Boolean).length : 0;
  const chars = content ? content.length : 0;
  const readTime = Math.max(1, Math.ceil(words / 200));

  statsWords.innerText = words;
  statsChars.innerText = chars;
  statsReadTime.innerText = `${readTime}m`;
}

// Auto-save mechanisms
let saveTimeout = null;
function triggerSave() {
  if (!currentNoteId) return;

  // Show active syncing status
  const indicatorIndicator = saveIndicator.querySelector('.saving-pulse');
  const indicatorText = saveIndicator.querySelector('span:last-child');
  
  indicatorIndicator.classList.remove('bg-emerald-500');
  indicatorIndicator.classList.add('bg-amber-500');
  indicatorText.innerText = 'Saving...';

  clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => {
    const note = notes.find(n => n.id === currentNoteId);
    if (note) {
      note.title = noteTitleInput.value.trim() || 'Untitled Note';
      note.tags = noteTagsInput.value.trim();
      note.content = editorInput.value;
      note.updatedAt = Date.now();

      localStorage.setItem('obsidian_lite_notes', JSON.stringify(notes));
      renderSidebarNotes();
      renderTagsFilter();

      // Complete pulse feedback state
      indicatorIndicator.classList.remove('bg-amber-500');
      indicatorIndicator.classList.add('bg-emerald-500');
      indicatorText.innerText = 'Sync Saved';
    }
  }, 600);
}

// Event Bindings
function setupEventListeners() {
  // Title / Tags Change
  noteTitleInput.addEventListener('input', triggerSave);
  noteTagsInput.addEventListener('input', triggerSave);
  editorInput.addEventListener('input', () => {
    updatePreviewAndStats();
    triggerSave();
  });

  // Document creation trigger action button
  createNoteBtn.addEventListener('click', () => {
    const newNote = {
      id: 'note-' + Date.now(),
      title: 'New Document Draft',
      content: `# New Document Draft\n\nStart writing markdown documents here...`,
      tags: 'draft',
      updatedAt: Date.now()
    };
    notes.unshift(newNote);
    localStorage.setItem('obsidian_lite_notes', JSON.stringify(notes));
    
    selectedTagFilter = null;
    renderTagsFilter();
    renderSidebarNotes();
    loadNote(newNote.id);
  });

  // Delete current active document action button
  deleteNoteBtn.addEventListener('click', () => {
    if (!currentNoteId) return;
    if (confirm('Are you absolutely sure you want to permanently delete this document?')) {
      notes = notes.filter(n => n.id !== currentNoteId);
      localStorage.setItem('obsidian_lite_notes', JSON.stringify(notes));
      
      currentNoteId = notes.length > 0 ? notes[0].id : null;
      selectedTagFilter = null;
      renderTagsFilter();
      renderSidebarNotes();
      
      if (currentNoteId) {
        loadNote(currentNoteId);
      } else {
        disableWorkspace();
      }
    }
  });

  // Live document searching
  searchInput.addEventListener('input', () => {
    renderSidebarNotes();
  });

  // Template Injection Selection trigger dropdown
  templateSelect.addEventListener('change', (e) => {
    const val = e.target.value;
    if (val && TEMPLATES[val] && currentNoteId) {
      if (confirm('Overwrite current contents with chosen template draft specifications?')) {
        editorInput.value = TEMPLATES[val];
        noteTitleInput.value = val.charAt(0).toUpperCase() + val.slice(1) + ' Workspace Log';
        updatePreviewAndStats();
        triggerSave();
      }
      e.target.value = ''; // Reset select tag index values
    }
  });

  // Sidebar Layout Collapse & Slide view actions
  sidebarToggleBtn.addEventListener('click', () => {
    sidebar.classList.toggle('-translate-x-full');
    sidebar.classList.toggle('lg:translate-x-0');
  });

  sidebarCloseBtn.addEventListener('click', () => {
    sidebar.classList.add('-translate-x-full');
  });

  // Cheatsheet Reference Manual trigger modal actions
  cheatSheetToggle.addEventListener('click', () => {
    cheatSheetModal.classList.remove('hidden');
    cheatSheetModal.classList.add('flex');
  });

  closeCheatsheetBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      cheatSheetModal.classList.add('hidden');
      cheatSheetModal.classList.remove('flex');
    });
  });

  // Mobile layout switch tabs
  tabEdit.addEventListener('click', () => showTab('edit'));
  tabPreview.addEventListener('click', () => showTab('preview'));
}

// Mobile responsive tab switcher display logic
function showTab(tab) {
  if (tab === 'edit') {
    tabEdit.classList.add('bg-zinc-800', 'text-white');
    tabEdit.classList.remove('text-zinc-400');
    tabPreview.classList.remove('bg-zinc-800', 'text-white');
    tabPreview.classList.add('text-zinc-400');

    editorPane.classList.remove('hidden');
    editorPane.classList.add('flex');
    previewPaneContainer.classList.add('hidden');
    previewPaneContainer.classList.remove('lg:flex');
  } else {
    tabPreview.classList.add('bg-zinc-800', 'text-white');
    tabPreview.classList.remove('text-zinc-400');
    tabEdit.classList.remove('bg-zinc-800', 'text-white');
    tabEdit.classList.add('text-zinc-400');

    previewPaneContainer.classList.remove('hidden');
    previewPaneContainer.classList.add('flex', 'lg:flex');
    editorPane.classList.add('hidden');
    editorPane.classList.remove('flex');
  }
}

// On DOM load complete
window.addEventListener('DOMContentLoaded', init);