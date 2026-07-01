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
  const [errorType, setErrorType] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const runSearch = useCallback(
    async (value) => {
      const query = String(value ?? '').trim();
      if (!query) {
        setResults([]);
        setErrorType('empty');
        setErrorMessage('캐릭터 이름을 입력해 주세요.');
        return;
      }

      setLoading(true);
      setErrorType('');
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
          setErrorType('empty-result');
          setErrorMessage('검색 결과가 없습니다.');
        }
      } catch (error) {
        const isTimeout =
          error?.code === 'ECONNABORTED' ||
          String(error?.message ?? '').toLowerCase().includes('timeout');
        setErrorType(isTimeout ? 'timeout' : 'failure');
        setResults([]);
        setErrorMessage(
          isTimeout
            ? '검색 시간이 초과되었습니다. 잠시 후 다시 시도해 주세요.'
            : error?.response?.data?.message ||
              error?.response?.data?.detail ||
              error?.message ||
              '캐릭터 검색에 실패했습니다.',
        );
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
      <PageHeader title="캐릭터 검색" description="캐릭터 이름으로 로스트아크 서버 검색 결과를 확인합니다." />

      <Card className="search-card">
        <form className="search-form" onSubmit={handleSearch}>
          <Input
            label="캐릭터 이름"
            placeholder="예: Damso"
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
          />
          <Button type="submit">{loading ? '검색 중...' : '검색'}</Button>
        </form>
      </Card>

      {loading ? (
        <Card className="loading-state">
          <h2 className="loading-state__title">캐릭터 정보를 불러오는 중입니다.</h2>
          <p className="loading-state__desc">잠시만 기다려 주세요.</p>
        </Card>
      ) : errorMessage ? (
        <EmptyState
          title={
            errorType === 'empty-result'
              ? '검색 결과가 없습니다.'
              : errorType === 'timeout'
                ? '검색 시간이 초과되었습니다.'
                : '검색 실패'
          }
          description={errorMessage}
        />
      ) : filteredResults.length > 0 ? (
        <section className="grid grid-2">
          {filteredResults.map((character) => (
            <CharacterCard
              key={`${character.characterName}-${character.serverName}`}
              character={character}
              onSetMain={(nextCharacter) => {
                if (!requireLogin()) {
                  return;
                }
                void setMainCharacter(nextCharacter);
              }}
            />
          ))}
        </section>
      ) : (
        <EmptyState title="검색 결과 없음" description="캐릭터 이름을 입력하고 검색해 주세요." />
      )}
    </div>
  );
};
