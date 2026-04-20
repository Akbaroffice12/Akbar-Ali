import { PDFTool } from './types';

export const TOOLS: PDFTool[] = [
  // ORGANIZE PDF
  { id: 'merge', name: 'Merge PDF', description: 'Combine PDFs in the order you want with the easiest PDF merger available.', icon: 'Merge', category: 'ORGANIZE', color: 'bg-fuchsia-500' },
  { id: 'split', name: 'Split PDF', description: 'Separate one page or a whole set for easy conversion into independent PDF files.', icon: 'Scissors', category: 'ORGANIZE', color: 'bg-fuchsia-400' },
  { id: 'organize', name: 'Organize PDF', description: 'Sort pages of your PDF file however you like. Delete PDF pages or add PDF pages to your document at your convenience.', icon: 'Layout', category: 'ORGANIZE', color: 'bg-purple-600' },
  { id: 'remove-pages', name: 'Delete Pages', description: 'Remove pages from your PDF document with ease.', icon: 'Trash2', category: 'ORGANIZE', color: 'bg-fuchsia-600' },
  { id: 'rotate', name: 'Rotate PDF', description: 'Rotate your PDFs the way you need them. You can even rotate multiple PDFs at once!', icon: 'RotateCw', category: 'ORGANIZE', color: 'bg-pink-500' },
  { id: 'scan-to-pdf', name: 'Scan to PDF', description: 'Capture document scans from your mobile device and send them instantly to your browser.', icon: 'Smartphone', category: 'ORGANIZE', color: 'bg-purple-500' },
  
  // OPTIMIZE PDF
  { id: 'compress', name: 'Compress PDF', description: 'Reduce file size while optimizing for maximal PDF quality.', icon: 'Minimize2', category: 'OPTIMIZE', color: 'bg-orange-500' },
  { id: 'repair', name: 'Repair PDF', description: 'Repair a damaged PDF and recover data from corrupt PDF. Fix PDF files with our Repair tool.', icon: 'Wrench', category: 'OPTIMIZE', color: 'bg-orange-400' },
  { id: 'ocr', name: 'OCR PDF', description: 'Easily convert scanned PDF into searchable and selectable documents.', icon: 'Search', category: 'OPTIMIZE', color: 'bg-orange-600' },

  // CONVERT PDF
  { id: 'pdf-to-word', name: 'PDF to Word', description: 'Easily convert your PDF files into easy to edit DOC and DOCX documents. The converted WORD document is almost 100% accurate.', icon: 'FileText', category: 'CONVERT', color: 'bg-blue-500' },
  { id: 'pdf-to-ppt', name: 'PDF to PowerPoint', description: 'Turn your PDF files into easy to edit PPT and PPTX slideshows.', icon: 'Presentation', category: 'CONVERT', color: 'bg-orange-600' },
  { id: 'pdf-to-excel', name: 'PDF to Excel', description: 'Pull data straight from PDFs into Excel spreadsheets in a few short seconds.', icon: 'FileSpreadsheet', category: 'CONVERT', color: 'bg-green-600' },
  { id: 'word-to-pdf', name: 'Word to PDF', description: 'Make DOC and DOCX files easy to read by converting them to PDF.', icon: 'FileText', category: 'CONVERT', color: 'bg-blue-400' },
  { id: 'ppt-to-pdf', name: 'PowerPoint to PDF', description: 'Make PPT and PPTX slideshows easy to view by converting them to PDF.', icon: 'Presentation', category: 'CONVERT', color: 'bg-orange-500' },
  { id: 'excel-to-pdf', name: 'Excel to PDF', description: 'Make EXCEL spreadsheets easy to read by converting them to PDF.', icon: 'FileSpreadsheet', category: 'CONVERT', color: 'bg-green-500' },
  { id: 'pdf-to-jpg', name: 'PDF to JPG', description: 'Convert each PDF page into a JPG or extract all images contained in a PDF.', icon: 'Image', category: 'CONVERT', color: 'bg-yellow-500' },
  { id: 'jpg-to-pdf', name: 'JPG to PDF', description: 'Convert JPG images to PDF in seconds. Easily adjust orientation and margins.', icon: 'FileImage', category: 'CONVERT', color: 'bg-yellow-600' },
  { id: 'html-to-pdf', name: 'HTML to PDF', description: 'Convert webpages in HTML to PDF. Copy and paste the URL of the page you want and convert it to PDF with a click.', icon: 'Globe', category: 'CONVERT', color: 'bg-indigo-500' },
  { id: 'pdf-to-pdfa', name: 'PDF to PDF/A', description: 'Transform your PDF to PDF/A, the ISO-standardized version of PDF for long-term archiving.', icon: 'Archive', category: 'CONVERT', color: 'bg-slate-600' },

  // EDIT PDF
  { id: 'edit', name: 'Edit PDF', description: 'Add text, images, shapes or freehand annotations to a PDF document. Edit the size, font, and color of the added content.', icon: 'Edit3', category: 'EDIT', color: 'bg-blue-600' },
  { id: 'sign', name: 'Sign PDF', description: 'Sign yourself or request electronic signatures from others.', icon: 'PenTool', category: 'EDIT', color: 'bg-purple-500' },
  { id: 'watermark', name: 'Watermark', description: 'Stamp an image or text over your PDF in seconds. Choose the typography, transparency and position.', icon: 'Stamp', category: 'EDIT', color: 'bg-teal-500' },
  { id: 'page-numbers', name: 'Page numbers', description: 'Add page numbers into PDFs with ease. Choose your positions, dimensions, typography.', icon: 'Hash', category: 'EDIT', color: 'bg-cyan-500' },
  { id: 'crop', name: 'Crop PDF', description: 'Crop margins of PDF documents or select specific areas, then apply the changes to one page or the whole document.', icon: 'Crop', category: 'EDIT', color: 'bg-pink-600' },

  // PDF SECURITY
  { id: 'unlock', name: 'Unlock PDF', description: 'Remove PDF password security, giving you the freedom to use your PDFs as you want.', icon: 'Unlock', category: 'SECURITY', color: 'bg-gray-700' },
  { id: 'protect', name: 'Protect PDF', description: 'Protect PDF files with a password. Encrypt PDF documents to prevent unauthorized access.', icon: 'Lock', category: 'SECURITY', color: 'bg-gray-800' },
  { id: 'redact', name: 'Redact PDF', description: 'Redact text and graphics to permanently remove sensitive information from a PDF.', icon: 'ShieldAlert', category: 'SECURITY', color: 'bg-red-700' },
  { id: 'compare', name: 'Compare PDF', description: 'Show a side-by-side document comparison and easily spot changes between different file versions.', icon: 'FileSearch', category: 'SECURITY', color: 'bg-blue-700' },

  // PDF INTELLIGENCE
  { id: 'ai-assistant', name: 'AI PDF Assistant', description: 'Chat with your PDF, ask questions, and get summaries using Google Search grounding.', icon: 'Sparkles', category: 'INTELLIGENCE', color: 'bg-gradient-to-br from-purple-600 to-blue-600' },
  { id: 'ai-summarizer', name: 'AI Summarizer', description: 'Quickly generate concise summaries from articles, paragraphs, and essays, providing clear and precise key points in seconds.', icon: 'FileText', category: 'INTELLIGENCE', color: 'bg-gradient-to-br from-blue-500 to-cyan-500' },
  { id: 'ai-translate', name: 'Translate PDF', description: 'Easily translate PDF files powered by AI. Keep fonts, layout, and formatting perfectly intact.', icon: 'Languages', category: 'INTELLIGENCE', color: 'bg-gradient-to-br from-indigo-500 to-purple-500' },
  { id: 'ai-image-gen', name: 'AI Image Studio', description: 'Generate and edit images from text prompts with custom aspect ratios.', icon: 'ImagePlus', category: 'INTELLIGENCE', color: 'bg-gradient-to-br from-pink-500 to-rose-500' },
  { id: 'ai-video-gen', name: 'AI Video Creator', description: 'Create stunning videos from text prompts using Veo 3 technology.', icon: 'Video', category: 'INTELLIGENCE', color: 'bg-gradient-to-br from-indigo-500 to-purple-500' },
  { id: 'ai-voice', name: 'AI Voice Lab', description: 'Real-time voice conversations, TTS, and audio transcription.', icon: 'Mic', category: 'INTELLIGENCE', color: 'bg-gradient-to-br from-cyan-500 to-blue-500' },

  // WORKFLOWS
  { id: 'create-workflow', name: 'Create workflow', description: 'Create custom workflows with your favorite tools, automate tasks, and reuse them anytime.', icon: 'Workflow', category: 'WORKFLOWS', color: 'bg-indigo-600' },
];
