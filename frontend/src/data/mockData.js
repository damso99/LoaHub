export const classes = [
  '버서커',
  '워로드',
  '디스트로이어',
  '홀리나이트',
  '슬레이어',
  '배틀마스터',
  '인파이터',
  '기공사',
  '창술사',
  '스트라이커',
  '브레이커',
  '데빌헌터',
  '블래스터',
  '호크아이',
  '스카우터',
  '건슬링어',
  '바드',
  '서머너',
  '아르카나',
  '소서리스',
  '데모닉',
  '블레이드',
  '리퍼',
  '소울이터',
  '도화가',
  '기상술사',
];

export const currentUserSeed = {
  id: 1,
  email: 'guardian@loahub.dev',
  nickname: '가디언 슬레이어',
  provider: 'local',
  role: 'ROLE_USER',
  providerId: null,
  createdAt: '2026-06-01',
};

export const profileSeed = {
  id: 1,
  userId: 1,
  mainCharacterName: '가디언 슬레이어',
  serverName: '아제나',
  characterClass: '슬레이어',
  itemLevel: 1620,
  characterImage:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuBWOfa9MOzQ8wv6WwC5x5aXighIOBLMtPuF6tPcvjHbVDJxULTkUY3v-oBR7oQpeSoS_tfIUomsjK_VIyCBX_Z8SVZNfvKg4iEknQOU3wkLLXIBsXTUQdbOfTaTk1L_J-0_XZ2aZzvjvxGIu50QsjG7t6__NROntW0srne5iDpIpzGBPH7hbedROPI3SyMHS0gAvvZ5xYwNBCTnr2jXYq0mBywgkeGoJpGYEmKhgDZgqJVo68_xqGPktEZsgiApNxlMS2jEp_OveHc',
  bio: '레이드와 게시판을 한 번에 관리하는 LoaHub 포트폴리오 데모 계정입니다.',
  createdAt: '2026-06-01',
  updatedAt: '2026-06-12',
};

export const charactersSeed = [
  {
    id: 1,
    userId: 1,
    characterName: '가디언 슬레이어',
    serverName: '아제나',
    characterClass: '슬레이어',
    itemLevel: 1620,
    characterImage:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCDXlwG5Ba7Waflk-pNzcs0IQje1OpqpZlVFVhJJ9eF-J1JGTUoQn49TW7NMRIot85X55EBeFTgosE_8RqXn22lf16wefL6rWgGvKZ1KwPmaL-xxUH0pocJ3NSZhWc79xaUkM0838vAC0gRyERlRu5J366fe5u2jxn19cilGIde7gdH8Pasgw2CtfCx0yNDLN6VKzDaTQGg23MGue__edUkiJq3EjiGDkLgmHZ-p6DfROFD2TTWleu5QzsfKYCXuUgg-0LeK13VPis',
    isMain: true,
    status: 'main',
  },
  {
    id: 2,
    userId: 1,
    characterName: '실드 메이트',
    serverName: '아제나',
    characterClass: '워로드',
    itemLevel: 1580.5,
    characterImage:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCKHy3Kb02dKcAAbYEbf6nNxs8r8Q38VYHoXDl5y3v0UmdqzLjRhAOY6nXbueMd6jaPZfs7_7e3Ks80Gmu6L7OGjrOx5FAFgBX52jeUk7rfHjPrlG5vKJvz3JmZ0lHC3pyB-FO_mLEC5HdpaLFl4Sji8QSRronsFXlhXKV2PhybJvOVvM-2f5IoXICuHQrWBexi4fusO3N0aWANavVkuTGdadd7lRPPCtZ4_tzHZU4seKeUcH08yx5q-0iGvQjVrL7FP8cIAeUvhgY',
    isMain: false,
    status: 'tracking',
  },
  {
    id: 3,
    userId: 1,
    characterName: '매직 미사일',
    serverName: '마리',
    characterClass: '소서리스',
    itemLevel: 1600,
    characterImage:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDEZnoRhsr3p0ayfyMB3wmjq-YDQAlKCJF7NIrJmWneHcW1Brn0PehHNcOEyDL-0cL-LReX8r-oN9U5O9PmQtQF02p3rRqZMphQtJ9EadA6K2qx0RYL9MKzDnXZWPfn8exLEhqww_XDO2e3sDQXla7MZvRWnga8DDKNCKmlYelvZfD5Xd2x63_fjuufW8-t2xooiB4N3_HgYikUNiuFkZoi3T7m0N8tRebqwy_fJfZ94EMf11FmR96r2_pdeDYydDjIQn8HepgzTzk',
    isMain: false,
    status: 'tracking',
  },
  {
    id: 4,
    userId: 1,
    characterName: '힐포골드',
    serverName: '카단',
    characterClass: '바드',
    itemLevel: 1610.83,
    characterImage:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDPhf3VYWMysYXHT7wUxHERqQ6dxgVncu2lhxrp1SOUldZwAd1-pcBFbH1nv5u6SUz15-ETcyJTQaxf_Y4DxXeaALaItl18RXFRmNxW6FImw4DGnvuskYRRq_3obDFhoYwcoy7prcTUk40G0-udwQKUK2T0KUHNLszZb2oyU2KnKFskJZPc1v5cwrpGjXiC0mUyuRexn_cA_H6g7FfKXvOleEvaR4-P9tPO5Uk6nPztUodvZpRz5m6GnptKnL82ZAJIuQnV5muHxw8',
    isMain: false,
    status: 'tracking',
  },
];

