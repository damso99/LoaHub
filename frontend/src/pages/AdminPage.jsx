import { Card } from '../components/Card';
import { PageHeader } from '../components/PageHeader';

const adminItems = [
  '게시판 관리',
  '게시글 강제 삭제',
  '댓글 강제 삭제',
  '공지 설정',
  '캘린더 콘텐츠 등록/수정/삭제',
];

export const AdminPage = () => {
  return (
    <div className="page-stack">
      <PageHeader
        title="관리자 센터"
        description="관리자만 접근할 수 있는 운영 도구 모음입니다."
      />

      <Card className="section-card">
        <ul className="admin-list">
          {adminItems.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </Card>
    </div>
  );
};
