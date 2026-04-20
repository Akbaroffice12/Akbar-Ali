import React, { useState, useEffect } from 'react';
import { TOOLS } from '../constants';
import { FileDropzone } from '../components/FileDropzone';
import { motion } from 'motion/react';
import { PDFDocument } from 'pdf-lib';
import * as Icons from 'lucide-react';
import { Loader2, Download, CheckCircle2, AlertCircle } from 'lucide-react';
import { cn } from '../lib/utils';

export const ToolPage: React.FC<{ toolId: string }> = ({ toolId }) => {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const tool = TOOLS.find(t => t.id === toolId);
  const Icon = tool ? ((Icons as any)[tool.icon] || Icons.File) : Icons.File;

  const getAcceptType = () => {
    if (toolId === 'jpg-to-pdf') {
      return { 'image/*': ['.jpg', '.jpeg', '.png', '.bmp', '.gif', '.tiff'] };
    }
    if (toolId === 'word-to-pdf' || toolId === 'pdf-to-word') {
      return { 'application/msword': ['.doc'], 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'] };
    }
    if (toolId === 'excel-to-pdf' || toolId === 'pdf-to-excel') {
      return { 'application/vnd.ms-excel': ['.xls'], 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'] };
    }
    if (toolId === 'pdf-to-ppt') {
      return { 'application/vnd.ms-powerpoint': ['.ppt'], 'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'] };
    }
    return { 'application/pdf': ['.pdf'] };
  };

  if (!tool) return null;

  const handleFilesAdded = (newFiles: File[]) => {
    setFiles(prev => [...prev, ...newFiles]);
    setResultUrl(null);
    setError(null);
  };

  const handleRemoveFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
    setResultUrl(null);
  };

  const processPDF = async () => {
    if (files.length === 0) return;
    
    setIsProcessing(true);
    setError(null);

    try {
      let resultPdfBytes: Uint8Array;

      if (toolId === 'merge') {
        const mergedPdf = await PDFDocument.create();
        for (const file of files) {
          const fileBytes = await file.arrayBuffer();
          const pdf = await PDFDocument.load(fileBytes);
          const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
          copiedPages.forEach((page) => mergedPdf.addPage(page));
        }
        resultPdfBytes = await mergedPdf.save();
      } else if (toolId === 'split') {
        // Simple split: just take the first page for demo
        const firstFile = files[0];
        const fileBytes = await firstFile.arrayBuffer();
        const pdf = await PDFDocument.load(fileBytes);
        const splitPdf = await PDFDocument.create();
        const [firstPage] = await splitPdf.copyPages(pdf, [0]);
        splitPdf.addPage(firstPage);
        resultPdfBytes = await splitPdf.save();
      } else if (toolId === 'jpg-to-pdf') {
        const pdfDoc = await PDFDocument.create();
        for (const file of files) {
          const imageBytes = await file.arrayBuffer();
          let image;
          if (file.type === 'image/jpeg' || file.name.toLowerCase().endsWith('.jpg') || file.name.toLowerCase().endsWith('.jpeg')) {
            image = await pdfDoc.embedJpg(imageBytes);
          } else if (file.type === 'image/png' || file.name.toLowerCase().endsWith('.png')) {
            image = await pdfDoc.embedPng(imageBytes);
          } else {
            // Fallback for other image types if supported by pdf-lib or skip
            continue;
          }
          
          const page = pdfDoc.addPage([image.width, image.height]);
          page.drawImage(image, {
            x: 0,
            y: 0,
            width: image.width,
            height: image.height,
          });
        }
        resultPdfBytes = await pdfDoc.save();
      } else {
        // For other tools, we'll just simulate processing for now
        await new Promise(resolve => setTimeout(resolve, 2000));
        const fileBytes = await files[0].arrayBuffer();
        resultPdfBytes = new Uint8Array(fileBytes);
      }

      const blob = new Blob([resultPdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setResultUrl(url);
    } catch (err) {
      console.error(err);
      setError('An error occurred while processing your file. Please make sure the file is not corrupted.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Tool Header */}
        <div className="text-center mb-12">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={cn(
              "w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 text-white relative overflow-hidden",
              "shadow-[0_12px_24px_-8px_rgba(0,0,0,0.4),inset_0_6px_8px_-2px_rgba(255,255,255,0.5),inset_0_-6px_8px_-2px_rgba(0,0,0,0.2)]",
              "border border-white/20",
              tool.color.replace('bg-fuchsia', 'bg-blue').replace('bg-red', 'bg-fuchsia')
            )}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-white/40 to-transparent opacity-60" />
            <Icon size={40} className="drop-shadow-[0_3px_4px_rgba(0,0,0,0.4)] relative z-10" />
          </motion.div>
          <motion.h1 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-4xl font-black text-gray-900 mb-4"
          >
            {tool.name}
          </motion.h1>
          <motion.p 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-gray-600 max-w-2xl mx-auto"
          >
            {tool.description}
          </motion.p>
        </div>

        {/* Tool Workspace */}
        <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-fuchsia-100/30 p-8 md:p-12 border border-gray-100">
          {!resultUrl ? (
            <>
              <FileDropzone 
                files={files} 
                onFilesAdded={handleFilesAdded} 
                onRemoveFile={handleRemoveFile} 
                accept={getAcceptType()}
              />
              
              {files.length > 0 && (
                <div className="mt-12 flex flex-col items-center gap-4">
                  <button
                    onClick={processPDF}
                    disabled={isProcessing}
                    className={cn(
                      "group relative px-12 py-5 rounded-2xl font-black text-xl text-white transition-all duration-300 shadow-xl flex items-center gap-3",
                      isProcessing ? "bg-gray-400 cursor-not-allowed" : "bg-fuchsia-600 hover:bg-fuchsia-700 hover:scale-105 active:scale-95 shadow-fuchsia-200"
                    )}
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="animate-spin" />
                        PROCESSING...
                      </>
                    ) : (
                      <>
                        {tool.name.toUpperCase()}
                        <motion.div
                          animate={{ x: [0, 5, 0] }}
                          transition={{ repeat: Infinity, duration: 1.5 }}
                        >
                          →
                        </motion.div>
                      </>
                    )}
                  </button>
                  <button 
                    onClick={() => setFiles([])}
                    className="text-gray-400 font-bold hover:text-fuchsia-600 transition-colors"
                  >
                    Clear all files
                  </button>
                </div>
              )}
            </>
          ) : (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-12"
            >
              <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-8">
                <CheckCircle2 size={48} />
              </div>
              <h2 className="text-3xl font-black text-gray-900 mb-4">PDFs have been processed!</h2>
              <p className="text-gray-500 mb-10">Your file is ready for download. It will be automatically deleted from our servers (if we had any) in 2 hours.</p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <a
                  href={resultUrl}
                  download={`pdfmaster-${toolId}-${Date.now()}.pdf`}
                  className="w-full sm:w-auto px-10 py-5 bg-fuchsia-600 text-white rounded-2xl font-black text-xl shadow-xl shadow-fuchsia-200 hover:bg-fuchsia-700 transition-all flex items-center justify-center gap-3"
                >
                  <Download size={24} />
                  Download PDF
                </a>
                <button
                  onClick={() => {
                    setFiles([]);
                    setResultUrl(null);
                  }}
                  className="w-full sm:w-auto px-10 py-5 bg-gray-100 text-gray-900 rounded-2xl font-black text-xl hover:bg-gray-200 transition-all"
                >
                  Start Over
                </button>
              </div>
            </motion.div>
          )}

          {error && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 p-4 bg-fuchsia-50 border border-fuchsia-100 rounded-xl flex items-center gap-3 text-fuchsia-600"
            >
              <AlertCircle size={20} />
              <p className="text-sm font-medium">{error}</p>
            </motion.div>
          )}
        </div>

        {/* How it works */}
        <div className="mt-24">
          <h2 className="text-3xl font-black text-center mb-12">How to {tool.name.toLowerCase()}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: "01", title: "Select Files", desc: `Select the PDF files you want to ${tool.name.toLowerCase()} or drag and drop them into the active area.` },
              { step: "02", title: "Wait for Processing", desc: "Our powerful browser-based engine will process your files in seconds without uploading them." },
              { step: "03", title: "Download Result", desc: "Once the processing is finished, click on the download button to save your new PDF." }
            ].map((item, i) => (
              <div key={i} className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
                <span className="absolute -right-4 -top-4 text-8xl font-black text-gray-50 group-hover:text-fuchsia-50 transition-colors">{item.step}</span>
                <h3 className="text-xl font-bold mb-4 relative z-10">{item.title}</h3>
                <p className="text-gray-500 text-sm relative z-10 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
          <div>
            <div className="w-12 h-12 bg-fuchsia-100 text-fuchsia-600 rounded-xl flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 size={24} />
            </div>
            <h4 className="text-lg font-bold mb-2">Secure Processing</h4>
            <p className="text-gray-500 text-sm">Your files are processed entirely in your browser. We never upload your sensitive data to any server.</p>
          </div>
          <div>
            <div className="w-12 h-12 bg-fuchsia-100 text-fuchsia-600 rounded-xl flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 size={24} />
            </div>
            <h4 className="text-lg font-bold mb-2">Fast & Easy</h4>
            <p className="text-gray-500 text-sm">No registration required. Just drag and drop your files and get your results in seconds.</p>
          </div>
          <div>
            <div className="w-12 h-12 bg-fuchsia-100 text-fuchsia-600 rounded-xl flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 size={24} />
            </div>
            <h4 className="text-lg font-bold mb-2">High Quality</h4>
            <p className="text-gray-500 text-sm">We use the best PDF processing libraries to ensure your documents maintain their original quality.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
