export type ToolCategory = 'ORGANIZE' | 'OPTIMIZE' | 'CONVERT' | 'EDIT' | 'SECURITY' | 'INTELLIGENCE' | 'WORKFLOWS';

export interface PDFTool {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: ToolCategory;
  color: string;
}
