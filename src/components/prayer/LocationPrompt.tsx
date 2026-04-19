'use client';

import { useState, useCallback } from 'react';
import { Search, MapPin, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useSettingsStore } from '@/store/settings-store';
import { TRANSLATIONS } from '@/lib/constants';

interface LocationPromptProps {
  error?: string | null;
  onRetry?: () => void;
}

export function LocationPrompt({ error, onRetry }: LocationPromptProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Array<{ lat: number; lng: number; name: string }>>([]);
  const [isSearching, setIsSearching] = useState(false);
  const setLocation = useSettingsStore((s) => s.setLocation);
  const language = useSettingsStore((s) => s.language);
  const t = TRANSLATIONS[language];

  const searchCity = useCallback(async () => {
    if (!query.trim()) return;
    setIsSearching(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5&accept-language=${language === 'ar' ? 'ar' : 'en'}`
      );
      const data = await res.json();
      setResults(
        data.map((r: Record<string, string>) => ({
          lat: parseFloat(r.lat),
          lng: parseFloat(r.lon),
          name: r.display_name?.split(',').slice(0, 2).join(', ') || r.display_name,
        }))
      );
    } catch {
      setResults([]);
    }
    setIsSearching(false);
  }, [query, language]);

  const selectCity = (lat: number, lng: number, name: string) => {
    setLocation(lat, lng, name);
    setResults([]);
    setQuery('');
  };

  return (
    <div className="space-y-4 rounded-xl border border-zad-border bg-zad-surface p-6 text-center">
      <MapPin size={32} className="mx-auto text-zad-gold" />
      <p className="text-sm text-text-secondary">{error || t.locationDenied}</p>

      <div className="flex gap-2">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && searchCity()}
          placeholder={t.selectCity}
          className="border-zad-border bg-zad-midnight text-text-primary placeholder:text-text-muted"
        />
        <Button
          onClick={searchCity}
          disabled={isSearching}
          variant="outline"
          className="border-zad-gold/30 text-zad-gold hover:bg-zad-gold-muted"
        >
          {isSearching ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Search className="h-4 w-4" />
          )}
        </Button>
      </div>

      {results.length > 0 && (
        <div className="max-h-48 space-y-1 overflow-y-auto custom-scrollbar">
          {results.map((r, i) => (
            <button
              key={i}
              onClick={() => selectCity(r.lat, r.lng, r.name)}
              className="w-full rounded-lg border border-zad-border px-3 py-2 text-right text-sm text-text-secondary transition-colors hover:bg-zad-gold-muted hover:text-text-primary"
            >
              {r.name}
            </button>
          ))}
        </div>
      )}

      {onRetry && (
        <Button
          onClick={onRetry}
          variant="ghost"
          className="text-text-muted hover:text-text-secondary"
        >
          {t.retry}
        </Button>
      )}
    </div>
  );
}
