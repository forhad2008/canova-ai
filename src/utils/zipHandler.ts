import JSZip from 'jszip';
import { ExtractedZipEntry } from '../types';

export interface ProcessedZipResult {
  name: string;
  sizeFormatted: string;
  bytes: number;
  entries: ExtractedZipEntry[];
  zipBlob: Blob;
  zipObject: JSZip;
}

export const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

/**
 * Reads a real .zip file from input, parses all file headers and directory tree using JSZip.
 */
export const parseUploadedZip = async (file: File): Promise<ProcessedZipResult> => {
  const zip = new JSZip();
  const zipContents = await zip.loadAsync(file);

  const entries: ExtractedZipEntry[] = [];

  zipContents.forEach((relativePath, zipEntry) => {
    entries.push({
      name: relativePath,
      size: (zipEntry as any)._data ? (zipEntry as any)._data.uncompressedSize || 0 : 0,
      sizeFormatted: formatBytes((zipEntry as any)._data ? (zipEntry as any)._data.uncompressedSize || 0 : 0),
      isFolder: zipEntry.dir,
      date: zipEntry.date ? zipEntry.date.toLocaleDateString() : new Date().toLocaleDateString(),
    });
  });

  return {
    name: file.name,
    sizeFormatted: formatBytes(file.size),
    bytes: file.size,
    entries,
    zipBlob: file,
    zipObject: zip,
  };
};

/**
 * Packs multiple files into a single real .zip archive for instant download.
 */
export const createZipArchive = async (files: File[], zipName: string): Promise<Blob> => {
  const zip = new JSZip();

  for (const f of files) {
    const arrayBuffer = await f.arrayBuffer();
    zip.file(f.name, arrayBuffer);
  }

  const zipBlob = await zip.generateAsync({ type: 'blob' });
  return zipBlob;
};

/**
 * Downloads a Blob as a file in browser.
 */
export const triggerBlobDownload = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