export const boardsSeed = [
  { id: 1, boardType: 'FREE', boardName: '자유게시판', className: null, sortOrder: 1 },
  { id: 2, boardType: 'CLASS', boardName: '직업별 게시판', className: '슬레이어', sortOrder: 2 },
  { id: 3, boardType: 'CLASS', boardName: '직업별 게시판', className: '소서리스', sortOrder: 3 },
  { id: 4, boardType: 'CLASS', boardName: '직업별 게시판', className: '바드', sortOrder: 4 },
];

export const postsSeed = [
  {
    id: 1,
    boardId: 1,
    userId: 1,
    title: '카멘 3관문 공략 파티 모집합니다',
    content:
      '아제나 서버 기준으로 금요일 20시부터 출발 예정입니다. 숙련자 우대하며 디스코드 필수입니다.',
    viewCount: 12500,
    likeCount: 42,
    commentCount: 8,
    author: 'Zoro',
    className: '슬레이어',
    createdAt: '1시간 전',
    updatedAt: '1시간 전',
    deletedYn: false,
    pinned: true,
    tags: ['가이드', '파티모집'],
  },
  {
    id: 2,
    boardId: 1,
    userId: 1,
    title: '오늘 밤 8시 에키드나 하드 트라이 서포터 모십니다',
    content:
      '서포터 1명 구합니다. 공팟보다는 커뮤니티 기반으로 진행하고 싶습니다.',
    viewCount: 842,
    likeCount: 16,
    commentCount: 3,
    author: 'GigaChad',
    className: '홀리나이트',
    createdAt: '3시간 전',
    updatedAt: '3시간 전',
    deletedYn: false,
    pinned: false,
    tags: ['파티모집'],
  },
  {
    id: 3,
    boardId: 2,
    userId: 1,
    title: '배럭 무기 25강 찍어줄 만한가요?',
    content:
      '소울이터 배럭 키우는 중인데 25강 투자 효율이 궁금합니다. 경험담 부탁드립니다.',
    viewCount: 5200,
    likeCount: 33,
    commentCount: 16,
    author: 'MokoMoko',
    className: '소울이터',
    createdAt: '5시간 전',
    updatedAt: '5시간 전',
    deletedYn: false,
    pinned: false,
    tags: ['직업질문'],
  },
  {
    id: 4,
    boardId: 1,
    userId: 1,
    title: '이번 주 떠상 요약 공유합니다',
    content: '베른 남부, 엘가시아, 쿠르잔 쪽 매물 정리했습니다. 즐겨찾기 업데이트 완료.',
    viewCount: 2940,
    likeCount: 18,
    commentCount: 4,
    author: 'PatchNote',
    className: '기상술사',
    createdAt: '7시간 전',
    updatedAt: '7시간 전',
    deletedYn: false,
    pinned: false,
    tags: ['정보공유'],
  },
];

