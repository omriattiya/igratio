export const TUTORIAL_IMAGES = [
  { src: "/1_accounts_centre.png", width: 454, height: 268 },
  { src: "/2_information_and_permissions.png", width: 386, height: 659 },
  { src: "/3_export_information.png", width: 781, height: 656 },
  { src: "/4_export_information_popup.png", width: 630, height: 691 },
  { src: "/5_choose_profile.png", width: 615, height: 439 },
  { src: "/6_where_to_export.png", width: 619, height: 443 },
  { src: "/7_what_to_exoprt.png", width: 621, height: 835 },
] as const;

const imageCache = new Map<string, string>();
let preloadStarted = false;

export function preloadAllTutorialImages(): void {
  if (preloadStarted) return;
  preloadStarted = true;

  for (const { src } of TUTORIAL_IMAGES) {
    fetch(src)
      .then((res) => res.blob())
      .then((blob) => {
        imageCache.set(src, URL.createObjectURL(blob));
      })
      .catch(() => {});
  }
}

export function getCachedSrc(originalSrc: string): string {
  return imageCache.get(originalSrc) ?? originalSrc;
}
