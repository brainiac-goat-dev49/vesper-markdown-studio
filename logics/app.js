// Predefined Notes list for instant onboarding
const DEFAULT_NOTES = [
  {
    id: 'note-1',
    title: '🚀 Workspace Onboarding Guide',
    content: `# Welcome to Obsidian Lite\n\nObsidian Lite is a high-performance markdown writing and documentation hub.\n\n## 🌟 Premium Features\n- **Real-time Live Preview** compiles Markdown into HTML on-the-fly.\n- **Tech Stack Analysis**: Automatically identifies frameworks and libraries referenced in your code (e.g., React, TypeScript, Vue).\n- **Interactive Checklists**: Click on the live preview checkboxes to change document state!\n- **Table Formatting**: Creates high-fidelity responsive tables.\n\n---\n\n## 🛠️ Code Blocks with Premium Headers\n\`\`\`typescript\nimport React from 'react';\n\nexport function CoreWorkspace() {\n  const [active, setActive] = React.useState(true);\n  return (\n    <div className="p-4 bg-zinc-900 rounded-lg">\n      <p>Active developer sandbox context is running!</p>\n    </div>\n  );\n}\n\`\`\`\n\n## 📊 Table Layout Improvement Example\n| Technical Stack | Maturity Rating | Target Execution |\n| :--- | :---: | :--- |\n| React & Next.js | Enterprise | Production Live |\n| Tailwind CSS | High | Styled Interface |\n| SQLite / PostgreSQL | Solid | Multi-tenant Database |\n\n## 💡 Rich Blockquote Styling\n> "Simplicity is the ultimate sophistication. When you write standard documentation, make it expressive, responsive, and robust."\n> — Obsidian Lite Workspace\n\n## 📝 Simple Checklist Target\n- [x] Integrate high-precision markdown processor\n- [ ] Build beautiful code blocks with language indicators\n- [ ] Finish system layout alignments\n\n*Create a new document to start drafting custom notes!*`,
    tags: 'onboarding, markdown, react',
    updatedAt: Date.now()
  },
  {
    id: 'note-2',
    title: '🗺️ Project Roadmap Spec',
    content: `# Project Spec Draft\n\nThis is a draft for our next-gen micro-frontend platform. We're considering leveraging several modern tools.\n\n## ⚡ Framework Stack Under Review\n- Svelte / SvelteKit for lighter weight runtimes\n- Vue 3 with Vite\n- Rust for the underlying WASM module compilation\n\n---\n\n> Key Quote: "Performance must be measured in milliseconds on weak 3G networks." - Core Architect\n`,
    tags: 'roadmap, vue, svelte, rust',
    updatedAt: Date.now() - 3600000
  }
];

