import { Link } from 'react-router-dom';
import { useAppState } from '../context/AppStateContext';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { PageHeader } from '../components/PageHeader';

const formatValue = (value, fallback = '-') => {
  if (value === null || value === undefined || value === '') {
    return fallback;
  }

  return value;
};

export const ProfilePage = () => {
  const { user, profile, logout } = useAppState();

  return (
    <div className="page-stack">
      <PageHeader
        title="마이페이지"
        description="로그인한 계정의 프로필과 대표 캐릭터 정보를 확인합니다."
        action={<Button as={Link} to="/profile/edit">프로필 수정</Button>}
      />

      <Card className="section-card profile-action-card">
        <div className="profile-action-card__content">
          <h2>계정 관리</h2>
          <p>프로필 수정과 대표 캐릭터 변경을 한 곳에서 관리할 수 있습니다.</p>
        </div>
        <div className="profile-action-card__actions">
          <Button variant="secondary" as={Link} to="/character-search">
            캐릭터 검색
          </Button>
          <Button variant="ghost" onClick={logout}>
            로그아웃
          </Button>
        </div>
      </Card>

      <section className="profile-grid">
        <Card className="profile-summary">
          <img
            src={profile?.characterImage || 'https://placehold.co/240x240/162033/7cb8ff?text=LoaHub'}
            alt={profile?.mainCharacterName || '대표 캐릭터'}
            className="profile-summary__image"
          />
          <div className="profile-summary__body">
            <h2>{formatValue(user?.nickname, '게스트')}</h2>
            <p>{formatValue(profile?.bio, '소개글이 없습니다.')}</p>
            <div className="chip-row">
              <Badge tone="primary">{formatValue(profile?.mainCharacterName, '대표 캐릭터 미설정')}</Badge>
              <Badge tone="info">{formatValue(profile?.characterClass, '직업 미설정')}</Badge>
              <Badge tone="warning">아이템 레벨 {formatValue(profile?.itemLevel, '-')}</Badge>
            </div>
          </div>
        </Card>

        <Card className="profile-info">
          <h2>회원 정보</h2>
          <dl className="info-list">
            <div>
              <dt>닉네임</dt>
              <dd>{formatValue(user?.nickname)}</dd>
            </div>
            <div>
              <dt>대표 캐릭터</dt>
              <dd>{formatValue(profile?.mainCharacterName)}</dd>
            </div>
            <div>
              <dt>서버명</dt>
              <dd>{formatValue(profile?.serverName)}</dd>
            </div>
            <div>
              <dt>직업</dt>
              <dd>{formatValue(profile?.characterClass)}</dd>
            </div>
            <div>
              <dt>가입일</dt>
              <dd>{formatValue(user?.createdAt)}</dd>
            </div>
          </dl>
        </Card>
      </section>
    </div>
  );
};
