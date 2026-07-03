// ---------------------------------------------------------------------------
// Informations société / mentions légales
// À remplacer par les vraies valeurs (idéalement injectées via appConfig
// une fois disponibles côté back-office, comme legalEmail dans Terms.jsx).
// ---------------------------------------------------------------------------
export const LEGAL_INFO = {
  raisonSociale: "Life Event SARL",
  rccm: "CI-ABJ-2019-M-21587",
  adresse: "Cocody, Attoban - Abidjan",
  telephone: "+225 07 11 246 145",
  mail:"lid.service.client@gmail.com",
  updateDate: "3 juillet 2026",
  delaiReversementJours: "14",
};

// ---------------------------------------------------------------------------
// Notes de bas de page (sources légales citées dans le document d'origine).
// Chaque note est reliée au texte par un appel `{ fn: id }` inséré dans les
// paragraphes ci-dessous, et listée en fin de page avec son lien source.
// ---------------------------------------------------------------------------
export const FOOTNOTES = [
  {
    id: 1,
    label: "Loi n°2013-546 du 30 juillet 2013 relative aux transactions électroniques",
    source: "ONECI — fiche PDF",
    url: "https://www.oneci.ci/uploads/files/articles/1638790502-loi-n2013-546-du-30-juillet-2013.pdf",
  },
  {
    id: 2,
    label: "Impôts et taxes en Côte d'Ivoire — articles 350 à 352 du Code général des Impôts",
    source: "Direction Générale des Impôts (DGI)",
    url: "https://www.dgi.gouv.ci/assets/documents/IMPOTS%20ET%20TAXES%20EN%20COTE%20D'IVOIRE%20.pdf",
  },
  {
    id: 3,
    label:
      "Note explicative n°03949/MBPE/DGI du 9 octobre 2023 sur l'assujettissement des plateformes de vente en ligne à la TVA",
    source: "Direction Générale des Impôts (DGI)",
    url: "https://www.dgi.gouv.ci/assets/documents/note_explicative_03949.pdf",
  },
  {
    id: 4,
    label: "Loi n°2016-412 du 15 juin 2016 relative à la consommation (texte intégral)",
    source: "FAOLEX",
    url: "https://faolex.fao.org/docs/pdf/Ivc172699.pdf",
  },
  {
    id: 5,
    label: "Loi n°2013-546 du 30 juillet 2013 relative aux transactions électroniques",
    source: "ONECI — fiche PDF",
    url: "https://www.oneci.ci/uploads/files/articles/1638790502-loi-n2013-546-du-30-juillet-2013.pdf",
  },
];

