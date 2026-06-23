const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
const FIXED_SLOTS = ['11:00', '13:00', '19:00', '21:00', '23:00'];

const selectFields = [
  'id',
  'week_start_date',
  'week_end_date',
  'category_name',
  'contents_name',
  'contents_icon',
  'min_item_level',
  'location',
  'start_time_kst',
  'start_date',
  'start_hhmm',
  'slot_hhmm',
  'rewards',
  'raw_content',
  'is_active',
  'created_at',
  'updated_at',
].join(',');

const ensureEnv = () => {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error('Supabase 환경 변수가 설정되지 않았습니다.');
  }
};

const buildRestUrl = (path, params = new URLSearchParams()) => {
  ensureEnv();
  const baseUrl = SUPABASE_URL.replace(/\/+$/, '');
  const query = params.toString();
  return `${baseUrl}/rest/v1/${path}${query ? `?${query}` : ''}`;
};

const requestSupabase = async (path, params = new URLSearchParams()) => {
  const response = await fetch(buildRestUrl(path, params), {
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    const body = await response.text().catch(() => '');
    throw new Error(body || '캘린더 데이터를 불러오지 못했습니다.');
  }

  return response.json();
};

const formatKstDate = (value = new Date()) => {
  const parts = new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(value);

  const map = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${map.year}-${map.month}-${map.day}`;
};

const normalizeReward = (reward) => ({
  name: reward?.name ?? reward?.Name ?? '',
  icon: reward?.icon ?? reward?.Icon ?? '',
  grade: reward?.grade ?? reward?.Grade ?? '',
});

const normalizeSchedule = (row) => ({
  id: row.id,
  weekStartDate: row.week_start_date,
  weekEndDate: row.week_end_date,
  categoryName: row.category_name,
  contentsName: row.contents_name,
  contentsIcon: row.contents_icon,
  minItemLevel: row.min_item_level,
  location: row.location,
  startTimeKst: row.start_time_kst,
  startDate: row.start_date,
  startHhmm: row.start_hhmm,
  slotHhmm: row.slot_hhmm,
  rewards: Array.isArray(row.rewards) ? row.rewards.map(normalizeReward) : [],
  rawContent: row.raw_content ?? null,
});

const sortSchedules = (items) =>
  [...items].sort((left, right) => {
    if (left.startDate !== right.startDate) return String(left.startDate).localeCompare(String(right.startDate));
    if (left.slotHhmm !== right.slotHhmm) return String(left.slotHhmm).localeCompare(String(right.slotHhmm));
    if (left.categoryName !== right.categoryName) return String(left.categoryName).localeCompare(String(right.categoryName));
    return String(left.startTimeKst).localeCompare(String(right.startTimeKst));
  });

const groupBySlot = (items) => {
  const groups = new Map(FIXED_SLOTS.map((slot) => [slot, []]));
  for (const item of items) {
    if (!groups.has(item.slotHhmm)) {
      groups.set(item.slotHhmm, []);
    }
    groups.get(item.slotHhmm).push(item);
  }

  return FIXED_SLOTS.map((slotHhmm) => ({
    slotHhmm,
    items: groups.get(slotHhmm) ?? [],
  }));
};

export const getLostArkCalendarToday = async () => {
  const date = formatKstDate();
  const params = new URLSearchParams({
    select: selectFields,
    is_active: 'eq.true',
    start_date: `eq.${date}`,
    order: 'start_date.asc,slot_hhmm.asc,category_name.asc,start_time_kst.asc',
  });

  const rows = await requestSupabase('lostark_calendar_schedules', params);
  const items = sortSchedules((rows ?? []).map(normalizeSchedule));

  return {
    date,
    groups: groupBySlot(items),
  };
};

export const getLostArkCalendarWeek = async () => {
  const params = new URLSearchParams({
    select: selectFields,
    is_active: 'eq.true',
    order: 'start_date.asc,slot_hhmm.asc,category_name.asc,start_time_kst.asc',
  });

  const rows = await requestSupabase('lostark_calendar_schedules', params);
  const items = sortSchedules((rows ?? []).map(normalizeSchedule));

  return {
    weekStartDate: items[0]?.weekStartDate ?? null,
    weekEndDate: items.at(-1)?.weekEndDate ?? null,
    items,
  };
};

export const getLostArkCalendarDate = async (date) => {
  const normalizedDate = String(date ?? '').trim();
  if (!normalizedDate) {
    throw new Error('조회할 날짜가 필요합니다.');
  }

  const params = new URLSearchParams({
    select: selectFields,
    is_active: 'eq.true',
    start_date: `eq.${normalizedDate}`,
    order: 'start_date.asc,slot_hhmm.asc,category_name.asc,start_time_kst.asc',
  });

  const rows = await requestSupabase('lostark_calendar_schedules', params);
  const items = sortSchedules((rows ?? []).map(normalizeSchedule));

  return {
    date: normalizedDate,
    groups: groupBySlot(items),
  };
};
