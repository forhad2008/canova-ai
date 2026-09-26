import React, { useState } from 'react';
import {
  Search,
  Image,
  Code2,
  FileEdit,
  Languages,
  Video,
  Globe,
  Sparkles,
} from 'lucide-react';
import { AITool } from '../types';
import { soundFx } from '../utils/audio';
import { useRecentSearches } from '../utils/useRecentSearches';
import { RecentSearchChips } from '../components/common/RecentSearchChips';

interface ExploreProps {
  onSelectTool: (tool: AITool) => void;
}

export const Explore: React.FC<ExploreProps> = ({ onSelectTool }) => {
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const { recentSearches, addSearch, removeSearch, clearSearches } = useRecentSearches(
    'nova_recent_searches_explore',
    ['Image Generator', 'Code Assistant', 'Translator']
  );

  const tools: AITool[] = [
    {
      id: 'image-gen',
      title: 'Image Generator',
      description: 'Create stunning images',
      category: 'Design',
      accentColor: '#D66BFF',
    },
    {
      id: 'code-assistant',
      title: 'Code Assistant',
      description: 'Write better code',
      category: 'Development',
      accentColor: '#35C9FF',
    },
    {
      id: 'note-maker',
      title: 'Note Maker',
      description: 'Capture your thoughts',
      category: 'Productivity',
      accentColor: '#8B5CFF',
    },
    {
      id: 'translator',
      title: 'Translator',
      description: 'Break language barriers',
      category: 'Productivity',
      accentColor: '#35C9FF',
    },
    {
      id: 'video-editor',
      title: 'Video Editor',
      description: 'Edit your videos',
      category: 'Design',
      accentColor: '#D66BFF',
    },
    {
      id: 'web-search',
      title: 'Web Search',
      description: 'Find anything',
      category: 'Search',
      accentColor: '#35C9FF',
    },
  ];

  const categories = ['All', 'Productivity', 'Design', 'Develop'];

  const filteredTools = tools.filter((tool) => {
    const matchesCategory =
      activeCategory === 'All' || tool.category.toLowerCase().includes(activeCategory.toLowerCase());
    const matchesSearch =
      tool.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getToolIcon = (id: string, color: string) => {
    switch (id) {
      case 'image-gen':
        return <Image size={20} color={color} />;
      case 'code-assistant':
        return <Code2 size={20} color={color} />;
      case 'note-maker':
        return <FileEdit size={20} color={color} />;
      case 'translator':
        return <Languages size={20} color={color} />;
      case 'video-editor':
        return <Video size={20} color={color} />;
      case 'web-search':
        return <Globe size={20} color={color} />;
      default:
        return <Sparkles size={20} color={color} />;
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      soundFx.playClick();
      addSearch(searchQuery.trim());
      setIsSearchFocused(false);
    }
  };

  const handleSelectRecentSearch = (term: string) => {
    setSearchQuery(term);
    addSearch(term);
    setIsSearchFocused(false);
  };

  return (
    <div className="relative flex flex-col space-y-4 px-5 py-4 pb-28 text-left select-none max-w-2xl mx-auto w-full">
      {/* 1. Header */}
      <div className="space-y-0.5">
        <h2 className="text-2xl font-extrabold text-black dark:text-white tracking-tight">
          Explore
        </h2>
        <p className="text-xs font-semibold text-slate-800 dark:text-[#9AA8C7]">
          Powerful tools at your fingertips.
        </p>
      </div>

      {/* 2. Search Tools with Recent Searches Dropdown */}
      <div className="relative w-full z-30">
        <form onSubmit={handleSearchSubmit} className="relative w-full">
          <div className="relative flex items-center">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-700 dark:text-[#657394] pointer-events-none"
            />
            <input
              type="text"
              value={searchQuery}
              onFocus={() => setIsSearchFocused(true)}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tools..."
              className="w-full neu-inset rounded-full py-2.5 pl-10 pr-4 text-xs font-medium text-black dark:text-white placeholder-slate-600 dark:placeholder-[#657394] focus:outline-none focus:ring-1 focus:ring-purple-500/50 transition-all"
            />
          </div>
        </form>

        {/* Recent Searches Chips below search bar */}
        {isSearchFocused && recentSearches.length > 0 && (
          <RecentSearchChips
            searches={recentSearches}
            onSelect={handleSelectRecentSearch}
            onRemove={removeSearch}
            onClear={clearSearches}
            onClose={() => setIsSearchFocused(false)}
          />
        )}
      </div>

      {/* 3. Category Filter Chips */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
        {categories.map((cat) => {
          const isActive = activeCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => {
                soundFx.playClick();
                setActiveCategory(cat);
              }}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-all cursor-pointer ${
                isActive
                  ? 'neu-primary-btn text-white shadow-md'
                  : 'neu-card-subtle text-slate-800 dark:text-[#9AA8C7] hover:text-black dark:hover:text-white border border-black/5 dark:border-white/5'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* 4. 2-Column Neumorphic Grid */}
      <div className="grid grid-cols-2 gap-3.5">
        {filteredTools.length === 0 ? (
          <div className="col-span-2 neu-card rounded-2xl p-6 text-center space-y-2">
            <Sparkles size={20} className="mx-auto text-purple-600 dark:text-purple-400 opacity-60" />
            <p className="text-xs font-semibold text-slate-800 dark:text-[#9AA8C7]">No tools found for "{searchQuery}"</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setActiveCategory('All');
              }}
              className="text-xs font-bold text-purple-700 dark:text-purple-400 underline cursor-pointer"
            >
              Reset filters
            </button>
          </div>
        ) : (
          filteredTools.map((tool) => (
            <button
              key={tool.id}
              onClick={() => {
                soundFx.playClick();
                onSelectTool(tool);
              }}
              className="neu-card rounded-2xl p-4 text-left flex flex-col justify-between space-y-4 cursor-pointer group active:scale-[0.98] transition-all hover:border-purple-500/30"
            >
              {/* Tool Icon inside elevated container */}
              <div
                className="w-11 h-11 rounded-2xl neu-inset flex items-center justify-center border border-black/5 dark:border-white/8 group-hover:scale-105 transition-transform"
                style={{
                  boxShadow: `0 0 16px ${tool.accentColor}25`,
                }}
              >
                {getToolIcon(tool.id, tool.accentColor)}
              </div>

              <div>
                <h4 className="text-sm font-bold text-black dark:text-white group-hover:text-purple-700 dark:group-hover:text-purple-300 transition-colors">
                  {tool.title}
                </h4>
                <p className="text-[11px] text-slate-800 dark:text-[#657394] font-medium mt-1 leading-snug">
                  {tool.description}
                </p>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
};
