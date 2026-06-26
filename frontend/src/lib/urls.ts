export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const ASSET_URL =
  process.env.NEXT_PUBLIC_ASSET_URL || API_URL.replace(/\/api\/?$/, '');

export function getAssetUrl(path?: string | null) {
  if (!path) return '';
  const trimmed = path.trim();
  if (!trimmed) return '';
  if (/^(https?:|blob:|data:)/.test(trimmed)) return trimmed;
  if (trimmed.startsWith('/')) return `${ASSET_URL}${trimmed}`;
  return trimmed;
}
