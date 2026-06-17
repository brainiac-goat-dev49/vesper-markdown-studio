/**
 * logics/app.js
 * Premium Vanilla ES6 Markdown Engine Controller
 * Integrated with localStorage, auto-saving indicators, live templates, custom tagging, and metadata tracking.
 * Year: 2026
 */

// Custom High-Fidelity Markdown Parser Engine
class MarkdownEngine {
  static parse(markdown) {
    if (!markdown) return '<p class="text-zinc-500 italic">No content. Start writing here...</p>';
    let html = markdown;

    // 1. Escape HTML entities to prevent XSS issues while maintaining performance
    html = html
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    // 2. Code blocks (```lang ... ```)
    html = html.replace(/```(\w*)\n([\s\S]*?)\n```/g, (match, lang, code) => {
      const cleanCode = code.trim();
      return `<pre><code class="language-${lang || 'text'}">${cleanCode}</code></pre>`;
    });

    // 3. Inline Code (`code`)
    html = html.replace(/`([^`\n]+)`/g, '<code>$1</code>');

    // 4. Headers with interactive hash anchors (H1 - H6)
    html = html.replace(/^(#{1,6})\s+(.+)$/gm, (match, hashes, title) => {
      const level = hashes.length;
      const cleanTitle = title.trim();
      const slug = cleanTitle.toLowerCase().replace(/[^\w]+/g, '-');
      return `<h${level} id="${slug}">${cleanTitle}</h${level}>`;
    });

    // 5. Blockquotes (Group consecutive lines)
    html = html.replace(/^>\s+(.+)$/gm, '<blockquote>$1</blockquote>');
    html = html.replace(/<\/blockquote>\n<blockquote>/g, '<br>');

    // 6. Horizontal Rules
    html = html.replace(/^(\s*[-*_]){3,}\s*$/gm, '<hr>');

    // 7. Interactive Tasks Checklist (- [ ] and - [x])
    let taskIndex = 0;
    html = html.replace(/^([ \t]*)-\s+\[([ xX])\]\s+(.+)$/gm, (match, indent, checked, label) => {
      const isChecked = checked.toLowerCase() === 'x';
      const doneClass = isChecked ? 'task-list-item-done' : '';
      return `<li class="task-list-item ${doneClass}">
        <input type="checkbox" ${isChecked ? 'checked' : ''} data-task-id="${taskIndex++}">
        <span class="ml-1">${label.trim()}</span>
      </li>`;
    });

    // 8. Unordered Lists (excluding checklists handled above)
    html = html.replace(/^([ \t]*)[*+-]\s+(.+)$/gm, (match, indent, text) => {
      if (text.startsWith('[ ]') || text.startsWith('[x]') || text.startsWith('[X]')) {
        return match;
      }
      return `<ul><li>${text.trim()}</li></ul>`;
    });
    html = html.replace(/<\/ul>\n<ul>/g, '');

    // 9. Ordered Lists
    html = html.replace(/^([ \t]*)\d+\.\s+(.+)$/gm, '<ol><li>$2</li></ol>');
    html = html.replace(/<\/ol>\n<ol>/g, '');

    // 10. Styled Bold, Italics, Strikethroughs, and Highlights
    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');
    html = html.replace(/__([^_]+)__/g, '<strong>$1</strong>');
    html = html.replace(/_([^_]+)_/g, '<em>$1</em>');
    html = html.replace(/~~([^~]+)~~/g, '<del>$1</del>');
    html = html.replace(/==([^=]+)==/g, '<mark>$1</mark>');

    // 11. Custom Highlights for specific Markdown shortcuts (Optional convenience)
    html = html.replace(/::([^:]+)::/g, '<kbd>$1</kbd>');

    // 12. Auto-Link Parsing
    html = html.replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1" target="_blank" class="text-violet-400 hover:underline inline-flex items-center gap-1">$1 ↗</a>');

    // 13. Dynamic High-fidelity Table Generator
    const lines = html.split('\n');
    let inTable = false;
    let tableHeaders = [];
    let tableAlignments = [];
    let tableRows = [];
    let parsedLines = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.startsWith('|') && line.endsWith('|')) {
        const parts = line.split('|').map(s => s.trim()).filter((s, idx, arr) => idx > 0 && idx < arr.length - 1);
        
        if (!inTable) {
          const nextLine = lines[i+1] ? lines[i+1].trim() : '';
          if (nextLine.startsWith('|') && nextLine.includes('-')) {
            inTable = true;
            tableHeaders = parts;
            const alignmentParts = nextLine.split('|').map(s => s.trim()).filter((s, idx, arr) => idx > 0 && idx < arr.length - 1);
            tableAlignments = alignmentParts.map(s => {
              if (s.startsWith(':') && s.endsWith(':')) return 'center';
              if (s.endsWith(':')) return 'right';
              return 'left';
            });
            i++; // skip separator
            continue;
          }
        }
        
        if (inTable) {
          tableRows.push(parts);
        }
      } else {
        if (inTable) {
          parsedLines.push(MarkdownEngine.renderTableHTML(tableHeaders, tableAlignments, tableRows));
          inTable = false;
          tableHeaders = [];
          tableAlignments = [];
          tableRows = [];
        }
        parsedLines.push(lines[i]);
      }
    }
    
    if (inTable) {
      parsedLines.push(MarkdownEngine.renderTableHTML(tableHeaders, tableAlignments, tableRows));
    }

    html = parsedLines.join('\n');

    // Convert spacing gaps to paragraphs
    html = html.replace(/\n\n/g, '<p class="my-4"></p>');

    return html;
  }

  static renderTableHTML(headers, alignments, rows) {
    let html = '<div class="overflow-x-auto my-6"><table class="w-full"><thead><tr>';
    headers.forEach((h, idx) => {
      const align = alignments[idx] || 'left';
      html += `<th style="text-align: ${align}">${h}</th>`;
    });
    html += '</tr></thead><tbody>';
    rows.forEach(row => {
      html += 'tr>';
      for (let idx = 0; idx < headers.length; idx++) {
        const cell = row[idx] || '';
        const align = alignments[idx] || 'left';
        html += `<td style="text-align: ${align}">${cell}</td>`;
      }
      html += '</tr>';
    });
    html += '</tbody></table></div>';
    return html;
  }
}

// Built-in Premium System Starter Templates
const NOTE_TEMPLATES = {
  daily: `# Daily Log - 2026-03-31 🪐

## Today's Core Strategy
- [ ] Complete critical design implementation details
- [ ] Review stateful synchronization logs

## Timetable Schedule
* **09:00 AM** - Team Architecture Alignment Sync
* **10:30 AM** - Markdown Parser Feature Refinement
* **03:00 PM** - Performance Metrics Review

## Brainstorming & Observations
> "Consistency is the compounding engine of progress."
==Double equal signs create brilliant highlighted marks to keep core tasks prominent.==`,

  weekly: `# Weekly Review & Strategy Blueprint

## Key Milestones Met
- [x] Integrate dual-pane side-by-side editing interface
- [x] Complete Markdown Engine and auto-saving logic

## Strategic Goals Next Week
- [ ] Incorporate comprehensive telemetry analysis
- [ ] Optimize custom keybinding accelerators

## Executive Reflections
* Keep UX responsive, clean, and styled beautifully.`,

  project: `# Project Specification Document

## Executive Overview
A zero-dependency high-performance Markdown editing tool built purely on modern ES6 specifications.

## Priority Feature Matrix
| Feature Goal | Target Phase | Status |
| :--- | :---: | :---: |
| Collapsible Sidebars | Phase 1 | Complete |
| Local Storage Sync | Phase 1 | Active |
| Interactive Previews | Phase 2 | Complete |

## Implementation Stack
- HTML5 Custom Customizations
- Tailwind CSS CDN Layout
- Vanilla JavaScript Core`,

  meeting: `# Meeting Agenda & Minutes

**Date:** 2026-03-31  
**Topic:** Core State Sync Logic  
**Lead Facilitator:** Senior Platform Architect  

## Key Takeaways & Agreements
1. Run parsing inside a lightweight debounced wrapper to prevent UI stutters.
2. Enable direct checkbox interaction in the real-time preview frame.

## Deliverables Checklist
- [ ] Deliver application script (logics/app.js)
- [ ] Verify Tailwind components align cleanly`
};

// Main State & Controller Logic
class AppController {
  constructor() {
    this.notes = [];
    this.activeNoteId = null;
    this.searchQuery = '';
    this.selectedTagFilter = '';
    this.saveTimeout = null;

    // Cache DOM Elements
    this.dom = {
      noteList: document.getElementById('noteList'),
      editorInput: document.getElementById('editorInput'),
      previewPane: document.getElementById('previewPane'),
      searchInput: document.getElementById('searchInput'),
      tagsFilterList: document.getElementById('tagsFilterList'),
      noteTitleInput: document.getElementById('noteTitleInput'),
      noteTagsInput: document.getElementById('noteTagsInput'),
      saveIndicator: document.getElementById('saveIndicator'),
      createNoteBtn: document.getElementById('createNoteBtn'),
      deleteNoteBtn: document.getElementById('deleteNoteBtn'),
      sidebar: document.getElementById('sidebar'),
      sidebarToggleBtn: document.getElementById('sidebarToggleBtn'),
      sidebarCloseBtn: document.getElementById('sidebarCloseBtn'),
      templateSelect: document.getElementById('templateSelect'),
      statsWords: document.getElementById('statsWords'),
      statsChars: document.getElementById('statsChars'),
      statsReadTime: document.getElementById('statsReadTime'),
      cheatSheetToggle: document.getElementById('cheatSheetToggle'),
      cheatSheetModal: document.getElementById('cheatSheetModal'),
      closeCheatSheet: document.getElementById('closeCheatSheet'),
      editorPane: document.getElementById('editorPane'),
      previewPaneContainer: document.getElementById('previewPaneContainer'),
      tabEdit: document.getElementById('tabEdit'),
      tabPreview: document.getElementById('tabPreview')
    };

    this.init();
  }

  init() {
    // Load existing storage or generate demo workspace
    this.loadNotes();
    this.setupEventListeners();
    this.renderNoteList();
    this.renderTagsFilter();
    this.selectNote(this.notes[0]?.id || null);
    
    // Auto-Save background loop simulation (Visual Indicator Pulse)
    setInterval(() => {
      this.triggerVisualPulse();
    }, 12000);
  }

  loadNotes() {
    const rawData = localStorage.getItem('obsidian_lite_notes');
    if (rawData) {
      try {
        this.notes = JSON.parse(rawData);
      } catch (e) {
        this.notes = [];
      }
    }

    if (this.notes.length === 0) {
      // First-time load: Setup beautifully rich starter documents
      this.notes = [
        {
          id: 'welcome-note-id',
          title: 'Welcome to Obsidian Lite 2026 🪐',
          content: `# Welcome to Obsidian Lite 2026 🪐

This is a premium, high-fidelity single-page **Markdown Editor** crafted with pure vanilla ES6 and Tailwind CSS.

## 🚀 Key Features Included

- **Side-by-Side Dual Pane**: Live preview updates instantly as you type.
- **Robust Client-side CRUD**: All notes are synchronized continuously to your local browser storage.
- **Interactive Checkboxes**: Try checking/unchecking items directly inside the preview layout!
- **Word & Read-Time Tracker**: Instant metadata stats keep you informed.
- **Template Injector**: Drop customizable structured starter templates with a single click.
- **Interactive Tags**: Organize your collection by adding custom tags in the header.

## 📝 Markdown Quick Reference

### Beautiful Standard Tables
| Product Variant | Category | Status |
| :--- | :--- | :---: |
| Obsidian Premium | Workspace | Vibrant |
| Tail-wind Styling | Framework | Active |

### Blockquotes & Custom Highlights
> "This workspace changes how you prioritize information. Absolute minimalist comfort."
Use ==double equals== to highlight important passages.

## 🛠️ Interactive Tasks Checklist
- [x] Experience smooth elastic transitions
- [ ] Create your first custom note
- [ ] Toggle the sidebar view on mobile layouts`,
          tags: ['guide', 'workspace'],
          updatedAt: new Date('2026-03-31T10:00:00.000Z').getTime()
        },
        {
          id: 'demo-scratchpad',
          title: 'Immediate Sandbox Scratchpad',
          content: `# Sandbox Scratchpad 📝

Use this safe space to test custom Markdown styles. Write code blocks, lists, headers, or align tables!

\`\`\`javascript
// High performance parsing engine
const render = (text) => {
  return MarkdownEngine.parse(text);
};
console.log("Ready for 2026 workflows!");
\`\`\`

- [ ] Unfinished checklist element
- [ ] Draft system documentation structure`,
          tags: ['sandbox', 'scratch'],
          updatedAt: new Date('2026-03-31T09:45:00.000Z').getTime()
        }
      ];
      this.saveNotesToStorage();
    }
  }

  saveNotesToStorage() {
    localStorage.setItem('obsidian_lite_notes', JSON.stringify(this.notes));
  }

  setupEventListeners() {
    // 1. Live Input Parsing
    this.dom.editorInput.addEventListener('input', () => {
      if (!this.activeNoteId) return;
      const active = this.notes.find(n => n.id === this.activeNoteId);
      if (active) {
        active.content = this.dom.editorInput.value;
        active.updatedAt = Date.now();
        this.updatePreviewAndMetadata();
        this.debouncedSave();
      }
    });

    // 2. Title and Tag updates
    this.dom.noteTitleInput.addEventListener('input', () => {
      if (!this.activeNoteId) return;
      const active = this.notes.find(n => n.id === this.activeNoteId);
      if (active) {
        active.title = this.dom.noteTitleInput.value || 'Untitled Note';
        active.updatedAt = Date.now();
        this.renderNoteList();
        this.debouncedSave();
      }
    });

    this.dom.noteTagsInput.addEventListener('change', () => {
      if (!this.activeNoteId) return;
      const active = this.notes.find(n => n.id === this.activeNoteId);
      if (active) {
        const rawTags = this.dom.noteTagsInput.value;
        active.tags = rawTags.split(',')
          .map(t => t.trim().toLowerCase())
          .filter(t => t.length > 0);
        active.updatedAt = Date.now();
        this.renderTagsFilter();
        this.renderNoteList();
        this.debouncedSave();
      }
    });

    // 3. Search input
    this.dom.searchInput.addEventListener('input', (e) => {
      this.searchQuery = e.target.value.toLowerCase();
      this.renderNoteList();
    });

    // 4. Create & Delete Buttons
    this.dom.createNoteBtn.addEventListener('click', () => this.createNewNote());
    this.dom.deleteNoteBtn.addEventListener('click', () => this.deleteActiveNote());

    // 5. Sidebar Toggles
    this.dom.sidebarToggleBtn.addEventListener('click', () => {
      this.dom.sidebar.classList.toggle('sidebar-closed');
    });
    this.dom.sidebarCloseBtn.addEventListener('click', () => {
      this.dom.sidebar.classList.add('sidebar-closed');
    });

    // 6. Template Injector dropdown
    this.dom.templateSelect.addEventListener('change', (e) => {
      const selected = e.target.value;
      if (selected && NOTE_TEMPLATES[selected]) {
        this.insertTextAtCursor(NOTE_TEMPLATES[selected]);
        this.dom.templateSelect.value = ''; // Reset selection
      }
    });

    // 7. Interactive task click handling inside live preview
    this.dom.previewPane.addEventListener('change', (e) => {
      if (e.target && e.target.type === 'checkbox' && e.target.hasAttribute('data-task-id')) {
        const taskId = parseInt(e.target.getAttribute('data-task-id'), 10);
        const isChecked = e.target.checked;
        this.toggleTaskInMarkdown(taskId, isChecked);
      }
    });

    // 8. Cheat Sheet Dialog Modal
    this.dom.cheatSheetToggle.addEventListener('click', () => {
      this.dom.cheatSheetModal.classList.remove('hidden');
      this.dom.cheatSheetModal.classList.add('flex');
    });
    this.dom.closeCheatSheet.addEventListener('click', () => {
      this.dom.cheatSheetModal.classList.add('hidden');
      this.dom.cheatSheetModal.classList.remove('flex');
    });
    this.dom.cheatSheetModal.addEventListener('click', (e) => {
      if (e.target === this.dom.cheatSheetModal) {
        this.dom.cheatSheetModal.classList.add('hidden');
        this.dom.cheatSheetModal.classList.remove('flex');
      }
    });

    // 9. Interactive Mobile Tabs switcher (Editor vs. Preview Layouts)
    this.dom.tabEdit.addEventListener('click', () => {
      this.dom.tabEdit.classList.add('bg-zinc-800', 'text-white');
      this.dom.tabEdit.classList.remove('text-zinc-400');
      this.dom.tabPreview.classList.remove('bg-zinc-800', 'text-white');
      this.dom.tabPreview.classList.add('text-zinc-400');

      this.dom.editorPane.classList.remove('hidden');
      this.dom.previewPaneContainer.classList.add('hidden');
    });

    this.dom.tabPreview.addEventListener('click', () => {
      this.dom.tabPreview.classList.add('bg-zinc-800', 'text-white');
      this.dom.tabPreview.classList.remove('text-zinc-400');
      this.dom.tabEdit.classList.remove('bg-zinc-800', 'text-white');
      this.dom.tabEdit.classList.add('text-zinc-400');

      this.dom.previewPaneContainer.classList.remove('hidden');
      this.dom.editorPane.classList.add('hidden');
    });
  }

  // Inject selected templates smoothly where cursor is currently active
  insertTextAtCursor(text) {
    const input = this.dom.editorInput;
    const startPos = input.selectionStart;
    const endPos = input.selectionEnd;
    const originalValue = input.value;

    const newValue = originalValue.substring(0, startPos) + text + originalValue.substring(endPos, originalValue.length);
    input.value = newValue;
    input.focus();
    input.selectionStart = startPos + text.length;
    input.selectionEnd = startPos + text.length;

    // Trigger update lifecycle
    if (this.activeNoteId) {
      const active = this.notes.find(n => n.id === this.activeNoteId);
      if (active) {
        active.content = newValue;
        active.updatedAt = Date.now();
        this.updatePreviewAndMetadata();
        this.debouncedSave();
      }
    }
  }

  createNewNote() {
    const newNote = {
      id: 'note_' + Date.now(),
      title: 'New Workspace Document',
      content: `# New Workspace Document\n\nStart your thoughts here...`,
      tags: ['workspace'],
      updatedAt: Date.now()
    };
    this.notes.unshift(newNote);
    this.saveNotesToStorage();
    this.renderNoteList();
    this.renderTagsFilter();
    this.selectNote(newNote.id);
    
    // Smoothly ensure sidebar is open on Desktop to showcase creation
    if (window.innerWidth >= 1024) {
      this.dom.sidebar.classList.remove('sidebar-closed');
    }
  }

  deleteActiveNote() {
    if (!this.activeNoteId) return;
    if (confirm('Are you absolutely certain you want to delete this note? This action cannot be undone.')) {
      this.notes = this.notes.filter(n => n.id !== this.activeNoteId);
      this.saveNotesToStorage();
      this.renderNoteList();
      this.renderTagsFilter();
      this.selectNote(this.notes[0]?.id || null);
    }
  }

  selectNote(id) {
    this.activeNoteId = id;
    const note = this.notes.find(n => n.id === id);

    if (note) {
      this.dom.noteTitleInput.value = note.title;
      this.dom.noteTagsInput.value = note.tags.join(', ');
      this.dom.editorInput.value = note.content;
      this.dom.editorInput.disabled = false;
      this.dom.noteTitleInput.disabled = false;
      this.dom.noteTagsInput.disabled = false;
      this.dom.deleteNoteBtn.disabled = false;
      this.updatePreviewAndMetadata();
    } else {
      // Empty slate default state
      this.dom.noteTitleInput.value = '';
      this.dom.noteTagsInput.value = '';
      this.dom.editorInput.value = '';
      this.dom.editorInput.disabled = true;
      this.dom.noteTitleInput.disabled = true;
      this.dom.noteTagsInput.disabled = true;
      this.dom.deleteNoteBtn.disabled = true;
      this.dom.previewPane.innerHTML = `<div class="flex flex-col items-center justify-center h-full text-zinc-500 py-20"><svg class="w-12 h-12 mb-3 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg><p>No active note selected. Create a new note to start building.</p></div>`;
      
      this.dom.statsWords.textContent = '0';
      this.dom.statsChars.textContent = '0';
      this.dom.statsReadTime.textContent = '0m';
    }

    this.renderNoteList();
  }

  // Finds N-th checkbox item in raw Markdown and toggles its state
  toggleTaskInMarkdown(index, isChecked) {
    const note = this.notes.find(n => n.id === this.activeNoteId);
    if (!note) return;

    let currentMatchIndex = 0;
    const lines = note.content.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (/^[ \t]*-\s+\[([ xX])\]\s+/.test(line)) {
        if (currentMatchIndex === index) {
          lines[i] = line.replace(/(\[[ xX]\])/, isChecked ? '[x]' : '[ ]');
          break;
        }
        currentMatchIndex++;
      }
    }

    note.content = lines.join('\n');
    this.dom.editorInput.value = note.content;
    this.updatePreviewAndMetadata();
    this.saveNotesToStorage();
    this.triggerSaveIndicator();
  }

  updatePreviewAndMetadata() {
    const note = this.notes.find(n => n.id === this.activeNoteId);
    if (!note) return;

    // Convert Markdown to interactive premium HTML
    const htmlContent = MarkdownEngine.parse(note.content);
    this.dom.previewPane.innerHTML = htmlContent;

    // Compute Word Counts & Estimated Reading Duration Metrics
    const rawText = note.content || '';
    const cleanWords = rawText.trim().split(/\s+/).filter(w => w.length > 0);
    const wordCount = cleanWords.length;
    const charCount = rawText.length;
    const readDuration = Math.max(1, Math.ceil(wordCount / 200));

    this.dom.statsWords.textContent = wordCount.toLocaleString();
    this.dom.statsChars.textContent = charCount.toLocaleString();
    this.dom.statsReadTime.textContent = `${readDuration}m`;
  }

  debouncedSave() {
    this.dom.saveIndicator.innerHTML = `
      <span class="inline-block w-2.5 h-2.5 rounded-full bg-amber-500 mr-2 animate-ping"></span>
      <span class="text-xs text-zinc-400 font-medium">Pending changes...</span>
    `;

    clearTimeout(this.saveTimeout);
    this.saveTimeout = setTimeout(() => {
      this.saveNotesToStorage();
      this.triggerSaveIndicator();
    }, 1000);
  }

  triggerSaveIndicator() {
    this.dom.saveIndicator.innerHTML = `
      <span class="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500 mr-2 saving-pulse"></span>
      <span class="text-xs text-zinc-300 font-semibold tracking-wide uppercase">Sync Saved</span>
    `;
  }

  triggerVisualPulse() {
    // Keeps visual micro-interaction alive on dashboard periodically
    if (this.dom.saveIndicator.querySelector('.saving-pulse')) return;
    this.dom.saveIndicator.classList.add('opacity-40');
    setTimeout(() => {
      this.dom.saveIndicator.classList.remove('opacity-40');
    }, 1000);
  }

  renderTagsFilter() {
    // Generate active tags list for filters sidebar view
    const allTagsMap = {};
    this.notes.forEach(note => {
      if (Array.isArray(note.tags)) {
        note.tags.forEach(t => {
          allTagsMap[t] = (allTagsMap[t] || 0) + 1;
        });
      }
    });

    const uniqueTags = Object.keys(allTagsMap).sort();

    let filterHtml = `
      <button data-tag-val="" class="w-full text-left px-3 py-1.5 rounded-md text-xs font-semibold uppercase tracking-wider transition ${
        this.selectedTagFilter === '' ? 'bg-violet-600/30 border border-violet-500 text-violet-300' : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
      }">
        ⭐ Show All Documents
      </button>
    `;

    uniqueTags.forEach(tag => {
      const isActive = this.selectedTagFilter === tag;
      const count = allTagsMap[tag];
      filterHtml += `
        <button data-tag-val="${tag}" class="flex items-center justify-between w-full text-left px-3 py-1.5 rounded-md text-xs transition ${
          isActive ? 'bg-violet-600/30 border border-violet-500 text-violet-300 font-semibold' : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
        }">
          <span>#${tag}</span>
          <span class="bg-zinc-800 px-1.5 py-0.5 rounded text-[10px] text-zinc-500 font-mono">${count}</span>
        </button>
      `;
    });

    this.dom.tagsFilterList.innerHTML = filterHtml;

    // Attach click filters
    this.dom.tagsFilterList.querySelectorAll('button').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const targetBtn = e.currentTarget;
        this.selectedTagFilter = targetBtn.getAttribute('data-tag-val');
        this.renderTagsFilter();
        this.renderNoteList();
      });
    });
  }

  renderNoteList() {
    // Filter notes on Search Criteria and selected tags
    const filtered = this.notes.filter(note => {
      const matchSearch = note.title.toLowerCase().includes(this.searchQuery) || 
                          note.content.toLowerCase().includes(this.searchQuery);
      
      const matchTag = this.selectedTagFilter === '' || 
                       (Array.isArray(note.tags) && note.tags.includes(this.selectedTagFilter));

      return matchSearch && matchTag;
    });

    if (filtered.length === 0) {
      this.dom.noteList.innerHTML = `
        <div class="text-center text-zinc-600 text-xs py-10 px-4">
          No matching notes found.<br>Try clearing filters.
        </div>
      `;
      return;
    }

    let listHtml = '';
    filtered.forEach(note => {
      const isActive = note.id === this.activeNoteId;
      const cleanSnippet = note.content
        .replace(/[#*`~=|\[\]]/g, '') // remove markdown symbols for display snippet
        .substring(0, 65) + '...';

      const tagChips = note.tags.map(t => `
        <span class="bg-zinc-800/80 text-[9px] text-zinc-400 px-1.5 py-0.5 rounded uppercase tracking-wider font-semibold">#${t}</span>
      `).join(' ');

      const formattedDate = new Date(note.updatedAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });

      listHtml += `
        <div data-note-id="${note.id}" class="file-card relative p-4 mb-2.5 rounded-lg cursor-pointer flex flex-col gap-2 ${
          isActive ? 'active bg-zinc-800/50 border-violet-500' : 'bg-zinc-900/40'
        }">
          <div class="flex justify-between items-start">
            <h3 class="font-bold text-sm text-zinc-100 truncate pr-2 w-full">${note.title || 'Untitled Note'}</h3>
            <span class="text-[10px] text-zinc-500 whitespace-nowrap font-mono">${formattedDate}</span>
          </div>
          <p class="text-xs text-zinc-400 line-clamp-2 leading-relaxed h-8 overflow-hidden">${cleanSnippet}</p>
          <div class="flex flex-wrap gap-1 mt-1">
            ${tagChips}
          </div>
        </div>
      `;
    });

    this.dom.noteList.innerHTML = listHtml;

    // Attach click events
    this.dom.noteList.querySelectorAll('.file-card').forEach(card => {
      card.addEventListener('click', (e) => {
        const noteId = e.currentTarget.getAttribute('data-note-id');
        this.selectNote(noteId);
        
        // Auto-close sidebar on small screens (mobile view behavior)
        if (window.innerWidth < 1024) {
          this.dom.sidebar.classList.add('sidebar-closed');
        }
      });
    });
  }
}

// Instantiate Premium App Workspace Engine once DOM structure has loaded
document.addEventListener('DOMContentLoaded', () => {
  window.MarkdownWorkspace = new AppController();
});