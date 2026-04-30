
function getServerRootUrl(): string {
  const apiUrl = process.env.NEXT_PUBLIC_STORAGE_URL ?? "";
  return apiUrl.replace(/\/api\/?$/, "");
}


export function getImage(path?: string | null, fallback = "/board_dummy_1.jpg"): string {
  if (!path) return fallback;

  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  const serverRoot = getServerRootUrl();
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${serverRoot}${normalized}`;
}

export function getCleanFileName(path: string): string {
  const parts = path.split("/");
  const lastPart = parts[parts.length - 1];
  
  const hyphenIndex = lastPart.indexOf("-");
  if (hyphenIndex !== -1) {
    return lastPart.substring(hyphenIndex + 1);
  }
  
  return lastPart;
}
