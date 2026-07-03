// ---------------------------------------------------------------------------
// Informations société / mentions légales
// À remplacer par les vraies valeurs (idéalement injectées via appConfig
// une fois disponibles côté back-office, comme legalEmail/dpoEmail dans
// Terms.jsx / Cgv.jsx).
// ---------------------------------------------------------------------------
export const LEGAL_INFO = {
  raisonSociale: "Life Event SARL",
  capital: "5.000.000",
  rccm: "CI-ABJ-2019-M-21587",
  ncc: "1505671 E",
  adresse: "Cocody, Attoban - Abidjan",
  telephone: "+225 07 11 246 145",
  mail: "lid.service.client@gmail.com",
  updateDate: "3 juillet 2026",
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
    label: "Décret n°2024-381 du 12 juin 2024 portant institution de la Carte de Commerçant",
    source: "JuriAfrica",
    url: "https://www.juriafrica.com/lex/decret-2024-381-12-juin-2024-56280.htm",
  },
  {
    id: 3,
    label: "Loi n°2013-450 du 19 juin 2013 relative à la protection des données à caractère personnel",
    source: "ARTCI — fiche PDF",
    url: "https://www.artci.ci/images/stories/pdf/lois/loi_2013_450.pdf",
  },
  {
    id: 4,
    label: "Impôts et taxes en Côte d'Ivoire — articles 350 à 352 du Code général des Impôts",
    source: "Direction Générale des Impôts (DGI)",
    url: "https://www.dgi.gouv.ci/assets/documents/IMPOTS%20ET%20TAXES%20EN%20COTE%20D'IVOIRE%20.pdf",
  },
  {
    id: 5,
    label:
      "Note explicative n°03949/MBPE/DGI du 9 octobre 2023 sur l'assujettissement des plateformes de vente en ligne à la TVA",
    source: "Direction Générale des Impôts (DGI)",
    url: "https://www.dgi.gouv.ci/assets/documents/note_explicative_03949.pdf",
  },
  {
    id: 6,
    label: "Loi n°2013-546 du 30 juillet 2013 relative aux transactions électroniques",
    source: "ONECI — fiche PDF",
    url: "https://www.oneci.ci/uploads/files/articles/1638790502-loi-n2013-546-du-30-juillet-2013.pdf",
  },
  {
    id: 7,
    label: "Le consentement du consommateur dans la loi ivoirienne relative à la consommation",
    source: "AFRILEX — S. G. Kablan",
    url: "https://afrilex.u-bordeaux.fr/wp-content/uploads/2021/03/Afrilex_Sylvain-Georges_KABLAN___le_consentement_du_consommateur_dans_la_loi_ivoirienne_relative_a_la_consommation-.pdf",
  },
];

