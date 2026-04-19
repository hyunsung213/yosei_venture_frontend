/**
 * 백엔드에서 저장된 poster 경로를 완전한 URL로 변환합니다.
 *
 * 백엔드 구조:
 *   - API 라우트:    app.use("/api", routes)          → NEXT_PUBLIC_API_URL 사용 (ex. http://localhost:5000/api)
 *   - 정적 파일:    app.use("/upload", express.static(...)) → 서버 루트 사용 (ex. http://localhost:5000)
 *
 * 따라서 이미지 URL은 NEXT_PUBLIC_API_URL에서 /api suffix를 제거한 서버 루트를 기준으로 합니다.
 */

function getServerRootUrl(): string {
  const apiUrl = process.env.NEXT_PUBLIC_STORAGE_URL ?? "";
  return apiUrl.replace(/\/api\/?$/, "");
}

/**
 * DB에 저장된 경로를 완전한 정적 파일 URL로 변환합니다.
 *
 * - DB 저장 경로 예시: "upload/posters/filename.jpg" 또는 "/upload/posters/filename.jpg"
 * - 이미 완전한 URL(http/https)이면 그대로 반환합니다.
 * - 경로가 없으면 fallback 이미지를 반환합니다.
 */
export function getImage(path?: string | null, fallback = "/board_dummy_1.jpg"): string {
  if (!path) return fallback;

  // 이미 완전한 URL이면 그대로 사용
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  const serverRoot = getServerRootUrl();
  // 슬래시 중복 방지
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${serverRoot}${normalized}`;
}

/**
 * 서버에 저장된 파일 경로에서 원본 파일명을 유추하여 반환합니다.
 * (예: "upload/files/1712345678-공고문.pdf" -> "공고문.pdf")
 */
export function getCleanFileName(path: string): string {
  const parts = path.split("/");
  const lastPart = parts[parts.length - 1];
  
  // 타임스탬프 (일반적으로 13자리 숫자 - 이름 형식) 제거 시도
  // 만약 "-" 가 포함되어 있다면 첫 번째 "-" 이후의 문자열을 원본 파일명으로 간주
  const hyphenIndex = lastPart.indexOf("-");
  if (hyphenIndex !== -1) {
    return lastPart.substring(hyphenIndex + 1);
  }
  
  return lastPart;
}
