
document.addEventListener('DOMContentLoaded', function() {
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Accueil", "item": "https://lid-shop.web.app/" },
      { "@type": "ListItem", "position": 2, "name": "Boutique", "item": "https://lid-shop.web.app/shop" },
      { "@type": "ListItem", "position": 3, "name": "Blog", "item": "https://lid-shop.web.app/blog" }
    ]
  });
  document.head.appendChild(script);
});
