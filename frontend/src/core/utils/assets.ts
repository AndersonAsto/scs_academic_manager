import { environment } from "../../environments/environment";

export function resolveAssetUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  return `${environment.assetsUrl}${path}`;
}