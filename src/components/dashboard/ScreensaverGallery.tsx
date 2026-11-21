import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SCREENSAVER_CATALOG } from '../../utils/screensaverCatalog';
import { ScreensaverCard } from './ScreensaverCard';
import { useAppStore } from '../../store/useAppStore';
import { Search, SlidersHorizontal, Sparkles } from 'lucide-react';

export const ScreensaverGallery: React.FC = () => {
  const { currentTab, settings } = useAppStore();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const categories = [
    { id: 'all', label: 'All Environments' },
    { id: 'cinematic', label: 'Cinematic 3D' },
    { id: 'relaxing', label: 'Relaxing' },
    { id: 'nature', label: 'Nature' },
    { id: 'ultra-low', label: 'OLED Standby' },
    { id: 'abstract', label: 'Abstract' }
  ];

  const filteredItems = SCREENSAVER_CATALOG.filter((item) => {
    if (currentTab === 'favorites' && !settings.favorites.includes(item.id)) {
      return false;
    }
    if (selectedCategory !== 'all' && item.category !== selectedCategory) {
      return false;
    }
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      return (
        item.title.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.tag.toLowerCase().includes(q) ||
        item.engine.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Category Pills & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {categories.map((cat) => {
            const isActive = selectedCategory === cat.id;
            return (
              <motion.button
                key={cat.id}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-sky-500/20 text-sky-200 border border-sky-400/50 shadow-[0_0_16px_rgba(56,189,248,0.25)]'
                    : 'bg-white/[0.04] text-slate-300 hover:text-white hover:bg-white/[0.08] border border-white/[0.06]'
                }`}
              >
                {cat.label}
              </motion.button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search environments or engines..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.09] text-xs text-white placeholder-slate-400 focus:outline-none focus:border-sky-400/70 focus:bg-white/[0.07] focus:shadow-[0_0_18px_rgba(56,189,248,0.2)] transition-all backdrop-blur-md"
          />
        </div>
      </div>

      {/* Grid of Holographic Portals */}
      {filteredItems.length > 0 ? (
        <motion.div
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <AnimatePresence>
            {filteredItems.map((item) => (
              <ScreensaverCard key={item.id} item={item} />
            ))}
          </AnimatePresence>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="py-20 text-center rounded-2xl border border-dashed border-white/15 p-8 bg-white/[0.01] backdrop-blur-md"
        >
          <SlidersHorizontal className="w-10 h-10 text-slate-400 mx-auto mb-3" />
          <h3 className="text-base font-display font-semibold text-white">No environments match your criteria</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Try adjusting your search query or switching categories to explore other available ambient modes.
          </p>
        </motion.div>
      )}
    </div>
  );
};
export default ScreensaverGallery;
