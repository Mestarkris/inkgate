import { generateTeaser } from "@/lib/ai";
import { getArticle } from "@/lib/articles";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const article = getArticle(slug);

  if (!article) {
    return Response.json({ error: "Article not found" }, { status: 404 });
  }

  const teaser = await generateTeaser(slug);
  return Response.json({ teaser });
}