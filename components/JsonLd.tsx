export function JsonLd() {
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'FinancialService',
    'name': 'KingdomTradeX',
    'url': 'https://kingdomtradex.com',
    'logo': 'https://kingdomtradex.com/logo.png',
    'description': 'Faith-driven AI trading platform pairing biblical stewardship with disciplined algorithmic trading across crypto, US stocks, and commodities.',
    'sameAs': [
      'https://github.com/davidganton1-alt/KTX',
      'https://twitter.com/KingdomTradeX'
    ],
    'areaServed': 'Worldwide',
    'serviceType': 'Algorithmic Trading Platform'
  };

  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    'name': 'KingdomTradeX',
    'url': 'https://kingdomtradex.com',
    'potentialAction': {
      '@type': 'SearchAction',
      'target': 'https://kingdomtradex.com/markets?q={search_term_string}',
      'query-input': 'required name=search_term_string'
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
    </>
  );
}
