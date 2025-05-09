'use client';

import React from 'react';
import { motion } from 'framer-motion';

export interface ToolCategory {
  id: string;
  name: string;
  icon: string;
  description: string;
}

interface CategoryTabsProps {
  categories: ToolCategory[];
  activeCategory: string;
  onCategoryChange: (categoryId: string) => void;
}

const CategoryTabs: React.FC<CategoryTabsProps> = ({
  categories,
  activeCategory,
  onCategoryChange
}) => {
  return (
    <div className="overflow-x-auto pb-2">
      <div className="flex space-x-2">
        {categories.map(category => (
          <motion.button
            key={category.id}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.95 }}
            className={`px-4 py-2 rounded-full flex items-center gap-2 whitespace-nowrap transition-colors ${
              activeCategory === category.id
                ? 'bg-purple-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
            onClick={() => onCategoryChange(category.id)}
          >
            <i className={`${category.icon}`}></i>
            <span>{category.name}</span>
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default CategoryTabs;
