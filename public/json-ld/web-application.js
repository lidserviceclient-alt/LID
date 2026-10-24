
document.addEventListener('DOMContentLoaded', function() {
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Lid App",
    "alternateName": "Life Distribution",
    "url": "https://lid-shop.web.app",
    "applicationCategory": "ECommerceApplication",
    "operatingSystem": "Web, iOS, Android",
    "description": "Marketplace e-commerce innovante permettant l'achat et la vente de produits en ligne avec paiements sécurisés et interface moderne.",
    "offers": { "@type": "Offer", "price": "0", "priceCurrency": "XOF" },
    "publisher": {
      "@type": "Organization",
      "name": "Life Distribution",
      "logo": { "@type": "ImageObject", "url": "https://lid-shop.web.app/imgs/logo.png", "width": "600", "height": "60" }
    },
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://lid-shop.web.app/search?q={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  });
  document.head.appendChild(script);
});
