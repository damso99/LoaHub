import { Card } from '../../components/Card';
import { formatRelativeLabel } from './boardUtils';

const formatCount = (value) => Number(value ?? 0).toLocaleString();

export const BoardSidebar = ({ hotPosts = [], recentComments = [], onlineMembers = [] }) => {
  return (
    <aside className="board-side-panel">
      {hotPosts.length ? (
        <Card className="board-side-card">
          <div className="board-side-card__header">
            <p className="board-eyebrow">HOT</p>
            <h3>인기글</h3>
          </div>
          <div className="board-side-card__list">
            {hotPosts.map((post) => (
              <div key={post.id} className="sidebar-mini-post">
                <strong>{post.title}</strong>
                <span>{formatCount(post.likeCount)} 추천</span>
              </div>
            ))}
          </div>
        </Card>
      ) : null}

      {recentComments.length ? (
        <Card className="board-side-card">
          <div className="board-side-card__header">
            <p className="board-eyebrow">COMMENT</p>
            <h3>최근 댓글</h3>
          </div>
          <div className="board-side-card__list">
            {recentComments.map((item) => (
              <div key={item.id} className="sidebar-mini-comment">
                <strong>{item.author}</strong>
                <p>{item.content}</p>
                <span>{formatRelativeLabel(item.createdAt)}</span>
              </div>
            ))}
          </div>
        </Card>
      ) : null}

      {onlineMembers.length ? (
        <Card className="board-side-card">
          <div className="board-side-card__header">
            <p className="board-eyebrow">ONLINE</p>
            <h3>접속 중인 모험가</h3>
          </div>
          <div className="board-online-grid">
            {onlineMembers.map((member) => (
              <div key={member.name} className="board-online-card">
                <span className="board-online-card__avatar">{member.name.slice(0, 1)}</span>
                <strong>{member.name}</strong>
                <span>{member.role}</span>
              </div>
            ))}
          </div>
        </Card>
      ) : null}
    </aside>
  );
};
