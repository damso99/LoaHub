import { api } from './client';

const unwrap = (response) => response?.data?.data ?? response?.data ?? response;

const normalizeReward = (reward) => ({
  name: reward?.name ?? reward?.Name ?? '',
  icon: reward?.icon ?? reward?.Icon ?? '',
  grade: reward?.grade ?? reward?.Grade ?? '',
  iconUrl: reward?.iconUrl ?? reward?.icon_url ?? reward?.icon ?? '',
});

const normalizeTodayItem = (item, contentType) => ({
  id: item?.id ?? `${contentType}-${item?.contentName ?? item?.contentsName ?? ''}-${item?.startTime ?? ''}`,
  contentName: item?.contentName ?? item?.contentsName ?? '',
  contentType,
  startTime: item?.startTime ?? item?.startTimeKst ?? '',
  imageUrl: item?.imageUrl ?? item?.contentsIcon ?? '',
  rewardType: item?.rewardType ?? null,
  rewards: Array.isArray(item?.rewards) ? item.rewards.map(normalizeReward) : [],
  rewardItems: Array.isArray(item?.rewardItems) ? item.rewardItems.map(normalizeReward) : [],
  rewardText: item?.rewardText ?? '',
  location: item?.location ?? '',
});

const normalizeWeekItem = (item) => ({
  id: item?.id ?? `${item?.startDate ?? ''}-${item?.slotHhmm ?? ''}-${item?.contentsName ?? ''}`,
  categoryName: item?.categoryName ?? item?.category_name ?? '',
  contentsName: item?.contentsName ?? item?.contents_name ?? '',
  contentsIcon: item?.contentsIcon ?? item?.contents_icon ?? '',
  minItemLevel: item?.minItemLevel ?? item?.min_item_level ?? null,
  location: item?.location ?? '',
  startTimeKst: item?.startTimeKst ?? item?.start_time_kst ?? '',
  startDate: item?.startDate ?? item?.start_date ?? '',
  startHhmm: item?.startHhmm ?? item?.start_hhmm ?? '',
  slotHhmm: item?.slotHhmm ?? item?.slot_hhmm ?? '',
  rewards: Array.isArray(item?.rewards) ? item.rewards.map(normalizeReward) : [],
  rawContent: item?.rawContent ?? item?.raw_content ?? null,
});

const normalizeDay = (day) => ({
  date: day?.date ?? '',
  groups: Array.isArray(day?.groups)
    ? day.groups.map((group) => ({
        slotHhmm: group?.slotHhmm ?? '',
        items: Array.isArray(group?.items) ? group.items.map(normalizeWeekItem) : [],
      }))
    : [],
});

export async function fetchLostArkCalendar() {
  const response = await api.getLostArkCalendarToday();
  const payload = unwrap(response);

  return [
    ...(payload?.adventureIslands ?? []).map((item) => normalizeTodayItem(item, 'adventureIslands')),
    ...(payload?.chaosGates ?? []).map((item) => normalizeTodayItem(item, 'chaosGates')),
    ...(payload?.fieldBosses ?? []).map((item) => normalizeTodayItem(item, 'fieldBosses')),
  ];
}

export async function getLostArkCalendarToday() {
  const response = await api.getLostArkCalendarToday();
  const payload = unwrap(response);
  return {
    date: payload?.date ?? '',
    adventureIslands: Array.isArray(payload?.adventureIslands)
      ? payload.adventureIslands.map((item) => normalizeTodayItem(item, 'adventureIslands'))
      : [],
    chaosGates: Array.isArray(payload?.chaosGates)
      ? payload.chaosGates.map((item) => normalizeTodayItem(item, 'chaosGates'))
      : [],
    fieldBosses: Array.isArray(payload?.fieldBosses)
      ? payload.fieldBosses.map((item) => normalizeTodayItem(item, 'fieldBosses'))
      : [],
  };
}

export async function getLostArkCalendarWeek() {
  const response = await api.getLostArkCalendarWeek();
  const payload = unwrap(response);

  return {
    weekStartDate: payload?.weekStartDate ?? null,
    weekEndDate: payload?.weekEndDate ?? null,
    items: Array.isArray(payload?.items) ? payload.items.map(normalizeWeekItem) : [],
  };
}

export async function getLostArkCalendarDate(date) {
  const response = await api.getLostArkCalendarDate(date);
  const payload = unwrap(response);

  return {
    date: payload?.date ?? date ?? '',
    groups: Array.isArray(payload?.groups) ? payload.groups.map(normalizeDayGroup) : [],
  };
}

const normalizeDayGroup = (group) => ({
  slotHhmm: group?.slotHhmm ?? '',
  items: Array.isArray(group?.items) ? group.items.map(normalizeWeekItem) : [],
});
