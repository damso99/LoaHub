import { createClient } from 'jsr:@supabase/supabase-js@2';

type LostArkCalendarItem = {
  CategoryName?: string;
  ContentsName?: string;
  ContentsIcon?: string | null;
  MinItemLevel?: number | null;
  Location?: string | null;
  StartTimes?: string[] | null;
  RewardItems?: unknown;
  [key: string]: unknown;
};

type CalendarReward = {
  name: string;
  icon: string;
  grade: string;
};

type CalendarRewardSource = CalendarReward & {
  startTimes: string[] | null;
};

type CalendarRow = {
  week_start_date: string;
  week_end_date: string;
  category_name: string;
  contents_name: string;
  contents_icon: string;
  min_item_level: number | null;
  location: string;
  start_time_kst: string;
  start_date: string;
  start_hhmm: string;
  slot_hhmm: string;
  rewards: CalendarReward[];
  raw_content: LostArkCalendarItem;
};

const TARGET_CATEGORIES = new Set(['모험 섬', '필드보스', '카오스게이트']);
const NORMAL_SLOTS = new Set(['11:00', '13:00', '19:00', '21:00', '23:00']);
const CHAOS_SLOT_MAP: Record<string, string> = {
  '11:50': '11:00',
  '13:50': '13:00',
  '19:50': '19:00',
  '21:50': '21:00',
  '23:50': '23:00',
};

const json = (status: number, body: Record<string, unknown>) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
    },
  });

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, content-type, apikey, x-client-info',
  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
};

