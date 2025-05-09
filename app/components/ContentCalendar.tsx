'use client';

import React, { useState, useEffect } from 'react';
import { format, parseISO } from 'date-fns';
import { Calendar, Plus, CheckCircle, Edit, Trash, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

interface CalendarEntry {
  id: number;
  date: string;
  title: string;
  type: string;
  platform: string;
  status: 'planned' | 'draft' | 'scheduled' | 'published';
  notes?: string;
}

interface ContentCalendarProps {
  onEntrySelect?: (entry: CalendarEntry) => void;
}

const ContentCalendar: React.FC<ContentCalendarProps> = ({ onEntrySelect }) => {
  const [entries, setEntries] = useState<CalendarEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [activeEntry, setActiveEntry] = useState<CalendarEntry | null>(null);
  
  // Form states for calendar generation
  const [timeframe, setTimeframe] = useState('2 weeks');
  const [contentFocus, setContentFocus] = useState('');
  const [numberOfPosts, setNumberOfPosts] = useState('10');
  const [topicAreas, setTopicAreas] = useState('');
  
  // Form states for individual entry
  const [entryDate, setEntryDate] = useState<Date | null>(new Date());
  const [entryTitle, setEntryTitle] = useState('');
  const [entryType, setEntryType] = useState('post');
  const [entryPlatform, setEntryPlatform] = useState('Instagram');
  const [entryStatus, setEntryStatus] = useState<'planned' | 'draft' | 'scheduled' | 'published'>('planned');
  const [entryNotes, setEntryNotes] = useState('');

  // Fetch calendar entries on component mount
  useEffect(() => {
    fetchCalendarEntries();
  }, []);

  const fetchCalendarEntries = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/calendar');
      if (!response.ok) {
        throw new Error('Failed to fetch calendar entries');
      }
      
      const data = await response.json();
      setEntries(data.entries || []);
    } catch (err: any) {
      console.error('Error fetching calendar entries:', err);
      setError(err.message || 'Failed to load calendar');
    } finally {
      setIsLoading(false);
    }
  };

  const generateCalendar = async () => {
    if (!contentFocus || !topicAreas) {
      setError('Please provide content focus and topic areas');
      return;
    }
    
    setIsGenerating(true);
    setError('');
    
    try {
      const response = await fetch('/api/calendar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'generate',
          timeframe,
          contentFocus,
          numberOfPosts,
          topicAreas,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate calendar');
      }
      
      const data = await response.json();
      setEntries(data.calendar || []);
      setShowForm(false);
      
    } catch (err: any) {
      console.error('Error generating calendar:', err);
      setError(err.message || 'Calendar generation failed. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const addEntry = async () => {
    if (!entryTitle || !entryDate) {
      setError('Title and date are required');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      const formattedDate = format(entryDate, 'yyyy-MM-dd');
      
      const newEntry = {
        date: formattedDate,
        title: entryTitle,
        type: entryType,
        platform: entryPlatform,
        status: entryStatus,
        notes: entryNotes,
      };
      
      const response = await fetch('/api/calendar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'add',
          entry: newEntry,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add entry');
      }
      
      await fetchCalendarEntries();
      resetEntryForm();
      
    } catch (err: any) {
      console.error('Error adding calendar entry:', err);
      setError(err.message || 'Failed to add entry. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const updateEntry = async () => {
    if (!activeEntry) return;
    
    setIsLoading(true);
    setError('');
    
    try {
      const formattedDate = entryDate ? format(entryDate, 'yyyy-MM-dd') : activeEntry.date;
      
      const updatedEntry = {
        id: activeEntry.id,
        date: formattedDate,
        title: entryTitle,
        type: entryType,
        platform: entryPlatform,
        status: entryStatus,
        notes: entryNotes,
      };
      
      const response = await fetch('/api/calendar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'update',
          entry: updatedEntry,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update entry');
      }
      
      await fetchCalendarEntries();
      resetEntryForm();
      
    } catch (err: any) {
      console.error('Error updating calendar entry:', err);
      setError(err.message || 'Failed to update entry. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const deleteEntry = async (id: number) => {
    setIsLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/calendar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'delete',
          entry: { id },
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete entry');
      }
      
      await fetchCalendarEntries();
      
    } catch (err: any) {
      console.error('Error deleting calendar entry:', err);
      setError(err.message || 'Failed to delete entry. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const editEntry = (entry: CalendarEntry) => {
    setActiveEntry(entry);
    setEntryTitle(entry.title);
    setEntryDate(parseISO(entry.date));
    setEntryType(entry.type);
    setEntryPlatform(entry.platform);
    setEntryStatus(entry.status);
    setEntryNotes(entry.notes || '');
    setShowForm(true);
  };

  const resetEntryForm = () => {
    setActiveEntry(null);
    setEntryTitle('');
    setEntryDate(new Date());
    setEntryType('post');
    setEntryPlatform('Instagram');
    setEntryStatus('planned');
    setEntryNotes('');
    setShowForm(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planned': return 'bg-blue-500/20 text-blue-500';
      case 'draft': return 'bg-yellow-500/20 text-yellow-500';
      case 'scheduled': return 'bg-purple-500/20 text-purple-500';
      case 'published': return 'bg-green-500/20 text-green-500';
      default: return 'bg-gray-500/20 text-gray-500';
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'instagram': return 'fab fa-instagram';
      case 'twitter': return 'fab fa-twitter';
      case 'facebook': return 'fab fa-facebook';
      case 'tiktok': return 'fab fa-tiktok';
      case 'youtube': return 'fab fa-youtube';
      default: return 'fas fa-globe';
    }
  };

  return (
    <div className="bg-background-alt rounded-lg border border-border p-5">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <Calendar className="text-secondary mr-2" size={20} />
          <h2 className="text-xl font-semibold text-text-light">Content Calendar</h2>
        </div>
        
        <div className="flex gap-2">
          <button 
            className="bg-background-dark hover:bg-border px-3 py-1 rounded border border-border text-text-light text-sm flex items-center gap-1"
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? 'Cancel' : <><Plus size={16} /> New</>}
          </button>
        </div>
      </div>
      
      {error && (
        <div className="mb-4 text-error text-sm p-3 bg-error/10 border border-error/20 rounded-md">
          {error}
        </div>
      )}
      
      {showForm && (
        <div className="mb-6 p-4 border border-border rounded-lg bg-background-dark">
          <h3 className="text-lg font-medium text-secondary mb-4">
            {activeEntry ? 'Edit Calendar Entry' : 'Create New Calendar Entry'}
          </h3>
          
          {!activeEntry && (
            <div className="mb-6 p-4 border border-border/50 rounded-lg bg-background-alt/50">
              <h4 className="text-md font-medium text-text-light mb-2">Generate Multiple Entries</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-text-light mb-1 text-sm">Timeframe</label>
                  <select 
                    className="w-full bg-background-dark border border-border rounded p-2 text-text-light"
                    value={timeframe}
                    onChange={(e) => setTimeframe(e.target.value)}
                  >
                    <option value="1 week">1 Week</option>
                    <option value="2 weeks">2 Weeks</option>
                    <option value="1 month">1 Month</option>
                    <option value="3 months">3 Months</option>
                  </select>
                </div>
                <div>
                  <label className="block text-text-light mb-1 text-sm">Number of Posts</label>
                  <select 
                    className="w-full bg-background-dark border border-border rounded p-2 text-text-light"
                    value={numberOfPosts}
                    onChange={(e) => setNumberOfPosts(e.target.value)}
                  >
                    <option value="5">5 Posts</option>
                    <option value="10">10 Posts</option>
                    <option value="15">15 Posts</option>
                    <option value="20">20 Posts</option>
                  </select>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-text-light mb-1 text-sm">Content Focus</label>
                  <input 
                    type="text" 
                    className="w-full bg-background-dark border border-border rounded p-2 text-text-light"
                    placeholder="e.g., upcoming events, artist spotlights"
                    value={contentFocus}
                    onChange={(e) => setContentFocus(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-text-light mb-1 text-sm">Topic Areas</label>
                  <input 
                    type="text" 
                    className="w-full bg-background-dark border border-border rounded p-2 text-text-light"
                    placeholder="e.g., techno, house music, local artists"
                    value={topicAreas}
                    onChange={(e) => setTopicAreas(e.target.value)}
                  />
                </div>
              </div>
              
              <button
                className="w-full mt-4 bg-primary hover:bg-primary-hover text-text-light font-medium py-2 px-4 rounded transition-colors flex justify-center items-center"
                onClick={generateCalendar}
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="animate-spin mr-2" size={16} />
                    Generating...
                  </>
                ) : (
                  'Generate Calendar Plan'
                )}
              </button>
            </div>
          )}
          
          <div className="space-y-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-text-light mb-1 text-sm">Title</label>
                <input 
                  type="text" 
                  className="w-full bg-background-dark border border-border rounded p-2 text-text-light"
                  placeholder="Content title"
                  value={entryTitle}
                  onChange={(e) => setEntryTitle(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-text-light mb-1 text-sm">Date</label>
                <DatePicker
                  selected={entryDate}
                  onChange={(date) => setEntryDate(date)}
                  className="w-full bg-background-dark border border-border rounded p-2 text-text-light"
                  dateFormat="yyyy-MM-dd"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-text-light mb-1 text-sm">Content Type</label>
                <select 
                  className="w-full bg-background-dark border border-border rounded p-2 text-text-light"
                  value={entryType}
                  onChange={(e) => setEntryType(e.target.value)}
                >
                  <option value="post">Post</option>
                  <option value="story">Story</option>
                  <option value="video">Video</option>
                  <option value="article">Article</option>
                  <option value="newsletter">Newsletter</option>
                </select>
              </div>
              <div>
                <label className="block text-text-light mb-1 text-sm">Platform</label>
                <select 
                  className="w-full bg-background-dark border border-border rounded p-2 text-text-light"
                  value={entryPlatform}
                  onChange={(e) => setEntryPlatform(e.target.value)}
                >
                  <option value="Instagram">Instagram</option>
                  <option value="Twitter">Twitter</option>
                  <option value="Facebook">Facebook</option>
                  <option value="TikTok">TikTok</option>
                  <option value="YouTube">YouTube</option>
                  <option value="Website">Website</option>
                </select>
              </div>
              <div>
                <label className="block text-text-light mb-1 text-sm">Status</label>
                <select 
                  className="w-full bg-background-dark border border-border rounded p-2 text-text-light"
                  value={entryStatus}
                  onChange={(e) => setEntryStatus(e.target.value as any)}
                >
                  <option value="planned">Planned</option>
                  <option value="draft">Draft</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="published">Published</option>
                </select>
              </div>
            </div>
            
            <div>
              <label className="block text-text-light mb-1 text-sm">Notes</label>
              <textarea 
                className="w-full bg-background-dark border border-border rounded p-2 text-text-light min-h-[80px]"
                placeholder="Additional notes"
                value={entryNotes}
                onChange={(e) => setEntryNotes(e.target.value)}
              />
            </div>
            
            <div className="flex justify-end gap-2">
              <button 
                className="bg-border hover:bg-border/80 px-4 py-2 rounded-md text-text-light"
                onClick={resetEntryForm}
              >
                Cancel
              </button>
              <button 
                className="bg-primary hover:bg-primary-hover px-4 py-2 rounded-md text-text-light"
                onClick={activeEntry ? updateEntry : addEntry}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin mr-2 inline" size={16} />
                    Saving...
                  </>
                ) : (
                  activeEntry ? 'Update Entry' : 'Add Entry'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {isLoading && !isGenerating ? (
        <div className="flex justify-center items-center p-8">
          <Loader2 className="animate-spin text-secondary" size={24} />
          <span className="ml-2 text-text-muted">Loading calendar...</span>
        </div>
      ) : entries.length === 0 ? (
        <div className="text-center py-8 text-text-muted">
          <Calendar className="mx-auto mb-2 text-text-muted opacity-50" size={32} />
          <p>No calendar entries yet</p>
          <p className="text-sm mt-1">Create a new entry or generate a content plan</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/50 text-text-muted text-left text-sm">
                <th className="pb-2 font-medium">Date</th>
                <th className="pb-2 font-medium">Title</th>
                <th className="pb-2 font-medium">Type</th>
                <th className="pb-2 font-medium">Platform</th>
                <th className="pb-2 font-medium">Status</th>
                <th className="pb-2 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {entries.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).map((entry) => (
                <tr key={entry.id} className="border-b border-border/30 hover:bg-background-dark/50">
                  <td className="py-3 text-text-light">
                    {format(parseISO(entry.date), 'MMM dd, yyyy')}
                  </td>
                  <td className="py-3 text-text-light font-medium">{entry.title}</td>
                  <td className="py-3 text-text-muted capitalize">{entry.type}</td>
                  <td className="py-3">
                    <div className="flex items-center">
                      <i className={`${getPlatformIcon(entry.platform)} text-secondary mr-2`}></i>
                      <span className="text-text-light">{entry.platform}</span>
                    </div>
                  </td>
                  <td className="py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(entry.status)}`}>
                      {entry.status}
                    </span>
                  </td>
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => onEntrySelect && onEntrySelect(entry)}
                        className="text-secondary hover:text-primary transition-colors"
                        title="Select for content generation"
                      >
                        <CheckCircle size={16} />
                      </button>
                      <button 
                        onClick={() => editEntry(entry)}
                        className="text-text-muted hover:text-text-light transition-colors"
                        title="Edit entry"
                      >
                        <Edit size={16} />
                      </button>
                      <button 
                        onClick={() => deleteEntry(entry.id)}
                        className="text-text-muted hover:text-error transition-colors"
                        title="Delete entry"
                      >
                        <Trash size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ContentCalendar;
