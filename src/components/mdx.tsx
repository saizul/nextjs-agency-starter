import { MDXRemote } from "next-mdx-remote/rsc";
import type { ComponentProps, ReactNode } from "react";
import { slugifyHeading } from "@/lib/slug";

function textOf(node: ReactNode): string {
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(textOf).join("");
  if (node && typeof node === "object" && "props" in node) {
    return textOf((node as { props: { children?: ReactNode } }).props.children);
  }
  return "";
}

function H2({ children, ...props }: ComponentProps<"h2">) {
  return (
    <h2 id={slugifyHeading(textOf(children))} {...props}>
      {children}
    </h2>
  );
}

function H3({ children, ...props }: ComponentProps<"h3">) {
  return (
    <h3 id={slugifyHeading(textOf(children))} {...props}>
      {children}
    </h3>
  );
}

const components = { h2: H2, h3: H3 };

/** Render an MDX string on the server. Content comes from files in the repository. */
export function Mdx({ source }: { source: string }) {
  return (
    <div className="prose-content">
      <MDXRemote source={source} components={components} />
    </div>
  );
}