const FRAMEWORKS_MAP = {
  'react': { name: 'React', color: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30' },
  'vue': { name: 'Vue.js', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' },
  'angular': { name: 'Angular', color: 'bg-red-500/10 text-red-400 border-red-500/30' },
  'svelte': { name: 'Svelte', color: 'bg-orange-500/10 text-orange-400 border-orange-500/30' },
  'typescript': { name: 'TypeScript', color: 'bg-blue-500/10 text-blue-400 border-blue-500/30' },
  'javascript': { name: 'JavaScript', color: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30' },
  'node': { name: 'Node.js', color: 'bg-green-500/10 text-green-400 border-green-500/30' },
  'tailwind': { name: 'Tailwind CSS', color: 'bg-sky-500/10 text-sky-400 border-sky-500/30' },
  'rust': { name: 'Rust', color: 'bg-amber-600/10 text-amber-400 border-amber-600/30' },
  'python': { name: 'Python', color: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30' },
  'nextjs': { name: 'Next.js', color: 'bg-zinc-100/10 text-zinc-100 border-zinc-100/30' },
  'laravel': { name: 'Laravel', color: 'bg-rose-500/10 text-rose-400 border-rose-500/30' },
  'django': { name: 'Django', color: 'bg-emerald-600/10 text-emerald-300 border-emerald-600/30' },
  'postgres': { name: 'PostgreSQL', color: 'bg-blue-600/10 text-blue-300 border-blue-600/30' },
  'sqlite': { name: 'SQLite', color: 'bg-sky-600/10 text-sky-300 border-sky-600/30' }
};

let notes = [];
let activeNoteId = null;
let selectedTagFilter = null;
let activeSearchQuery = '';

const noteListContainer = document.getElementById('noteList');
const tagsFilterList = document.getElementById('tagsFilterList');
const searchInput = document.getElementById('searchInput');
const createNoteBtn = document.getElementById('createNoteBtn');
const noteTitleInput = document.getElementById('noteTitleInput');
const noteTagsInput = document.getElementById('noteTagsInput');
const editorInput = document.getElementById('editorInput');
const previewPane = document.getElementById('previewPane');
const deleteNoteBtn = document.getElementById('deleteNoteBtn');
const templateSelect = document.getElementById('templateSelect');
const saveIndicator = document.getElementById('saveIndicator');
const techContextPanel = document.getElementById('techContextPanel');
const techStackBadges = document.getElementById('techStackBadges');

const statsWords = document.getElementById('statsWords');
const statsChars = document.getElementById('statsChars');
const statsReadTime = document.getElementById('statsReadTime');

const tabEdit = document.getElementById('tabEdit');
const tabPreview = document.getElementById('tabPreview');
const editorPane = document.getElementById('editorPane');
const previewPaneContainer = document.getElementById('previewPaneContainer');

const sidebarToggleBtn = document.getElementById('sidebarToggleBtn');
const sidebarCloseBtn = document.getElementById('sidebarCloseBtn');
const sidebar = document.getElementById('sidebar');

const cheatSheetToggle = document.getElementById('cheatSheetToggle');
const cheatSheetModal = document.getElementById('cheatSheetModal');
const closeCheatsheetBtns = document.querySelectorAll('.close-cheatsheet-btn');

function initApp() {
  const saved = localStorage.getItem('obsidian_lite_notes');
  if (saved) {
    try {
      notes = JSON.parse(saved);
    } catch(e) {
      notes = [...DEFAULT_NOTES];
    }
  } else {
    notes = [...DEFAULT_NOTES];
  }

  const lastActiveId = localStorage.getItem('obsidian_lite_active_id');
  if (lastActiveId && notes.find(n => n.id === lastActiveId)) {
    activeNoteId = lastActiveId;
  } else if (notes.length > 0) {
    activeNoteId = notes[0].id;
  }

  setupEventListeners();
  renderSidebar();
  loadActiveNote();
}

function renderSidebar() {
  let filtered = [...notes];
  if (activeSearchQuery.trim()) {
    const q = activeSearchQuery.toLowerCase().trim();
    filtered = filtered.filter(n => 
      n.title.toLowerCase().includes(q) || 
      n.content.toLowerCase().includes(q) || 
      n.tags.toLowerCase().includes(q)
    );
  }

  if (selectedTagFilter) {
    filtered = filtered.filter(n => {
      const list = n.tags.split(',').map(t => t.trim().toLowerCase());
      return list.includes(selectedTagFilter.toLowerCase());
    });
  }

  filtered.sort((a, b) => b.updatedAt - a.updatedAt);

  noteListContainer.innerHTML = '';
  if (filtered.length === 0) {
    noteListContainer.innerHTML = `
      <div class="p-4 text-center text-xs text-zinc-500">
        No documents found.
      </div>
    `;
  } else {
    filtered.forEach(note => {
      const isActive = note.id === activeNoteId;
      const card = document.createElement('button');
      card.className = `w-full text-left p-3 rounded-lg smooth-transition border flex flex-col gap-1.5 ${
        isActive 
          ? 'bg-violet-950/20 border-violet-500/50 shadow-sm shadow-violet-950/10' 
          : 'bg-zinc-900/40 border-zinc-800/40 hover:bg-zinc-800/40 hover:border-zinc-700/60'
      }`;

      let previewText = note.content.replace(/[#*`>_~|[-]/g, '').substring(0, 70);
      if (note.content.length > 70) previewText += '...';

      const tagBadges = note.tags.split(',')
        .map(t => t.trim())
        .filter(t => t.length > 0)
        .map(t => `<span class="bg-zinc-800 text-[9px] text-zinc-400 px-1.5 py-0.5 rounded">${t}</span>`)
        .join(' ');

      card.innerHTML = `
        <div class="flex items-center justify-between gap-2 w-full">
          <span class="font-bold text-xs ${isActive ? 'text-violet-300' : 'text-zinc-200'} truncate">${note.title || 'Untitled note'}</span>
          <span class="text-[9px] text-zinc-500 font-mono shrink-0">${formatTime(note.updatedAt)}</span>
        </div>
        <p class="text-[11px] text-zinc-400/80 line-clamp-2 leading-relaxed">${previewText || 'Empty workspace...'}</p>
        ${tagBadges ? `<div class="flex flex-wrap gap-1 mt-1">${tagBadges}</div>` : ''}
      `;

      card.addEventListener('click', () => {
        selectNote(note.id);
        if (window.innerWidth < 1024) {
          sidebar.classList.add('-translate-x-full');
        }
      });
      noteListContainer.appendChild(card);
    });
  }

  const allTags = new Set();
  notes.forEach(note => {
    note.tags.split(',').forEach(tag => {
      const clean = tag.trim();
      if (clean) allTags.add(clean.toLowerCase());
    });
  });

  tagsFilterList.innerHTML = '';
  const allBtn = document.createElement('button');
  allBtn.className = `px-2 py-1 text-[10px] rounded font-medium smooth-transition text-left flex items-center justify-between ${
    !selectedTagFilter ? 'bg-violet-500/15 text-violet-300 border border-violet-500/20' : 'text-zinc-400 hover:text-zinc-200'
  }`;
  allBtn.innerHTML = `<span>⚡ Clear filters</span> <span class="text-[9px] opacity-60 font-mono">(\${notes.length})</span>`;
  allBtn.addEventListener('click', () => {
    selectedTagFilter = null;
    renderSidebar();
  });
  tagsFilterList.appendChild(allBtn);

  allTags.forEach(tag => {
    const count = notes.filter(n => n.tags.split(',').map(t => t.trim().toLowerCase()).includes(tag)).length;
    const tagBtn = document.createElement('button');
    tagBtn.className = `px-2 py-1 text-[10px] rounded font-medium smooth-transition text-left flex items-center justify-between ${
      selectedTagFilter === tag ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30' : 'text-zinc-400 hover:text-zinc-200'
    }`;
    tagBtn.innerHTML = `<span># \${tag}</span> <span class="text-[9px] opacity-60 font-mono">(\${count})</span>`;
    tagBtn.addEventListener('click', () => {
      selectedTagFilter = tag;
      renderSidebar();
    });
    tagsFilterList.appendChild(tagBtn);
  });
}

function formatTime(ms) {
  const diff = Date.now() - ms;
  if (diff < 60000) return 'Just now';
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `\${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `\${hrs}h ago`;
  return new Date(ms).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function loadActiveNote() {
  const note = notes.find(n => n.id === activeNoteId);
  if (!note) {
    noteTitleInput.value = '';
    noteTitleInput.disabled = true;
    noteTagsInput.value = '';
    noteTagsInput.disabled = true;
    editorInput.value = '';
    editorInput.disabled = true;
    deleteNoteBtn.disabled = true;
    previewPane.innerHTML = `
      <div class="h-full flex flex-col items-center justify-center text-center p-6">
        <svg class="w-12 h-12 text-zinc-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
        <h4 class="text-zinc-400 font-bold text-sm">No Active Document Selected</h4>
        <p class="text-xs text-zinc-500 mt-1 max-w-xs">Create a new markdown note or clear search filters to load a document workspace.</p>
      </div>
    `;
    updateStats('', '');
    techContextPanel.classList.add('hidden');
    return;
  }

  noteTitleInput.disabled = false;
  noteTagsInput.disabled = false;
  editorInput.disabled = false;
  deleteNoteBtn.disabled = false;

  noteTitleInput.value = note.title;
  noteTagsInput.value = note.tags;
  editorInput.value = note.content;

  triggerRender();
}

function selectNote(id) {
  activeNoteId = id;
  localStorage.setItem('obsidian_lite_active_id', id);
  renderSidebar();
  loadActiveNote();
}

function triggerRender() {
  const title = noteTitleInput.value;
  const markdownText = editorInput.value;

  const compiledHtml = parseMarkdown(markdownText);
  previewPane.innerHTML = compiledHtml;

  updateStats(title, markdownText);

  const detectedFrameworks = analyzeTechStack(markdownText);
  if (detectedFrameworks.length > 0) {
    techContextPanel.classList.remove('hidden');
    techStackBadges.innerHTML = detectedFrameworks.map(fw => `
      <span class="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded border \${fw.color}">
        \${fw.name}
      </span>
    `).join('');
  } else {
    techContextPanel.classList.add('hidden');
  }

  flashSavedStatus();
}

function saveCurrentNote() {
  const noteIndex = notes.findIndex(n => n.id === activeNoteId);
  if (noteIndex !== -1) {
    notes[noteIndex].title = noteTitleInput.value || 'Untitled note';
    notes[noteIndex].tags = noteTagsInput.value;
    notes[noteIndex].content = editorInput.value;
    notes[noteIndex].updatedAt = Date.now();

    localStorage.setItem('obsidian_lite_notes', JSON.stringify(notes));
  }
}

let saveTimeout = null;
function flashSavedStatus() {
  saveIndicator.innerHTML = `
    <span class="inline-block w-2.5 h-2.5 rounded-full bg-amber-500 mr-2 saving-pulse"></span>
    <span class="text-xs text-zinc-300 font-semibold tracking-wide uppercase">Saving...</span>
  `;

  if (saveTimeout) clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => {
    saveCurrentNote();
    renderSidebar();
    saveIndicator.innerHTML = `
      <span class="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500 mr-2"></span>
      <span class="text-xs text-zinc-300 font-semibold tracking-wide uppercase">Sync Saved</span>
    `;
  }, 400); 
}

function parseMarkdown(text) {
  const lines = text.split('\n');
  let html = [];
  
  let i = 0;
  while (i < lines.length) {
    let line = lines[i];

    if (line.trim().startsWith('```')) {
      let lang = line.trim().substring(3).trim() || 'txt';
      let codeLines = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      let codeContent = codeLines.join('\n');
      
      let escapedCode = codeContent
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');

      let blockId = `code-\${Math.random().toString(36).substr(2, 9)}`;
      html.push(`
        <div class="codeblock-container my-4">
          <div class="codeblock-header">
            <span class="codeblock-lang-badge">\${lang}</span>
            <button class="copy-code-btn" onclick="copyCodeText(\'\${blockId}\')">
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
              </svg>
              Copy
            </button>
          </div>
          <pre><code id="\${blockId}" class="language-\${lang}">\${escapedCode}</code></pre>
        </div>
      `);
      i++;
      continue;
    }

    if (line.trim().startsWith('|')) {
      let tableLines = [];
      while (i < lines.length && lines[i].trim().startsWith('|')) {
        tableLines.push(lines[i]);
        i++;
      }
      
      if (tableLines.length > 0) {
        let tableHtml = '<table class="w-full text-left border-collapse my-4">';
        
        let rows = tableLines.map(r => {
          let cleaned = r.trim();
          if (cleaned.startsWith('|')) cleaned = cleaned.substring(1);
          if (cleaned.endsWith('|')) cleaned = cleaned.substring(0, cleaned.length - 1);
          return cleaned.split('|').map(cell => cell.trim());
        });

        let hasSeparator = rows.length > 1 && rows[1].every(cell => cell.startsWith('-') || cell.endsWith('-') || cell.startsWith(':') || cell.endsWith(':'));
        
        let startRow = 0;
        if (hasSeparator) {
          tableHtml += '<thead><tr>';
          rows[0].forEach(cell => {
            tableHtml += `<th>\${inlineParse(cell)}</th>`;
          });
          tableHtml += '</tr></thead>';
          startRow = 2;
        } else {
          startRow = 0;
        }

        tableHtml += '<tbody>';
        for (let rIdx = startRow; rIdx < rows.length; rIdx++) {
          tableHtml += '<tr>';
          rows[rIdx].forEach(cell => {
            tableHtml += `<td>\${inlineParse(cell)}</td>`;
          });
          tableHtml += '</tr>';
        }
        tableHtml += '</tbody></table>';
        html.push(tableHtml); 
      }
      continue;
    }

    if (line.trim().startsWith('>')) {
      let quoteLines = [];
      while (i < lines.length && lines[i].trim().startsWith('>')) {
        let cleanedQuoteLine = lines[i].trim();
        if (cleanedQuoteLine.startsWith('> ')) {
          cleanedQuoteLine = cleanedQuoteLine.substring(2);
        } else {
          cleanedQuoteLine = cleanedQuoteLine.substring(1);
        }
        quoteLines.push(cleanedQuoteLine);
        i++;
      }
      
      let parsedQuoteContent = quoteLines.map(line => inlineParse(line)).join('<br>');
      html.push(`<blockquote><p>\${parsedQuoteContent}</p></blockquote>`);
      continue;
    }

    if (line.trim().startsWith('#')) {
      let trimmed = line.trim();
      let level = 0;
      while (trimmed[level] === '#') {
        level++;
      }
      if (level > 0 && level <= 6 && trimmed[level] === ' ') {
        let textVal = trimmed.substring(level + 1);
        html.push(`<h\${level}>\${inlineParse(textVal)}</h\${level}>`);
        i++;
        continue;
      }
    }

    if (line.trim() === '---' || line.trim() === '***' || line.trim() === '___') {
      html.push('<hr>');
      i++;
      continue;
    }

    if (line.trim().startsWith('- ') || line.trim().startsWith('* ') || /^\d+\.\s/.test(line.trim())) {
      let listLines = [];
      while (i < lines.length && (lines[i].trim().startsWith('- ') || lines[i].trim().startsWith('* ') || /^\d+\.\s/.test(lines[i].trim()))) {
        listLines.push({ rawIndex: i, text: lines[i] });
        i++;
      }

      let listHtml = '';
      let listType = listLines[0].text.trim().startsWith('-') || listLines[0].text.trim().startsWith('*') ? 'ul' : 'ol';
      listHtml += `<\${listType}>`;

      listLines.forEach(item => {
        let raw = item.text.trim();
        let content = '';
        let isTask = false;
        let isChecked = false;

        if (raw.startsWith('- [ ] ') || raw.startsWith('- [x] ') || raw.startsWith('- [X] ')) { 
          isTask = true;
          isChecked = raw.toLowerCase().startsWith('- [x]');
          content = raw.substring(6);
        } else if (raw.startsWith('- ') || raw.startsWith('* ')) {
          content = raw.substring(2);
        } else {
          let match = raw.match(/^\d+\.\s(.*)/);
          content = match ? match[1] : raw;
        }

        if (isTask) {
          listHtml += `
            <li class="flex items-center gap-2 my-1">
              <input type="checkbox" \${isChecked ? 'checked' : ''} data-raw-index="\${item.rawIndex}" class="task-checkbox accent-violet-500 cursor-pointer rounded bg-zinc-800 border-zinc-700">
              <span class="\${isChecked ? 'line-through text-zinc-500' : ''}">\${inlineParse(content)}</span>
            </li>`;
        } else { 
          listHtml += `<li>\${inlineParse(content)}</li>`;
        }
      });

      listHtml += `</\${listType}>`;
      html.push(listHtml);
      continue;
    }

    if (line.trim() === '') {
      i++;
      continue;
    }

    html.push(`<p>\${inlineParse(line)}</p>`);
    i++;
  } 

  return html.join('\n');
}

function inlineParse(str) {
  let res = str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  res = res.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  res = res.replace(/__(.*?)__/g, '<strong>$1</strong>');
  res = res.replace(/\*(.*?)\*/g, '<em>$1</em>');
  res = res.replace(/_(.*?)_/g, '<em>$1</em>');
  res = res.replace(/==(.*?)==/g, '<mark>$1</mark>');
  res = res.replace(/~~(.*?)~~/g, '<del>$1</del>');
  res = res.replace(/`(.*?)`/g, '<code>$1</code>');
  res = res.replace(/::(.*?)::/g, '<kbd>$1</kbd>');

  return res;
}

function analyzeTechStack(text) {
  const normalized = text.toLowerCase();
  const detected = [];
  
  Object.keys(FRAMEWORKS_MAP).forEach(key => {
    const regex = new RegExp(`\\b\${key}\\b`, 'i');
    if (regex.test(normalized)) {
      detected.push(FRAMEWORKS_MAP[key]);
    }
  });

  return detected;
}

function updateStats(title, content) {
  const fullText = (title + ' ' + content).trim();
  if (!fullText) {
    statsWords.innerText = '0';
    statsChars.innerText = '0';
    statsReadTime.innerText = '1m';
    return;
  }

  const chars = fullText.length;
  const words = fullText.split(/\s+/).filter(w => w.length > 0).length;
  const readTime = Math.max(1, Math.ceil(words / 200));

  statsWords.innerText = words;
  statsChars.innerText = chars;
  statsReadTime.innerText = `\${readTime}m`;
}

window.copyCodeText = function(blockId) {
  const codeEl = document.getElementById(blockId);
  if (codeEl) {
    const text = codeEl.innerText;
    navigator.clipboard.writeText(text).then(() => {
      const btn = codeEl.closest('.codeblock-container').querySelector('.copy-code-btn');
      if (btn) {
        const origHtml = btn.innerHTML;
        btn.innerHTML = `
          <svg class="w-3 h-3 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
          Copied!
        `;
        setTimeout(() => {
          btn.innerHTML = origHtml;
        }, 1500);
      }
    });
  }
};

function setupEventListeners() {
  noteTitleInput.addEventListener('input', triggerRender);
  noteTagsInput.addEventListener('input', triggerRender);
  editorInput.addEventListener('input', triggerRender);

  searchInput.addEventListener('input', (e) => {
    activeSearchQuery = e.target.value;
    renderSidebar();
  });

  createNoteBtn.addEventListener('click', () => {
    const newId = `note-\${Math.random().toString(36).substr(2, 9)}`;
    const newNote = {
      id: newId,
      title: '📁 New Spec Document',
      content: '# New Spec Document\\n\\nStart writing markdown formatting context here...',
      tags: 'draft',
      updatedAt: Date.now()
    };
    notes.push(newNote);
    localStorage.setItem('obsidian_lite_notes', JSON.stringify(notes));
    selectNote(newId);
  });

  deleteNoteBtn.addEventListener('click', () => {
    if (!confirm('Are you absolutely sure you want to permanently delete this document from your workspace?')) return;
    notes = notes.filter(n => n.id !== activeNoteId);
    localStorage.setItem('obsidian_lite_notes', JSON.stringify(notes));
    if (notes.length > 0) {
      activeNoteId = notes[0].id;
    } else {
      activeNoteId = null;
    }
    localStorage.setItem('obsidian_lite_active_id', activeNoteId || '');
    renderSidebar();
    loadActiveNote();
  });

  previewPane.addEventListener('change', (e) => {
    if (e.target.classList.contains('task-checkbox')) {
      const lineIndex = parseInt(e.target.getAttribute('data-raw-index'), 10);
      const checked = e.target.checked;
      
      const lines = editorInput.value.split('\n');
      if (lineIndex >= 0 && lineIndex < lines.length) {
        let line = lines[lineIndex];
        if (checked) {
          line = line.replace(/^(\\s*[-*]\\s*)\\[\\s*\\]/, '\$1[x]');
        } else {
          line = line.replace(/^(\\s*[-*]\\s*)\\[[xX]\\]/, '\$1[ ]');
        }
        lines[lineIndex] = line;
        
        editorInput.value = lines.join('\n');
        triggerRender();
      }
    }
  });

  templateSelect.addEventListener('change', (e) => {
    const type = e.target.value;
    if (!type || !activeNoteId) return;

    let textToInject = '';
    const dateStr = new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    switch (type) {
      case 'daily':
        textToInject = `\\n\\n# Daily Strategy Log - \${dateStr}\\n\\n## 🎯 Daily Core Objectives\\n- [ ] Task 1: Initialize developer test suit\\n- [ ] Task 2: Deliver component interface feedback\\n\\n## 📊 Performance Indicators\\n| Metric | Expected Target | Progress Status |\\n| :--- | :--- | :--- |\\n| Core Speed | Under 100ms | Excellent |\\n| Coverage | 95% Minimum | In Progress |\\n\\n> Focus for today: "Simplify execution paths, ensure zero-dependency styling loops."`;
        break;
      case 'weekly':
        textToInject = `\\n\\n# Weekly Blueprints\\n\\n## 🗺️ High-Level Focus\\n- Outline roadmap architecture\\n- Standardize metadata schemas\\n\\n## 🛠️ Tech Stack Under Review\\n- React Native for companion client apps\\n- TypeScript for absolute safety guards\\n\\n> Quote of the week: "Consistency breeds excellence."`;
        break;
      case 'project':
        textToInject = `\\n\\n# Project Specifications Draft\\n\\n## 📝 Specifications Detail\\n- [ ] Setup production build configurations\\n- [ ] Document integration variables\\n\\n## ⚙️ Build System Requirements\\n| Component | Engine | Release Version |\\n| :--- | :---: | :--- |\\n| Bundling | Vite / Turbopack | Latest Stable |\\n| Language | TypeScript 5 | Enterprise |`;
        break;
      case 'meeting':
        textToInject = `\\n\\n# Meeting Agenda - \${dateStr}\\n\\n## 👥 Attendance & Roles\\n- Product Management (Chair)\\n- Engineering Team (Updates)\\n\\n## 📌 Discussed Points\\n> "We must finalize deployment targets and scale resources before next Tuesday."`;
        break;
    }

    const startPos = editorInput.selectionStart;
    const endPos = editorInput.selectionEnd;
    const originalText = editorInput.value;

    if (startPos || startPos === 0) {
      editorInput.value = originalText.substring(0, startPos) + textToInject + originalText.substring(endPos);
    } else {
      editorInput.value += textToInject;
    }

    e.target.value = '';
    triggerRender();
  });

  tabEdit.addEventListener('click', () => {
    tabEdit.classList.add('bg-zinc-800', 'text-white');
    tabEdit.classList.remove('text-zinc-400');
    tabPreview.classList.add('text-zinc-400');
    tabPreview.classList.remove('bg-zinc-800', 'text-white');

    editorPane.classList.remove('hidden');
    previewPaneContainer.classList.add('hidden');
  });

  tabPreview.addEventListener('click', () => {
    tabPreview.classList.add('bg-zinc-800', 'text-white');
    tabPreview.classList.remove('text-zinc-400');
    tabEdit.classList.add('text-zinc-400');
    tabEdit.classList.remove('bg-zinc-800', 'text-white');

    previewPaneContainer.classList.remove('hidden');
    editorPane.classList.add('hidden');
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
}

document.addEventListener('DOMContentLoaded', initApp);/**
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

    // 2. Code blocks (```lang ... ```) with modern headers and copy buttons
    html = html.replace(/```(\w*)\n([\s\S]*?)\n```/g, (match, lang, code) => {
      const cleanCode = code.trim();
      const language = lang || 'plaintext';
      return `
<div class="code-block-wrapper my-6 rounded-lg overflow-hidden border border-zinc-800 bg-[#111827]">
  <div class="code-block-header flex items-center justify-between px-4 py-1.5 bg-[#0f172a] border-b border-zinc-800 text-[11px] text-zinc-400 font-mono">
    <span class="uppercase tracking-wider font-semibold text-violet-400">${language}</span>
    <button onclick="(function(btn){ navigator.clipboard.writeText(decodeURIComponent('${encodeURIComponent(cleanCode)}')).then(function(){ const orig = btn.innerHTML; btn.innerHTML = 'Copied!'; btn.classList.add('text-emerald-400'); setTimeout(function(){ btn.innerHTML = orig; btn.classList.remove('text-emerald-400'); }, 1500); }); })(this)" class="flex items-center gap-1 hover:text-white transition duration-150">
      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
      </svg>
      <span>Copy</span>
    </button>
  </div>
  <pre class="!m-0 !p-4 overflow-x-auto bg-[#111827]/60"><code class="language-${language}">${cleanCode}</code></pre>
</div>`;
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

    // 5. Blockquotes (Group consecutive lines and handle HTML-escaped standard '>' markers correctly)
    html = html.replace(/^(?:&gt;|>)[ \t]+([\s\S]*?)$/gm, '<blockquote>$1</blockquote>');
    html = html.replace(/<\/blockquote>\s*<blockquote>/g, '<br>');

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
    let html = `
    <div class="overflow-x-auto my-6 rounded-xl border border-zinc-800 bg-gradient-to-b from-[#111827] to-[#0b0f17] shadow-xl">
      <table class="w-full border-collapse">
        <thead>
          <tr class="bg-gradient-to-r from-zinc-900 to-zinc-950 border-b border-zinc-800">`;
    headers.forEach((h, idx) => {
      const align = alignments[idx] || 'left';
      html += `
            <th class="px-4 py-3 text-zinc-200 font-bold text-xs uppercase tracking-wider text-${align}" style="text-align: ${align}">
              ${h}
            </th>`;
    });
    html += `
          </tr>
        </thead>
        <tbody class="divide-y divide-zinc-800/50">`;
    rows.forEach((row, rIdx) => {
      const rowBg = rIdx % 2 === 0 ? 'bg-[#161b26]/30' : 'bg-transparent';
      html += `
          <tr class="${rowBg} hover:bg-violet-600/5 transition duration-150">`;
      for (let idx = 0; idx < headers.length; idx++) {
        const cell = row[idx] || '';
        const align = alignments[idx] || 'left';
        html += `
            <td class="px-4 py-3 text-zinc-300 text-sm" style="text-align: ${align}">
              ${cell}
            </td>`;
      }
      html += `
          </tr>`;
    });
    html += `
        </tbody>
      </table>
    </div>`;
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
      closeCheatSheetBtns: document.querySelectorAll('.close-cheatsheet-btn'),
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
    
    // On tablet and mobile screens, start with the sidebar collapsed for better usability
    if (window.innerWidth < 1024) {
      this.dom.sidebar.classList.add('sidebar-closed');
    }

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
    this.dom.closeCheatSheetBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        this.dom.cheatSheetModal.classList.add('hidden');
        this.dom.cheatSheetModal.classList.remove('flex');
      });
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
      
      const panel = document.getElementById('techContextPanel');
      if (panel) panel.classList.add('hidden');
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

  // Identifies user framework stack context in real-time
  analyzeTechStack(content) {
    const text = (content || '').toLowerCase();
    const badges = [];

    const detectors = [
      { id: 'react', name: 'React', color: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30', keywords: ['react', 'jsx', 'usestate', 'useeffect', 'createcontext'] },
      { id: 'vue', name: 'Vue.js', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30', keywords: ['vue', 'v-model', 'v-for', 'v-if', 'ref(', 'computed('] },
      { id: 'svelte', name: 'Svelte', color: 'bg-orange-500/10 text-orange-400 border-orange-500/30', keywords: ['svelte', 'onmount', 'export let'] },
      { id: 'angular', name: 'Angular', color: 'bg-red-500/10 text-red-400 border-red-500/30', keywords: ['angular', '@component', 'ngmodule', 'rxjs'] },
      { id: 'tailwind', name: 'Tailwind CSS', color: 'bg-sky-500/10 text-sky-400 border-sky-500/30', keywords: ['tailwind', 'tailwindcss', 'flex', 'grid', 'justify-'] },
      { id: 'python', name: 'Python', color: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30', keywords: ['def ', 'import ', 'print(', 'pip install', 'django', 'flask'] },
      { id: 'django', name: 'Django', color: 'bg-emerald-600/10 text-emerald-300 border-emerald-600/30', keywords: ['django', 'models.model', 'urlpatterns'] },
      { id: 'rails', name: 'Ruby on Rails', color: 'bg-red-600/10 text-red-300 border-red-600/30', keywords: ['rails', 'active_record', 'gem ', 'def index'] },
      { id: 'nodejs', name: 'Node.js', color: 'bg-green-500/10 text-green-400 border-green-500/30', keywords: ['node', 'require(', 'module.exports', 'npm install', 'express'] },
      { id: 'javascript', name: 'Vanilla JS', color: 'bg-yellow-400/10 text-yellow-300 border-yellow-400/30', keywords: ['const ', 'let ', 'function', '=>', 'vanilla', 'addeventlistener', 'document.getelementbyid'] },
      { id: 'typescript', name: 'TypeScript', color: 'bg-blue-500/10 text-blue-400 border-blue-500/30', keywords: ['interface ', 'type ', ': string', ': number', 'as ', 'readonly'] },
      { id: 'rust', name: 'Rust', color: 'bg-amber-600/10 text-amber-300 border-amber-600/30', keywords: ['fn main()', 'impl ', 'let mut', 'match ', 'cargo'] },
      { id: 'go', name: 'Go', color: 'bg-sky-400/10 text-sky-300 border-sky-400/30', keywords: ['func main()', 'package main', 'import "fmt"'] }
    ];

    detectors.forEach(d => {
      const matched = d.keywords.some(keyword => text.includes(keyword));
      if (matched) {
        badges.push(d);
      }
    });

    const panel = document.getElementById('techContextPanel');
    const container = document.getElementById('techStackBadges');

    if (panel && container) {
      if (badges.length > 0) {
        panel.classList.remove('hidden');
        container.innerHTML = badges.map(b => `
          <span class="px-2 py-0.5 rounded text-[10px] font-semibold border ${b.color} transition duration-150 hover:scale-105 cursor-default uppercase tracking-wider">
            ${b.name}
          </span>
        `).join('');
      } else {
        panel.classList.add('hidden');
        container.innerHTML = '';
      }
    }
  }

  updatePreviewAndMetadata() {
    const note = this.notes.find(n => n.id === this.activeNoteId);
    if (!note) return;

    // Convert Markdown to interactive premium HTML
    const htmlContent = MarkdownEngine.parse(note.content);
    this.dom.previewPane.innerHTML = htmlContent;

    // Analyze framework stacks context in real-time
    this.analyzeTechStack(note.content);

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