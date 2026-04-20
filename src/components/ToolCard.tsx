import React from 'react';
import * as Icons from 'lucide-react';
import { PDFTool } from '../types';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';

interface ToolCardProps {
  tool: PDFTool;
  onSelect: (id: string) => void;
}

export const ToolCard: React.FC<ToolCardProps> = ({ tool, onSelect }) => {
  const Icon = (Icons as any)[tool.icon] || Icons.File;

  return (
    <button onClick={() => onSelect(tool.id)} className="w-full text-left h-full">
      <motion.div
        whileHover={{ y: -5, scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="group relative flex flex-col p-8 bg-white rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl hover:border-fuchsia-200 transition-all duration-300 h-full"
      >
        <div className={cn(
          "w-16 h-16 rounded-2xl flex items-center justify-center mb-6 relative overflow-hidden transition-transform duration-300 group-hover:scale-110",
          "shadow-sm border border-gray-50",
          tool.color.replace('bg-', 'bg-opacity-10 text-').replace('-500', '').replace('-600', '').replace('-400', '').replace('-700', '').replace('-800', '')
        )}>
          <div className="absolute inset-0 bg-white opacity-50" />
          <Icon size={32} className="relative z-10" />
        </div>
        <h3 className="text-2xl font-black text-gray-900 mb-3 group-hover:text-fuchsia-600 transition-colors">
          {tool.name}
        </h3>
        <p className="text-lg text-gray-500 line-clamp-3 leading-relaxed">
          {tool.description}
        </p>
      </motion.div>
    </button>
  );
};
