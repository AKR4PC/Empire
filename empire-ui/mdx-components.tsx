import type { MDXComponents } from "mdx/types";

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    ...components,
    hr: ({ ...props }) => <hr className="mt-2 mb-6" {...props} />,
    code: (props) => (
      <code
        className="bg-gray-800 text-pink-400 rounded px-1 py-0.5 font-mono text-sm"
        {...props}
      />
    ),
    pre: (props) => (
      <pre
        className="bg-gray-900 text-white p-4 rounded-md overflow-x-auto"
        {...props}
      />
    ),
    table: (props) => (
      <table
        className="min-w-min w-full border-separate border-spacing-0 rounded-lg overflow-hidden"
        {...props}
      />
    ),
    th: (props) => (
      <th
        className="bg-white/10 px-4 py-3 text-sm font-semibold text-white uppercase tracking-wider border-b-2 border-white/15"
        {...props}
      />
    ),
    td: (props) => (
      <td
        className="px-4 py-3 text-sm text-white/90 border-b border-white/5"
        {...props}
      />
    ),
    tr: (props) => <tr className="hover:bg-white/5 transition-colors" {...props} />,
  };
}
