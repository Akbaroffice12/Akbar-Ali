import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, File, X } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

interface FileDropzoneProps {
  onFilesAdded: (files: File[]) => void;
  files: File[];
  onRemoveFile: (index: number) => void;
  accept?: Record<string, string[]>;
  multiple?: boolean;
}

export const FileDropzone: React.FC<FileDropzoneProps> = ({ 
  onFilesAdded, 
  files, 
  onRemoveFile,
  accept = { 'application/pdf': ['.pdf'] },
  multiple = true
}) => {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    onFilesAdded(acceptedFiles);
  }, [onFilesAdded]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    accept,
    multiple
  } as any);

  const getAcceptedExtensions = () => {
    return Object.values(accept).flat().join(', ');
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div 
        {...getRootProps()} 
        className={cn(
          "relative border-2 border-dashed rounded-3xl p-12 transition-all duration-300 cursor-pointer flex flex-col items-center justify-center min-h-[300px]",
          isDragActive ? "border-fuchsia-500 bg-fuchsia-50" : "border-gray-200 bg-white hover:border-fuchsia-400 hover:bg-fuchsia-50/30"
        )}
      >
        <input {...getInputProps()} />
        <div className="bg-fuchsia-100 p-6 rounded-full mb-6 text-fuchsia-600 group-hover:scale-110 transition-transform">
          <Upload size={48} />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          {isDragActive ? "Drop the files here" : `Select ${getAcceptedExtensions()} files`}
        </h3>
        <p className="text-gray-500 text-center max-w-md">
          or drag and drop {getAcceptedExtensions()} files here to get started. All files are processed locally in your browser.
        </p>
      </div>

      <AnimatePresence>
        {files.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="mt-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4"
          >
            {files.map((file, index) => (
              <motion.div 
                key={`${file.name}-${index}`}
                layout
                className="relative bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 group"
              >
                <div className="bg-fuchsia-50 p-2 rounded-lg text-fuchsia-600">
                  <File size={24} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-900 truncate">{file.name}</p>
                  <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveFile(index);
                  }}
                  className="p-1.5 hover:bg-fuchsia-50 text-gray-400 hover:text-fuchsia-600 rounded-full transition-colors"
                >
                  <X size={16} />
                </button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
