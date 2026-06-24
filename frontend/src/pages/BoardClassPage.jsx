import { useParams } from 'react-router-dom';
import { ForumBoardPage } from './ForumBoardPage';

export const BoardClassPage = () => {
  const { classCode } = useParams();

  return (
    <ForumBoardPage
      boardType="CLASS"
      classCode={classCode}
      description="직업별 세팅, 공략, 전분, 질문을 한 화면에서 확인할 수 있습니다."
    />
  );
};
