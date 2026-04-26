'use client';

import { useEffect, useRef } from 'react';

interface HtmlContentProps {
  html: string;
  className?: string;
}

export default function HtmlContent({ html, className = 'page active' }: HtmlContentProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const scripts = ref.current.querySelectorAll('script');
    scripts.forEach((oldEl) => {
      if (oldEl.dataset.teExecuted === 'true') return;
      const s = document.createElement('script');
      for (const attr of oldEl.attributes) s.setAttribute(attr.name, attr.value);
      s.text = oldEl.textContent || '';
      s.dataset.teExecuted = 'true';
      oldEl.parentNode?.replaceChild(s, oldEl);
    });
  }, [html]);

  return (
    <div
      ref={ref}
      className={className}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
