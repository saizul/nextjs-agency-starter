import Link from "next/link";
import { Container } from "@/components/ui";
import { defaultLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";

// Rendered for notFound() calls inside locale routes. Keep it language-neutral-friendly.
export default function NotFound() {
  const dict = getDictionary(defaultLocale);
  return (
    <Container className="py-24 text-center">
      <h1 className="text-4xl font-bold">{dict.notFound.title}</h1>
      <p className="mt-4 text-muted">{dict.notFound.body}</p>
      <p className="mt-8">
        <Link href="/" className="font-semibold text-brand underline underline-offset-4">
          {dict.notFound.home}
        </Link>
      </p>
    </Container>
  );
}
