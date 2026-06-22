import { useParams } from 'react-router-dom';
import { useAppState } from '../context/AppStateContext';
import { PageHeader } from '../components/PageHeader';
import { PostTable } from '../components/PostTable';

export const BoardClassPage = () => {
  const { className } = useParams();
  const { posts } = useAppState();

  const filtered = posts.filter((post) => post.className === className);

  return (
    <div className="page-stack board-page">
      <PageHeader
        title={`${className} 게시판`}
        description={`${className} 직업 유저가 모여 공략과 세팅, 파티 정보를 공유합니다.`}
      />
      <PostTable posts={filtered.length > 0 ? filtered : posts.slice(0, 3)} />
    </div>
  );
};
