import React from 'react';
import { TOOLS } from '../constants';
import { ToolCard } from '../components/ToolCard';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';
import { Search, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { ToolCategory } from '../types';
import { Footer } from '../components/layout/Footer';

const CATEGORIES: { id: ToolCategory | 'ALL'; name: string }[] = [
  { id: 'ALL', name: 'All' },
  { id: 'WORKFLOWS', name: 'Workflows' },
  { id: 'ORGANIZE', name: 'Organize PDF' },
  { id: 'OPTIMIZE', name: 'Optimize PDF' },
  { id: 'CONVERT', name: 'Convert PDF' },
  { id: 'EDIT', name: 'Edit PDF' },
  { id: 'SECURITY', name: 'PDF Security' },
  { id: 'INTELLIGENCE', name: 'PDF Intelligence' },
];

export const Home: React.FC<{ onToolSelect: (id: string) => void }> = ({ onToolSelect }) => {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<ToolCategory | 'ALL'>('ALL');

  const filteredTools = TOOLS.filter(tool => {
    const matchesSearch = tool.name.toLowerCase().includes(search.toLowerCase()) ||
                         tool.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === 'ALL' || tool.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative py-12 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-white -z-10" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="mb-6 flex justify-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-tr from-blue-600 to-fuchsia-600 relative overflow-hidden shadow-[0_12px_24px_-8px_rgba(0,0,0,0.5),inset_0_6px_8px_-2px_rgba(255,255,255,0.5),inset_0_-6px_8px_-2px_rgba(0,0,0,0.3)] border border-white/20">
              <div className="absolute inset-0 bg-gradient-to-b from-white/40 to-transparent opacity-60" />
              <span className="text-white font-black text-4xl italic tracking-tighter drop-shadow-[0_3px_5px_rgba(0,0,0,0.5)] relative z-10">AZ</span>
            </div>
          </div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-black text-gray-900 mb-4 tracking-tight"
          >
            AZ PDF <br />
            <span className="text-fuchsia-600 text-2xl md:text-3xl">One App—For Everything</span>
          </motion.h1>

          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-2 mt-8 mb-12">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={cn(
                  "px-6 py-2.5 rounded-full text-sm font-bold transition-all shadow-sm border",
                  activeCategory === cat.id 
                    ? "bg-fuchsia-600 text-white border-fuchsia-600 shadow-fuchsia-200" 
                    : "bg-white text-gray-600 border-gray-100 hover:border-gray-300 hover:bg-gray-50"
                )}
              >
                {cat.name}
              </button>
            ))}
          </div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="relative max-w-2xl mx-auto"
          >
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400" size={24} />
            <input 
              type="text"
              placeholder="Search for tools..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-16 pr-6 py-4 bg-white rounded-2xl shadow-xl shadow-gray-200/50 border-none focus:ring-2 focus:ring-fuchsia-500 transition-all outline-none text-lg font-medium"
            />
          </motion.div>
        </div>
      </section>

      {/* Tools Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredTools.map((tool) => (
            <ToolCard key={tool.id} tool={tool} onSelect={onToolSelect} />
          ))}
        </div>

        {filteredTools.length === 0 && (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-400">
              <Search size={40} />
            </div>
            <p className="text-gray-500 text-xl font-bold">No tools found</p>
            <button 
              onClick={() => { setSearch(''); setActiveCategory('ALL'); }}
              className="mt-4 text-fuchsia-600 font-bold hover:underline"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};