// ---------------------------------------------------------------------------
// Contenu des CGU, structuré en données pour rester scalable :
// ajouter/retirer/réordonner un article ne touche qu'à ce tableau,
// jamais au JSX de rendu.
//
// Un paragraphe peut être :
//  - une chaîne simple
//  - un tableau de segments (chaîne | { fn: <id note> }) quand un appel de
//    note de bas de page doit être inséré au milieu du texte
//  - un objet { subtitle, text } pour un sous-titre + paragraphe (ex: Article 5)
// ---------------------------------------------------------------------------
export const buildArticles = ({ legalEmail, dpoEmail = legalEmail, legal }) => [
  {
    title: "Article 1 : Objet",
    paragraphs: [
      "Les présentes Conditions Générales d'Utilisation (ci-après les « CGU ») ont pour objet de définir les modalités et conditions d'accès et d'utilisation de la plateforme de commerce électronique LID (ci-après la « Plateforme »), accessible via le site internet lidshopping.com.",
      "La Plateforme fonctionne selon un modèle hybride : elle permet, d'une part, la vente directe de produits et/ou services par l'Éditeur lui-même (ci-après les « Ventes Directes ») et, d'autre part, l'hébergement d'une marketplace mettant en relation des Vendeurs tiers (professionnels ou particuliers) avec des Acheteurs (ci-après les « Ventes Marketplace »).",
      `La Plateforme est éditée par la société ${legal.raisonSociale}, société de droit ivoirien au capital de ${legal.capital} FCFA, immatriculée au Registre du Commerce et du Crédit Mobilier (RCCM) d'Abidjan sous le numéro ${legal.rccm}, titulaire du Numéro de Compte Contribuable ${legal.ncc}, dont le siège social est situé à ${legal.adresse}, Côte d'Ivoire (ci-après l'« Éditeur » ou « nous »).`,
    ],
  },
  {
    title: "Article 2 : Définitions",
    list: [
      "« Plateforme » : le site internet LID.",
      "« Utilisateur » : toute personne physique ou morale accédant à la Plateforme, en qualité d'Acheteur et/ou de Vendeur.",
      "« Éditeur » : la société éditrice, qui exploite la Plateforme et intervient également en qualité de Vendeur pour les Ventes Directes.",
      "« Vendeur tiers » : toute personne physique ou morale, professionnelle ou non, distincte de l'Éditeur, proposant à la vente des produits ou services sur la Plateforme via une boutique qui lui est propre, dans le cadre de la marketplace.",
      "« Acheteur » : tout Utilisateur passant commande de produits ou services, qu'ils soient vendus par l'Éditeur ou par un Vendeur tiers.",
      "« Compte » : espace personnel sécurisé créé par l'Utilisateur lui permettant d'accéder aux fonctionnalités de la Plateforme.",
      "« Mobile Money » : services de paiement mobile incluant notamment Orange Money, MTN Mobile Money, Moov Money et Wave.",
      "« KYC » (Know Your Customer) : procédure de vérification d'identité et de conformité applicable aux Vendeurs tiers avant activation de leur boutique.",
    ],
  },
  {
    title: "Article 3 : Acceptation des CGU",
    paragraphs: [
      "L'accès et l'utilisation de la Plateforme impliquent l'acceptation pleine et entière des présentes CGU. Toute personne ne souhaitant pas être liée par les présentes doit s'abstenir d'utiliser la Plateforme. L'inscription sur la Plateforme vaut acceptation expresse et sans réserve des CGU.",
      "Les présentes CGU sont complétées, pour toute opération d'achat (Vente Directe ou Vente Marketplace), par les Conditions Générales de Vente (CGV) applicables à la transaction concernée. En cas de contradiction pour une transaction donnée, les CGV priment sur les CGU pour les aspects contractuels de la vente.",
    ],
  },
  {
    title: "Article 4 : Accès à la Plateforme et création de compte",
    paragraphs: [
      "L'accès à certaines fonctionnalités de la Plateforme nécessite la création d'un Compte. L'Utilisateur doit être âgé d'au moins 18 ans et disposer de la pleine capacité juridique pour contracter, ou agir avec l'autorisation d'un représentant légal s'il est mineur.",
      "Lors de son inscription, l'Utilisateur s'engage à fournir des informations exactes, complètes et à jour (nom, prénom, adresse e-mail). Toute fausse déclaration pourra entraîner la suspension ou la suppression du Compte.",
      "L'Utilisateur est seul responsable de la confidentialité de ses identifiants de connexion et de toute activité réalisée depuis son compte. Il s'engage à informer immédiatement l'Éditeur en cas d'utilisation non autorisée de son compte.",
    ],
  },
  {
    title: "Article 5 : Deux régimes de vente sur la Plateforme",
    paragraphs: [
      {
        subtitle: "5.1 Ventes Directes",
        text: "Lorsqu'un produit est identifié sur la fiche produit comme « Vendu et expédié par LID », l'Éditeur agit en qualité de vendeur direct. Il est alors pleinement responsable, en tant que cocontractant de l'Acheteur, de la conformité, de la disponibilité, de la livraison et de la garantie du produit ou service, dans les conditions prévues par les CGV.",
      },
      {
        subtitle: "5.2 Ventes Marketplace",
        text: "Lorsqu'un produit est proposé par un Vendeur tiers identifié sur la fiche produit, l'Éditeur agit en qualité d'intermédiaire technique mettant en relation le Vendeur tiers et l'Acheteur. Sauf mention contraire expresse, l'Éditeur n'est pas partie au contrat de vente conclu entre le Vendeur tiers et l'Acheteur et n'est ni propriétaire ni dépositaire des produits proposés à la vente.",
      },
      [
        "L'identité du vendeur (Éditeur ou Vendeur tiers) est systématiquement et clairement affichée sur chaque fiche produit et au récapitulatif de commande, conformément à l'obligation d'information précontractuelle prévue par la loi n°2013-546 du 30 juillet 2013",
        { fn: 1 },
        " relative aux transactions électroniques.",
      ],
    ],
  },
  {
    title: "Article 6 : Inscription et vérification des Vendeurs tiers",
    paragraphs: [
      "Tout Vendeur tiers souhaitant ouvrir une boutique sur la Plateforme doit fournir, selon sa qualité, les justificatifs suivants :",
    ],
    list: [
      "copie d'une pièce d'identité valide (CNI, passeport, attestation d'identité) ;",
      "Numéro de Compte Contribuable (NCC) et/ou extrait du Registre du Commerce et du Crédit Mobilier (RCCM) pour les commerçants et sociétés ;",
      [
        "le cas échéant, la Carte de Commerçant instituée par le décret n°2024-381 du 12 juin 2024",
        { fn: 2 },
        ", pour les personnes exerçant une activité commerciale à titre habituel ;",
      ],
      "tout document complémentaire requis dans le cadre de la procédure de vérification d'identité (KYC), notamment un relevé d'identité Mobile Money ou bancaire destiné aux reversements.",
    ],
    paragraphsAfterList: [
      "L'Éditeur se réserve le droit de refuser, suspendre ou clôturer l'inscription d'un Vendeur tiers dont les documents seraient incomplets, falsifiés ou non conformes, ou dont l'activité contreviendrait à la réglementation ivoirienne, communautaire (UEMOA/CEDEAO) ou aux Actes uniformes OHADA applicables au commerce électronique et au droit commercial général.",
    ],
  },
  {
    title: "Article 7 : Obligations des Utilisateurs",
    paragraphs: [
      "Chaque Utilisateur s'engage à utiliser la Plateforme conformément à sa destination, à la réglementation en vigueur en Côte d'Ivoire et aux bonnes mœurs. Il est notamment interdit de :",
    ],
    list: [
      "publier des contenus illicites, diffamatoires, frauduleux, contrefaisants ou portant atteinte aux droits de tiers ;",
      "proposer à la vente des produits contrefaits, dangereux ou réglementés (armes, stupéfiants, médicaments non autorisés, produits contrefaits, etc.) ;",
      "usurper l'identité d'un tiers ou créer un faux compte ;",
      "détourner la Plateforme à des fins de blanchiment, d'escroquerie ou de toute autre activité frauduleuse, notamment via les services de Mobile Money ;",
      "perturber le fonctionnement technique de la Plateforme (virus, scripts automatisés, tentatives d'intrusion).",
    ],
    paragraphsAfterList: [
      "Tout manquement à ces obligations pourra entraîner la suspension immédiate du Compte concerné, sans préjudice de poursuites judiciaires.",
    ],
  },
  {
    title: "Article 8 : Propriété intellectuelle",
    paragraphs: [
      "L'ensemble des éléments composant la Plateforme (structure, logo, charte graphique, textes, bases de données, code informatique) est protégé par le droit de la propriété intellectuelle et demeure la propriété exclusive de l'Éditeur ou de ses concédants. Toute reproduction, représentation ou exploitation non autorisée est strictement interdite.",
      "Chaque Vendeur tiers garantit détenir l'ensemble des droits nécessaires sur les contenus (photos, descriptions, marques) qu'il publie sur sa boutique et concède à l'Éditeur une licence non exclusive d'utilisation de ces contenus aux fins de fonctionnement et de promotion de la Plateforme.",
    ],
  },
  {
    title: "Article 9 : Données à caractère personnel",
    paragraphs: [
      [
        "L'Éditeur traite les données à caractère personnel des Utilisateurs conformément à la loi n°2013-450 du 19 juin 2013",
        { fn: 3 },
        " relative à la protection des données à caractère personnel, sous le contrôle de l'Autorité de Régulation des Télécommunications/TIC de Côte d'Ivoire (ARTCI), auprès de laquelle la Plateforme déclare son traitement.",
      ],
      `Les données collectées (identité, coordonnées, données de transaction, données de paiement Mobile Money) sont utilisées aux fins de gestion des Comptes, traitement des commandes, prévention de la fraude et amélioration des services. Chaque Utilisateur dispose d'un droit d'accès, de rectification, d'opposition et de suppression de ses données, exerçable à l'adresse ${dpoEmail}.`,
      "Pour les Vendeurs tiers, les données de vérification KYC (pièce d'identité, RCCM, informations bancaires/Mobile Money) sont conservées pour la durée nécessaire au respect des obligations légales de lutte contre le blanchiment et le financement du terrorisme applicables dans l'espace UEMOA.",
      "Pour plus de détails, l'Utilisateur est invité à consulter la Politique de Confidentialité de la Plateforme, partie intégrante des présentes CGU.",
    ],
  },
  {
    title: "Article 10 : Fiscalité et paiement",
    paragraphs: [
      [
        "Les prix affichés sur la Plateforme sont exprimés en Francs CFA (FCFA) toutes taxes comprises. Conformément aux articles 350 à 352 du Code général des Impôts",
        { fn: 4 },
        " et à la note d'application de la Direction Générale des Impôts du 9 octobre 2023",
        { fn: 5 },
        " relative aux plateformes de commerce en ligne, la Taxe sur la Valeur Ajoutée (TVA), actuellement fixée à 18 %, est applicable aux opérations réalisées via la Plateforme dès lors que la livraison ou la consommation du service a lieu sur le territoire ivoirien, y compris pour les opérateurs non résidents.",
      ],
      "Chaque Vendeur tiers demeure seul responsable de son identification fiscale, de la collecte et du reversement de la TVA due sur ses propres ventes, ainsi que du respect de ses autres obligations fiscales et sociales.",
    ],
  },
  {
    title: "Article 11 : Disponibilité et évolution de la Plateforme",
    paragraphs: [
      "L'Éditeur met en œuvre tous les moyens raisonnables pour assurer un accès continu à la Plateforme, sans toutefois garantir une disponibilité ininterrompue, notamment compte tenu des contraintes liées à la fourniture d'accès internet et d'électricité en Côte d'Ivoire et dans la sous-région.",
      "L'Éditeur se réserve le droit de modifier, suspendre ou interrompre tout ou partie de la Plateforme, notamment pour des raisons de maintenance, sans que sa responsabilité ne puisse être engagée à ce titre, sauf faute lourde.",
    ],
  },
  {
    title: "Article 12 : Responsabilité",
    paragraphs: [
      [
        "Pour les Ventes Directes, l'Éditeur assume la responsabilité contractuelle du vendeur telle que définie par les CGV et par la loi n°2013-546 du 30 juillet 2013",
        { fn: 6 },
        ", qui pose un principe de responsabilité de plein droit du cybercommerçant à l'égard de son cocontractant.",
      ],
      "Pour les Ventes Marketplace, la responsabilité de l'Éditeur ne saurait être engagée en cas d'inexécution ou de mauvaise exécution des obligations contractuelles imputable à un Vendeur tiers, à un Acheteur, à un opérateur de Mobile Money, à un prestataire de livraison tiers, ou à un cas de force majeure (notamment coupure de réseau électrique ou télécom, grève, émeute, catastrophe naturelle). L'Éditeur ne garantit pas l'exactitude, l'exhaustivité ou l'actualité des informations publiées par les Vendeurs tiers et invite les Acheteurs à faire preuve de vigilance raisonnable avant tout achat.",
    ],
  },
  {
    title: "Article 13 : Suspension et résiliation de compte",
    paragraphs: [
      `L'Éditeur peut suspendre ou résilier, de plein droit et sans préavis, le Compte de tout Utilisateur en cas de violation des présentes CGU, de fraude avérée ou suspectée, ou de demande des autorités compétentes. L'Utilisateur peut à tout moment demander la clôture de son Compte en écrivant à ${legalEmail}.`,
    ],
  },
  {
    title: "Article 14 : Modification des CGU",
    paragraphs: [
      "L'Éditeur se réserve le droit de modifier à tout moment les présentes CGU. Les Utilisateurs seront informés de toute modification substantielle par notification sur la Plateforme et/ou par e-mail, au moins quinze (15) jours avant son entrée en vigueur. La poursuite de l'utilisation de la Plateforme après cette date vaut acceptation des CGU modifiées.",
    ],
  },
  {
    title: "Article 15 : Droit applicable et règlement des litiges",
    paragraphs: [
      [
        "Les présentes CGU sont soumises au droit ivoirien, notamment la loi n°2013-546 du 30 juillet 2013 relative aux transactions électroniques (telle que modifiée, s'agissant de son article 50, par l'ordonnance n°2024-950 du 30 octobre 2024), la loi n°2016-412 du 15 juin 2016",
        { fn: 7 },
        " relative à la consommation, ainsi qu'aux Actes uniformes de l'Organisation pour l'Harmonisation en Afrique du Droit des Affaires (OHADA) applicables.",
      ],
      "En cas de litige, les parties s'efforceront de rechercher une solution amiable, le cas échéant par voie de médiation. À défaut d'accord amiable, le litige sera porté devant les juridictions compétentes du Tribunal de Commerce d'Abidjan, sauf disposition impérative contraire applicable aux consommateurs.",
    ],
  },
  {
    title: "Article 16 : Contact",
    paragraphs: [
      `Pour toute question relative aux présentes CGU, l'Utilisateur peut contacter le service client de la Plateforme à l'adresse suivante : ${legalEmail} / ${legal.telephone}.`,
    ],
  },
];