export const commentsSeed = {
  1: [
    {
      id: 1,
      postId: 1,
      userId: 1,
      content: '시간대가 맞아서 관심 있습니다. 디코 아이디 남겨주세요.',
      createdAt: '50분 전',
      author: 'Rainfall',
    },
    {
      id: 2,
      postId: 1,
      userId: 1,
      content: '직업은 뭐 받으시나요?',
      createdAt: '30분 전',
      author: 'BlueShield',
    },
  ],
  2: [
    {
      id: 3,
      postId: 2,
      userId: 1,
      content: '서포터 가능합니다. 주말 일정 맞으면 참여하고 싶습니다.',
      createdAt: '2시간 전',
      author: 'HolySong',
    },
  ],
  3: [],
  4: [],
};

export const calendarContents = [
  {
    id: 1,
    contentName: '카오스게이트',
    contentType: 'TODAY',
    startTime: '2026-06-17 18:00',
    description: '유성룬, 각인서, 재련 재료 수급 콘텐츠',
  },
  {
    id: 2,
    contentName: '필드보스',
    contentType: 'TODAY',
    startTime: '2026-06-17 19:30',
    description: '서버별 등장 시간 확인 후 참여',
  },
  {
    id: 3,
    contentName: '모험섬',
    contentType: 'WEEK',
    startTime: '2026-06-19 12:00',
    description: '주간 보상 수급용 콘텐츠',
  },
  {
    id: 4,
    contentName: '주간 초기화',
    contentType: 'WEEK',
    startTime: '2026-06-18 06:00',
    description: '레이드 및 숙제 초기화',
  },
];

export const merchantsSeed = [
  {
    id: 1,
    region: '루테란 서부',
    merchantName: '떠돌이 상인 루카스',
    spawnTime: '18:00 ~ 19:30',
    items: ['카드팩', '요리 재료', '호감도 아이템'],
    description: '평일 저녁 자주 등장하는 기본 지역 상인',
    serverName: '아제나',
    favorite: true,
  },
  {
    id: 2,
    region: '베른 남부',
    merchantName: '떠돌이 상인 에이든',
    spawnTime: '20:00 ~ 21:00',
    items: ['각인서', '전투 각인서', '재련 재료'],
    description: '고레벨 유저가 자주 찾는 핵심 지역',
    serverName: '카단',
    favorite: false,
  },
  {
    id: 3,
    region: '엘가시아',
    merchantName: '떠돌이 상인 나히르',
    spawnTime: '22:00 ~ 23:30',
    items: ['영웅 호감도', '재료 상자', '배틀 아이템'],
    description: '고급 재료 위주로 노리는 지역',
    serverName: '마리',
    favorite: true,
  },
];

export const messagesSeed = [
  {
    id: 1,
    senderId: 2,
    receiverId: 1,
    title: '파티 모집 관련 문의',
    content: '카멘 3관문 모집 관련해서 일정 다시 확인 부탁드립니다.',
    isRead: false,
    deletedBySender: false,
    deletedByReceiver: false,
    createdAt: '2026-06-17 10:20',
    senderNickname: 'Zoro',
    receiverNickname: '가디언 슬레이어',
  },
  {
    id: 2,
    senderId: 1,
    receiverId: 3,
    title: '떠상 정보 공유 감사합니다',
    content: '베른 남부 매물 잘 확인했습니다. 즐겨찾기 해두겠습니다.',
    isRead: true,
    deletedBySender: false,
    deletedByReceiver: false,
    createdAt: '2026-06-16 22:05',
    senderNickname: '가디언 슬레이어',
    receiverNickname: 'PatchNote',
  },
];

