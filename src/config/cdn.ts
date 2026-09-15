// src/config/cdn.ts
// Use VITE_CDN_URL env var if set; otherwise serve assets from local /public
const cdnBase = (import.meta.env.VITE_CDN_URL as string | undefined) ?? '';

export function getAssetUrl(assetPath: string): string {
  const cleanPath = assetPath.startsWith('/') ? assetPath.slice(1) : assetPath;
  if (cdnBase && cdnBase.trim() !== '') {
    const cleanBase = cdnBase.endsWith('/') ? cdnBase.slice(0, -1) : cdnBase;
    return `${cleanBase}/${cleanPath}`;
  }
  return `/${cleanPath}`;
}

export const cdn = { baseUrl: cdnBase };
