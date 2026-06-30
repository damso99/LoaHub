import { useState } from 'react';
import { api } from '../api/client';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { EmptyState } from '../components/EmptyState';
import { Input } from '../components/Input';
import { MarketItemCard } from '../components/MarketItemCard';
import { PageHeader } from '../components/PageHeader';

export const MarketPage = () => {
  const [keyword, setKeyword] = useState('');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [searched, setSearched] = useState(false);

  const handleSearch = async (event) => {
    event.preventDefault();
    const normalized = String(keyword ?? '').trim();
    if (!normalized) {
      setItems([]);
      setErrorMessage('Please enter an item name.');
      setSearched(false);
      return;
    }

    setLoading(true);
    setErrorMessage('');
    setSearched(true);
    try {
      const response = await api.searchMarketItems(normalized);
      const data = response?.data?.data ?? response?.data ?? [];
      setItems(Array.isArray(data) ? data : []);
    } catch (exception) {
      setItems([]);
      setSearched(true);
      const status = exception?.response?.status;
      if (status === 504) {
        setErrorMessage('Lost Ark API response timed out.');
      } else if (status === 429) {
        setErrorMessage('Lost Ark API rate limit was exceeded.');
      } else {
        setErrorMessage(exception?.response?.data?.message || 'Market search failed.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-stack market-page">
      <PageHeader
        title="Market prices"
        description="Search item prices from the Lost Ark Open API through the backend."
      />

      <Card className="search-card">
        <form className="search-form market-search-form" onSubmit={handleSearch}>
          <Input
            label="Item name"
            placeholder="e.g. Destruction Stone"
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
          />
          <Button type="submit">{loading ? 'Searching...' : 'Search'}</Button>
        </form>
      </Card>

      {errorMessage ? <EmptyState title="Search failed" description={errorMessage} /> : null}

      {loading ? (
        <Card className="loading-state">
          <h2 className="loading-state__title">Loading market prices.</h2>
          <p className="loading-state__desc">Please wait while the search results are being loaded.</p>
        </Card>
      ) : items.length > 0 ? (
        <section className="grid grid-2">
          {items.map((item) => (
            <MarketItemCard key={`${item.itemId}-${item.itemName}`} item={item} />
          ))}
        </section>
      ) : searched ? (
        <EmptyState title="No results found" description="Try a different item name." />
      ) : null}
    </div>
  );
};
