import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAppState } from '../context/AppStateContext';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { CharacterCard } from '../components/CharacterCard';
import { EmptyState } from '../components/EmptyState';
import { Input } from '../components/Input';
import { PageHeader } from '../components/PageHeader';
import { characterSearchResults } from '../data/mockData';
import { useAuthGuard } from '../hooks/useAuthGuard';

export const CharacterSearchPage = () => {
  const { setMainCharacter, searchCharactersLocal } = useAppState();
  const { requireLogin } = useAuthGuard();
  const [searchParams] = useSearchParams();
  const [keyword, setKeyword] = useState('');
  const [results, setResults] = useState(characterSearchResults);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const query = searchParams.get('q');
    if (!query) {
      return;
    }

    setKeyword(query);
    void (async () => {
      setLoading(true);
      try {
        const nextResults = await searchCharactersLocal(query);
        setResults(nextResults.length > 0 ? nextResults : characterSearchResults);
      } finally {
        setLoading(false);
      }
    })();
  }, [searchCharactersLocal, searchParams]);

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
    setLoading(true);
    try {
      const nextResults = await searchCharactersLocal(keyword);
      setResults(nextResults.length > 0 ? nextResults : characterSearchResults);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-stack">
      <PageHeader
        title="캐릭터 검색"
        description="캐릭터명으로 검색하고 대표 캐릭터로 바로 설정할 수 있습니다."
      />

      <Card className="search-card">
        <form className="search-form" onSubmit={handleSearch}>
          <Input
            label="캐릭터명"
            placeholder="예: Guardian Slayer"
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
          />
          <Button type="submit">{loading ? '검색 중' : '검색하기'}</Button>
        </form>
      </Card>

      {loading ? (
        <Card className="loading-state">
          <h2 className="loading-state__title">캐릭터 정보를 불러오는 중입니다.</h2>
          <p className="loading-state__desc">잠시만 기다리면 검색 결과 카드가 표시됩니다.</p>
        </Card>
      ) : filteredResults.length > 0 ? (
        <section className="grid grid-2">
          {filteredResults.map((character) => (
            <CharacterCard
              key={character.id}
              character={character}
              onSetMain={(nextCharacter) => {
                if (!requireLogin()) {
                  return;
                }
                setMainCharacter(nextCharacter);
              }}
              onTrack={() => undefined}
            />
          ))}
        </section>
      ) : (
        <EmptyState
          title="캐릭터를 찾지 못했습니다."
          description="캐릭터명을 다시 확인한 뒤 검색해보세요."
        />
      )}
    </div>
  );
};
