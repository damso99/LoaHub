import { useMemo, useState } from 'react';
import { useAppState } from '../context/AppStateContext';
import { Card } from '../components/Card';
import { EmptyState } from '../components/EmptyState';
import { MerchantCard } from '../components/MerchantCard';
import { PageHeader } from '../components/PageHeader';
import { useAuthGuard } from '../hooks/useAuthGuard';

export const MerchantPage = () => {
  const { merchants, toggleMerchantFavorite } = useAppState();
  const { requireLogin } = useAuthGuard();
  const [keyword, setKeyword] = useState('');

  const filtered = useMemo(
    () =>
      merchants.filter(
        (merchant) =>
          merchant.region.includes(keyword) ||
          merchant.merchantName.includes(keyword) ||
          merchant.items.some((item) => item.includes(keyword)),
      ),
    [keyword, merchants],
  );

  return (
    <div className="page-stack">
      <PageHeader
        title="떠돌이 상인"
        description="지역별 상인 출현 시간과 판매 아이템을 이 화면에서 확인합니다."
      />
      <Card className="search-card">
        <input
          className="input"
          placeholder="지역 또는 아이템 검색"
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
        />
      </Card>
      {filtered.length > 0 ? (
        <section className="grid grid-3">
          {filtered.map((merchant) => (
            <MerchantCard
              key={merchant.id}
              merchant={merchant}
              onFavorite={() => {
                if (!requireLogin()) {
                  return;
                }
                toggleMerchantFavorite(merchant.id);
              }}
            />
          ))}
        </section>
      ) : (
        <EmptyState
          title="조건에 맞는 떠돌이 상인 정보가 없습니다."
          description="검색어를 줄이거나 다른 지역을 선택해보세요."
        />
      )}
    </div>
  );
};
