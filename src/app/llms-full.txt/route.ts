/** /llms-full.txt — every built page's own summary and FAQs. */
import { llmsFullTxt } from "@/lib/seo/llms";

export const dynamic = "force-static";

export function GET() {
  return new Response(llmsFullTxt(), { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
