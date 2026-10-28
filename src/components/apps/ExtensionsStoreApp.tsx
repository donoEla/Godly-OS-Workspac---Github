import React, { useState } from 'react';
import { useExtensions } from '../../context/ExtensionsContext';
import { 
  Puzzle, 
  Upload, 
  Download, 
  Share2, 
  Plus, 
  Trash2, 
  Check, 
  Sparkles, 
  Code, 
  Sliders, 
  Search,
  ExternalLink,
  Layers,
  Wand2,
  RefreshCw,
  Copy
} from 'lucide-react';
import { sound } from '../../utils/sound';
import { DesktopExtension } from '../../types/extensions';
import { useOS } from '../../context/OSContext';

export const ExtensionsStoreApp: React.FC = () => {
  const { addNotification } = useOS();
  const {
    extensions,
    toggleExtension,
    installExtension,
    uninstallExtension,
    exportExtensions,
    importExtensions,
    getShareableLink,
  } = useExtensions();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // New Extension Form State
  const [newExtName, setNewExtName] = useState('');
  const [newExtDesc, setNewExtDesc] = useState('');
  const [newExtAuthor, setNewExtAuthor] = useState('');
  const [newExtCategory, setNewExtCategory] = useState<DesktopExtension['category']>('Custom');
  const [newExtIcon, setNewExtIcon] = useState('✨');
  const [newExtCss, setNewExtCss] = useState(`/* Custom OS Style Extension */\n.window-frame-container {\n  border-radius: 26px !important;\n}`);

  const categories = ['All', 'Animations', 'Visuals', 'Productivity', 'Audio', 'Custom'];

  const filteredExtensions = extensions.filter((ext) => {
    const matchesCat = selectedCategory === 'All' || ext.category === selectedCategory;
    const matchesSearch =
      ext.name.toLowerCase().includes(search.toLowerCase()) ||
      ext.description.toLowerCase().includes(search.toLowerCase()) ||
      ext.author.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      try {
        const parsed = JSON.parse(content);
        if (Array.isArray(parsed)) {
          importExtensions(content);
          addNotification('Extensions Imported', `Loaded ${parsed.length} extensions (disabled by default for review).`, 'success');
        } else if (parsed.id && parsed.name) {
          installExtension(parsed);
          addNotification('Extension Installed', `Installed ${parsed.name} (disabled by default for review).`, 'success');
        }
      } catch (err) {
        addNotification('Upload Failed', 'Invalid extension JSON format.', 'alert');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExtName.trim()) return;

    const id = 'custom-' + Date.now();
    const newExtension: DesktopExtension = {
      id,
      name: newExtName.trim(),
      author: newExtAuthor.trim() || 'Anonymous User',
      version: '1.0.0',
      description: newExtDesc.trim() || 'Custom user created desktop extension',
      icon: newExtIcon || '✨',
      category: newExtCategory,
      enabled: true,
      isBuiltIn: false,
      customCss: newExtCss,
      tags: ['Custom', 'User-Created']
    };

    installExtension(newExtension);
    setShowCreateModal(false);
    setNewExtName('');
    setNewExtDesc('');
    setNewExtAuthor('');
  };

  const handleExportDownload = () => {
    sound.playClick();
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(exportExtensions());
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', 'godly-desktop-extensions.json');
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleCopyShareLink = () => {
    sound.playClick();
    const link = getShareableLink();
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    addNotification('Sync Link Copied', 'Extensions URL hash copied. Open this link on any device to sync your desktop extensions!', 'success');
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="flex flex-col h-full w-full bg-[var(--window-glass)] backdrop-blur-2xl text-slate-100 select-none overflow-hidden font-sans">
      {/* Top Header Bar */}
      <div className="flex flex-wrap items-center justify-between px-6 py-3.5 bg-black/40 backdrop-blur-xl border-b border-white/10 flex-shrink-0 shadow-lg gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-purple-600/30 border border-white/20">
            <Puzzle size={20} className="text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white tracking-wide">Desktop Extensions Hub</h2>
              <span className="text-[10px] bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded-full font-mono">
                Store & Sync
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Customize animations, physics, audio, and visual enhancements. Syncs across links.
            </p>
          </div>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap shrink-0">
          {/* Create Custom */}
          <button
            onClick={() => {
              sound.playClick();
              setShowCreateModal(true);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600/30 hover:bg-purple-600/45 border border-purple-500/40 text-purple-200 text-xs font-semibold transition-all shadow-sm"
          >
            <Plus size={14} />
            <span>Create</span>
          </button>

          {/* Upload File */}
          <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/15 text-slate-200 hover:text-white text-xs font-semibold cursor-pointer transition-all">
            <Upload size={14} className="text-cyan-400" />
            <span>Upload (.json)</span>
            <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
          </label>

          {/* Export File */}
          <button
            onClick={handleExportDownload}
            className="p-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/15 text-slate-300 hover:text-white transition-all"
            title="Download extensions backup file"
          >
            <Download size={14} />
          </button>

          {/* Copy Share Link */}
          <button
            onClick={handleCopyShareLink}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600/25 hover:bg-emerald-600/40 border border-emerald-500/40 text-emerald-200 text-xs font-semibold transition-all shadow-sm"
            title="Copy URL with all your extensions embedded to sync anywhere"
          >
            {copiedLink ? <Check size={14} className="text-emerald-400" /> : <Share2 size={14} />}
            <span>{copiedLink ? 'Link Copied!' : 'Sync Link'}</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex items-center justify-between px-6 py-2.5 bg-black/20 border-b border-white/[0.06] gap-3 flex-shrink-0">
        <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                sound.playClick();
                setSelectedCategory(cat);
              }}
              className={`px-3 py-1 rounded-xl text-xs font-medium transition-all ${
                selectedCategory === cat
                  ? 'bg-purple-600/30 text-white border border-purple-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative w-60">
          <Search size={13} className="absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search extensions..."
            className="w-full bg-white/[0.06] border border-white/10 rounded-xl pl-8 pr-3 py-1 text-xs text-white placeholder-slate-500 outline-none focus:border-purple-500/50"
          />
        </div>
      </div>

      {/* Main Extensions Grid */}
      <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 custom-scrollbar">
        {filteredExtensions.map((ext) => (
          <div
            key={ext.id}
            className={`flex flex-col justify-between p-4 rounded-2xl border transition-all duration-200 ${
              ext.enabled
                ? 'bg-gradient-to-b from-purple-900/15 to-black/40 border-purple-500/35 shadow-lg shadow-purple-900/10'
                : 'bg-black/30 border-white/[0.08] hover:border-white/20'
            }`}
          >
            <div>
              {/* Header */}
              <div className="flex items-start justify-between gap-3 mb-2.5">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-white/[0.06] border border-white/10 flex items-center justify-center text-xl shadow-inner flex-shrink-0">
                    {ext.icon}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-white truncate">{ext.name}</h3>
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                      <span>v{ext.version}</span>
                      <span>•</span>
                      <span className="truncate max-w-[100px]">{ext.author}</span>
                    </div>
                  </div>
                </div>

                {/* Toggle Switch */}
                <button
                  type="button"
                  onClick={() => {
                    toggleExtension(ext.id);
                    const willBe = !ext.enabled;
                    addNotification(
                      willBe ? 'Extension Activated' : 'Extension Disabled',
                      `${ext.name} is now ${willBe ? 'active and applied to your desktop' : 'disabled'}.`,
                      willBe ? 'success' : 'info'
                    );
                  }}
                  className={`w-11 h-6 rounded-full transition-all relative inline-flex items-center p-0.5 shrink-0 cursor-pointer ${
                    ext.enabled ? 'bg-gradient-to-r from-purple-600 to-indigo-600 shadow-md shadow-purple-600/30' : 'bg-white/15 hover:bg-white/25'
                  }`}
                  title={ext.enabled ? 'Disable Extension' : 'Enable Extension'}
                >
                  <span
                    className={`inline-block w-5 h-5 rounded-full bg-white shadow-md transform transition-transform duration-200 pointer-events-none ${
                      ext.enabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Description */}
              <p className="text-xs text-slate-300 leading-relaxed mb-3">
                {ext.description}
              </p>

              {/* Tags */}
              {ext.tags && (
                <div className="flex flex-wrap gap-1 mb-2.5">
                  {ext.tags.map((t, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] px-2 py-0.5 rounded-lg bg-white/[0.04] text-slate-400 border border-white/[0.06] font-mono"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              )}

              {/* Security indicator for extensions executing JavaScript */}
              {ext.customJs && (
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-300 text-[10px] mb-3 font-medium">
                  <Code size={11} className="text-amber-400 shrink-0" />
                  <span>Executes Custom JavaScript</span>
                </div>
              )}
            </div>

            {/* Footer Status & Actions */}
            <div className="flex items-center justify-between pt-2.5 border-t border-white/[0.06] text-[11px] gap-2">
              <button
                type="button"
                onClick={() => {
                  toggleExtension(ext.id);
                  const willBe = !ext.enabled;
                  addNotification(
                    willBe ? 'Extension Activated' : 'Extension Disabled',
                    `${ext.name} is now ${willBe ? 'active and applied to your desktop' : 'disabled'}.`,
                    willBe ? 'success' : 'info'
                  );
                }}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
                  ext.enabled
                    ? 'bg-purple-600/20 border-purple-500/40 text-purple-300 hover:bg-purple-600/30'
                    : 'bg-white/5 border-white/10 text-slate-300 hover:text-white hover:bg-white/10'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    ext.enabled ? 'bg-emerald-400 shadow-[0_0_6px_#34d399]' : 'bg-slate-500'
                  }`}
                />
                <span>{ext.enabled ? 'Active (Click to Disable)' : 'Enable Extension'}</span>
              </button>

              {!ext.isBuiltIn && (
                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    uninstallExtension(ext.id);
                  }}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                  title="Uninstall extension"
                >
                  <Trash2 size={13} />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Create Extension Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#0e101a] border border-purple-500/40 rounded-3xl p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Sparkles size={18} className="text-purple-400" />
                <h3 className="text-base font-bold text-white">Create Desktop Extension</h3>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="flex flex-col gap-3">
              <div>
                <label className="text-xs text-slate-400 font-medium block mb-1">Extension Name</label>
                <input
                  type="text"
                  required
                  value={newExtName}
                  onChange={(e) => setNewExtName(e.target.value)}
                  placeholder="e.g. Liquid Glass Windows"
                  className="w-full bg-white/[0.06] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-slate-400 font-medium block mb-1">Author Name</label>
                  <input
                    type="text"
                    value={newExtAuthor}
                    onChange={(e) => setNewExtAuthor(e.target.value)}
                    placeholder="Your username"
                    className="w-full bg-white/[0.06] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 font-medium block mb-1">Category</label>
                  <select
                    value={newExtCategory}
                    onChange={(e) => setNewExtCategory(e.target.value as any)}
                    className="w-full bg-[#121422] border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-purple-500"
                  >
                    <option value="Visuals">Visuals</option>
                    <option value="Animations">Animations</option>
                    <option value="Productivity">Productivity</option>
                    <option value="Audio">Audio</option>
                    <option value="Custom">Custom</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-400 font-medium block mb-1">Description</label>
                <input
                  type="text"
                  value={newExtDesc}
                  onChange={(e) => setNewExtDesc(e.target.value)}
                  placeholder="What does this extension do?"
                  className="w-full bg-white/[0.06] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 font-medium block mb-1">
                  Custom CSS Injector (Live)
                </label>
                <textarea
                  rows={4}
                  value={newExtCss}
                  onChange={(e) => setNewExtCss(e.target.value)}
                  className="w-full bg-[#0a0a10] border border-white/10 rounded-xl p-3 text-xs text-emerald-400 font-mono outline-none focus:border-purple-500 custom-scrollbar"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-white/10 mt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-purple-600/30"
                >
                  Install & Activate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
