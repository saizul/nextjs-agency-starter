import type { Metadata } from "next";
import { BlogListing, blogMetadata } from "@/components/blog-listing";
import { type LocaleParams, resolveLocale } from "@/lib/page";

export async function generateMetadata({ params }: LocaleParams): Promise<Metadata> {
  return blogMetadata(await resolveLocale(params), 1);
}

export default async function BlogIndexPage({ params }: LocaleParams) {
  return <BlogListing locale={await resolveLocale(params)} page={1} />;
}
