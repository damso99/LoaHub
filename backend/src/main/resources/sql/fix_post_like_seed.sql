-- LoaHub 추천 시드 정리
-- 기본 데모 계정(user_id = 1)이 이미 추천한 상태로 들어가면
-- 첫 클릭이 "추천"이 아니라 "추천 취소"처럼 보일 수 있다.
-- 기존 데이터가 있는 환경에서 안전하게 정리한다.

DELETE FROM post_likes
WHERE user_id = 1
  AND post_id IN (1, 4);
