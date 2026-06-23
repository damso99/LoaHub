import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAppState } from '../context/AppStateContext';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { CharacterCard } from '../components/CharacterCard';
import { EmptyState } from '../components/EmptyState';
import { Input } from '../components/Input';
import { PageHeader } from '../components/PageHeader';
import { useAuthGuard } from '../hooks/useAuthGuard';

const normalizeCharacter = (character) => ({
  ...character,
  characterClass: character.characterClass ?? character.characterClassName ?? '',
  itemLevel: character.itemLevel ?? character.itemAvgLevel ?? '',
});

export const CharacterSearchPage = () => {
  const { setMainCharacter, searchCharactersLocal } = useAppState();
  const { requireLogin } = useAuthGuard();
  const [searchParams] = useSearchParams();
  const [keyword, setKeyword] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const runSearch = useCallback(
    async (value) => {
      const query = String(value ?? '').trim();
      if (!query) {
        setResults([]);
        setErrorMessage('Please enter a character name.');
        return;
      }

      setLoading(true);
      setErrorMessage('');
      try {
        const nextResults = await searchCharactersLocal(query);
        const normalizedResults = Array.isArray(nextResults)
          ? nextResults.map(normalizeCharacter)
          : nextResults
            ? [normalizeCharacter(nextResults)]
            : [];
        setResults(normalizedResults);
        if (normalizedResults.length === 0) {
          setErrorMessage('Character not found.');
        }
      } catch (error) {
        const isTimeout =
          error?.code === 'ECONNABORTED' ||
          String(error?.message ?? '').toLowerCase().includes('timeout');
        const message =
          isTimeout
            ? 'Search timed out. The server may still be starting up. Please try again in a moment.'
            : error?.response?.data?.message ||
          error?.response?.data?.detail ||
          error?.message ||
          'Character search failed.';
        setResults([]);
        setErrorMessage(message);
      } finally {
        setLoading(false);
      }
    },
    [searchCharactersLocal],
  );

  useEffect(() => {
    const query = searchParams.get('q');
    if (!query) {
      return;
    }

    setKeyword(query);
    void runSearch(query);
  }, [runSearch, searchParams]);

  const filteredResults = useMemo(() => {
    const normalized = keyword.toLowerCase();
    return results.filter(
      (item) =>
        item.characterName.toLowerCase().includes(normalized) ||
        item.serverName.toLowerCase().includes(normalized) ||
        item.characterClass.toLowerCase().includes(normalized),
    );
  }, [keyword, results]);

  const handleSearch = async (event) => {
    event.preventDefault();
    await runSearch(keyword);
  };

  return (
    <div className="page-stack">
      <PageHeader
        title="Character Search"
        description="Enter a character name to view Lost Ark Open API results."
      />

      <Card className="search-card">
        <form className="search-form" onSubmit={handleSearch}>
          <Input
            label="Character name"
            placeholder="e.g. Damso"
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
          />
          <Button type="submit">{loading ? 'Searching...' : 'Search'}</Button>
        </form>
      </Card>

      {loading ? (
        <Card className="loading-state">
          <h2 className="loading-state__title">Loading character information.</h2>
          <p className="loading-state__desc">Please wait while the search results load.</p>
        </Card>
      ) : errorMessage ? (
        <EmptyState title="Search failed" description={errorMessage} />
      ) : filteredResults.length > 0 ? (
        <section className="grid grid-2">
          {filteredResults.map((character) => (
            <CharacterCard
              key={character.characterName}
              character={character}
              onSetMain={(nextCharacter) => {
                if (!requireLogin()) {
                  return;
                }
                void setMainCharacter(nextCharacter);
              }}
              onTrack={() => undefined}
            />
          ))}
        </section>
      ) : (
        <EmptyState title="No characters yet" description="Enter a character name and search." />
      )}
    </div>
  );
};
