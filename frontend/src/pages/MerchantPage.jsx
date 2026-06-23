import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { EmptyState } from '../components/EmptyState';
import { MerchantCard } from '../components/MerchantCard';
import { PageHeader } from '../components/PageHeader';
import { useAuthGuard } from '../hooks/useAuthGuard';

const normalizeMerchant = (merchant) => ({
  ...merchant,
  items: Array.isArray(merchant.items) ? merchant.items : [],
  favorite: Boolean(merchant.favorite),
  current: Boolean(merchant.current),
});

const extractPayload = (response) => response?.data?.data ?? response?.data ?? [];

const applyRegionFilter = (list, region) => {
  const normalizedRegion = String(region ?? '').trim().toLowerCase();
  if (!normalizedRegion) {
    return list;
  }

  return list.filter((item) => String(item.region ?? '').toLowerCase().includes(normalizedRegion));
};

export const MerchantPage = () => {
  const { requireLogin } = useAuthGuard();
  const [allMerchants, setAllMerchants] = useState([]);
  const [merchants, setMerchants] = useState([]);
  const [currentMerchants, setCurrentMerchants] = useState([]);
  const [region, setRegion] = useState('');
  const [keyword, setKeyword] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentLoading, setCurrentLoading] = useState(false);
  const [error, setError] = useState('');

  const regionOptions = useMemo(
    () =>
      Array.from(
        new Set((allMerchants.length > 0 ? allMerchants : merchants).map((item) => item.region).filter(Boolean)),
      ),
    [allMerchants, merchants],
  );

  const loadMerchants = async (nextRegion = region, nextKeyword = keyword) => {
    setLoading(true);
    setError('');

    try {
      const keywordValue = String(nextKeyword ?? '').trim();
      const regionValue = String(nextRegion ?? '').trim();
      const response = keywordValue
        ? await api.searchMerchants(keywordValue)
        : await api.getMerchants(regionValue || undefined);
      const data = applyRegionFilter(
        extractPayload(response).map(normalizeMerchant),
        regionValue,
      );
      if (!keywordValue && !regionValue) {
        setAllMerchants(data);
      }
      setMerchants(data);
      if (!keywordValue && !regionValue && data.length === 0) {
        setError('No merchant data is available.');
      }
    } catch (exception) {
      setMerchants([]);
      setError(exception?.response?.data?.message || 'Merchant search failed.');
    } finally {
      setLoading(false);
    }
  };

  const loadCurrentMerchants = async (nextRegion = region, nextKeyword = keyword) => {
    setCurrentLoading(true);
    try {
      const response = await api.getCurrentMerchants(String(nextRegion ?? '').trim() || undefined);
      const data = applyRegionFilter(extractPayload(response).map(normalizeMerchant), nextRegion);
      const keywordValue = String(nextKeyword ?? '').trim().toLowerCase();
      const filtered = keywordValue
        ? data.filter((item) =>
            [item.region, item.merchantName, item.description, item.spawnTime, ...(item.items ?? [])]
              .filter(Boolean)
              .some((value) => String(value).toLowerCase().includes(keywordValue)),
          )
        : data;
      setCurrentMerchants(filtered);
    } catch {
      setCurrentMerchants([]);
    } finally {
      setCurrentLoading(false);
    }
  };

  useEffect(() => {
    void loadMerchants();
    void loadCurrentMerchants();
  }, []);

  const updateMerchantLists = (nextMerchant) => {
    setMerchants((current) =>
      current.map((item) => (item.id === nextMerchant.id ? { ...item, ...nextMerchant } : item)),
    );
    setCurrentMerchants((current) =>
      current.map((item) => (item.id === nextMerchant.id ? { ...item, ...nextMerchant } : item)),
    );
  };

  const handleSearch = async (event) => {
    event.preventDefault();
    await loadMerchants(region, keyword);
    await loadCurrentMerchants(region, keyword);
  };

  const handleFavorite = async (merchant) => {
    if (!requireLogin()) {
      return;
    }

    try {
      const response = merchant.favorite
        ? await api.unfavoriteMerchant(merchant.id)
        : await api.favoriteMerchant(merchant.id);
      const nextMerchant = normalizeMerchant(extractPayload(response));
      updateMerchantLists(nextMerchant);
    } catch (exception) {
      setError(exception?.response?.data?.message || 'Failed to update favorite.');
    }
  };

  const handleOpenMerchant = (merchant) => {
    window.alert([merchant.merchantName, merchant.description, merchant.items.join(', ')].join('\n'));
  };

  return (
    <div className="page-stack merchant-page">
      <PageHeader
        title="Wandering Merchants"
        description="Browse merchants from the internal merchant table, filter by region, and favorite the ones you use most."
        action={
          <Button as={Link} to="/market" variant="secondary">
            Market prices
          </Button>
        }
      />

      <Card className="search-card merchant-page__filters">
        <form className="merchant-filters" onSubmit={handleSearch}>
          <input
            className="input"
            placeholder="Search merchant name or item"
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
          />
          <select className="input" value={region} onChange={(event) => setRegion(event.target.value)}>
            <option value="">All regions</option>
            {regionOptions.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
          <Button type="submit">{loading ? 'Searching...' : 'Search'}</Button>
        </form>
        {error ? <p className="form-footnote auth-message auth-message--error">{error}</p> : null}
      </Card>

      <section className="section-stack">
        <div className="section-stack__header">
          <h2>Current merchants</h2>
          <span>{currentLoading ? 'Loading...' : `${currentMerchants.length} merchants`}</span>
        </div>
        {currentLoading ? (
          <Card className="loading-state">
            <h2 className="loading-state__title">Loading current merchants.</h2>
            <p className="loading-state__desc">Please wait while the current merchant list is loaded.</p>
          </Card>
        ) : currentMerchants.length > 0 ? (
          <section className="grid grid-3">
            {currentMerchants.map((merchant) => (
              <MerchantCard
                key={merchant.id}
                merchant={merchant}
                onFavorite={() => handleFavorite(merchant)}
                onOpen={() => handleOpenMerchant(merchant)}
              />
            ))}
          </section>
        ) : (
          <EmptyState
            title="No current merchants"
            description="There are no merchants matching the current time or filters."
          />
        )}
      </section>

      <section className="section-stack">
        <div className="section-stack__header">
          <h2>All merchants</h2>
          <span>{loading ? 'Loading...' : `${merchants.length} merchants`}</span>
        </div>
        {loading ? (
          <Card className="loading-state">
            <h2 className="loading-state__title">Loading merchants.</h2>
            <p className="loading-state__desc">Please wait while the merchant list is loaded.</p>
          </Card>
        ) : merchants.length > 0 ? (
          <section className="grid grid-3">
            {merchants.map((merchant) => (
              <MerchantCard
                key={merchant.id}
                merchant={merchant}
                onFavorite={() => handleFavorite(merchant)}
                onOpen={() => handleOpenMerchant(merchant)}
              />
            ))}
          </section>
        ) : (
          <EmptyState
            title="No merchant results"
            description="Try a different keyword or region."
          />
        )}
      </section>
    </div>
  );
};
