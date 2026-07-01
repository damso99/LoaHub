const KST_TIME_ZONE = 'Asia/Seoul';
const KST_HOUR_THRESHOLD = 6;

const formatKstParts = (date = new Date()) => {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: KST_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(date);

  return Object.fromEntries(parts.map((part) => [part.type, part.value]));
};

const buildUtcDateFromKstParts = ({ year, month, day }) => {
  return new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
};

const formatDateKey = (date) => {
  const year = String(date.getUTCFullYear());
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const parseKstDateTime = (value) => {
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

export function resolveLoaScheduleDate(now = new Date()) {
  const parts = formatKstParts(now);
  const kstMinutes = Number(parts.hour) * 60 + Number(parts.minute);
  const baseDate = buildUtcDateFromKstParts(parts);

  if (kstMinutes < KST_HOUR_THRESHOLD * 60) {
    baseDate.setUTCDate(baseDate.getUTCDate() - 1);
  }

  return formatDateKey(baseDate);
}

export function getKstDateKey(value = new Date()) {
  const parts = formatKstParts(value);
  return `${parts.year}-${parts.month}-${parts.day}`;
}

export function isScheduleDateMatch(value, targetDateKey) {
  const parsed = parseKstDateTime(value);
  if (!parsed) {
    return false;
  }

  return getKstDateKey(parsed) === targetDateKey;
}

export function formatKstTime(value) {
  const parsed = parseKstDateTime(value);
  if (!parsed) {
    return '';
  }

  return new Intl.DateTimeFormat('ko-KR', {
    timeZone: KST_TIME_ZONE,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(parsed);
}

export function formatKstDateLabel(value) {
  const parsed = parseKstDateTime(`${String(value ?? '').trim()}T00:00:00+09:00`);
  if (!parsed) {
    return String(value ?? '');
  }

  return new Intl.DateTimeFormat('ko-KR', {
    timeZone: KST_TIME_ZONE,
    month: '2-digit',
    day: '2-digit',
    weekday: 'short',
  }).format(parsed);
}

export function parseKstDateTimeValue(value) {
  return parseKstDateTime(value);
}
