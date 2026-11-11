/**
 * Browser-safe content: only the small JSON files (no file-system access).
 * Client components import from here; server code imports from "@/lib/content".
 */
import navigationJson from "@content/navigation.json";
import siteJson from "@content/site.json";

export const site = siteJson;
export const navigation = navigationJson;
