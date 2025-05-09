// Template Manager - Efficient template lookup and filtering

import { ContentTemplate, SocialPlatform } from '../lib/ai-services';
import enhancedTemplates, { socialPlatforms, toolCategories } from './enhanced-templates';

// Interface for indexed templates by category
interface TemplateIndex {
  [category: string]: ContentTemplate[];
}

/**
 * Creates an index of templates by category for O(1) lookups
 */
export function createTemplateIndex(): TemplateIndex {
  const index: TemplateIndex = {};
  
  enhancedTemplates.forEach(template => {
    if (!index[template.category]) {
      index[template.category] = [];
    }
    
    index[template.category].push(template);
  });
  
  return index;
}

// Singleton instance - created once and reused
const templateIndex = createTemplateIndex();

/**
 * Get templates by category - O(1) lookup instead of filtering
 */
export function getTemplatesByCategory(category: string): ContentTemplate[] {
  return templateIndex[category] || [];
}

/**
 * Find a template by ID
 */
export function getTemplateById(id: number): ContentTemplate | undefined {
  return enhancedTemplates.find(template => template.id === id);
}

/**
 * Find matching templates based on search criteria
 */
export function findTemplates(searchTerm: string): ContentTemplate[] {
  const term = searchTerm.toLowerCase();
  
  return enhancedTemplates.filter(template => 
    template.name.toLowerCase().includes(term) || 
    template.description.toLowerCase().includes(term)
  );
}

/**
 * Get a template suitable for a specific calendar entry
 */
export function getTemplateForCalendarEntry(entry: any): ContentTemplate | null {
  // Find a suitable template based on entry type
  let template = enhancedTemplates.find(t => 
    t.category === 'social' && 
    (t.name.toLowerCase().includes(entry.type?.toLowerCase() || '') || 
     t.name.toLowerCase().includes('announcement'))
  );
  
  // Default to Event Announcement if no specific match
  if (!template) {
    template = enhancedTemplates.find(t => t.id === 2); // Event Announcement
  }
  
  return template || null;
}

/**
 * Pre-fill form values based on a calendar entry and template
 */
export function prefillFormValues(entry: any, template: ContentTemplate): Record<string, string> {
  const fields: Record<string, string> = {};
  
  if (template.name.toLowerCase().includes('event')) {
    fields['eventName'] = entry.title || '';
    fields['date'] = entry.date || '';
    fields['venue'] = entry.notes?.split(' at ')?.[1] || '';
    fields['artists'] = entry.notes?.includes('featuring') 
      ? entry.notes.split('featuring ')[1].split('.')[0] 
      : '';
    fields['genre'] = 'electronic music';
    fields['ticketPrice'] = 'available online';
  } else {
    // Generic pre-fill
    fields['title'] = entry.title || '';
    fields['date'] = entry.date || '';
    fields['content'] = entry.notes || '';
  }
  
  return fields;
}

/**
 * Find a platform by name
 */
export function getPlatformByName(name: string): SocialPlatform | undefined {
  return socialPlatforms.find(p => 
    p.name.toLowerCase() === name.toLowerCase()
  );
}

/**
 * Get category details by ID
 */
export function getCategoryById(id: string) {
  return toolCategories.find(category => category.id === id);
}

export default {
  getTemplatesByCategory,
  getTemplateById,
  findTemplates,
  getTemplateForCalendarEntry,
  prefillFormValues,
  getPlatformByName,
  getCategoryById,
  allTemplates: enhancedTemplates,
  socialPlatforms,
  toolCategories
};
