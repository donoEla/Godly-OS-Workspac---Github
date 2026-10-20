import React, { useState, useEffect } from 'react';
import { useOS } from '../../context/OSContext';
import { 
  FileText, 
  Save, 
  Plus, 
  Trash2, 
  Eye, 
  Code, 
  Columns, 
  FileCode, 
  Search,
  CheckCircle2,
  Clock,
  Sparkles,
  Bold,
  Italic,
  List,
  Heading
} from 'lucide-react';
import { sound } from '../../utils/sound';

interface OpenTab {
  id: string;
  name: string;
  content: string;
  isDirty: boolean;
  fsId?: string;
  updatedAt: string;
}

export const NotesApp: React.FC = () => {
  const { fileSystem, createFile, updateFileContent, addNotification } = useOS();

  const docFiles = fileSystem.filter(
    (f) => f.type === 'file' && (f.extension === 'md' || f.extension === 'txt' || f.extension === 'json')
  );

  const [tabs, setTabs] = useState<OpenTab[]>([
    {
      id: 'tab-welcome',
      name: 'Welcome-to-Godly-OS.md',
      content: docFiles.find((f) => f.name.includes('Welcome'))?.content || `# Welcome to Godly OS\n\nA luxury operating system running natively in your browser.\n\n### Features\n- Glassmorphic window management\n- Starship Terminal with fastfetch\n- Offline ambient harmonic synthesizer\n- Seamless cloud arcade powered by nowgg.fun\n- Smart edge window snapping`,
      isDirty: false,
      fsId: docFiles.find((f) => f.name.includes('Welcome'))?.id,
      updatedAt: 'Just now',
    },
  ]);
  const [activeTabId, setActiveTabId] = useState<string>('tab-welcome');
  const [viewMode, setViewMode] = useState<'editor' | 'split' | 'preview'>('editor');
  const [searchFilter, setSearchFilter] = useState('');

  const activeTab = tabs.find((t) => t.id === activeTabId) || tabs[0];

  const handleContentChange = (val: string) => {
    setTabs((prev) =>
      prev.map((tab) =>
        tab.id === activeTabId
          ? { ...tab, content: val, isDirty: true, updatedAt: 'Just now' }
          : tab
      )
    );
  };

  const handleSave = () => {
    sound.playClick();
    if (!activeTab) return;

    if (activeTab.fsId) {
      updateFileContent(activeTab.fsId, activeTab.content);
    } else {
      const ext = activeTab.name.split('.').pop() || 'md';
      const newFile = createFile('documents', activeTab.name, activeTab.content, ext);
      setTabs((prev) =>
        prev.map((tab) =>
          tab.id === activeTabId ? { ...tab, fsId: newFile.id, isDirty: false } : tab
        )
      );
    }

    setTabs((prev) =>
      prev.map((tab) => (tab.id === activeTabId ? { ...tab, isDirty: false } : tab))
    );
    addNotification('File Saved', `${activeTab.name} saved to Documents.`, 'success');
  };

  const handleNewFile = () => {
    sound.playClick();
    const count = tabs.length + 1;
    const newTab: OpenTab = {
      id: `tab-${Date.now()}`,
      name: `Untitled-${count}.md`,
      content: `# Untitled Note\n\nStart typing your thoughts here...`,
      isDirty: false,
      updatedAt: 'Just now',
    };
    setTabs((prev) => [...prev, newTab]);
    setActiveTabId(newTab.id);
  };

  const handleCloseTab = (tabId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    sound.playClick();
    if (tabs.length === 1) return;
    const filtered = tabs.filter((t) => t.id !== tabId);
    setTabs(filtered);
    if (activeTabId === tabId) {
      setActiveTabId(filtered[0].id);
    }
  };

  // Quick markdown formatting insertions
  const insertFormatting = (prefix: string, suffix: string = '') => {
    sound.playClick();
    handleContentChange(`${activeTab.content}\n${prefix} ${suffix}`);
  };

  const wordCount = activeTab ? activeTab.content.trim().split(/\s+/).filter(Boolean).length : 0;
  const charCount = activeTab ? activeTab.content.length : 0;

  return (
    <div className="flex h-full w-full bg-[var(--window-glass)] backdrop-blur-2xl text-white select-none overflow-hidden font-sans">
      {/* Left Frosted Glass Note List Sidebar */}
      <div className="w-64 bg-black/40 backdrop-blur-2xl border-r border-white/10 flex flex-col shrink-0 shadow-[inset_-1px_0_0_rgba(255,255,255,0.05)]">
        {/* Sidebar Header & Search */}
        <div className="p-3 border-b border-white/10 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white tracking-wide flex items-center gap-1.5">
              <FileText size={14} className="text-purple-400" />
              <span>Notes Studio</span>
            </span>
            <button
              onClick={handleNewFile}
              className="p-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white shadow-sm transition-transform active:scale-95"
              title="New Note"
            >
              <Plus size={14} />
            </button>
          </div>

          <div className="relative">
            <Search size={13} className="absolute left-2.5 top-2.5 text-white/40" />
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Search notes..."
              className="w-full bg-white/[0.05] border border-white/10 rounded-xl pl-8 pr-2.5 py-1.5 text-xs text-white placeholder-white/40 outline-none focus:border-purple-500/50"
            />
          </div>
        </div>

        {/* Note Cards List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {tabs
            .filter((t) => t.name.toLowerCase().includes(searchFilter.toLowerCase()) || t.content.toLowerCase().includes(searchFilter.toLowerCase()))
            .map((tab) => {
              const isSelected = tab.id === activeTabId;
              const firstLine = tab.content.split('\n')[0].replace(/^#+\s*/, '') || tab.name;

              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    sound.playClick();
                    setActiveTabId(tab.id);
                  }}
                  className={`w-full text-left p-3 rounded-xl border transition-all ${
                    isSelected
                      ? 'bg-purple-600/25 border-purple-500/40 shadow-sm text-white'
                      : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.06] text-white/70'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold truncate text-white max-w-[150px]">
                      {tab.name}
                    </span>
                    {tab.isDirty && <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />}
                  </div>
                  <div className="text-[11px] text-white/40 line-clamp-2 leading-relaxed">
                    {firstLine}
                  </div>
                </button>
              );
            })}
        </div>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-white/10 text-[10px] text-white/40 flex items-center justify-between">
          <span>{tabs.length} Notes in Studio</span>
          <span className="text-emerald-400">● Cloud Synced</span>
        </div>
      </div>

      {/* Main Editor Canvas Zone */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#060911]">
        {/* Top Editor Toolbar */}
        <div className="h-11 border-b border-white/10 px-4 flex items-center justify-between bg-[#0b0f1a] shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-white tracking-tight">
              {activeTab.name}
            </span>
            {activeTab.isDirty ? (
              <span className="text-[10px] text-amber-400 font-mono flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                Unsaved
              </span>
            ) : (
              <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                <CheckCircle2 size={11} />
                Saved
              </span>
            )}
          </div>

          {/* Formatting & View Mode Controls */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-white/[0.04] p-1 rounded-xl border border-white/5">
              <button
                onClick={() => insertFormatting('# Title')}
                className="p-1 rounded hover:bg-white/10 text-white/60 hover:text-white"
                title="Heading"
              >
                <Heading size={13} />
              </button>
              <button
                onClick={() => insertFormatting('**bold text**')}
                className="p-1 rounded hover:bg-white/10 text-white/60 hover:text-white"
                title="Bold"
              >
                <Bold size={13} />
              </button>
              <button
                onClick={() => insertFormatting('*italic text*')}
                className="p-1 rounded hover:bg-white/10 text-white/60 hover:text-white"
                title="Italic"
              >
                <Italic size={13} />
              </button>
              <button
                onClick={() => insertFormatting('- ')}
                className="p-1 rounded hover:bg-white/10 text-white/60 hover:text-white"
                title="List"
              >
                <List size={13} />
              </button>
            </div>

            <div className="flex bg-white/[0.04] p-1 rounded-xl border border-white/5">
              <button
                onClick={() => setViewMode('editor')}
                className={`px-2 py-1 rounded-lg text-xs transition-colors ${
                  viewMode === 'editor' ? 'bg-purple-600 text-white' : 'text-white/60 hover:text-white'
                }`}
              >
                Edit
              </button>
              <button
                onClick={() => setViewMode('split')}
                className={`px-2 py-1 rounded-lg text-xs transition-colors ${
                  viewMode === 'split' ? 'bg-purple-600 text-white' : 'text-white/60 hover:text-white'
                }`}
              >
                Split
              </button>
              <button
                onClick={() => setViewMode('preview')}
                className={`px-2 py-1 rounded-lg text-xs transition-colors ${
                  viewMode === 'preview' ? 'bg-purple-600 text-white' : 'text-white/60 hover:text-white'
                }`}
              >
                Preview
              </button>
            </div>

            <button
              onClick={handleSave}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-purple-600/30 transition-all active:scale-95"
            >
              <Save size={13} />
              <span>Save</span>
            </button>
          </div>
        </div>

        {/* Editor Body */}
        <div className="flex-1 flex overflow-hidden">
          {(viewMode === 'editor' || viewMode === 'split') && (
            <textarea
              value={activeTab.content}
              onChange={(e) => handleContentChange(e.target.value)}
              className={`flex-1 h-full bg-transparent p-6 text-sm text-slate-200 outline-none resize-none font-mono leading-relaxed selection:bg-purple-600/40 ${
                viewMode === 'split' ? 'border-r border-white/10 w-1/2' : 'w-full'
              }`}
              placeholder="Start drafting in Markdown..."
              spellCheck={false}
            />
          )}

          {(viewMode === 'preview' || viewMode === 'split') && (
            <div
              className={`flex-1 h-full p-6 overflow-y-auto text-sm text-slate-200 leading-relaxed space-y-4 bg-white/[0.01] ${
                viewMode === 'split' ? 'w-1/2' : 'w-full'
              }`}
            >
              {activeTab.content.split('\n').map((line, i) => {
                if (line.startsWith('# ')) {
                  return <h1 key={i} className="text-2xl font-bold text-white border-b border-white/10 pb-2">{line.slice(2)}</h1>;
                }
                if (line.startsWith('## ')) {
                  return <h2 key={i} className="text-xl font-bold text-white mt-4">{line.slice(3)}</h2>;
                }
                if (line.startsWith('### ')) {
                  return <h3 key={i} className="text-lg font-semibold text-purple-300 mt-3">{line.slice(4)}</h3>;
                }
                if (line.startsWith('- ')) {
                  return <li key={i} className="list-disc ml-5 text-slate-300">{line.slice(2)}</li>;
                }
                if (!line.trim()) {
                  return <div key={i} className="h-2" />;
                }
                return <p key={i} className="text-slate-300">{line}</p>;
              })}
            </div>
          )}
        </div>

        {/* Status Bar */}
        <div className="h-7 border-t border-white/10 px-4 flex items-center justify-between text-[11px] text-white/40 bg-[#090d16] shrink-0 font-mono">
          <div className="flex items-center gap-4">
            <span>{wordCount} words</span>
            <span>{charCount} characters</span>
            <span>~{Math.max(1, Math.ceil(wordCount / 200))} min read</span>
          </div>
          <div className="flex items-center gap-2 text-purple-300">
            <Sparkles size={11} />
            <span>Markdown Live Sync</span>
          </div>
        </div>
      </div>
    </div>
  );
};
