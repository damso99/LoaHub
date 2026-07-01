import { resolveLoaScheduleDate } from '../utils/calendarDate';

const LOSTARK_API_ENDPOINT = 'https://developer-lostark.game.onstove.com/gamecontents/calendar';
const LOSTARK_API_KEY = import.meta.env.VITE_LOSTARK_API_KEY?.trim() ?? '';

const toArray = (value) => {
  if (Array.isArray(value)) {
    return value;
  }

  if (value == null || value === '') {
    return [];
  }

  return [value];
};

const normalizeText = (value) =>
  String(value ?? '')
    .trim()
    .replaceAll(/[\s_-]/g, '')
    .toLowerCase();

const pickText = (value, fieldNames) => {
  for (const fieldName of fieldNames) {
    const candidate = value?.[fieldName];
    if (candidate != null && String(candidate).trim() !== '') {
      return String(candidate).trim();
    }
  }

  return '';
};

const pickArray = (value, fieldNames) => {
  for (const fieldName of fieldNames) {
    const candidate = value?.[fieldName];
    if (Array.isArray(candidate)) {
      return candidate;
    }
    if (typeof candidate === 'string' && candidate.trim() !== '') {
      return [candidate.trim()];
    }
  }

  return [];
};

const normalizeRewardItem = (value) => ({
  name: pickText(value, ['Name', 'name']),
  icon: pickText(value, ['Icon', 'icon']),
  grade: pickText(value, ['Grade', 'grade']),
  iconUrl: pickText(value, ['IconUrl', 'iconUrl', 'icon_url']),
});

const normalizeRewardItems = (value) => {
  const rewardGroups = pickArray(value, ['RewardGroups', 'rewardGroups']);
  if (rewardGroups.length > 0) {
    return rewardGroups.flatMap((group) => pickArray(group, ['RewardItems', 'rewardItems']).map(normalizeRewardItem));
  }

  const rewardItems = pickArray(value, ['RewardItems', 'rewardItems']);
  return rewardItems.map(normalizeRewardItem);
};

const extractItems = (payload) => {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (!payload || typeof payload !== 'object') {
    return [];
  }

  for (const fieldName of ['Items', 'items', 'Data', 'data', 'CalendarItems', 'calendarItems']) {
    const candidate = payload?.[fieldName];
    if (Array.isArray(candidate)) {
      return candidate;
    }
  }

  return [payload];
};

const normalizeStartTimes = (value) => {
  const rawStartTimes = [
    ...pickArray(value, ['StartTimes', 'startTimes']),
    ...pickArray(value, ['StartTime', 'startTime']),
  ];

  return rawStartTimes
    .flatMap((item) => toArray(item))
    .map((item) => String(item).trim())
    .filter(Boolean);
};

const normalizeCalendarItem = (value) => ({
  categoryName: pickText(value, ['CategoryName', 'categoryName', 'category_name']),
  contentsName: pickText(value, ['ContentsName', 'contentsName', 'contents_name']),
  contentsIcon: pickText(value, ['ContentsIcon', 'contentsIcon', 'contents_icon']),
  minItemLevel: (() => {
    const candidate = value?.MinItemLevel ?? value?.minItemLevel ?? value?.min_item_level;
    if (candidate == null || candidate === '') {
      return null;
    }

    const parsed = Number(candidate);
    return Number.isNaN(parsed) ? null : parsed;
  })(),
  startTimes: normalizeStartTimes(value),
  location: pickText(value, ['Location', 'location']),
  rewardItems: normalizeRewardItems(value),
  rawContent: value,
});

