import React, { useState } from 'react';
import { useOS } from '../../context/OSContext';
import { 
  Folder, 
  FileText, 
  Image as ImageIcon, 
  Music, 
  HardDrive, 
  ChevronRight, 
  ArrowLeft, 
  ArrowUp, 
  Grid, 
  List, 
  Plus, 
  Trash2, 
  Search,
  ExternalLink,
  Download,
  Eye,
  FileCode,
  Sparkles,
  FolderPlus,
  FilePlus
} from 'lucide-react';
import { sound } from '../../utils/sound';
import { FileItem } from '../../types/os';

export const FileManagerApp: React.FC = () => {
  const { 
    fileSystem, 
    createFile, 
    createFolder, 
    deleteFileItem, 
    renameFileItem, 
    setWallpaper, 
    openApp, 
    addNotification 
  } = useOS();

  const [currentFolderId, setCurrentFolderId] = useState<string | null>('documents');
  const [history, setHistory] = useState<(string | null)[]>(['documents']);
  const [historyIdx, setHistoryIdx] = useState(0);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Folder navigation
  const navigateTo = (folderId: string | null) => {
    sound.playClick();
    const newHist = history.slice(0, historyIdx + 1);
    newHist.push(folderId);
    setHistory(newHist);
    setHistoryIdx(newHist.length - 1);
    setCurrentFolderId(folderId);
    setSelectedItemId(null);
  };

  const goBack = () => {
    if (historyIdx > 0) {
      sound.playClick();
      setHistoryIdx(historyIdx - 1);
      setCurrentFolderId(history[historyIdx - 1]);
      setSelectedItemId(null);
    }
  };

  const goUp = () => {
    if (!currentFolderId) return;
    const currentFolder = fileSystem.find((f) => f.id === currentFolderId);
    navigateTo(currentFolder ? currentFolder.parentId : null);
  };

  const currentItems = fileSystem.filter((item) => {
    if (searchQuery.trim()) {
      return item.name.toLowerCase().includes(searchQuery.toLowerCase());
    }
    return item.parentId === currentFolderId;
  });

  const selectedItem = fileSystem.find((item) => item.id === selectedItemId);

  const handleItemDoubleClick = (item: FileItem) => {
    sound.playClick();
    if (item.type === 'folder') {
      navigateTo(item.id);
    } else if (item.imageUrl) {
      setPreviewImage(item.imageUrl);
    } else if (item.extension === 'md' || item.extension === 'txt' || item.extension === 'json') {
      openApp('notes');
    }
  };

  const handleCreateFolder = () => {
    const name = prompt('Enter folder name:', 'New Folder');
    if (name) {
      createFolder(currentFolderId, name);
      addNotification('Folder Created', `Created folder "${name}"`, 'success');
    }
  };

  const handleCreateFile = () => {
    const name = prompt('Enter file name:', 'New Document.txt');
    if (name) {
      createFile(currentFolderId, name, 'Created in Godly OS File Manager');
      addNotification('File Created', `Created file "${name}"`, 'success');
    }
  };

  const handleDelete = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    deleteFileItem(id);
    setSelectedItemId(null);
    addNotification('Item Deleted', 'Item moved to simulated trash.', 'info');
  };

  const getFileIcon = (item: FileItem) => {
    if (item.type === 'folder') {
      return <Folder size={viewMode === 'grid' ? 36 : 18} className="text-amber-400 fill-amber-400/20" />;
    }
    if (item.imageUrl || item.name.endsWith('.jpg') || item.name.endsWith('.png')) {
      return <ImageIcon size={viewMode === 'grid' ? 36 : 18} className="text-cyan-400" />;
    }
    if (item.extension === 'md' || item.extension === 'txt') {
      return <FileText size={viewMode === 'grid' ? 36 : 18} className="text-purple-400" />;
    }
    if (item.extension === 'json' || item.extension === 'js' || item.extension === 'ts') {
      return <FileCode size={viewMode === 'grid' ? 36 : 18} className="text-emerald-400" />;
    }
    return <FileText size={viewMode === 'grid' ? 36 : 18} className="text-slate-400" />;
  };

  return (
    <div className="flex h-full w-full bg-[var(--window-glass)] backdrop-blur-2xl text-white select-none overflow-hidden font-sans">
      {/* Finder / Nautilus Sidebar */}
      <div className="w-56 bg-black/40 backdrop-blur-2xl border-r border-white/10 flex flex-col p-3 shrink-0 shadow-[inset_-1px_0_0_rgba(255,255,255,0.05)]">
        <span className="text-[10px] font-bold uppercase tracking-wider text-white/40 px-2.5 mb-2 font-mono">
          Favorites
        </span>
        <div className="space-y-1">
          {[
            { id: null, label: 'Root System', icon: HardDrive },
            { id: 'desktop', label: 'Desktop', icon: Grid },
            { id: 'documents', label: 'Documents', icon: FileText },
            { id: 'wallpapers', label: 'Wallpapers', icon: ImageIcon },
            { id: 'media', label: 'Audio & Music', icon: Music },
          ].map((fav) => {
            const Icon = fav.icon;
            const isCur = currentFolderId === fav.id;
            return (
              <button
                key={fav.label}
                onClick={() => navigateTo(fav.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                  isCur
                    ? 'bg-purple-600/25 text-purple-300 font-semibold border border-purple-500/30'
                    : 'text-white/70 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon size={14} className={isCur ? 'text-purple-400' : 'text-white/50'} />
                <span>{fav.label}</span>
              </button>
            );
          })}
        </div>

        {/* Disk Storage Status */}
        <div className="mt-auto p-3 rounded-2xl bg-white/[0.03] border border-white/5">
          <div className="flex items-center justify-between text-[11px] mb-1.5">
            <span className="text-white/50">Simulated Disk</span>
            <span className="font-mono text-purple-300 font-semibold">24.2 GB free</span>
          </div>
          <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
            <div className="bg-purple-500 h-full w-[38%]" />
          </div>
        </div>
      </div>

      {/* Main File Explorer Viewport */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Navigation Toolbar */}
        <div className="h-12 border-b border-white/10 px-4 flex items-center justify-between bg-black/35 backdrop-blur-xl shrink-0 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
          <div className="flex items-center gap-2">
            <button
              onClick={goBack}
              disabled={historyIdx === 0}
              className="p-1.5 rounded-lg hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent text-white/70 hover:text-white"
            >
              <ArrowLeft size={15} />
            </button>
            <button
              onClick={goUp}
              disabled={!currentFolderId}
              className="p-1.5 rounded-lg hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent text-white/70 hover:text-white"
            >
              <ArrowUp size={15} />
            </button>

            {/* Path Breadcrumbs */}
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/[0.04] border border-white/5 text-xs text-white/80">
              <span>Home</span>
              <ChevronRight size={12} className="text-white/40" />
              <span className="text-purple-300 font-semibold capitalize">
                {currentFolderId || 'Root'}
              </span>
            </div>
          </div>

          {/* Search + Action Buttons */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search size={13} className="absolute left-2.5 top-2.5 text-white/40" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search folder..."
                className="w-44 bg-white/[0.05] border border-white/10 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-white/40 outline-none focus:border-purple-500/50"
              />
            </div>

            <div className="flex bg-white/[0.04] p-1 rounded-xl border border-white/5">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === 'grid' ? 'bg-purple-600 text-white' : 'text-white/60 hover:text-white'
                }`}
                title="Grid view"
              >
                <Grid size={13} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === 'list' ? 'bg-purple-600 text-white' : 'text-white/60 hover:text-white'
                }`}
                title="List view"
              >
                <List size={13} />
              </button>
            </div>

            <button
              onClick={handleCreateFolder}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/15 text-white rounded-xl text-xs font-semibold border border-white/10"
            >
              <FolderPlus size={13} />
              <span>New Folder</span>
            </button>
            <button
              onClick={handleCreateFile}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-purple-600/30"
            >
              <FilePlus size={13} />
              <span>New File</span>
            </button>
          </div>
        </div>

        {/* Content View + Optional Preview Pane */}
        <div className="flex-1 flex overflow-hidden">
          <div className="flex-1 p-5 overflow-y-auto">
            {currentItems.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-white/40 space-y-2">
                <Folder size={44} className="opacity-30" />
                <span className="text-xs">This directory is empty</span>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
                {currentItems.map((item) => {
                  const isSelected = selectedItemId === item.id;
                  return (
                    <div
                      key={item.id}
                      onClick={() => setSelectedItemId(item.id)}
                      onDoubleClick={() => handleItemDoubleClick(item)}
                      className={`group flex flex-col items-center p-3.5 rounded-2xl cursor-pointer border transition-all ${
                        isSelected
                          ? 'bg-purple-600/20 border-purple-500/50 shadow-md scale-[1.02]'
                          : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.06] hover:border-white/15'
                      }`}
                    >
                      <div className="w-14 h-14 flex items-center justify-center mb-2">
                        {getFileIcon(item)}
                      </div>
                      <span className="text-xs font-medium text-white/90 text-center truncate w-full">
                        {item.name}
                      </span>
                      <span className="text-[10px] text-white/40 mt-0.5">
                        {item.type === 'folder' ? 'Folder' : item.size || '1 KB'}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* List Mode */
              <div className="divide-y divide-white/5 text-xs">
                {currentItems.map((item) => {
                  const isSelected = selectedItemId === item.id;
                  return (
                    <div
                      key={item.id}
                      onClick={() => setSelectedItemId(item.id)}
                      onDoubleClick={() => handleItemDoubleClick(item)}
                      className={`flex items-center justify-between py-2.5 px-3 rounded-xl cursor-pointer transition-colors ${
                        isSelected ? 'bg-purple-600/25 text-white' : 'hover:bg-white/5 text-white/80'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {getFileIcon(item)}
                        <span className="font-medium">{item.name}</span>
                      </div>
                      <div className="flex items-center gap-6 text-white/40 font-mono text-[11px]">
                        <span>{item.updatedAt || 'Recent'}</span>
                        <span className="w-16 text-right">{item.type === 'folder' ? '--' : item.size || '1 KB'}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Selected Item Preview Pane */}
          {selectedItem && (
            <div className="w-64 border-l border-white/10 p-5 bg-[#0b0e17] flex flex-col shrink-0 animate-in fade-in duration-200">
              <div className="w-full h-32 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center mb-4 overflow-hidden">
                {selectedItem.imageUrl ? (
                  <img src={selectedItem.imageUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  getFileIcon(selectedItem)
                )}
              </div>

              <div className="text-sm font-bold text-white truncate mb-1">
                {selectedItem.name}
              </div>
              <div className="text-xs text-white/40 mb-4 capitalize">
                {selectedItem.type} • {selectedItem.size || '1 KB'}
              </div>

              <div className="space-y-2 mt-auto">
                {selectedItem.imageUrl && (
                  <button
                    onClick={() => {
                      setWallpaper(selectedItem.imageUrl!);
                      addNotification('Wallpaper Applied', 'Desktop background updated.', 'success');
                    }}
                    className="w-full py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-semibold shadow-md"
                  >
                    Set as Desktop Wallpaper
                  </button>
                )}
                <button
                  onClick={() => handleDelete(selectedItem.id)}
                  className="w-full py-2 bg-red-600/20 hover:bg-red-600 text-red-300 hover:text-white rounded-xl text-xs font-semibold border border-red-500/30 transition-colors"
                >
                  Delete Item
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