const nowKstIso = () => {
  const parts = new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).formatToParts(new Date());

  const map = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${map.year}-${map.month}-${map.day}T${map.hour}:${map.minute}:${map.second}`;
};

const todayKstDate = () => nowKstIso().slice(0, 10);

const normalizeToken = (value: string | null) => {
  const token = value?.trim() ?? '';
  if (!token) return '';
  return token.toLowerCase().startsWith('bearer ') ? token : `Bearer ${token}`;
};

const trimText = (value: unknown) => (typeof value === 'string' ? value.trim() : '');

const formatTime = (value: string) => value.slice(11, 16);

const normalizeDateTime = (value: string) => {
  const trimmed = value.trim();
  if (trimmed.length === 16) {
    return `${trimmed}:00`;
  }
  return trimmed.slice(0, 19);
};

const isTimeAllowed = (categoryName: string, startHhmm: string) => {
  if (categoryName === '카오스게이트') {
    return Object.prototype.hasOwnProperty.call(CHAOS_SLOT_MAP, startHhmm);
  }
  return NORMAL_SLOTS.has(startHhmm);
};

const getSlotHhmm = (categoryName: string, startHhmm: string) => {
  if (categoryName === '카오스게이트') {
    return CHAOS_SLOT_MAP[startHhmm] ?? null;
  }
  return NORMAL_SLOTS.has(startHhmm) ? startHhmm : null;
};

const extractItems = (root: unknown): LostArkCalendarItem[] => {
  if (Array.isArray(root)) {
    return root.filter((item): item is LostArkCalendarItem => Boolean(item && typeof item === 'object'));
  }

  if (!root || typeof root !== 'object') {
    return [];
  }

  const objectRoot = root as Record<string, unknown>;
  for (const key of ['Items', 'items', 'Data', 'data', 'CalendarItems', 'calendarItems']) {
    const candidate = objectRoot[key];
    if (Array.isArray(candidate)) {
      return candidate.filter((item): item is LostArkCalendarItem => Boolean(item && typeof item === 'object'));
    }
  }

  return [];
};

const extractRewardItems = (source: unknown): CalendarRewardSource[] => {
  const rewards: CalendarRewardSource[] = [];

  const visit = (value: unknown): void => {
    if (Array.isArray(value)) {
      value.forEach(visit);
      return;
    }

    if (!value || typeof value !== 'object') {
      return;
    }

    const item = value as Record<string, unknown>;
    const hasRewardShape =
      'Name' in item || 'name' in item || 'Icon' in item || 'icon' in item || 'Grade' in item || 'grade' in item;

    if (hasRewardShape) {
      const startTimes = item.StartTimes ?? item.startTimes;
      rewards.push({
        name: trimText(item.Name ?? item.name),
        icon: trimText(item.Icon ?? item.icon),
        grade: trimText(item.Grade ?? item.grade),
        startTimes: Array.isArray(startTimes)
          ? startTimes.map((value) => String(value))
          : startTimes == null
            ? null
            : [String(startTimes)],
      });
      return;
    }

    for (const key of ['RewardItems', 'rewardItems', 'Items', 'items', 'Rewards', 'rewards', 'RewardGroups', 'rewardGroups']) {
      if (key in item) {
        visit(item[key]);
      }
    }
  };

  visit(source);
  return rewards;
};

const sameStartTime = (left: string, right: string) => normalizeDateTime(left) === normalizeDateTime(right);

const matchesRewardStartTimes = (rewardStartTimes: unknown, scheduleStartTime: string) => {
  if (rewardStartTimes == null) {
    return true;
  }

  if (!Array.isArray(rewardStartTimes)) {
    return sameStartTime(String(rewardStartTimes), scheduleStartTime);
  }

  return rewardStartTimes.some((candidate) => sameStartTime(String(candidate), scheduleStartTime));
};

const buildRows = (items: LostArkCalendarItem[]) => {
  const rows: CalendarRow[] = [];
  const allDates: string[] = [];

  for (const item of items) {
    const categoryName = trimText(item.CategoryName);
    if (!TARGET_CATEGORIES.has(categoryName)) {
      continue;
    }

    const startTimes = Array.isArray(item.StartTimes) ? item.StartTimes : [];
    const rewardItems = extractRewardItems(item.RewardItems);

    for (const rawStartTime of startTimes) {
      const normalizedStartTime = normalizeDateTime(String(rawStartTime));
      const startHhmm = formatTime(normalizedStartTime);
      if (!isTimeAllowed(categoryName, startHhmm)) {
        continue;
      }

      const slotHhmm = getSlotHhmm(categoryName, startHhmm);
      if (!slotHhmm) {
        continue;
      }

      const filteredRewards = rewardItems
        .filter((reward) => matchesRewardStartTimes(reward.startTimes, normalizedStartTime))
        .map((reward) => ({
          name: reward.name,
          icon: reward.icon,
          grade: reward.grade,
        }));

      const startDate = normalizedStartTime.slice(0, 10);
      allDates.push(startDate);

      rows.push({
        week_start_date: '',
        week_end_date: '',
        category_name: categoryName,
        contents_name: trimText(item.ContentsName),
        contents_icon: trimText(item.ContentsIcon),
        min_item_level: typeof item.MinItemLevel === 'number' ? item.MinItemLevel : null,
        location: trimText(item.Location),
        start_time_kst: normalizedStartTime,
        start_date: startDate,
        start_hhmm: startHhmm,
        slot_hhmm: slotHhmm,
        rewards: filteredRewards,
        raw_content: item,
      });
    }
  }

  const weekStartDate = allDates.length > 0 ? allDates.sort()[0] : null;
  const weekEndDate = allDates.length > 0 ? allDates.sort().at(-1) ?? null : null;

  const deduped = new Map<string, CalendarRow>();
  for (const row of rows) {
    row.week_start_date = weekStartDate ?? row.start_date;
    row.week_end_date = weekEndDate ?? row.start_date;
    const key = `${row.category_name}|${row.contents_name}|${row.location}|${row.start_time_kst}`;
    if (!deduped.has(key)) {
      deduped.set(key, row);
    }
  }

  return {
    weekStartDate,
    weekEndDate,
    filteredCount: rows.length,
    savedCount: deduped.size,
    rows: Array.from(deduped.values()).sort((left, right) => {
      if (left.start_date !== right.start_date) return left.start_date.localeCompare(right.start_date);
      if (left.slot_hhmm !== right.slot_hhmm) return left.slot_hhmm.localeCompare(right.slot_hhmm);
      if (left.category_name !== right.category_name) return left.category_name.localeCompare(right.category_name);
      return left.start_time_kst.localeCompare(right.start_time_kst);
    }),
  };
};

const lostArkApiRequest = async (apiKey: string) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 20000);

  try {
    const response = await fetch('https://developer-lostark.game.onstove.com/gamecontents/calendar', {
      method: 'GET',
      headers: {
        accept: 'application/json',
        authorization: normalizeToken(apiKey),
      },
      signal: controller.signal,
    });

    if (!response.ok) {
      const status = response.status;
      const text = await response.text().catch(() => '');
      const error = new Error(text || `Lost Ark API error: ${status}`);
      (error as Error & { status?: number }).status = status;
      throw error;
    }

    return await response.json();
  } finally {
    clearTimeout(timeoutId);
  }
};

const getErrorMessage = (error: unknown) => {
  const status = typeof error === 'object' && error && 'status' in error ? Number((error as { status?: number }).status) : null;
  if (status === 401 || status === 403) return '로스트아크 API 인증에 실패했습니다.';
  if (status === 404) return '로스트아크 캘린더 데이터를 찾을 수 없습니다.';
  if (status === 429) return '로스트아크 API 요청 한도를 초과했습니다.';
  if (status === 504) return '로스트아크 API 응답 시간이 초과되었습니다.';

  if (error instanceof DOMException && error.name === 'AbortError') {
    return '로스트아크 API 응답 시간이 초과되었습니다.';
  }

  return '로스트아크 API 호출에 실패했습니다.';
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST' && req.method !== 'GET') {
    return json(405, { status: 'METHOD_NOT_ALLOWED', message: '허용되지 않은 메서드입니다.' });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? Deno.env.get('APP_SUPABASE_URL') ?? '';
  const serviceRoleKey = Deno.env.get('APP_SUPABASE_SERVICE_ROLE_KEY') ?? Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
  const lostarkApiKey = Deno.env.get('LOSTARK_API_KEY') ?? '';

  if (!supabaseUrl || !serviceRoleKey) {
    return json(500, { status: 'FAIL', message: 'Supabase 환경 변수가 설정되지 않았습니다.' });
  }

  if (!lostarkApiKey.trim()) {
    return json(500, { status: 'FAIL', message: 'LOSTARK_API_KEY가 설정되지 않았습니다.' });
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const startedAt = nowKstIso();
  const { data: logRow, error: logError } = await supabase
    .from('lostark_calendar_sync_logs')
    .insert({
      sync_type: 'WEEKLY',
      status: 'RUNNING',
      message: '캘린더 동기화를 시작했습니다.',
      started_at: startedAt,
    })
    .select('id')
    .single();

  if (logError) {
    return json(500, { status: 'FAIL', message: '동기화 로그를 생성하지 못했습니다.', detail: logError.message });
  }

  const logId = logRow.id as string;

  try {
    const response = await lostArkApiRequest(lostarkApiKey);
    const items = extractItems(response);
    const { weekStartDate, weekEndDate, filteredCount, savedCount, rows } = buildRows(items);

    if (!rows.length || !weekStartDate || !weekEndDate) {
      await supabase.from('lostark_calendar_sync_logs').update({
        status: 'FAIL',
        message: '필터링 결과가 0건입니다.',
        error_message: '기존 캐시를 유지했습니다.',
        finished_at: nowKstIso(),
      }).eq('id', logId);

      return json(422, {
        status: 'FAIL',
        message: '필터링 결과가 0건이라 기존 캐시를 유지했습니다.',
        fetchedCount: items.length,
        filteredCount,
        savedCount,
      });
    }

    const { data: rpcResult, error: rpcError } = await supabase.rpc('replace_lostark_calendar_week', {
      p_week_start_date: weekStartDate,
      p_week_end_date: weekEndDate,
      p_rows: rows,
    });

    if (rpcError) {
      throw rpcError;
    }

    await supabase.from('lostark_calendar_sync_logs').update({
      status: 'SUCCESS',
      week_start_date: weekStartDate,
      week_end_date: weekEndDate,
      fetched_count: items.length,
      filtered_count: filteredCount,
      saved_count: savedCount,
      message: '캘린더 동기화가 완료되었습니다.',
      finished_at: nowKstIso(),
    }).eq('id', logId);

    return json(200, {
      status: 'SUCCESS',
      fetchedCount: items.length,
      filteredCount,
      savedCount,
      weekStartDate,
      weekEndDate,
      rpcResult,
    });
  } catch (error) {
    const message = getErrorMessage(error);

    await supabase.from('lostark_calendar_sync_logs').update({
      status: 'FAIL',
      message: '캘린더 동기화에 실패했습니다.',
      error_message: message,
      finished_at: nowKstIso(),
    }).eq('id', logId);

    return json(
      typeof error === 'object' && error && 'status' in error && Number((error as { status?: number }).status) === 429
        ? 429
        : message.includes('응답 시간이 초과')
          ? 504
          : 502,
      {
        status: 'FAIL',
        message,
      },
    );
  }
});