const toDateTime = (value) => {
  const text = String(value ?? '').trim();
  if (!text) {
    return null;
  }

  const normalized = text.includes(' ') ? text.replace(' ', 'T') : text;
  const hasTimeZone = /[zZ]|[+-]\d\d:\d\d$/.test(normalized);
  const withZone = hasTimeZone ? normalized : `${normalized}+09:00`;
  const parsed = new Date(withZone);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const flattenCalendarItems = (items) =>
  items.flatMap((item) =>
    item.startTimes
      .map((startTime) => {
        const parsed = toDateTime(startTime);
        if (!parsed) {
          return null;
        }

        return {
          id: `${item.contentsName}|${startTime}`,
          categoryName: item.categoryName,
          contentsName: item.contentsName,
          contentsIcon: item.contentsIcon,
          minItemLevel: item.minItemLevel,
          location: item.location,
          startTimeKst: startTime,
          startDate: new Intl.DateTimeFormat('en-CA', {
            timeZone: 'Asia/Seoul',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
          })
            .format(parsed)
            .replaceAll('/', '-'),
          startHhmm: new Intl.DateTimeFormat('ko-KR', {
            timeZone: 'Asia/Seoul',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
          }).format(parsed),
          slotHhmm: new Intl.DateTimeFormat('ko-KR', {
            timeZone: 'Asia/Seoul',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
          }).format(parsed),
          rewards: Array.isArray(item.rewardItems) ? item.rewardItems : [],
          rawContent: item.rawContent,
          weekStartDate: null,
          weekEndDate: null,
        };
      })
      .filter(Boolean),
  );

const sortItems = (items) =>
  [...items].sort((left, right) => {
    if (left.startDate !== right.startDate) {
      return String(left.startDate).localeCompare(String(right.startDate));
    }

    if (left.slotHhmm !== right.slotHhmm) {
      return String(left.slotHhmm).localeCompare(String(right.slotHhmm));
    }

    if (left.categoryName !== right.categoryName) {
      return String(left.categoryName).localeCompare(String(right.categoryName));
    }

    return String(left.startTimeKst).localeCompare(String(right.startTimeKst));
  });

const groupBySlot = (items) => {
  const grouped = new Map();

  for (const item of items) {
    const slotKey = String(item.slotHhmm ?? '').trim() || '00:00';
    if (!grouped.has(slotKey)) {
      grouped.set(slotKey, []);
    }
    grouped.get(slotKey).push(item);
  }

  return Array.from(grouped.entries()).map(([slotHhmm, slotItems]) => ({
    slotHhmm,
    items: slotItems,
  }));
};

export async function fetchLostArkCalendar({ signal } = {}) {
  if (!LOSTARK_API_KEY) {
    const error = new Error('VITE_LOSTARK_API_KEY가 설정되지 않았습니다.');
    error.code = 'MISSING_LOSTARK_API_KEY';
    throw error;
  }

  const response = await fetch(LOSTARK_API_ENDPOINT, {
    method: 'GET',
    signal,
    headers: {
      accept: 'application/json',
      authorization: `bearer ${LOSTARK_API_KEY}`,
    },
  });

  if (!response.ok) {
    const error = new Error('로스트아크 캘린더 API 호출 실패');
    error.code = 'LOSTARK_API_REQUEST_FAILED';
    throw error;
  }

  const payload = await response.json();
  return extractItems(payload).map(normalizeCalendarItem);
}

export function normalizeLostArkCalendarItems(payload) {
  return extractItems(payload).map(normalizeCalendarItem);
}

export function getLostArkCalendarKey(value) {
  return normalizeText(value);
}

export async function getLostArkCalendarWeek() {
  const items = sortItems(flattenCalendarItems(await fetchLostArkCalendar()));
  const dateKeys = items.map((item) => item.startDate).filter(Boolean);

  return {
    weekStartDate: dateKeys[0] ?? null,
    weekEndDate: dateKeys.at(-1) ?? null,
    items,
  };
}

export async function getLostArkCalendarToday() {
  const targetDate = resolveLoaScheduleDate();
  const items = sortItems(flattenCalendarItems(await fetchLostArkCalendar()).filter((item) => item.startDate === targetDate));

  return {
    date: targetDate,
    groups: groupBySlot(items),
  };
}

export async function getLostArkCalendarDate(date) {
  const normalizedDate = String(date ?? '').trim();
  if (!normalizedDate) {
    throw new Error('조회할 날짜가 필요합니다.');
  }

  const items = sortItems(flattenCalendarItems(await fetchLostArkCalendar()).filter((item) => item.startDate === normalizedDate));

  return {
    date: normalizedDate,
    groups: groupBySlot(items),
  };
}
