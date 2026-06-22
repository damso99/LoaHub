import { Link } from 'react-router-dom';
import { useAppState } from '../context/AppStateContext';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { PageHeader } from '../components/PageHeader';

export const ProfilePage = () => {
  const { user, profile, posts, logout } = useAppState();
  const myPosts = posts.filter((post) => post.userId === user?.id);

  return (
    <div className="page-stack">
      <PageHeader
        title="마이페이지"
        description="로그인한 계정의 정보와 내가 작성한 글을 관리합니다."
        action={<Button as={Link} to="/profile/edit">프로필 수정</Button>}
      />

      <Card className="section-card profile-action-card">
        <div className="profile-action-card__content">
          <h2>계정 관리</h2>
          <p>프로필 변경과 로그아웃은 이 영역에서 관리할 수 있습니다.</p>
        </div>
        <div className="profile-action-card__actions">
          <Button variant="secondary" as={Link} to="/character-search">
            캐릭터 변경
          </Button>
          <Button variant="ghost" onClick={logout}>
            로그아웃
          </Button>
        </div>
      </Card>

      <section className="profile-grid">
        <Card className="profile-summary">
          <img src={profile.characterImage} alt={profile.mainCharacterName} className="profile-summary__image" />
          <div className="profile-summary__body">
            <h2>{user?.nickname ?? '게스트'}</h2>
            <p>{profile.bio}</p>
            <div className="chip-row">
              <Badge tone="primary">{profile.mainCharacterName}</Badge>
              <Badge tone="info">{profile.characterClass}</Badge>
              <Badge tone="warning">아이템레벨 {profile.itemLevel}</Badge>
            </div>
          </div>
        </Card>

        <Card className="profile-info">
          <h2>회원 정보</h2>
          <dl className="info-list">
            <div>
              <dt>닉네임</dt>
              <dd>{user?.nickname}</dd>
            </div>
            <div>
              <dt>대표 캐릭터</dt>
              <dd>{profile.mainCharacterName}</dd>
            </div>
            <div>
              <dt>서버명</dt>
              <dd>{profile.serverName}</dd>
            </div>
            <div>
              <dt>직업</dt>
              <dd>{profile.characterClass}</dd>
            </div>
            <div>
              <dt>가입일</dt>
              <dd>{user?.createdAt}</dd>
            </div>
          </dl>
        </Card>
      </section>

      <Card className="section-card">
        <h2>내가 작성한 글</h2>
        <div className="mini-post-list">
          {myPosts.map((post) => (
            <Link key={post.id} to={`/posts/${post.id}`} className="mini-post">
              <strong>{post.title}</strong>
              <span>{post.likeCount}</span>
            </Link>
          ))}
        </div>
      </Card>
    </div>
  );
};