export const characterSearchResults = [
  {
    id: 101,
    characterName: 'Guardian Slayer',
    serverName: 'NA East - Azena',
    characterClass: 'Slayer',
    itemLevel: 1620,
    characterImage:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAlKjwkP-3VtWbbz11ShNf8O9AOnvIhJ9Yd2Px9AT19QqReQED1RDY-PKts08wGQSVEyXiLsSnT1_yRfBCfESS_a4AghNcXZ_XTad1D2H17blIDS-yXWS6E-Sm-9jEmaPWNHbUGY6aiEs9IWWjzbVuxD9Zk02gD5m5aSMb_V52AJUqGTgd7Pv_N1jLo97lw8febz5OJkaHbEuHHYWOPEBAAbM895ldEK3eJr1V1XLl0EL6Vtji5s-c1_CAOzCGEjVJuikHaMex_Xjk',
    rosterLevel: 245,
    isMain: true,
  },
  {
    id: 102,
    characterName: 'Shield Maiden',
    serverName: 'NA East - Azena',
    characterClass: 'Warrior',
    itemLevel: 1580.5,
    characterImage:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBETad2qGxoRf5tPXNZIgaKo7L0RiBp8b38jwu3GUZMQdeXzfBX-3ISvtWcIOYN-0leUhkuqdxYMSrBzqPq9hXyVzj3dk8DVREftWqi6Ee0N-TMe9WK-dqrQpOiLbd6nXxC2XkS6Qjt2yX-vUygV428vNFLlSq4diJWdZm1nnGFaj-6k-V_0C6AmrTMM2h3McwC6B_n4dTU98AOnyucOeOYRkTswqu_gNVIwIyYtKjUV-ksRNYa0cHjn6tRvmyvlvBlyVHeBR3lqdw',
    rosterLevel: 180,
    isMain: false,
  },
  {
    id: 103,
    characterName: 'Magic Missile',
    serverName: 'NA West - Mari',
    characterClass: 'Sorceress',
    itemLevel: 1600,
    characterImage:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBxEpT56Co8gZ9rKrIiwJ4222cRygZatiCVZ3Gk03qBSFv3OJJUTVv2ZM2FwrCHDMKuLf3ibwKsxKKTTvxF-pItEVZJkLZ8cyws5N8R8q-37_XEiJxy_NreCy8Ay7Q9H8-2zYQAnk-7TRPQyDnvLfnmZDaDOYNO9B8qZsqTQqREB72RC-47hshSqNuEtNjMlMISrj5FYywFURcAU-iiBBicTiuUyeLVoXJ7CjPS2HpHrX-y0UMTfQZBOmXA45SvdqMm7-chAuH_Vds',
    rosterLevel: 210,
    isMain: false,
  },
  {
    id: 104,
    characterName: 'HealsForGold',
    serverName: 'EU Central - Kadan',
    characterClass: 'Bard',
    itemLevel: 1610.83,
    characterImage:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCT2BiLeFTtWljmuhpTW77G1O8f6v5dsZJd0QMJ260dxzTVFYz4-0WYpQJca-pBXvyJHj8xYB20evV3ICCFeGvIWAdIsKKt85aeJsP5uvocpxP9cqIFkBnaFJBIxsw9f6L_BwA6E7xniQkV-Cy4O9Sdn-VO0emIh15hOS3s0LSID6WkVlms18v5TOqTLq67L3Yj7xtAq5o4Y0C-m0vc2RknQCz_R9NBsD-PL_IotKh_5XkuoVdfHOa1gTTRHaJx3jmLviJ8WExz2tg',
    rosterLevel: 300,
    isMain: false,
  },
];

export const todayHighlights = [
  {
    id: 1,
    title: '오늘의 콘텐츠',
    description: '카오스게이트와 필드보스 시간을 바로 확인하세요.',
    stat: '2개 진행',
  },
  {
    id: 2,
    title: '인기 게시글',
    description: '실시간 공략과 파티 모집이 활발합니다.',
    stat: '124명 참여',
  },
  {
    id: 3,
    title: '떠돌이상인',
    description: '서버별 등장 시간과 판매 아이템을 모아두었습니다.',
    stat: '즐겨찾기 8개',
  },
];
