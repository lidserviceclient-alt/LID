
document.addEventListener('DOMContentLoaded', function() {
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Life Distribution",
    "alternateName": "Lid App",
    "url": "https://lid-shop.web.app",
    "logo": "https://lid-shop.web.app/imgs/logo.png",
    "description": "Plateforme e-commerce qui connecte acheteurs et vendeurs en Afrique avec des solutions de paiement sécurisées",
    "foundingDate": "2023",
    "areaServed": { "@type": "Country", "name": "Côte d'Ivoire" },
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "Customer Service",
      "availableLanguage": ["French"]
    }
  });
  document.head.appendChild(script);
});