// ---------------------------------------------------------------------------
// Contenu des CGV, structuré en données pour rester scalable :
// ajouter/retirer/réordonner un article ne touche qu'à ce tableau,
// jamais au JSX de rendu.
//
// Un paragraphe peut être :
//  - une chaîne simple
//  - un tableau de segments (chaîne | { fn: <id note> }) quand un appel de
//    note de bas de page doit être inséré au milieu du texte.
// ---------------------------------------------------------------------------
export const buildArticles = ({ legalEmail, legal }) => [
  {
    title: "Article 1 : Objet et champ d'application",
    paragraphs: [
      `Les présentes Conditions Générales de Vente (ci-après les « CGV ») régissent toute commande de produits et/ou services passée sur la plateforme LID (ci-après la « Plateforme »), éditée par ${legal.raisonSociale}, RCCM Abidjan n°${legal.rccm}, dont le siège est à ${legal.adresse}, Côte d'Ivoire (ci-après l'« Éditeur »), accessible via le site internet lidshopping.com.`,
      "La Plateforme fonctionne selon un modèle hybride : certains produits et services sont vendus directement par l'Éditeur (« Ventes Directes »), d'autres sont vendus par des Vendeurs tiers référencés sur la Plateforme (« Ventes Marketplace »). Le vendeur applicable à chaque commande, Éditeur ou Vendeur tiers, est indiqué de manière claire et non ambiguë sur la fiche produit et au récapitulatif de commande, avant validation.",
      "Pour les Ventes Directes, le contrat de vente est conclu directement entre l'Acheteur et l'Éditeur. Pour les Ventes Marketplace, le contrat de vente est conclu directement entre l'Acheteur et le Vendeur tiers ; la Plateforme intervient alors en qualité d'intermédiaire technique et de tiers de confiance pour la gestion de la commande et du paiement.",
    ],
  },
  {
    title: "Article 2 : Produits et services concernés",
    paragraphs: [
      "Les présentes CGV s'appliquent à l'ensemble des produits physiques et des services proposés à la vente sur la Plateforme, que ce soit par l'Éditeur ou par un Vendeur tiers, dans la limite des catégories autorisées. Sont notamment exclus de la vente les produits illicites, contrefaits, dangereux, périmés ou soumis à une réglementation spécifique non respectée (médicaments, armes, produits du tabac, etc.).",
    ],
  },
  {
    title: "Article 3 : Commande",
    paragraphs: [
      "L'Acheteur sélectionne le ou les produits/services souhaités, les ajoute à son panier, puis valide sa commande après vérification du récapitulatif (caractéristiques, prix, identité du vendeur — Éditeur ou Vendeur tiers —, frais de livraison, adresse de livraison, moyen de paiement).",
      [
        "La validation de la commande, accompagnée du paiement ou de la confirmation du mode de paiement choisi, vaut acceptation irrévocable des présentes CGV et formation du contrat de vente avec le vendeur concerné (Éditeur ou Vendeur tiers). Un récapitulatif de commande est envoyé à l'Acheteur par e-mail et/ou notification sur l'application, conformément à l'obligation d'accusé de réception prévue par la loi n°2013-546 du 30 juillet 2013 relative aux transactions électroniques",
        { fn: 1 },
        ".",
      ],
      "Une même commande peut comporter à la fois des articles Vente Directe et des articles Vente Marketplace ; dans ce cas, elle donne lieu à autant de contrats de vente distincts que de vendeurs concernés, bien qu'un paiement unique et un suivi de livraison unifié soient proposés à l'Acheteur.",
    ],
  },
  {
    title: "Article 4 : Prix",
    paragraphs: [
      [
        "Les prix des produits et services sont affichés en Francs CFA (FCFA), toutes taxes comprises (TTC), hors frais de livraison qui sont précisés avant validation finale de la commande. Conformément aux articles 350 à 352 du Code général des Impôts",
        { fn: 2 },
        ", la Taxe sur la Valeur Ajoutée (TVA), actuellement fixée à 18 %, est incluse dans le prix affiché dès lors que la loi ivoirienne la rend applicable",
        { fn: 3 },
        ".",
      ],
      "Pour les Ventes Directes, l'Éditeur est seul responsable de la conformité de ses prix et de sa TVA à la réglementation fiscale ivoirienne. Pour les Ventes Marketplace, chaque Vendeur tiers reste seul responsable de la conformité de ses prix à la réglementation fiscale applicable, notamment en matière de TVA lorsque celle-ci est due.",
      "La Plateforme se réserve le droit de modifier ses éventuels frais de service à tout moment, sans effet sur les commandes déjà validées.",
    ],
  },
  {
    title: "Article 5 : Modes de paiement",
    paragraphs: [
      "Le règlement des commandes peut s'effectuer, selon les options proposées sur la fiche produit, par les moyens suivants :",
    ],
    list: [
      "Mobile Money : Orange Money, MTN Mobile Money, Moov Money, Wave ;",
      "Carte bancaire (Visa, Mastercard) via une passerelle de paiement sécurisée ;",
      "Paiement à la livraison (« Cash on Delivery »), en espèces ou par Mobile Money, lorsque cette option est disponible pour la zone de livraison concernée.",
    ],
    paragraphsAfterList: [
      "Pour les Ventes Marketplace payées en ligne (Mobile Money et carte), les fonds sont conservés sur un compte séquestre technique jusqu'à confirmation de la bonne réception de la commande par l'Acheteur, puis reversés au Vendeur tiers déduction faite de la commission de la Plateforme, selon les délais prévus à l'Article 11. Pour les Ventes Directes, les fonds sont perçus directement par l'Éditeur.",
      "Pour le paiement à la livraison, l'Acheteur s'engage à disposer du montant exact dû lors de la remise du colis. Tout refus de paiement injustifié à la livraison pourra entraîner la facturation de frais de réacheminement et, en cas de refus répétés, la suspension de la possibilité d'utiliser cette option de paiement.",
    ],
  },
  {
    title: "Article 6 : Livraison",
    paragraphs: [
      "Les délais et zones de livraison (Abidjan, intérieur de la Côte d'Ivoire, sous-région UEMOA le cas échéant) sont précisés sur la fiche de chaque produit ou service au moment de la commande et peuvent varier selon le vendeur (Éditeur ou Vendeur tiers) et le prestataire logistique choisi.",
      "La livraison est réputée effectuée dès remise du produit à l'Acheteur ou à toute personne habilitée par lui à l'adresse indiquée lors de la commande. L'Acheteur est invité à vérifier l'état du colis à réception et à signaler toute anomalie (colis endommagé, produit manquant ou non conforme) dans un délai de quarante-huit (48) heures auprès du service client de la Plateforme.",
      "En cas de retard de livraison significatif imputable au vendeur ou au transporteur, l'Acheteur peut solliciter l'annulation de sa commande et le remboursement intégral via le service client de la Plateforme.",
    ],
  },
  {
    title: "Article 7 : Droit de rétractation, retours et remboursement",
    paragraphs: [
      [
        "Conformément à la loi n°2016-412 du 15 juin 2016 relative à la consommation",
        { fn: 4 },
        " et aux usages applicables au commerce électronique en Côte d'Ivoire, sauf exception légale (produits personnalisés, denrées périssables, produits descellés pour des raisons d'hygiène, services pleinement exécutés avec l'accord de l'Acheteur), l'Acheteur consommateur dispose d'un délai de sept (7) jours calendaires à compter de la réception du produit pour exercer son droit de rétractation, sans avoir à justifier de motif, que le produit soit vendu par l'Éditeur ou par un Vendeur tiers.",
      ],
      "Pour exercer ce droit, l'Acheteur doit contacter le service client de la Plateforme et retourner le produit dans son état d'origine, complet et non utilisé. Les frais de retour sont à la charge de l'Acheteur, sauf si le produit est non conforme ou défectueux, auquel cas ils sont pris en charge par le vendeur concerné (Éditeur ou Vendeur tiers).",
      "Le remboursement intervient dans un délai maximum de quatorze (14) jours ouvrés à compter de la réception et de la vérification du produit retourné, par le même moyen de paiement que celui utilisé lors de l'achat (recrédit Mobile Money, carte bancaire) ou par tout autre moyen convenu avec l'Acheteur. Pour les Ventes Marketplace, ce remboursement est avancé par la Plateforme via le compte séquestre puis, le cas échéant, répercuté sur les sommes dues au Vendeur tiers.",
    ],
  },
  {
    title: "Article 8 : Garanties",
    paragraphs: [
      "Les produits vendus sur la Plateforme, qu'ils proviennent de l'Éditeur ou d'un Vendeur tiers, bénéficient des garanties légales applicables en Côte d'Ivoire et dans l'espace OHADA, notamment la garantie contre les vices cachés et la garantie de conformité. Pour les Ventes Directes, ces garanties sont mises en œuvre directement auprès de l'Éditeur. Pour les Ventes Marketplace, elles sont mises en œuvre auprès du Vendeur tiers concerné, la Plateforme accompagnant l'Acheteur dans ses démarches en cas de litige.",
    ],
  },
  {
    title: "Article 9 : Rôle, commission et obligations de la Plateforme",
    paragraphs: [
      "Pour les Ventes Marketplace, la Plateforme perçoit auprès de chaque Vendeur tiers une commission sur les ventes réalisées, dont le taux est précisé dans les conditions spécifiques applicables aux Vendeurs (« Conditions Vendeurs »). Cette commission rémunère les services de mise en relation, de paiement sécurisé et d'assistance proposés par la Plateforme.",
      "La Plateforme s'engage à mettre en œuvre des moyens raisonnables pour sécuriser les transactions et vérifier l'identité des Vendeurs tiers référencés (procédure KYC), sans toutefois se substituer à ceux-ci dans l'exécution de leurs obligations contractuelles. Pour les Ventes Directes, l'Éditeur assume l'intégralité des obligations du vendeur telles que décrites aux articles 6 à 8 des présentes CGV.",
    ],
  },
  {
    title: "Article 10 : Facturation",
    paragraphs: [
      "Une facture ou un justificatif d'achat est mis à disposition de l'Acheteur pour chaque commande. Pour les Ventes Directes, la facture est émise par l'Éditeur. Pour les Ventes Marketplace, la facture est émise par le Vendeur tiers ou, pour son compte, par la Plateforme lorsque celle-ci en a été mandatée à cet effet dans les Conditions Vendeurs.",
    ],
  },
  {
    title: "Article 11 : Reversement des fonds aux Vendeurs tiers",
    paragraphs: [
      `Les sommes payées par les Acheteurs au titre des Ventes Marketplace sont reversées aux Vendeurs tiers, déduction faite de la commission de la Plateforme et des éventuels frais de transaction Mobile Money ou bancaire, dans un délai de ${legal.delaiReversementJours} jours ouvrés après confirmation de la livraison, sur le compte Mobile Money ou bancaire renseigné par le Vendeur tiers lors de son inscription.`,
    ],
  },
  {
    title: "Article 12 : Annulation de commande",
    paragraphs: [
      "L'Acheteur peut annuler sa commande tant que celle-ci n'a pas été préparée ou expédiée, via son espace personnel ou le service client. Le vendeur concerné (Éditeur ou Vendeur tiers) peut également annuler une commande en cas d'indisponibilité du produit, auquel cas l'Acheteur est intégralement remboursé dans un délai de sept (7) jours ouvrés.",
    ],
  },
  {
    title: "Article 13 : Litiges relatifs à une commande",
    paragraphs: [
      `En cas de litige relatif à une Vente Directe (non-conformité, non-livraison, produit défectueux), l'Acheteur contacte directement le service client de la Plateforme à l'adresse ${legalEmail}.`,
      `En cas de litige relatif à une Vente Marketplace, l'Acheteur est invité à contacter en premier lieu le Vendeur tiers concerné via la messagerie de la Plateforme. À défaut de résolution amiable sous soixante-douze (72) heures, l'Acheteur peut saisir le service de médiation de la Plateforme à l'adresse ${legalEmail}, qui s'efforcera de trouver une solution équitable entre les parties, sans préjudice du droit de chacune d'elles de saisir les juridictions compétentes.`,
    ],
  },
  {
    title: "Article 14 : Responsabilité",
    paragraphs: [
      [
        "Pour les Ventes Directes, l'Éditeur est seul responsable, en qualité de vendeur, de la conformité, de la qualité, de la disponibilité et de la livraison des produits et services proposés, conformément au principe de responsabilité de plein droit du cybercommerçant posé par l'article 7 de la loi n°2013-546 du 30 juillet 2013",
        { fn: 5 },
        ".",
      ],
      "Pour les Ventes Marketplace, le Vendeur tiers est seul responsable de la conformité, de la qualité, de la disponibilité et de la livraison des produits et services qu'il propose. La responsabilité de la Plateforme ne saurait être engagée en cas de manquement du Vendeur tiers à ses obligations, sauf faute propre de la Plateforme dans la gestion du paiement ou de la mise en relation.",
    ],
  },
  {
    title: "Article 15 : Force majeure",
    paragraphs: [
      "Aucune des parties ne pourra être tenue responsable d'un retard ou d'une inexécution résultant d'un cas de force majeure tel que reconnu par la jurisprudence et le droit OHADA, incluant notamment les coupures prolongées d'électricité ou de réseaux de télécommunications, les catastrophes naturelles, les troubles civils, les grèves générales ou les décisions des autorités publiques.",
    ],
  },
  {
    title: "Article 16 : Droit applicable et juridiction compétente",
    paragraphs: [
      "Les présentes CGV sont régies par le droit ivoirien, notamment la loi n°2013-546 du 30 juillet 2013 relative aux transactions électroniques (telle que modifiée par l'ordonnance n°2024-950 du 30 octobre 2024), la loi n°2016-412 du 15 juin 2016 relative à la consommation, et les Actes uniformes OHADA applicables, notamment en matière de droit commercial général et de transactions électroniques.",
      "Tout litige né de l'interprétation ou de l'exécution des présentes CGV qui n'aurait pu être résolu à l'amiable sera soumis à la compétence exclusive du Tribunal de Commerce d'Abidjan, sous réserve des dispositions impératives protectrices applicables aux consommateurs.",
    ],
  },
  {
    title: "Article 17 : Contact",
    paragraphs: [
      `Pour toute question relative à une commande ou aux présentes CGV : ${legalEmail} / ${legal.telephone} / ${legal.adresse}.`,
    ],
  },
];