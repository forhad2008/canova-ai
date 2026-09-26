import React, { useState, useRef } from 'react';
import {
  Search,
  Plus,
  MoreVertical,
  FileText,
  FileCode,
  Archive,
  Image as ImageIcon,
  Download,
  Trash2,
  Eye,
  Check,
  UploadCloud,
  File,
  X,
} from 'lucide-react';
import { FileItem } from '../types';
import { soundFx } from '../utils/audio';

interface FilesProps {
  files: FileItem[];
  onAddFile: (file: Omit<FileItem, 'id'>) => void;
  onDeleteFile: (id: string) => void;
}

export const Files: React.FC<FilesProps> = ({
  files,
  onAddFile,
  onDeleteFile,
}) => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'documents' | 'images' | 'others'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [previewFile, setPreviewFile] = useState<FileItem | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  const [newFileType, setNewFileType] = useState<'documents' | 'images' | 'others'>('documents');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filterChips: { id: 'all' | 'documents' | 'images' | 'others'; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'documents', label: 'Documents' },
    { id: 'images', label: 'Images' },
    { id: 'others', label: 'Others' },
  ];

  const filteredFiles = files.filter((f) => {
    const matchesFilter = activeFilter === 'all' || f.category === activeFilter;
    const matchesSearch = f.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getFileIcon = (file: FileItem) => {
    switch (file.extension.toLowerCase()) {
      case 'pdf':
        return (
          <div className="w-10 h-10 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 flex items-center justify-center shrink-0">
            <FileText size={18} />
          </div>
        );
      case 'fig':
      case 'sketch':
        return (
          <div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-500/30 text-blue-400 flex items-center justify-center shrink-0">
            <FileCode size={18} />
          </div>
        );
      case 'txt':
      case 'md':
        return (
          <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 flex items-center justify-center shrink-0">
            <FileText size={18} />
          </div>
        );
      case 'png':
      case 'jpg':
      case 'jpeg':
      case 'webp':
        return (
          <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-400 flex items-center justify-center shrink-0">
            <ImageIcon size={18} />
          </div>
        );
      default:
        return (
          <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0">
            <Archive size={18} />
          </div>
        );
    }
  };

  const handleNativeFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;

    soundFx.playSuccess();
    const uploaded = fileList[0];
    const extension = uploaded.name.includes('.') ? uploaded.name.split('.').pop()?.toLowerCase() || 'dat' : 'dat';
    const isImg = ['png', 'jpg', 'jpeg', 'webp', 'svg'].includes(extension);
    const isDoc = ['pdf', 'doc', 'docx', 'txt', 'md'].includes(extension);

    const sizeStr =
      uploaded.size < 1024 * 1024
        ? `${Math.round(uploaded.size / 1024)} KB`
        : `${(uploaded.size / (1024 * 1024)).toFixed(1)} MB`;

    onAddFile({
      name: uploaded.name,
      size: sizeStr,
      date: 'Just now',
      category: isDoc ? 'documents' : isImg ? 'images' : 'others',
      extension,
      color: isDoc ? '#ef4444' : isImg ? '#a855f7' : '#f59e0b',
    });
  };

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFileName.trim()) return;

    soundFx.playSuccess();
    const ext = newFileName.includes('.') ? newFileName.split('.').pop() || 'dat' : 'pdf';
    onAddFile({
      name: newFileName.trim(),
      size: `${(Math.random() * 8 + 0.5).toFixed(1)} MB`,
      date: 'Just now',
      category: newFileType,
      extension: ext,
      color: newFileType === 'documents' ? '#ef4444' : newFileType === 'images' ? '#a855f7' : '#f59e0b',
    });

    setNewFileName('');
    setIsUploadModalOpen(false);
  };

  return (
    <div className="relative flex flex-col space-y-4 px-5 py-4 pb-28 text-left select-none max-w-2xl mx-auto w-full">
      {/* 1. Header */}
      <div className="space-y-0.5">
        <h2 className="text-2xl font-extrabold text-black dark:text-white tracking-tight">
          Files
        </h2>
        <p className="text-xs font-semibold text-slate-800 dark:text-[#9AA8C7]">
          Your files, always within reach.
        </p>
      </div>

      {/* Hidden real file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleNativeFileUpload}
        className="hidden"
      />

      {/* 2. Search & Upload Controls */}
      <div className="flex items-center gap-2.5">
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-purple-600 dark:text-[#A978FF] pointer-events-none"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search files by name..."
            className="w-full neu-inset rounded-full py-2.5 pl-10 pr-10 text-xs font-semibold text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-[#657394] focus:outline-none focus:ring-1 focus:ring-purple-500/50 transition-all shadow-[inset_2px_2px_5px_rgba(166,180,204,0.4),inset_-2px_-2px_5px_rgba(255,255,255,0.9)] dark:shadow-none"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                soundFx.playClick();
                setSearchQuery('');
              }}
              aria-label="Clear search"
              className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X size={12} />
            </button>
          )}
        </div>

        {/* (+) Button matching Screen 7 */}
        <button
          onClick={() => {
            soundFx.playClick();
            setIsUploadModalOpen(true);
          }}
          aria-label="Upload file"
          className="w-10 h-10 rounded-full neu-primary-btn shrink-0 flex items-center justify-center text-white cursor-pointer hover:scale-105 active:scale-95 transition-transform shadow-md"
        >
          <Plus size={18} />
        </button>
      </div>

      {/* 3. Filter Chips */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
        {filterChips.map((chip) => {
          const isActive = activeFilter === chip.id;
          return (
            <button
              key={chip.id}
              onClick={() => {
                soundFx.playClick();
                setActiveFilter(chip.id);
              }}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-all cursor-pointer ${
                isActive
                  ? 'neu-primary-btn text-white shadow-md'
                  : 'neu-card-subtle text-slate-800 dark:text-[#9AA8C7] hover:text-black dark:hover:text-white border border-black/5 dark:border-white/5'
              }`}
            >
              {chip.label}
            </button>
          );
        })}
      </div>

      {/* 4. File Items List */}
      <div className="space-y-3">
        {filteredFiles.length === 0 ? (
          <div className="neu-card rounded-2xl p-8 text-center text-xs font-semibold text-slate-800 dark:text-[#657394]">
            No files found matching your search.
          </div>
        ) : (
          filteredFiles.map((file) => (
            <div
              key={file.id}
              className="neu-card rounded-2xl p-3.5 flex items-center justify-between gap-3 group relative transition-all"
            >
              {/* File Icon */}
              {getFileIcon(file)}

              {/* File Details */}
              <div
                onClick={() => {
                  soundFx.playClick();
                  setPreviewFile(file);
                }}
                className="flex-1 cursor-pointer overflow-hidden text-left"
              >
                <h4 className="text-xs font-bold text-black dark:text-white group-hover:text-purple-700 dark:group-hover:text-purple-300 transition-colors truncate">
                  {file.name}
                </h4>
                <div className="flex items-center gap-2 mt-0.5 text-[11px] font-medium text-slate-800 dark:text-[#657394]">
                  <span>{file.size}</span>
                  <span>•</span>
                  <span>{file.date}</span>
                </div>
              </div>

              {/* Context menu */}
              <div className="relative">
                <button
                  onClick={() => {
                    soundFx.playClick();
                    setActiveMenuId(activeMenuId === file.id ? null : file.id);
                  }}
                  aria-label="File options"
                  className="p-1.5 rounded-lg text-slate-600 dark:text-[#657394] hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
                >
                  <MoreVertical size={16} />
                </button>

                {activeMenuId === file.id && (
                  <div className="absolute right-0 mt-1 w-36 rounded-xl neu-card py-1.5 shadow-2xl z-50 border border-black/8 dark:border-white/10 text-xs bg-white dark:bg-[#071329]">
                    <button
                      onClick={() => {
                        soundFx.playClick();
                        setPreviewFile(file);
                        setActiveMenuId(null);
                      }}
                      className="w-full px-3 py-1.5 text-left text-slate-800 dark:text-[#F7F8FF] hover:bg-black/5 dark:hover:bg-white/5 flex items-center gap-2 cursor-pointer font-medium"
                    >
                      <Eye size={13} /> Preview
                    </button>
                    <button
                      onClick={() => {
                        soundFx.playSuccess();
                        setCopiedId(file.id);
                        setTimeout(() => setCopiedId(null), 1500);
                        setActiveMenuId(null);
                      }}
                      className="w-full px-3 py-1.5 text-left text-slate-800 dark:text-[#F7F8FF] hover:bg-black/5 dark:hover:bg-white/5 flex items-center gap-2 cursor-pointer font-medium"
                    >
                      {copiedId === file.id ? <Check size={13} className="text-emerald-500" /> : <Download size={13} />}
                      {copiedId === file.id ? 'Downloaded' : 'Download'}
                    </button>
                    <button
                      onClick={() => {
                        soundFx.playClick();
                        onDeleteFile(file.id);
                        setActiveMenuId(null);
                      }}
                      className="w-full px-3 py-1.5 text-left text-red-500 hover:bg-black/5 dark:hover:bg-white/5 flex items-center gap-2 cursor-pointer font-semibold"
                    >
                      <Trash2 size={13} /> Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* File Preview Modal */}
      {previewFile && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="neu-card rounded-3xl p-6 w-full max-w-sm border border-black/10 dark:border-purple-500/30 bg-white dark:bg-[#071226] text-left shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              {getFileIcon(previewFile)}
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate max-w-[200px]">
                  {previewFile.name}
                </h3>
                <p className="text-xs font-semibold text-slate-600 dark:text-[#9AA8C7]">
                  {previewFile.size} • {previewFile.date}
                </p>
              </div>
            </div>

            <div className="neu-inset bg-[#F8FAFC] dark:bg-[#060e20] rounded-xl p-4 text-xs text-slate-800 dark:text-[#9AA8C7] mb-4 space-y-2 leading-relaxed border border-black/5 dark:border-white/5">
              <p className="text-slate-900 dark:text-white font-bold">Asset Inspection Details:</p>
              <p>Extension: {previewFile.extension.toUpperCase()}</p>
              <p>Storage Security: AES-256 Cloud Encrypted</p>
              <p>Synced with Canova Cloud Vault</p>
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => {
                  soundFx.playClick();
                  setPreviewFile(null);
                }}
                className="px-4 py-2 rounded-xl neu-button text-xs font-bold text-slate-700 dark:text-[#9AA8C7] hover:text-slate-900 dark:hover:text-white cursor-pointer shadow-xs"
              >
                Close
              </button>
              <button
                onClick={() => {
                  soundFx.playSuccess();
                  setCopiedId(previewFile.id);
                  setTimeout(() => {
                    setCopiedId(null);
                    setPreviewFile(null);
                  }, 1200);
                }}
                className="px-4 py-2 rounded-xl neu-primary-btn text-xs font-bold text-white flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                <Download size={14} /> Download File
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="neu-card rounded-3xl p-6 w-full max-w-sm border border-black/10 dark:border-purple-500/30 bg-white dark:bg-[#071226] text-left shadow-2xl">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">Add New File</h3>
            <p className="text-xs font-medium text-slate-600 dark:text-[#9AA8C7] mb-4">
              Register an asset into your encrypted vault
            </p>

            <form onSubmit={handleUploadSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-800 dark:text-[#9AA8C7] block mb-1.5">
                  File Name
                </label>
                <input
                  type="text"
                  required
                  value={newFileName}
                  onChange={(e) => setNewFileName(e.target.value)}
                  placeholder="e.g. Portfolio_Design_2026.fig"
                  className="w-full neu-inset bg-[#F8FAFC] dark:bg-[#060e20] rounded-xl py-2.5 px-3.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-[#657394] focus:outline-none focus:ring-1 focus:ring-purple-500/50 font-medium border border-black/5 dark:border-white/5"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-800 dark:text-[#9AA8C7] block mb-1.5">
                  Category
                </label>
                <select
                  value={newFileType}
                  onChange={(e) =>
                    setNewFileType(e.target.value as 'documents' | 'images' | 'others')
                  }
                  className="w-full neu-inset rounded-xl py-2.5 px-3 text-xs font-bold text-slate-900 dark:text-white bg-[#F8FAFC] dark:bg-[#060e20] focus:outline-none border border-black/5 dark:border-white/5"
                >
                  <option value="documents">Documents (PDF, TXT, DOCX)</option>
                  <option value="images">Images (PNG, JPG, FIG)</option>
                  <option value="others">Others (ZIP, JSON, TAR)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="px-4 py-2 rounded-xl neu-button text-xs font-bold text-slate-700 dark:text-[#9AA8C7] hover:text-slate-900 dark:hover:text-white cursor-pointer shadow-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl neu-primary-btn text-xs font-bold text-white cursor-pointer shadow-md"
                >
                  Save File
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
