/** Decor Carpi – media CDN (Manus CloudFront) */
export const DECOR_CARPI_CDN =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663463855860/5JYUyBvQa2GUNcqbsccVam";

export function cdnAsset(path: string): string {
  return `${DECOR_CARPI_CDN}/${path.replace(/^\//, "")}`;
}
