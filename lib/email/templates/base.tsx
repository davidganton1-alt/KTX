import * as React from 'react';
import { IVORY, INK, MUTED } from '../components';

// Email shell: 600px card on ivory, letterhead wordmark, generous padding,
// footer with a one-click unsubscribe line (List-Unsubscribe header pairs
// with it). Pure tables + inline CSS for client compatibility.

interface BaseTemplateProps {
  preview?: string;
  children: React.ReactNode;
}

export function BaseTemplate({ preview, children }: BaseTemplateProps) {
  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <title>{preview || 'KingdomTradeX'}</title>
        <meta name="x-apple-disable-message-reformatting" />
      </head>
      <body style={{ margin: 0, padding: 0, backgroundColor: IVORY, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
        {preview ? (
          <div style={{ display: 'none', maxHeight: 0, overflow: 'hidden', opacity: 0, color: IVORY }}>
            {preview}&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌
          </div>
        ) : null}
        <table role="presentation" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <tr>
            <td align="center" style={{ padding: '40px 20px' }}>
              <table role="presentation" style={{ width: '600px', maxWidth: '600px', borderCollapse: 'collapse', backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e8e6dd' }}>
                <tr>
                  <td style={{ padding: '36px 40px 8px' }}>
                    <span style={{ fontSize: '20px', fontWeight: 600, letterSpacing: '-0.01em', color: INK }}>
                      Kingdom<span style={{ color: '#a8760a' }}>TradeX</span>
                    </span>
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: '24px 40px 40px' }}>{children}</td>
                </tr>
                <tr>
                  <td style={{ padding: '28px 40px', backgroundColor: IVORY, borderBottomLeftRadius: '12px', borderBottomRightRadius: '12px' }}>
                    <p style={{ margin: 0, fontSize: '12px', color: MUTED, lineHeight: 1.6 }}>
                      © 2026 KingdomTradeX. All rights reserved.
                    </p>
                    <p style={{ margin: '8px 0 0', fontSize: '12px', color: MUTED, lineHeight: 1.6 }}>
                      This is a transactional email related to your account activity.
                    </p>
                    <p style={{ margin: '8px 0 0', fontSize: '12px', color: MUTED, lineHeight: 1.6 }}>
                      Trading involves risk, including the possible loss of principal. Target returns are not guarantees.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  );
}
