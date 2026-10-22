import React, { useState, useRef, useMemo } from 'react';
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
  Trash2, 
  Search, 
  Download, 
  Eye, 
  FileCode, 
  FolderPlus, 
  FilePlus,
  Upload,
  X,
  Check,
  Edit3,
  Play,
  Pause,
  ArrowUpDown,
  Sparkles,
  FileCheck,
  Copy
} from 'lucide-react';
import { sound } from '../../utils/sound';
import { FileItem } from '../../types/os';
import { getAssetUrl } from '../../utils/assetHelper';

type SortOption = 'name' | 'date' | 'size' | 'type';

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
  const [sortBy, setSortBy] = useState<SortOption>('name');
  const [sortAsc, setSortAsc] = useState(true);

  // Modals & Popups
  const [showNewFolderModal, setShowNewFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  const [showNewFileModal, setShowNewFileModal] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  const [newFileExt, setNewFileExt] = useState('md');
  const [newFileInitialContent, setNewFileInitialContent] = useState('');

  const [showRenameModal, setShowRenameModal] = useState(false);
  const [renameTarget, setRenameTarget] = useState<FileItem | null>(null);
  const [renameValue, setRenameValue] = useState('');

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<FileItem | null>(null);

  // Rich In-App Previews
  const [previewItem, setPreviewItem] = useState<FileItem | null>(null);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Drag and drop upload state
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

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

  // Filter & Sort Items
  const currentItems = useMemo(() => {
    let items = fileSystem.filter((item) => {
      if (searchQuery.trim()) {
        return item.name.toLowerCase().includes(searchQuery.toLowerCase());
      }
      return item.parentId === currentFolderId;
    });

    items.sort((a, b) => {
      // Folders always first unless sorting specifically
      if (a.type !== b.type) {
        return a.type === 'folder' ? -1 : 1;
      }
      let cmp = 0;
      if (sortBy === 'name') {
        cmp = a.name.localeCompare(b.name);
      } else if (sortBy === 'date') {
        cmp = (a.updatedAt || '').localeCompare(b.updatedAt || '');
      } else if (sortBy === 'size') {
        const parseSize = (s?: string) => {
          if (!s) return 0;
          if (s.includes('MB')) return parseFloat(s) * 1024;
          return parseFloat(s) || 0;
        };
        cmp = parseSize(a.size) - parseSize(b.size);
      } else if (sortBy === 'type') {
        cmp = (a.extension || a.type).localeCompare(b.extension || b.type);
      }
      return sortAsc ? cmp : -cmp;
    });

    return items;
  }, [fileSystem, searchQuery, currentFolderId, sortBy, sortAsc]);

  const selectedItem = fileSystem.find((item) => item.id === selectedItemId);

  // Calculate simulated storage stats
  const storageStats = useMemo(() => {
    let totalBytes = 0;
    let docsBytes = 0;
    let mediaBytes = 0;
    let codeBytes = 0;

    fileSystem.forEach((item) => {
      if (item.type === 'file') {
        let bytes = 1024;
        if (item.size) {
          if (item.size.includes('MB')) bytes = parseFloat(item.size) * 1024 * 1024;
          else if (item.size.includes('KB')) bytes = parseFloat(item.size) * 1024;
          else bytes = parseFloat(item.size) || 1024;
        } else if (item.content) {
          bytes = item.content.length;
        } else if (item.imageUrl) {
          bytes = item.imageUrl.length * 0.75;
        }

        totalBytes += bytes;
        if (['jpg', 'jpeg', 'png', 'svg', 'webp', 'gif', 'mp3', 'wav'].includes(item.extension || '')) {
          mediaBytes += bytes;
        } else if (['js', 'ts', 'tsx', 'jsx', 'json', 'html', 'css'].includes(item.extension || '')) {
          codeBytes += bytes;
        } else {
          docsBytes += bytes;
        }
      }
    });

    const totalMB = totalBytes / (1024 * 1024);
    const capacityMB = 500;
    const usedPct = Math.min(100, Math.max(4, (totalMB / capacityMB) * 100));

    return {
      usedMB: totalMB < 1 ? `${(totalBytes / 1024).toFixed(1)} KB` : `${totalMB.toFixed(1)} MB`,
      freeMB: `${(capacityMB - totalMB).toFixed(1)} MB free`,
      pct: usedPct,
      docsPct: (docsBytes / (totalBytes || 1)) * 100,
      mediaPct: (mediaBytes / (totalBytes || 1)) * 100,
      codePct: (codeBytes / (totalBytes || 1)) * 100,
    };
  }, [fileSystem]);

  // Open item action
  const handleItemDoubleClick = (item: FileItem) => {
    sound.playClick();
    if (item.type === 'folder') {
      navigateTo(item.id);
    } else {
      setPreviewItem(item);
    }
  };

  // Creation Modals
  const confirmCreateFolder = () => {
    if (!newFolderName.trim()) return;
    createFolder(currentFolderId, newFolderName.trim());
    addNotification('Folder Created', `Created folder "${newFolderName.trim()}"`, 'success');
    setNewFolderName('');
    setShowNewFolderModal(false);
  };

  const confirmCreateFile = () => {
    if (!newFileName.trim()) return;
    const finalName = newFileName.includes('.') ? newFileName.trim() : `${newFileName.trim()}.${newFileExt}`;
    createFile(currentFolderId, finalName, newFileInitialContent || `# ${finalName}\n\nCreated in Godly OS File Manager.`, newFileExt);
    addNotification('File Created', `Created file "${finalName}"`, 'success');
    setNewFileName('');
    setNewFileInitialContent('');
    setShowNewFileModal(false);
  };

  const startRename = (item: FileItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setRenameTarget(item);
    setRenameValue(item.name);
    setShowRenameModal(true);
  };

  const confirmRename = () => {
    if (renameTarget && renameValue.trim()) {
      renameFileItem(renameTarget.id, renameValue.trim());
      addNotification('Item Renamed', `Renamed to "${renameValue.trim()}"`, 'info');
      setShowRenameModal(false);
      setRenameTarget(null);
    }
  };

  const startDelete = (item: FileItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setDeleteTarget(item);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (deleteTarget) {
      deleteFileItem(deleteTarget.id);
      if (selectedItemId === deleteTarget.id) setSelectedItemId(null);
      if (previewItem?.id === deleteTarget.id) setPreviewItem(null);
      addNotification('Item Deleted', `Removed "${deleteTarget.name}"`, 'info');
      setShowDeleteModal(false);
      setDeleteTarget(null);
    }
  };

  // Real PC File Download
  const handleDownload = (item: FileItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    sound.playClick();
    if (item.imageUrl) {
      const a = document.createElement('a');
      a.href = item.imageUrl.startsWith('/') ? getAssetUrl(item.imageUrl) : item.imageUrl;
      a.download = item.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      addNotification('Download Started', `Downloading ${item.name}`, 'success');
    } else {
      const blob = new Blob([item.content || ''], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = item.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      addNotification('Download Complete', `Saved ${item.name} to disk`, 'success');
    }
  };

  // Real PC File Upload Handling
  const handleFileUpload = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    Array.from(files).forEach((file) => {
      const ext = file.name.split('.').pop()?.toLowerCase() || 'txt';
      const isImg = ['png', 'jpg', 'jpeg', 'webp', 'svg', 'gif'].includes(ext);

      if (isImg) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const dataUrl = e.target?.result as string;
          createFile(currentFolderId, file.name, '', ext, dataUrl);
          addNotification('Image Uploaded', `${file.name} saved to Godly OS`, 'success');
        };
        reader.readAsDataURL(file);
      } else {
        const reader = new FileReader();
        reader.onload = (e) => {
          const text = e.target?.result as string;
          createFile(currentFolderId, file.name, text || '', ext);
          addNotification('File Uploaded', `${file.name} saved to Godly OS`, 'success');
        };
        reader.readAsText(file);
      }
    });
  };

  const getFileIcon = (item: FileItem, sizeClass = 'w-9 h-9') => {
    if (item.type === 'folder') {
      return <Folder className={`${sizeClass} text-amber-400 fill-amber-400/20`} />;
    }
    const ext = item.extension?.toLowerCase() || '';
    if (item.imageUrl || ['jpg', 'jpeg', 'png', 'svg', 'webp', 'gif'].includes(ext)) {
      return <ImageIcon className={`${sizeClass} text-cyan-400`} />;
    }
    if (['mp3', 'wav', 'ogg', 'm4a'].includes(ext)) {
      return <Music className={`${sizeClass} text-pink-400`} />;
    }
    if (['json', 'js', 'ts', 'tsx', 'jsx', 'html', 'css', 'py'].includes(ext)) {
      return <FileCode className={`${sizeClass} text-emerald-400`} />;
    }
    return <FileText className={`${sizeClass} text-purple-400`} />;
  };

  return (
    <div 
      className="flex h-full w-full bg-[var(--window-glass)] backdrop-blur-2xl text-white select-none overflow-hidden font-sans relative"
      onDragOver={(e) => {
        e.preventDefault();
        setIsDraggingOver(true);
      }}
      onDragLeave={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
          setIsDraggingOver(false);
        }
      }}
      onDrop={(e) => {
        e.preventDefault();
        setIsDraggingOver(false);
        handleFileUpload(e.dataTransfer.files);
      }}
    >
      {/* Hidden File Input for Real PC Upload */}
      <input 
        type="file" 
        ref={fileInputRef} 
        multiple 
        className="hidden" 
        onChange={(e) => handleFileUpload(e.target.files)} 
      />

      {/* Drag & Drop Overlay */}
      {isDraggingOver && (
        <div className="absolute inset-0 z-50 bg-purple-950/80 backdrop-blur-md border-2 border-dashed border-purple-400 flex flex-col items-center justify-center pointer-events-none animate-in fade-in duration-200">
          <Upload size={56} className="text-purple-300 animate-bounce mb-3" />
          <div className="text-xl font-bold text-white tracking-wide">Drop Files into Godly OS</div>
          <p className="text-sm text-purple-200/70 mt-1">Files will be saved into the current folder</p>
        </div>
      )}

      {/* Sidebar with Quick Locations & Disk Metrics */}
      <div className="w-60 bg-black/45 backdrop-blur-2xl border-r border-white/10 flex flex-col p-3.5 shrink-0 shadow-[inset_-1px_0_0_rgba(255,255,255,0.05)]">
        <span className="text-[10px] font-bold uppercase tracking-wider text-white/40 px-2.5 mb-2.5 font-mono">
          Locations
        </span>
        <div className="space-y-1 mb-4">
          {[
            { id: null, label: 'Root System (/)', icon: HardDrive },
            { id: 'desktop', label: 'Desktop', icon: Grid },
            { id: 'documents', label: 'Documents', icon: FileText },
            { id: 'pictures', label: 'Pictures & Wallpapers', icon: ImageIcon },
            { id: 'music', label: 'Audio & Music', icon: Music },
            { id: 'downloads', label: 'Downloads', icon: Download },
            { id: 'system', label: 'System Files', icon: FileCode },
          ].map((loc) => {
            const Icon = loc.icon;
            const isCur = currentFolderId === loc.id;
            return (
              <button
                key={loc.label}
                onClick={() => navigateTo(loc.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                  isCur
                    ? 'bg-purple-600/30 text-purple-200 font-semibold border border-purple-500/40 shadow-sm'
                    : 'text-white/70 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon size={14} className={isCur ? 'text-purple-400' : 'text-white/50'} />
                <span className="truncate">{loc.label}</span>
              </button>
            );
          })}
        </div>

        {/* Real Storage Breakdown Meter */}
        <div className="mt-auto p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2.5">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-white/60 font-medium">Virtual Drive</span>
            <span className="font-mono text-purple-300 font-bold">{storageStats.usedMB}</span>
          </div>
          
          {/* Multi-segment usage meter */}
          <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden flex">
            <div 
              style={{ width: `${storageStats.docsPct * (storageStats.pct / 100)}%` }} 
              className="bg-purple-500 h-full" 
              title="Documents & Text"
            />
            <div 
              style={{ width: `${storageStats.mediaPct * (storageStats.pct / 100)}%` }} 
              className="bg-cyan-400 h-full" 
              title="Media & Pictures"
            />
            <div 
              style={{ width: `${storageStats.codePct * (storageStats.pct / 100)}%` }} 
              className="bg-emerald-400 h-full" 
              title="Code & Config"
            />
          </div>

          <div className="flex items-center justify-between text-[10px] text-white/40 pt-1 border-t border-white/5">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400 inline-block" /> Docs
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 inline-block" /> Media
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" /> Code
            </span>
          </div>
        </div>
      </div>

      {/* Main File Explorer Viewport */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Navigation Toolbar */}
        <div className="h-14 border-b border-white/10 px-4 flex items-center justify-between bg-black/40 backdrop-blur-xl shrink-0 gap-3">
          {/* Back/Up & Breadcrumb */}
          <div className="flex items-center gap-2">
            <button
              onClick={goBack}
              disabled={historyIdx === 0}
              className="p-1.5 rounded-lg hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent text-white/70 hover:text-white transition-colors"
              title="Back"
            >
              <ArrowLeft size={16} />
            </button>
            <button
              onClick={goUp}
              disabled={!currentFolderId}
              className="p-1.5 rounded-lg hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent text-white/70 hover:text-white transition-colors"
              title="Up one level"
            >
              <ArrowUp size={16} />
            </button>

            {/* Breadcrumb Capsule */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.05] border border-white/10 text-xs text-white/80 font-mono">
              <span className="cursor-pointer hover:text-white" onClick={() => navigateTo(null)}>godly</span>
              <ChevronRight size={12} className="text-white/40" />
              <span className="text-purple-300 font-semibold capitalize">
                {currentFolderId || 'root'}
              </span>
            </div>
          </div>

          {/* Search, Sort, View Toggles & Actions */}
          <div className="flex items-center gap-2">
            {/* Search */}
            <div className="relative">
              <Search size={13} className="absolute left-3 top-3 text-white/40" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter files..."
                className="w-44 bg-white/[0.06] border border-white/10 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-white/40 outline-none focus:border-purple-500/60 focus:bg-white/[0.09] transition-all"
              />
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center bg-white/[0.05] rounded-xl border border-white/10 px-2 py-1 text-xs gap-1">
              <ArrowUpDown size={12} className="text-white/40" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="bg-transparent text-white/80 outline-none cursor-pointer text-xs"
              >
                <option value="name" className="bg-[#121624]">Name</option>
                <option value="date" className="bg-[#121624]">Date</option>
                <option value="size" className="bg-[#121624]">Size</option>
                <option value="type" className="bg-[#121624]">Type</option>
              </select>
              <button 
                onClick={() => setSortAsc(!sortAsc)}
                className="text-[10px] text-white/40 hover:text-white font-mono px-1"
                title="Toggle sort direction"
              >
                {sortAsc ? '▲' : '▼'}
              </button>
            </div>

            {/* View Mode Toggle */}
            <div className="flex bg-white/[0.05] p-1 rounded-xl border border-white/10">
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

            {/* Upload Button */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/15 text-white rounded-xl text-xs font-semibold border border-white/10 transition-colors"
              title="Upload file from PC"
            >
              <Upload size={13} className="text-cyan-400" />
              <span>Upload</span>
            </button>

            {/* New Folder Button */}
            <button
              onClick={() => setShowNewFolderModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/15 text-white rounded-xl text-xs font-semibold border border-white/10 transition-colors"
            >
              <FolderPlus size={13} className="text-amber-400" />
              <span>Folder</span>
            </button>

            {/* New File Button */}
            <button
              onClick={() => setShowNewFileModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-purple-600/30 transition-all"
            >
              <FilePlus size={13} />
              <span>New File</span>
            </button>
          </div>
        </div>

        {/* Content View + Selected Item Info Pane */}
        <div className="flex-1 flex overflow-hidden">
          <div className="flex-1 p-5 overflow-y-auto">
            {currentItems.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-white/40 space-y-3">
                <Folder size={48} className="opacity-25" />
                <div className="text-sm font-medium">Folder is empty</div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setShowNewFileModal(true)} 
                    className="px-3 py-1.5 bg-white/10 hover:bg-white/15 rounded-xl text-xs text-white"
                  >
                    Create a file
                  </button>
                  <button 
                    onClick={() => fileInputRef.current?.click()} 
                    className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 rounded-xl text-xs text-white"
                  >
                    Upload from PC
                  </button>
                </div>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3.5">
                {currentItems.map((item) => {
                  const isSelected = selectedItemId === item.id;
                  return (
                    <div
                      key={item.id}
                      onClick={() => setSelectedItemId(item.id)}
                      onDoubleClick={() => handleItemDoubleClick(item)}
                      className={`group relative flex flex-col items-center p-3 rounded-2xl cursor-pointer border transition-all ${
                        isSelected
                          ? 'bg-purple-600/25 border-purple-500/60 shadow-lg scale-[1.02]'
                          : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.06] hover:border-white/15'
                      }`}
                    >
                      <div className="w-16 h-16 rounded-xl flex items-center justify-center mb-2 overflow-hidden bg-white/[0.03] border border-white/5">
                        {item.imageUrl ? (
                          <img 
                            src={item.imageUrl.startsWith('/') ? getAssetUrl(item.imageUrl) : item.imageUrl} 
                            alt={item.name} 
                            className="w-full h-full object-cover rounded-xl"
                            loading="lazy"
                          />
                        ) : (
                          getFileIcon(item)
                        )}
                      </div>
                      <span className="text-xs font-medium text-white/90 text-center truncate w-full px-1">
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
                      <div className="flex items-center gap-3 min-w-0">
                        {getFileIcon(item, 'w-5 h-5')}
                        <span className="font-medium truncate">{item.name}</span>
                      </div>
                      <div className="flex items-center gap-6 text-white/40 font-mono text-[11px] shrink-0">
                        <span>{item.updatedAt || 'Recent'}</span>
                        <span className="w-16 text-right">{item.type === 'folder' ? '--' : item.size || '1 KB'}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Selected Item Inspector */}
          {selectedItem && (
            <div className="w-72 border-l border-white/10 p-5 bg-[#0b0e17]/95 flex flex-col shrink-0 animate-in fade-in duration-200">
              <div className="w-full h-36 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center mb-4 overflow-hidden relative group">
                {selectedItem.imageUrl ? (
                  <img 
                    src={selectedItem.imageUrl.startsWith('/') ? getAssetUrl(selectedItem.imageUrl) : selectedItem.imageUrl} 
                    alt="" 
                    className="w-full h-full object-cover" 
                  />
                ) : (
                  getFileIcon(selectedItem, 'w-14 h-14')
                )}
                {selectedItem.type === 'file' && (
                  <button 
                    onClick={() => setPreviewItem(selectedItem)}
                    className="absolute inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity gap-2 text-xs font-semibold text-white"
                  >
                    <Eye size={16} /> Preview
                  </button>
                )}
              </div>

              <div className="text-sm font-bold text-white truncate mb-1">
                {selectedItem.name}
              </div>
              <div className="text-xs text-white/40 mb-4 capitalize">
                {selectedItem.type} • {selectedItem.size || '1 KB'}
              </div>

              {/* Inspector Metadata Details */}
              <div className="space-y-2 mb-6 text-xs text-white/60 bg-white/[0.02] p-3 rounded-xl border border-white/5">
                <div className="flex justify-between">
                  <span className="text-white/40">Extension</span>
                  <span className="font-mono text-white/80 uppercase">{selectedItem.extension || selectedItem.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/40">Modified</span>
                  <span className="font-mono text-white/80">{selectedItem.updatedAt}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 mt-auto">
                {selectedItem.type === 'file' && (
                  <button
                    onClick={() => setPreviewItem(selectedItem)}
                    className="w-full py-2 bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 rounded-xl text-xs font-semibold border border-purple-500/40 flex items-center justify-center gap-2 transition-colors"
                  >
                    <Eye size={14} /> Quick Preview
                  </button>
                )}

                {selectedItem.imageUrl && (
                  <button
                    onClick={() => {
                      setWallpaper(selectedItem.imageUrl!);
                      addNotification('Wallpaper Applied', 'Desktop background updated.', 'success');
                    }}
                    className="w-full py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-semibold shadow-md flex items-center justify-center gap-2 transition-colors"
                  >
                    <Sparkles size={14} /> Set as Wallpaper
                  </button>
                )}

                {selectedItem.type === 'file' && (
                  <button
                    onClick={(e) => handleDownload(selectedItem, e)}
                    className="w-full py-2 bg-white/10 hover:bg-white/15 text-white rounded-xl text-xs font-semibold border border-white/10 flex items-center justify-center gap-2 transition-colors"
                  >
                    <Download size={14} /> Download to PC
                  </button>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={(e) => startRename(selectedItem, e)}
                    className="flex-1 py-2 bg-white/5 hover:bg-white/10 text-white/80 rounded-xl text-xs font-semibold border border-white/10 flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Edit3 size={13} /> Rename
                  </button>
                  <button
                    onClick={(e) => startDelete(selectedItem, e)}
                    className="flex-1 py-2 bg-red-600/20 hover:bg-red-600 text-red-300 hover:text-white rounded-xl text-xs font-semibold border border-red-500/30 flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Trash2 size={13} /> Delete
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* MODAL 1: Create Folder */}
      {showNewFolderModal && (
        <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-[#121624] border border-white/15 rounded-2xl w-full max-w-sm p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FolderPlus size={18} className="text-amber-400" />
                <h3 className="font-bold text-sm text-white">Create New Folder</h3>
              </div>
              <button 
                onClick={() => setShowNewFolderModal(false)}
                className="text-white/40 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            <div>
              <label className="text-[11px] text-white/50 mb-1.5 block">Folder Name</label>
              <input
                type="text"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && confirmCreateFolder()}
                autoFocus
                placeholder="e.g. My Projects"
                className="w-full bg-white/[0.07] border border-white/15 rounded-xl px-3.5 py-2 text-xs text-white placeholder-white/40 outline-none focus:border-purple-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowNewFolderModal(false)}
                className="px-3.5 py-1.5 bg-white/5 hover:bg-white/10 text-white/70 rounded-xl text-xs font-medium"
              >
                Cancel
              </button>
              <button
                onClick={confirmCreateFolder}
                className="px-4 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-semibold shadow-md"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Create File */}
      {showNewFileModal && (
        <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-[#121624] border border-white/15 rounded-2xl w-full max-w-md p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FilePlus size={18} className="text-purple-400" />
                <h3 className="font-bold text-sm text-white">Create New File</h3>
              </div>
              <button 
                onClick={() => setShowNewFileModal(false)}
                className="text-white/40 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[11px] text-white/50 mb-1.5 block">File Name</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newFileName}
                    onChange={(e) => setNewFileName(e.target.value)}
                    autoFocus
                    placeholder="Document name"
                    className="flex-1 bg-white/[0.07] border border-white/15 rounded-xl px-3.5 py-2 text-xs text-white placeholder-white/40 outline-none focus:border-purple-500"
                  />
                  <select
                    value={newFileExt}
                    onChange={(e) => setNewFileExt(e.target.value)}
                    className="bg-[#1b2137] border border-white/15 rounded-xl px-3 py-2 text-xs text-white outline-none"
                  >
                    <option value="md">.md</option>
                    <option value="txt">.txt</option>
                    <option value="js">.js</option>
                    <option value="json">.json</option>
                    <option value="css">.css</option>
                    <option value="html">.html</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] text-white/50 mb-1.5 block">Initial Content (Optional)</label>
                <textarea
                  value={newFileInitialContent}
                  onChange={(e) => setNewFileInitialContent(e.target.value)}
                  placeholder="Type starter content here..."
                  rows={4}
                  className="w-full bg-white/[0.07] border border-white/15 rounded-xl px-3.5 py-2 text-xs text-white font-mono placeholder-white/40 outline-none focus:border-purple-500 resize-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowNewFileModal(false)}
                className="px-3.5 py-1.5 bg-white/5 hover:bg-white/10 text-white/70 rounded-xl text-xs font-medium"
              >
                Cancel
              </button>
              <button
                onClick={confirmCreateFile}
                className="px-4 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-semibold shadow-md"
              >
                Create File
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Rename Item */}
      {showRenameModal && renameTarget && (
        <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-[#121624] border border-white/15 rounded-2xl w-full max-w-sm p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Edit3 size={18} className="text-purple-400" />
                <h3 className="font-bold text-sm text-white">Rename Item</h3>
              </div>
              <button 
                onClick={() => setShowRenameModal(false)}
                className="text-white/40 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            <div>
              <label className="text-[11px] text-white/50 mb-1.5 block">New Name</label>
              <input
                type="text"
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && confirmRename()}
                autoFocus
                className="w-full bg-white/[0.07] border border-white/15 rounded-xl px-3.5 py-2 text-xs text-white outline-none focus:border-purple-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowRenameModal(false)}
                className="px-3.5 py-1.5 bg-white/5 hover:bg-white/10 text-white/70 rounded-xl text-xs font-medium"
              >
                Cancel
              </button>
              <button
                onClick={confirmRename}
                className="px-4 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-semibold shadow-md"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: Delete Confirmation */}
      {showDeleteModal && deleteTarget && (
        <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-[#121624] border border-red-500/30 rounded-2xl w-full max-w-sm p-5 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-500/20 border border-red-500/30 flex items-center justify-center text-red-400 shrink-0">
                <Trash2 size={20} />
              </div>
              <div>
                <h3 className="font-bold text-sm text-white">Delete Item?</h3>
                <p className="text-xs text-white/50 mt-0.5 truncate max-w-[200px]">{deleteTarget.name}</p>
              </div>
            </div>

            <p className="text-xs text-white/60">
              Are you sure you want to delete this {deleteTarget.type}? This action will permanently remove it from virtual storage.
            </p>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-3.5 py-1.5 bg-white/5 hover:bg-white/10 text-white/70 rounded-xl text-xs font-medium"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-semibold shadow-md"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 5: Rich In-App File Previewer */}
      {previewItem && (
        <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-xl flex flex-col animate-in fade-in duration-200">
          {/* Header */}
          <div className="h-14 border-b border-white/10 px-5 flex items-center justify-between bg-black/40">
            <div className="flex items-center gap-3">
              {getFileIcon(previewItem, 'w-5 h-5')}
              <div>
                <div className="font-bold text-sm text-white">{previewItem.name}</div>
                <div className="text-[10px] text-white/40">{previewItem.size || '1 KB'} • {previewItem.updatedAt}</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {previewItem.imageUrl && (
                <button
                  onClick={() => {
                    setWallpaper(previewItem.imageUrl!);
                    addNotification('Wallpaper Applied', 'Desktop background updated.', 'success');
                  }}
                  className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5"
                >
                  <Sparkles size={13} /> Set Wallpaper
                </button>
              )}

              {['md', 'txt', 'json', 'js', 'ts'].includes(previewItem.extension || '') && (
                <button
                  onClick={() => {
                    setPreviewItem(null);
                    openApp('notes');
                  }}
                  className="px-3 py-1.5 bg-white/10 hover:bg-white/15 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5"
                >
                  <Edit3 size={13} /> Edit in Notes
                </button>
              )}

              <button
                onClick={() => handleDownload(previewItem)}
                className="px-3 py-1.5 bg-white/10 hover:bg-white/15 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5"
              >
                <Download size={13} /> Download
              </button>

              <button
                onClick={() => setPreviewItem(null)}
                className="p-1.5 rounded-xl hover:bg-white/10 text-white/70 hover:text-white ml-2"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Preview Content Body */}
          <div className="flex-1 p-6 overflow-auto flex items-center justify-center">
            {previewItem.imageUrl ? (
              <div className="max-w-4xl max-h-full flex flex-col items-center">
                <img 
                  src={previewItem.imageUrl.startsWith('/') ? getAssetUrl(previewItem.imageUrl) : previewItem.imageUrl} 
                  alt={previewItem.name} 
                  className="max-h-[70vh] rounded-2xl object-contain shadow-2xl border border-white/10"
                />
              </div>
            ) : ['mp3', 'wav', 'ogg'].includes(previewItem.extension || '') ? (
              <div className="bg-[#121624] border border-white/15 rounded-3xl p-8 max-w-md w-full flex flex-col items-center text-center shadow-2xl space-y-4">
                <div className="w-20 h-20 rounded-2xl bg-pink-500/20 border border-pink-500/30 flex items-center justify-center text-pink-400">
                  <Music size={40} />
                </div>
                <div className="font-bold text-base text-white">{previewItem.name}</div>
                <div className="text-xs text-white/40">Audio Track • Ready for Playback</div>
                <audio 
                  ref={audioRef} 
                  controls 
                  className="w-full mt-4" 
                  src={previewItem.content || ''} 
                />
              </div>
            ) : (
              /* Text / Code / Markdown Viewer */
              <div className="bg-[#0e121e] border border-white/15 rounded-2xl w-full max-w-4xl h-[75vh] flex flex-col overflow-hidden shadow-2xl">
                <div className="px-4 py-2 border-b border-white/10 bg-white/[0.03] flex items-center justify-between text-xs text-white/50 font-mono">
                  <span>{previewItem.name}</span>
                  <button
                    onClick={() => {
                      if (previewItem.content) {
                        navigator.clipboard.writeText(previewItem.content);
                        addNotification('Copied', 'Content copied to clipboard', 'info');
                      }
                    }}
                    className="hover:text-white flex items-center gap-1"
                  >
                    <Copy size={12} /> Copy Text
                  </button>
                </div>
                <pre className="flex-1 p-5 overflow-auto text-xs font-mono text-white/90 leading-relaxed whitespace-pre-wrap selection:bg-purple-600/50">
                  {previewItem.content || '(File is empty)'}
                </pre>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
