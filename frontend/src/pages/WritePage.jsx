import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAppState } from '../context/AppStateContext';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Input } from '../components/Input';
import { PageHeader } from '../components/PageHeader';
import { useAuthGuard } from '../hooks/useAuthGuard';

export const WritePage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const postId = searchParams.get('postId');
  const { createPost, updatePost, posts } = useAppState();
  const { user, isAdmin } = useAuthGuard();
  const [form, setForm] = useState({ title: '', content: '', className: '자유' });

  useEffect(() => {
    if (!postId) {
      return;
    }

    const existingPost = posts.find((item) => String(item.id) === String(postId));
    if (!existingPost) {
      return;
    }

    if (!isAdmin && existingPost.userId !== user?.id) {
      window.alert('본인이 작성한 글만 수정할 수 있습니다.');
      navigate(`/posts/${existingPost.id}`, { replace: true });
      return;
    }

    setForm({
      title: existingPost.title,
      content: existingPost.content,
      className: existingPost.className,
    });
  }, [isAdmin, navigate, postId, posts, user?.id]);

  const handleSubmit = (event) => {
    event.preventDefault();

    if (postId) {
      const updatedPost = updatePost(Number(postId), { ...form, boardId: 1, tags: ['수정'] });
      if (updatedPost) {
        navigate(`/posts/${updatedPost.id}`);
      }
      return;
    }

    const createdPost = createPost({ ...form, boardId: 1, tags: ['신규'] });
    navigate(`/posts/${createdPost.id}`);
  };

  return (
    <div className="page-stack narrow">
      <PageHeader
        title={postId ? '게시글 수정' : '글쓰기'}
        description="자유게시판 또는 직업별 게시판에 바로 게시글을 작성합니다."
      />
      <Card className="form-card">
        <form className="form-stack" onSubmit={handleSubmit}>
          <Input
            label="제목"
            value={form.title}
            onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
          />
          <Input
            label="직업"
            value={form.className}
            onChange={(event) => setForm((current) => ({ ...current, className: event.target.value }))}
          />
          <label className="field">
            <span className="field-label">내용</span>
            <textarea
              className="textarea"
              rows="8"
              value={form.content}
              onChange={(event) => setForm((current) => ({ ...current, content: event.target.value }))}
            />
          </label>
          <Button type="submit">{postId ? '수정하기' : '게시하기'}</Button>
        </form>
      </Card>
    </div>
  );
};
