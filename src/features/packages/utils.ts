import packageNames from "./package-names.json";

// Type assertion for the JSON import
const knownPackages: Record<string, string> = packageNames;

export function formatAppName(pkgId: string): string {
  // Check if we have a known name for this package
  if (knownPackages[pkgId]) {
    return knownPackages[pkgId];
  }

  // Fallback to parsing the package name
  const parts = pkgId.split(".");
  let segments = [...parts];

  // 1. Remove common TLDs from the start
  if (segments.length > 1 && ["com", "org", "net", "io", "co", "jp", "de", "uk"].includes(segments[0].toLowerCase())) {
    segments.shift();
  }

  // 2. Filter out generic noise words, UNLESS it's the only word left
  // We filter "android", "app", "apps", "mobile"
  const noiseWords = ["android", "app", "apps", "mobile", "client", "internal"];
  let meaningfulSegments = segments.filter((s) => !noiseWords.includes(s.toLowerCase()));

  // If we stripped everything (e.g. "com.android.app"), fallback to the last original segment
  if (meaningfulSegments.length === 0) {
    meaningfulSegments = [parts[parts.length - 1]];
  }

  // 3. Title Case and Join
  return meaningfulSegments
    .map((s) => {
      // Replace separators inside the segment itself (underscore, dash)
      const clean = s.replace(/[._-]/g, " ");
      // Capitalize words
      return clean.replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.substr(1).toLowerCase());
    })
    .join(" ");
}
