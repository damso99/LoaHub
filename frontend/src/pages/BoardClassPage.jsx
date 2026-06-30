import { useParams } from 'react-router-dom';
import { BoardListPage } from './BoardListPage';

export const BoardClassPage = () => {
  const { classCode } = useParams();

  return <BoardListPage boardType="CLASS" classCode={classCode} />;
};
