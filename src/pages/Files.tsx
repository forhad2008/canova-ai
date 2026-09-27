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
  File as FileIcon,
  X,
  Folder,
  PackageCheck,
  FileArchive,
  ArrowDownToLine,
} from 'lucide-react';
import { FileItem, ExtractedZipEntry } from '../types';
import { soundFx } from '../utils/audio';
import { parseUploadedZip, createZipArchive, triggerBlobDownload, formatBytes } from '../utils/zipHandler';

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
  const [activeFilter, setActiveFilter] = useState<'all' | 'documents' | 'images' | 'zips' | 'others'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [inspectZipFile, setInspectZipFile] = useState<FileItem | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState('');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const zipFileInputRef = useRef<HTMLInputElement>(null);
  const multiFileInputRef = useRef<HTMLInputElement>(null);

  const filterChips: { id: 'all' | 'documents' | 'images' | 'zips' | 'others'; label: string }[] = [
    { id: 'all', label: 'All Files' },
    { id: 'zips', label: 'ZIP Archives' },
    { id: 'documents', label: 'Documents' },
    { id: 'images', label: 'Images' },
    { id: 'others', label: 'Others' },
  ];

  const filteredFiles = files.filter((f) => {
    let matchesFilter = true;
    if (activeFilter === 'zips') {
      matchesFilter = f.extension.toLowerCase() === 'zip' || f.isZip === true;
    } else if (activeFilter !== 'all') {
      matchesFilter = f.category === activeFilter;
    }
    const matchesSearch = f.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getFileIcon = (file: FileItem) => {
    const isZip = file.extension.toLowerCase() === 'zip' || file.isZip;
    if (isZip) {
      return (
        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-purple-500/20 to-indigo-500/20 border border-purple-500/35 text-purple-600 dark:text-[#A978FF] flex items-center justify-center shrink-0 shadow-xs">
          <FileArchive size={20} />
        </div>
      );
    }

    switch (file.extension.toLowerCase()) {
      case 'pdf':
        return (
          <div className="w-11 h-11 rounded-2xl bg-red-500/15 border border-red-500/30 text-red-500 dark:text-red-400 flex items-center justify-center shrink-0 shadow-xs">
            <FileText size={20} />
          </div>
        );
      case 'fig':
      case 'sketch':
        return (
          <div className="w-11 h-11 rounded-2xl bg-blue-500/15 border border-blue-500/30 text-blue-500 dark:text-blue-400 flex items-center justify-center shrink-0 shadow-xs">
            <FileCode size={20} />
          </div>
        );
      case 'txt':
      case 'md':
        return (
          <div className="w-11 h-11 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-500 dark:text-cyan-400 flex items-center justify-center shrink-0 shadow-xs">
            <FileText size={20} />
          </div>
        );
      case 'png':
      case 'jpg':
      case 'jpeg':
      case 'webp':
        return (
          <div className="w-11 h-11 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-500 dark:text-emerald-400 flex items-center justify-center shrink-0 shadow-xs">
            <ImageIcon size={20} />
          </div>
        );
      default:
        return (
          <div className="w-11 h-11 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-500 dark:text-amber-400 flex items-center justify-center shrink-0 shadow-xs">
            <Archive size={20} />
          </div>
        );
    }
  };

  // Real Native ZIP & File Upload Handler
  const handleRealFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = e.target.files;
    if (!uploadedFiles || uploadedFiles.length === 0) return;

    soundFx.playSuccess();
    setIsProcessing(true);

    for (let i = 0; i < uploadedFiles.length; i++) {
      const file = uploadedFiles[i];
      const extension = file.name.includes('.') ? file.name.split('.').pop()?.toLowerCase() || '' : '';
      const isZip = extension === 'zip' || file.type.includes('zip');

      setProcessingStatus(`Processing ${file.name}...`);

      if (isZip) {
        try {
          // Parse ZIP contents using JSZip
          const zipResult = await parseUploadedZip(file);

          onAddFile({
            name: zipResult.name,
            size: zipResult.sizeFormatted,
            bytes: zipResult.bytes,
            date: 'Just now',
            category: 'others',
            extension: 'zip',
            color: '#a855f7',
            isZip: true,
            fileBlob: zipResult.zipBlob,
            zipContents: zipResult.entries,
          });
        } catch (err) {
          console.error('Error parsing ZIP file:', err);
          // Fallback to basic file item
          onAddFile({
            name: file.name,
            size: formatBytes(file.size),
            bytes: file.size,
            date: 'Just now',
            category: 'others',
            extension: 'zip',
            color: '#a855f7',
            isZip: true,
            fileBlob: file,
            zipContents: [
              { name: 'Archive Root', size: file.size, sizeFormatted: formatBytes(file.size), isFolder: true },
            ],
          });
        }
      } else {
        const isImg = ['png', 'jpg', 'jpeg', 'webp', 'svg'].includes(extension);
        const isDoc = ['pdf', 'doc', 'docx', 'txt', 'md'].includes(extension);

        onAddFile({
          name: file.name,
          size: formatBytes(file.size),
          bytes: file.size,
          date: 'Just now',
          category: isDoc ? 'documents' : isImg ? 'images' : 'others',
          extension,
          color: isDoc ? '#ef4444' : isImg ? '#10b981' : '#f59e0b',
          fileBlob: file,
        });
      }
    }

    setIsProcessing(false);
    setProcessingStatus('');
    if (zipFileInputRef.current) zipFileInputRef.current.value = '';
  };

  // Create Zip from multiple files
  const handleCreateZipFromLocalFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles || selectedFiles.length === 0) return;

    soundFx.playSuccess();
    setIsProcessing(true);
    setProcessingStatus('Compressing files into ZIP archive...');

    try {
      const fileArray = Array.from(selectedFiles);
      const zipName = `Archive_${Date.now().toString().slice(-4)}.zip`;
      const zipBlob = await createZipArchive(fileArray, zipName);

      // Re-parse created zip to build entries list
      const zipFile = new File([zipBlob], zipName, { type: 'application/zip' });
      const parsed = await parseUploadedZip(zipFile);

      onAddFile({
        name: zipName,
        size: formatBytes(zipBlob.size),
        bytes: zipBlob.size,
        date: 'Just now',
        category: 'others',
        extension: 'zip',
        color: '#a855f7',
        isZip: true,
        fileBlob: zipBlob,
        zipContents: parsed.entries,
      });
    } catch (err) {
      console.error('Error creating ZIP archive:', err);
    }

    setIsProcessing(false);
    setProcessingStatus('');
    if (multiFileInputRef.current) multiFileInputRef.current.value = '';
  };

  // Handle Drag & Drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const eventObj = { target: { files: e.dataTransfer.files } } as any;
      handleRealFileUpload(eventObj);
    }
  };

  // Download real file
  const handleDownload = (file: FileItem) => {
    soundFx.playSuccess();
    if (file.fileBlob) {
      triggerBlobDownload(file.fileBlob, file.name);
    } else {
      // Create a dummy text blob for fallback
      const dummyBlob = new Blob([`Content for ${file.name}`], { type: 'text/plain' });
      triggerBlobDownload(dummyBlob, file.name);
    }
    setCopiedId(file.id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`relative flex flex-col space-y-5 px-4 sm:px-6 py-5 pb-32 text-left select-none max-w-4xl mx-auto w-full transition-all ${
        dragOver ? 'ring-2 ring-purple-500 ring-offset-4 rounded-3xl bg-purple-500/5' : ''
      }`}
    >
      {/* Hidden Inputs for Real Files & ZIPs */}
      <input
        type="file"
        ref={zipFileInputRef}
        onChange={handleRealFileUpload}
        multiple
        className="hidden"
      />
      <input
        type="file"
        ref={multiFileInputRef}
        onChange={handleCreateZipFromLocalFiles}
        multiple
        className="hidden"
      />

      {/* 1. Storage Header Card - Matching Screenshot */}
      <div className="relative rounded-3xl p-6 neu-glass-card liquid-shimmer border border-white/60 dark:border-white/10 overflow-hidden shadow-lg space-y-4">
        <div className="absolute top-0 right-0 w-60 h-60 bg-gradient-to-br from-purple-500/15 via-indigo-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/15 border border-purple-500/30 text-purple-600 dark:text-[#A978FF] flex items-center justify-center shrink-0 shadow-xs">
              <Folder size={24} />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Cloud Workspace Storage
              </h2>
              <p className="text-xs font-semibold text-slate-600 dark:text-[#9AA8C7] mt-0.5">
                18.4 GB used of 50 GB encrypted cloud storage.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full md:w-auto">
            <button
              onClick={() => zipFileInputRef.current?.click()}
              className="flex-1 md:flex-initial px-5 py-2.5 rounded-2xl neu-primary-btn text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md active:scale-[0.98] transition-all"
            >
              <Plus size={16} />
              <span>Upload File / ZIP</span>
            </button>
            <button
              onClick={() => multiFileInputRef.current?.click()}
              title="Select files to pack into a ZIP archive"
              className="px-3.5 py-2.5 rounded-2xl bg-white/60 dark:bg-white/10 border border-black/5 dark:border-white/10 text-slate-700 dark:text-white hover:text-purple-600 dark:hover:text-purple-300 font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <FileArchive size={16} className="text-purple-600 dark:text-[#A978FF]" />
              <span className="hidden sm:inline">Pack ZIP</span>
            </button>
          </div>
        </div>

        {/* Progress Bar - Matching Screenshot */}
        <div className="pt-2 relative z-10 space-y-1.5">
          <div className="w-full h-3 rounded-full neu-inset overflow-hidden p-0.5 bg-[#F8FAFC] dark:bg-[#050d1e]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-purple-600 to-indigo-500 dark:from-[#8B5CFF] dark:to-[#35C9FF] transition-all duration-500 shadow-xs"
              style={{ width: '36.8%' }}
            />
          </div>
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-600 dark:text-[#9AA8C7] px-0.5">
            <span>36.8% Used</span>
            <span>31.6 GB Remaining</span>
          </div>
        </div>
      </div>

      {/* Processing Banner */}
      {isProcessing && (
        <div className="p-3.5 rounded-2xl bg-purple-500/15 border border-purple-500/30 text-purple-700 dark:text-purple-300 text-xs font-bold flex items-center gap-2.5 animate-pulse">
          <PackageCheck size={18} className="animate-spin text-purple-500" />
          <span>{processingStatus}</span>
        </div>
      )}

      {/* 2. Controls: Search Bar & Filter Chips */}
      <div className="space-y-3">
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
              placeholder="Search files or zip archives..."
              className="w-full neu-inset rounded-2xl py-2.5 pl-10 pr-10 text-xs font-semibold text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-[#657394] focus:outline-none focus:ring-1 focus:ring-purple-500/50 transition-all shadow-[inset_2px_2px_5px_rgba(166,180,204,0.4),inset_-2px_-2px_5px_rgba(255,255,255,0.9)] dark:shadow-none"
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
        </div>

        {/* Filter Chips */}
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
                className={`px-4 py-1.5 rounded-full text-xs font-bold shrink-0 transition-all cursor-pointer ${
                  isActive
                    ? 'neu-primary-btn text-white shadow-md'
                    : 'neu-card-subtle text-slate-700 dark:text-[#9AA8C7] hover:text-black dark:hover:text-white border border-black/5 dark:border-white/5'
                }`}
              >
                {chip.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Files Grid / Cards (ZIP emphasis) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {filteredFiles.length === 0 ? (
          <div className="col-span-full neu-card rounded-2xl p-8 text-center text-xs font-semibold text-slate-600 dark:text-[#657394]">
            No files or ZIP archives found matching your search.
          </div>
        ) : (
          filteredFiles.map((file) => {
            const isZip = file.extension.toLowerCase() === 'zip' || file.isZip;
            return (
              <div
                key={file.id}
                className="neu-glass-card rounded-2xl p-4 flex items-center justify-between gap-3 group relative transition-all hover:border-purple-500/40"
              >
                {/* File Icon */}
                {getFileIcon(file)}

                {/* Details */}
                <div
                  onClick={() => {
                    soundFx.playClick();
                    if (isZip) {
                      setInspectZipFile(file);
                    }
                  }}
                  className="flex-1 cursor-pointer overflow-hidden text-left"
                >
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-300 transition-colors truncate">
                      {file.name}
                    </h3>
                    {isZip && (
                      <span className="text-[9px] font-extrabold uppercase tracking-wider bg-purple-500/20 text-purple-700 dark:text-purple-300 px-1.5 py-0.5 rounded shrink-0">
                        ZIP
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] font-medium text-slate-600 dark:text-[#9AA8C7] mt-0.5">
                    {file.size} • {file.date}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1">
                  {isZip && (
                    <button
                      onClick={() => {
                        soundFx.playClick();
                        setInspectZipFile(file);
                      }}
                      title="Inspect ZIP contents"
                      className="p-2 rounded-xl text-purple-600 dark:text-[#A978FF] hover:bg-purple-500/10 transition-colors cursor-pointer"
                    >
                      <Eye size={16} />
                    </button>
                  )}

                  <button
                    onClick={() => handleDownload(file)}
                    title="Download file"
                    className="p-2 rounded-xl text-slate-600 dark:text-[#9AA8C7] hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
                  >
                    {copiedId === file.id ? <Check size={16} className="text-emerald-500" /> : <Download size={16} />}
                  </button>

                  <div className="relative">
                    <button
                      onClick={() => {
                        soundFx.playClick();
                        setActiveMenuId(activeMenuId === file.id ? null : file.id);
                      }}
                      aria-label="File options"
                      className="p-2 rounded-xl text-slate-500 dark:text-[#657394] hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
                    >
                      <MoreVertical size={16} />
                    </button>

                    {activeMenuId === file.id && (
                      <div className="absolute right-0 mt-1 w-40 rounded-2xl neu-card py-2 shadow-2xl z-50 border border-black/8 dark:border-white/10 text-xs bg-white dark:bg-[#071329]">
                        {isZip && (
                          <button
                            onClick={() => {
                              soundFx.playClick();
                              setInspectZipFile(file);
                              setActiveMenuId(null);
                            }}
                            className="w-full px-3.5 py-2 text-left text-purple-600 dark:text-purple-300 hover:bg-black/5 dark:hover:bg-white/5 flex items-center gap-2 cursor-pointer font-bold"
                          >
                            <FileArchive size={14} /> Unpack ZIP
                          </button>
                        )}
                        <button
                          onClick={() => {
                            handleDownload(file);
                            setActiveMenuId(null);
                          }}
                          className="w-full px-3.5 py-2 text-left text-slate-800 dark:text-[#F7F8FF] hover:bg-black/5 dark:hover:bg-white/5 flex items-center gap-2 cursor-pointer font-medium"
                        >
                          <Download size={14} /> Download
                        </button>
                        <button
                          onClick={() => {
                            soundFx.playClick();
                            onDeleteFile(file.id);
                            setActiveMenuId(null);
                          }}
                          className="w-full px-3.5 py-2 text-left text-red-500 hover:bg-black/5 dark:hover:bg-white/5 flex items-center gap-2 cursor-pointer font-semibold"
                        >
                          <Trash2 size={14} /> Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 4. Real ZIP Inspector & Unpacker Modal */}
      {inspectZipFile && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="neu-glass-card rounded-3xl p-6 w-full max-w-lg border border-purple-500/30 bg-white dark:bg-[#071226] text-left shadow-2xl space-y-4 max-h-[85vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-black/5 dark:border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-500/20 text-purple-600 dark:text-[#A978FF] flex items-center justify-center border border-purple-500/30 shrink-0">
                  <FileArchive size={20} />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white truncate max-w-[260px]">
                    {inspectZipFile.name}
                  </h3>
                  <p className="text-xs font-semibold text-slate-600 dark:text-[#9AA8C7]">
                    {inspectZipFile.size} • Encrypted ZIP Archive
                  </p>
                </div>
              </div>

              <button
                onClick={() => setInspectZipFile(null)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Archived Files Listing */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
              <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-[#9AA8C7] px-1">
                <span>Contents ({inspectZipFile.zipContents?.length || 0} items)</span>
                <span>Uncompressed</span>
              </div>

              {inspectZipFile.zipContents && inspectZipFile.zipContents.length > 0 ? (
                inspectZipFile.zipContents.map((entry, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-black/5 dark:border-white/5 flex items-center justify-between text-xs text-slate-800 dark:text-[#F7F8FF]"
                  >
                    <div className="flex items-center gap-2 overflow-hidden pr-2">
                      {entry.isFolder ? (
                        <Folder size={15} className="text-amber-500 shrink-0" />
                      ) : (
                        <FileText size={15} className="text-purple-500 shrink-0" />
                      )}
                      <span className="font-semibold truncate">{entry.name}</span>
                    </div>
                    <span className="text-[11px] font-mono text-slate-500 dark:text-[#9AA8C7] shrink-0">
                      {entry.sizeFormatted}
                    </span>
                  </div>
                ))
              ) : (
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/5 text-center text-xs text-slate-500">
                  Archive contains compressed project files.
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="pt-3 border-t border-black/5 dark:border-white/10 flex items-center justify-between gap-3">
              <button
                onClick={() => setInspectZipFile(null)}
                className="px-4 py-2.5 rounded-xl neu-button text-xs font-bold text-slate-700 dark:text-[#9AA8C7] hover:text-slate-900 dark:hover:text-white cursor-pointer shadow-xs"
              >
                Close
              </button>

              <button
                onClick={() => {
                  handleDownload(inspectZipFile);
                  setInspectZipFile(null);
                }}
                className="px-5 py-2.5 rounded-xl neu-primary-btn text-xs font-bold text-white flex items-center gap-2 cursor-pointer shadow-md"
              >
                <ArrowDownToLine size={15} />
                <span>Download Archive</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
