'use client';

import { useEffect, useRef } from 'react';
import { TRUSTBOX_TEMPLATES } from '@/lib/trustpilot';

interface TrustBoxProps {
  template: keyof typeof TRUSTBOX_TEMPLATES;
  className?: string;
}

export function TrustBox({ template, className }: TrustBoxProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current && (window as any).Trustpilot) {
      (window as any).Trustpilot.loadFromElement(ref.current, true);
    }
  }, [template]);

  const templateId = TRUSTBOX_TEMPLATES[template];

  return (
    <div
      ref={ref}
      className={`trustpilot-widget ${className || ''}`}
      data-template-id={templateId}
      data-businessunit-id="YOUR_BUSINESS_UNIT_ID"
      data-style-height="auto"
      data-style-width="100%"
      data-theme="light"
      data-stars="1,2,3,4,5"
      data-no-reviews-text="No reviews yet"
      data-review-languages="en"
    >
      <a
        href="https://www.trustpilot.com/review/kingdomtradex.com"
        target="_blank"
        rel="noopener noreferrer"
      >
        Trustpilot
      </a>
    </div>
  );
}
