import { Package, QrCode } from "lucide-react";

const LINK_COLUMNS = [
  { title: "À propos", links: ["Contactez-nous", "Devenir partenaire", "À propos de nous", "Actualités", "JoyPlus"] },
  { title: "Nos politiques", links: ["Cookies", "CGV", "Confidentialité", "Déclaration d'accessibilité"] },
  { title: "Besoin d'aide ?", links: ["Votre compte", "Vos commandes", "Paiement et facture", "Expédition et livraison", "Retours & remboursements", "› Aller au service client"] },
];

const PAYMENT_LOGOS = ["AmEx", "CB", "Visa", "Mastercard", "PayPal", "Apple Pay"];

export default function Footer() {
  return (
    <footer className="bg-pdp-surface font-barlow pt-10 pb-10">
      <div className="max-w-[1228px] mx-auto px-4 md:px-12">
        <div className="flex items-center justify-between flex-wrap gap-4 pb-8 border-b border-pdp-line-2">
          <div>
            <span className="text-pdp-red font-extrabold text-2xl">joy.</span>
            <p className="text-sm font-medium text-pdp-ink mt-1">Don't just buy, joy.</p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            {["🌐 Français - FR ˅", "€ EUR - Euro", "🇫🇷 France"].map((label) => (
              <button
                key={label}
                type="button"
                className="h-10 px-4 rounded border border-pdp-line-2 bg-white text-sm font-medium text-pdp-ink"
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-8 border-b border-pdp-line">
          <div className="flex items-center gap-4">
            <Package size={56} className="text-pdp-ink flex-shrink-0" />
            <div>
              <p className="text-base font-bold text-pdp-ink">Soyez les premiers informés</p>
              <p className="text-sm text-pdp-gray-700 mt-1 mb-3">Offres exclusives et nouveautés, directement par email.</p>
              <div className="flex gap-2 max-w-sm">
                <input
                  type="email"
                  placeholder="Entrer votre adresse e-mail"
                  className="flex-1 h-11 px-3 rounded border border-pdp-line-2 bg-white text-sm outline-none"
                />
                <button type="button" className="h-11 px-4 rounded bg-pdp-ink text-white text-sm font-semibold whitespace-nowrap">
                  S'abonner
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 md:border-l md:border-pdp-line md:pl-8">
            <QrCode size={120} className="text-pdp-ink flex-shrink-0" />
            <div>
              <p className="text-base font-bold text-pdp-ink">Téléchargez l'application joy.</p>
              <p className="text-sm text-pdp-gray-700 mt-1 mb-3">Scannez le code pour l'installer.</p>
              <div className="flex gap-2">
                <span className="h-10 px-4 rounded bg-black text-white text-xs font-semibold flex items-center">App Store</span>
                <span className="h-10 px-4 rounded bg-black text-white text-xs font-semibold flex items-center">Google Play</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 py-8 border-b border-pdp-line">
          {LINK_COLUMNS.map((col) => (
            <div key={col.title}>
              <h3 className="text-base font-bold text-pdp-ink mb-3">{col.title}</h3>
              <ul className="space-y-2">
                {col.links.map((link) => (
                  <li key={link}>
                    <button type="button" className="text-sm text-pdp-ink hover:underline text-left">{link}</button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between flex-wrap gap-3 pt-6">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-pdp-gray-700 mr-1">Nous acceptons</span>
            {PAYMENT_LOGOS.map((label) => (
              <span key={label} className="h-[22px] px-2 flex items-center rounded-[3px] border border-pdp-line-2 text-[10px] font-semibold text-pdp-gray-700">
                {label}
              </span>
            ))}
          </div>
          <span className="text-xs text-pdp-gray-700">© 2026 joy. Tous droits réservés</span>
        </div>
      </div>
    </footer>
  );
}
