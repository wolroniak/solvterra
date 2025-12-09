'use client';

import { useState } from 'react';
import { Tag, X, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface TagsSectionProps {
  tags: string[];
  onChange: (tags: string[]) => void;
}

const SUGGESTED_TAGS = [
  'outdoor',
  'digital',
  'social-media',
  'vor-ort',
  'team',
  'schnell',
  'umwelt',
  'bildung',
  'sozial',
  'tiere',
  'gesundheit',
  'kultur',
  'recherche',
  'kreativ',
  'umfrage',
];

export function TagsSection({ tags, onChange }: TagsSectionProps) {
  const [newTag, setNewTag] = useState('');

  const addTag = () => {
    const tagToAdd = newTag.trim().toLowerCase();
    if (tagToAdd && !tags.includes(tagToAdd)) {
      onChange([...tags, tagToAdd]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    onChange(tags.filter((t) => t !== tagToRemove));
  };

  const addSuggestedTag = (tag: string) => {
    if (!tags.includes(tag)) {
      onChange([...tags, tag]);
    }
  };

  const availableSuggestions = SUGGESTED_TAGS.filter((t) => !tags.includes(t));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Tag className="h-5 w-5 text-primary-500" />
          Tags
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Tags */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Aktuelle Tags
          </label>
          <div className="flex flex-wrap gap-2 min-h-[40px] p-3 bg-slate-50 rounded-lg">
            {tags.length === 0 ? (
              <span className="text-sm text-slate-400">Noch keine Tags hinzugefügt</span>
            ) : (
              tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="outline"
                  className="flex items-center gap-1 pr-1"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="ml-1 hover:text-red-500"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))
            )}
          </div>
        </div>

        {/* Add New Tag */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Neuen Tag hinzufügen
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              placeholder="z.B. teamwork, natur, recycling"
              className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addTag();
                }
              }}
            />
            <Button type="button" variant="outline" onClick={addTag}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Suggested Tags */}
        {availableSuggestions.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Vorschläge
            </label>
            <div className="flex flex-wrap gap-2">
              {availableSuggestions.slice(0, 10).map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => addSuggestedTag(tag)}
                  className="px-2 py-1 text-xs border rounded-full hover:bg-primary-50 hover:border-primary-300 transition-colors"
                >
                  + {tag}
                </button>
              ))}
            </div>
          </div>
        )}

        <p className="text-xs text-slate-500">
          Tags helfen Studenten, passende Challenges zu finden. Verwende relevante
          Schlüsselwörter.
        </p>
      </CardContent>
    </Card>
  );
}
