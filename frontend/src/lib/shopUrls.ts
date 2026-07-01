export type ShopUrlParams = {
  category?: string | undefined;
  collection?: string | undefined;
  search?: string | undefined;
  project?: string | undefined;
  sortBy?: string | undefined;
  minPrice?: string | undefined;
  maxPrice?: string | undefined;
  page?: string | undefined;
};

const SEGMENT_KEYS: Record<string, keyof ShopUrlParams> = {
  category: 'category',
  collection: 'collection',
  search: 'search',
  project: 'project',
  sort: 'sortBy',
  'min-price': 'minPrice',
  'max-price': 'maxPrice',
  page: 'page',
};

function cleanValue(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

function pushPair(segments: string[], key: string, value: unknown) {
  const cleaned = cleanValue(value);
  if (!cleaned) return;
  segments.push(key, encodeURIComponent(cleaned));
}

export function buildShopPath(params: ShopUrlParams = {}) {
  const segments = ['shop'];
  const category = cleanValue(params.category || params.collection);
  const search = cleanValue(params.search);
  const project = cleanValue(params.project);

  if (search) {
    pushPair(segments, 'search', search);
  } else if (category) {
    pushPair(segments, 'category', category);
  } else if (project) {
    pushPair(segments, 'project', project);
  }

  if (params.sortBy && params.sortBy !== 'createdAt') pushPair(segments, 'sort', params.sortBy);
  pushPair(segments, 'min-price', params.minPrice);
  pushPair(segments, 'max-price', params.maxPrice);
  if (params.page && params.page !== '1') pushPair(segments, 'page', params.page);

  return `/${segments.join('/')}`;
}

export function parseShopSegments(segments: string[] = []): ShopUrlParams {
  const params: ShopUrlParams = {};

  for (let index = 0; index < segments.length; index += 2) {
    const key = segments[index];
    const value = segments[index + 1];
    const paramKey = SEGMENT_KEYS[key];
    if (!paramKey || !value) continue;
    params[paramKey] = decodeURIComponent(value);
  }

  return params;
}
