export const starterTools = [
  {
    id: 1,
    name: 'Bosch Impact Drill',
    category: 'Power tools',
    owner: 'Rohan Mehta',
    area: 'Vijay Nagar',
    distance: '350 m away',
    deposit: 500,
    rating: 4.9,
    available: true,
    image: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=900&q=85',
    description: 'Compact 18V drill with charger and a basic bit set. Works well for shelves and small repairs.'
  },
  {
    id: 2,
    name: '6 ft Step Ladder',
    category: 'Home repair',
    owner: 'Ananya Shah',
    area: 'Scheme 54',
    distance: '700 m away',
    deposit: 300,
    rating: 4.8,
    available: true,
    image: 'https://images.unsplash.com/photo-1591588582259-e675bd2e6088?auto=format&fit=crop&w=900&q=85',
    description: 'Sturdy aluminium ladder with a wide top step. Easy to carry and folds flat for transport.'
  },
  {
    id: 3,
    name: 'Garden Tool Set',
    category: 'Gardening',
    owner: 'Neha Verma',
    area: 'Palasia',
    distance: '1.1 km away',
    deposit: 250,
    rating: 4.7,
    available: true,
    image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=900&q=85',
    description: 'Hand trowel, cultivator, pruner and gloves. Cleaned after every use and packed together.'
  },
  {
    id: 4,
    name: 'Karcher Pressure Washer',
    category: 'Cleaning',
    owner: 'Kabir Arora',
    area: 'New Palasia',
    distance: '1.4 km away',
    deposit: 900,
    rating: 5,
    available: false,
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=900&q=85',
    description: 'Portable washer with a 5 metre hose. Great for balconies, cars and outdoor furniture.'
  },
  {
    id: 5,
    name: 'Black + Decker Jigsaw',
    category: 'Power tools',
    owner: 'Aman Jain',
    area: 'Saket Nagar',
    distance: '1.8 km away',
    deposit: 600,
    rating: 4.6,
    available: true,
    image: 'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?auto=format&fit=crop&w=900&q=85',
    description: 'Variable-speed jigsaw with wood blades. Best for plywood, MDF and simple curved cuts.'
  },
  {
    id: 6,
    name: 'Camping Tent for 4',
    category: 'Outdoor',
    owner: 'Meera Joshi',
    area: 'Bengali Square',
    distance: '2.2 km away',
    deposit: 750,
    rating: 4.9,
    available: true,
    image: 'https://images.unsplash.com/photo-1475483768296-6163e08872a1?auto=format&fit=crop&w=900&q=85',
    description: 'Water-resistant four-person tent with ground sheet, poles and carry bag included.'
  }
];

export const starterRequests = [
  {
    id: 101,
    toolId: 3,
    tool: 'Garden Tool Set',
    borrower: 'Ishita Rao',
    dates: '18 - 20 Jul',
    message: 'Setting up a small balcony garden this weekend.',
    status: 'Pending'
  },
  {
    id: 102,
    toolId: 1,
    tool: 'Bosch Impact Drill',
    borrower: 'Dev Malhotra',
    dates: '19 Jul',
    message: 'Need to install two curtain rods at home.',
    status: 'Approved'
  }
];

export const categories = ['All', 'Power tools', 'Home repair', 'Gardening', 'Cleaning', 'Outdoor'];
