import { useEffect, useRef, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import TextField from './TextField';
import ErrorMessage from './ErrorMessage';
import { searchPlaces, resolvePlace } from '../services/mapsService';
import { validPoint } from '../utils/route';
import { theme } from '../theme';

function newSession() { return `${Date.now().toString(36)}_${Math.random().toString(36).slice(2)}_${Math.random().toString(36).slice(2)}`.slice(0, 36); }
export default function PlaceField({ label, value, selected, onChangeText, onSelect }) {
  const [suggestions, setSuggestions] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const version = useRef(0);
  const session = useRef(newSession());
  useEffect(() => { version.current += 1; }, [value, selected]);
  useEffect(() => {
    if (selected || value.trim().length < 3) return;
    let active = true;
    const timer = setTimeout(() => {
      setLoading(true);
      searchPlaces(value.trim(), session.current).then((result) => {
        if (active) { setSuggestions(result.suggestions); setError(result.suggestions.length ? '' : 'No places found. Try another search or select on the map.'); }
      }).catch((failure) => { if (active) setError(failure.message); })
        .finally(() => { if (active) setLoading(false); });
    }, 400);
    return () => { active = false; clearTimeout(timer); };
  }, [value, selected]);
  useEffect(() => () => { version.current += 1; }, []);
  function edit(text) {
    version.current += 1;
    setSuggestions([]); setError(''); setLoading(false);
    onChangeText(text);
  }
  async function choose(suggestion) {
    const current = ++version.current;
    setLoading(true); setError(''); setSuggestions([]);
    try {
      const place = await resolvePlace(suggestion.placeId, session.current);
      if (current !== version.current) return;
      if (!validPoint(place)) throw new Error('This place has no valid coordinates. Select another result.');
      session.current = newSession();
      onSelect(place);
    } catch (failure) { if (current === version.current) setError(failure.message); }
    finally { if (current === version.current) setLoading(false); }
  }
  return <View>
    <TextField label={label} value={value} onChangeText={edit} autoCorrect={false} placeholder="Search for a place" />
    {loading && !selected ? <Text accessibilityLiveRegion="polite" style={{ color: theme.colors.textSecondary }}>Finding location…</Text> : null}
    {!selected && suggestions.map((suggestion) => <Pressable key={suggestion.placeId} accessibilityRole="button" onPress={() => choose(suggestion)}
      style={{ padding: theme.spacing.sm, minHeight: 48, justifyContent: 'center', borderBottomWidth: 1, borderColor: theme.colors.border }}>
      <Text style={{ ...theme.typography.caption, color: theme.colors.text }}>{suggestion.label}</Text>
    </Pressable>)}
    <ErrorMessage message={selected ? '' : error} />
    {!selected && value.length > 0 && value.trim().length < 3 ? <Text style={{ color: theme.colors.textSecondary }}>Enter at least 3 characters, or select on the map.</Text> : null}
  </View>;
}
