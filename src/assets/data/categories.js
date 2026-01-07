import { 
  Smartphone, Shirt, Home, Monitor, Watch, 
  Gamepad2, Camera, ChevronRight, Zap 
} from 'lucide-react';

export const categories = [
  {
    id: 'electronics',
    label: 'Électronique & High-Tech',
    icon: Smartphone,
    color: 'text-blue-500',
    subcategories: [
      { title: 'Téléphonie', items: ['Smartphones Android', 'iPhones', 'Tablettes', 'Accessoires Mobile', 'Coques & Étuis'] },
      { title: 'Informatique', items: ['Laptops Bureautique', 'PC Gaming', 'Périphériques', 'Stockage & Disques', 'Imprimantes'] },
      { title: 'TV & Audio', items: ['Smart TV', 'Home Cinéma', 'Casques Bluetooth', 'Enceintes Connectées', 'Barres de son'] }
    ],
    image: 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=600&q=80',
    offer: 'Jusqu\'à -40% sur Samsung'
  },
  {
    id: 'fashion',
    label: 'Mode & Vêtements',
    icon: Shirt,
    color: 'text-pink-500',
    subcategories: [
      { title: 'Homme', items: ['T-shirts & Polos', 'Jeans & Pantalons', 'Costumes', 'Chaussures de Ville', 'Sneakers'] },
      { title: 'Femme', items: ['Robes de Soirée', 'Tops & Blouses', 'Lingerie', 'Sacs à Main', 'Bijoux & Montres'] },
      { title: 'Enfant', items: ['Garçon 2-14 ans', 'Fille 2-14 ans', 'Bébé & Puériculture', 'Chaussures Enfant', 'Cartables'] }
    ],
    image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600&q=80',
    offer: 'Nouvelle Collection Été'
  },
  {
    id: 'home',
    label: 'Maison & Cuisine',
    icon: Home,
    color: 'text-orange-500',
    subcategories: [
      { title: 'Cuisine', items: ['Robots de Cuisine', 'Cafetières', 'Batteries de Cuisine', 'Art de la Table', 'Ustensiles'] },
      { title: 'Décoration', items: ['Luminaires', 'Tapis & Textiles', 'Miroirs', 'Objets Déco', 'Plantes Artificielles'] },
      { title: 'Meubles', items: ['Canapés & Fauteuils', 'Lits & Matelas', 'Rangements', 'Tables à Manger', 'Bureaux'] }
    ],
    image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=600&q=80',
    offer: 'Déco : 2 achetés = 3ème offert'
  },
  {
    id: 'beauty',
    label: 'Beauté & Santé',
    icon: Zap,
    color: 'text-purple-500',
    subcategories: [
      { title: 'Parfums', items: ['Parfums Homme', 'Parfums Femme', 'Coffrets Cadeaux', 'Eaux de Toilette', 'Déodorants'] },
      { title: 'Soins', items: ['Soins Visage', 'Soins Corps', 'Soins Cheveux', 'Protection Solaire', 'Anti-âge'] },
      { title: 'Maquillage', items: ['Teint', 'Yeux', 'Lèvres', 'Ongles', 'Accessoires Make-up'] }
    ],
    image: 'https://images.unsplash.com/photo-1596462502278-27bfdd403348?w=600&q=80',
    offer: 'Coffrets Beauté en Promo'
  },
  {
    id: 'gaming',
    label: 'Gaming & Consoles',
    icon: Gamepad2,
    color: 'text-red-500',
    subcategories: [
      { title: 'PlayStation', items: ['Consoles PS5', 'Jeux PS5', 'Manettes', 'Abonnements PS+', 'Casques VR'] },
      { title: 'Xbox', items: ['Consoles Series X/S', 'Game Pass', 'Manettes Xbox', 'Jeux Xbox', 'Accessoires'] },
      { title: 'Nintendo', items: ['Switch OLED', 'Jeux Switch', 'Amiibo', 'Housses', 'Accessoires'] }
    ],
    image: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=600&q=80',
    offer: 'Pack Console + 2 Jeux'
  },
  {
    id: 'photo',
    label: 'Photo & Caméras',
    icon: Camera,
    color: 'text-green-500',
    subcategories: [
      { title: 'Appareils Photo', items: ['Reflex', 'Hybrides', 'Compacts', 'Instantanés', 'Argentiques'] },
      { title: 'Objectifs', items: ['Canon', 'Nikon', 'Sony', 'Sigma', 'Tamron'] },
      { title: 'Accessoires', items: ['Trépieds', 'Sacs Photo', 'Cartes Mémoire', 'Filtres', 'Éclairage Studio'] }
    ],
    image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&q=80',
    offer: 'Formation Photo Offerte'
  },
  {
    id: 'watches',
    label: 'Montres & Bijoux',
    icon: Watch,
    color: 'text-yellow-600',
    subcategories: [
      { title: 'Montres', items: ['Montres Homme', 'Montres Femme', 'Montres Connectées', 'Montres de Luxe', 'Bracelets'] },
      { title: 'Bijoux Or', items: ['Bagues', 'Colliers', 'Boucles d\'oreilles', 'Bracelets', 'Pendentifs'] },
      { title: 'Bijoux Argent', items: ['Parures', 'Chaînes', 'Bagues de Fiançailles', 'Alliances', 'Piercing'] }
    ],
    image: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=600&q=80',
    offer: '-20% sur les Montres Connectées'
  }
];