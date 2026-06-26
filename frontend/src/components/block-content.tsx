import { Fragment, type ReactNode } from 'react';
import type { BlockNode } from '@/lib/types';

interface TextChild {
  text?: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  code?: boolean;
  type?: string;
  url?: string;
  children?: TextChild[];
}

function renderInline(children: TextChild[] | undefined): ReactNode {
  if (!children) return null;
  return children.map((child, i) => {
    if (child.type === 'link' && child.url) {
      return (
        <a
          key={i}
          href={child.url}
          className="text-accent underline underline-offset-2 hover:text-accent/80"
          target="_blank"
          rel="noopener noreferrer"
        >
          {renderInline(child.children)}
        </a>
      );
    }
    let node: ReactNode = child.text ?? '';
    if (child.bold) node = <strong>{node}</strong>;
    if (child.italic) node = <em>{node}</em>;
    if (child.code) node = <code className="rounded bg-foreground/5 px-1 py-0.5 text-sm">{node}</code>;
    return <Fragment key={i}>{node}</Fragment>;
  });
}

export function BlockContent({ content }: { content?: BlockNode[] | null }) {
  if (!content?.length) return null;
  const blocks = content as unknown as (BlockNode & {
    level?: number;
    format?: 'ordered' | 'unordered';
    children?: TextChild[];
  })[];

  return (
    <div className="space-y-5 text-lg leading-relaxed text-foreground/80">
      {blocks.map((block, i) => {
        switch (block.type) {
          case 'heading': {
            const Tag = (block.level === 2 ? 'h2' : block.level === 3 ? 'h3' : 'h4') as 'h2';
            return (
              <Tag key={i} className="pt-4 font-display text-2xl font-semibold text-primary">
                {renderInline(block.children)}
              </Tag>
            );
          }
          case 'list':
            return block.format === 'ordered' ? (
              <ol key={i} className="list-decimal space-y-2 pl-6">
                {block.children?.map((li, j) => <li key={j}>{renderInline(li.children)}</li>)}
              </ol>
            ) : (
              <ul key={i} className="list-disc space-y-2 pl-6">
                {block.children?.map((li, j) => <li key={j}>{renderInline(li.children)}</li>)}
              </ul>
            );
          case 'quote':
            return (
              <blockquote key={i} className="border-l-4 border-accent/60 pl-5 italic text-foreground/70">
                {renderInline(block.children)}
              </blockquote>
            );
          default:
            return <p key={i}>{renderInline(block.children)}</p>;
        }
      })}
    </div>
  );
}
