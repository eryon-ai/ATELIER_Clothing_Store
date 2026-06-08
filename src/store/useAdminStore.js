import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { PRODUCTS } from '../mock/products'

function generateOrders() {
  const statuses = ['Processing', 'Shipped', 'Delivered', 'Cancelled']
  const names = ['Alex Chen', 'Jordan Kim', 'Sam Rivera', 'Morgan Lee', 'Casey Park', 'Taylor Swift', 'Riley Brooks', 'Drew Patel', 'Quinn Walker', 'Avery Stone']
  return Array.from({ length: 60 }, (_, i) => {
    const status = statuses[Math.floor(Math.random() * statuses.length)]
    const isVIP = Math.random() > 0.8
    const fraudRisk = Math.random() > 0.95 ? 'High' : (Math.random() > 0.8 ? 'Medium' : 'Low')
    return {
      id: `ATL-${String(10482 + i).padStart(5, '0')}`,
      customer: names[i % names.length],
      email: `user${i + 1}@example.com`,
      product: PRODUCTS[i % PRODUCTS.length]?.name || 'Metropolis Parka',
      amount: Math.floor(Math.random() * 1200) + 150,
      status,
      date: new Date(Date.now() - Math.random() * 30 * 86400000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      items: Math.floor(Math.random() * 3) + 1,
      isPriority: isVIP,
      fraudRisk,
      tags: isVIP ? ['VIP'] : (i % 5 === 0 ? ['First Time'] : []),
      carrier: status !== 'Processing' ? 'FedEx' : null,
      trackingNumber: status !== 'Processing' ? `FX${Math.floor(Math.random() * 10000000000)}` : null,
      notes: [],
      customerHistory: { totalOrders: Math.floor(Math.random() * 10) + 1, lifetimeValue: Math.floor(Math.random() * 5000) + 500 },
      timeline: [
        { type: 'placed', title: 'Order Placed', time: '2 days ago', user: 'System' },
        { type: 'payment', title: 'Payment Confirmed', time: '2 days ago', user: 'System' },
        ...(status !== 'Processing' ? [{ type: 'processing', title: 'Processing', time: '1 day ago', user: 'Warehouse' }] : []),
        ...(status === 'Shipped' || status === 'Delivered' ? [{ type: 'shipped', title: 'Shipped', time: '12 hours ago', user: 'Logistics' }] : []),
        ...(status === 'Delivered' ? [{ type: 'delivered', title: 'Delivered', time: '2 hours ago', user: 'FedEx' }] : []),
        ...(status === 'Cancelled' ? [{ type: 'cancelled', title: 'Order Cancelled', time: '1 day ago', user: 'Support Agent' }] : []),
      ]
    }
  })
}

function generateCustomers() {
  const seed = [
    { name: 'Alex Chen',    email: 'user1@example.com',  location: 'New York, USA',    channel: 'Organic',  segment: 'VIP',      loyaltyPoints: 4800, retentionScore: 92, healthScore: 94, riskFlag: 'Low',    joinDate: 'Jan 12, 2024', tags: ['VIP', 'High AOV'] },
    { name: 'Jordan Kim',   email: 'user2@example.com',  location: 'Los Angeles, USA', channel: 'Paid',     segment: 'Loyal',    loyaltyPoints: 3100, retentionScore: 78, healthScore: 80, riskFlag: 'Low',    joinDate: 'Mar 04, 2024', tags: ['Loyal'] },
    { name: 'Sam Rivera',   email: 'user3@example.com',  location: 'Miami, USA',       channel: 'Referral', segment: 'At Risk',  loyaltyPoints: 900,  retentionScore: 38, healthScore: 32, riskFlag: 'High',   joinDate: 'Feb 20, 2024', tags: ['Churning'] },
    { name: 'Morgan Lee',   email: 'user4@example.com',  location: 'Chicago, USA',     channel: 'Email',    segment: 'Loyal',    loyaltyPoints: 2600, retentionScore: 72, healthScore: 75, riskFlag: 'Low',    joinDate: 'Apr 10, 2023', tags: ['Newsletter'] },
    { name: 'Casey Park',   email: 'user5@example.com',  location: 'Seattle, USA',     channel: 'Organic',  segment: 'New',      loyaltyPoints: 400,  retentionScore: 55, healthScore: 60, riskFlag: 'Medium', joinDate: 'May 01, 2026', tags: ['First Time'] },
    { name: 'Taylor Swift', email: 'user6@example.com',  location: 'Nashville, USA',   channel: 'Paid',     segment: 'VIP',      loyaltyPoints: 8200, retentionScore: 97, healthScore: 98, riskFlag: 'Low',    joinDate: 'Nov 14, 2022', tags: ['VIP', 'Ambassador'] },
    { name: 'Riley Brooks', email: 'user7@example.com',  location: 'Austin, USA',      channel: 'Referral', segment: 'Lapsed',   loyaltyPoints: 1200, retentionScore: 22, healthScore: 18, riskFlag: 'High',   joinDate: 'Jun 08, 2023', tags: ['Win-Back'] },
    { name: 'Drew Patel',   email: 'user8@example.com',  location: 'Boston, USA',      channel: 'Email',    segment: 'Loyal',    loyaltyPoints: 2900, retentionScore: 81, healthScore: 83, riskFlag: 'Low',    joinDate: 'Aug 19, 2023', tags: ['Sale Buyer'] },
    { name: 'Quinn Walker', email: 'user9@example.com',  location: 'Denver, USA',      channel: 'Organic',  segment: 'At Risk',  loyaltyPoints: 700,  retentionScore: 41, healthScore: 35, riskFlag: 'Medium', joinDate: 'Mar 22, 2025', tags: ['Churning'] },
    { name: 'Avery Stone',  email: 'user10@example.com', location: 'Portland, USA',    channel: 'Paid',     segment: 'Loyal',    loyaltyPoints: 3400, retentionScore: 84, healthScore: 87, riskFlag: 'Low',    joinDate: 'Sep 05, 2023', tags: ['Repeat Buyer'] },
  ]
  return seed.map(c => ({
    ...c,
    notes: [
      { text: 'Prefers email communication. Very responsive to promotional campaigns.', author: 'Admin', date: 'May 10, 2026' }
    ],
    timeline: [
      { type: 'joined',  icon: 'person_add',   label: 'Account Created',       detail: `via ${c.channel}`,                           date: c.joinDate },
      { type: 'order',   icon: 'shopping_bag', label: 'First Purchase',         detail: 'Metropolis Parka — $480',                     date: c.joinDate },
      { type: 'email',   icon: 'mail',         label: 'Welcome Email Sent',     detail: 'Subject: Welcome to ATELIER',                 date: c.joinDate },
      { type: 'loyalty', icon: 'star',         label: 'Loyalty Tier Upgraded',  detail: `Now ${c.segment} member`,                    date: 'Mar 01, 2025' },
    ],
    banned: false,
  }))
}

const initialActivities = [
  { id: 1, time: '10m ago', text: 'VIP Customer Alex Chen placed $1,250 order.' },
  { id: 2, time: '1h ago', text: 'Campaign "SUMMER20" reached 1,000 uses.' },
  { id: 3, time: '3h ago', text: 'Goal "100 Orders/Month" achieved.' },
  { id: 4, time: '5h ago', text: 'New product "Silk Blend Scarf" published.' },
  { id: 5, time: '1d ago', text: 'System update completed successfully.' }
]

export const useAdminStore = create(persist(
  (set) => ({
    customers: generateCustomers(),
    products: PRODUCTS.slice(0, 30),
    orders: generateOrders(),
    activities: initialActivities,
    stats: {
      revenue: 284750,
      orders: 1247,
      customers: 8934,
      conversion: 3.2,
    },
    storefront: {
      title: 'The Fall Collection',
      subtitle: 'Spring / Summer 2026 — Campaign One',
      buttonText: 'Shop Women',
      buttonLink: '/collections/women',
      image: '/hero-bg.jpg',
    },
    storefrontCMS: {
      announcement: { text: "FREE GLOBAL SHIPPING ON ORDERS OVER $500", link: "", active: true },
      theme: { mode: 'Light', primaryColor: '#000000', font: 'Inter', isFunkyMode: true },

      // Hero Moods — 3 presets the admin can switch between
      activeHeroMood: null, // null = use main storefront hero
      heroMoods: [
        { id: 'summer', name: 'Summer Campaign', image: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1400&q=80', title: 'The Summer Edit', subtitle: 'Light fabrics for warm days — SS26', buttonText: 'Shop Summer', buttonLink: '/collections/women' },
        { id: 'winter', name: 'Winter Editorial', image: 'https://images.unsplash.com/photo-1520975916090-3105956dac38?w=1400&q=80', title: 'Winter Archive', subtitle: 'The new cold-weather collection — FW25', buttonText: 'Explore Now', buttonLink: '/collections/men' },
        { id: 'sale', name: 'Sale Mode', image: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=1400&q=80', title: 'Archive Sale', subtitle: 'Up to 40% off — limited time only', buttonText: 'Shop The Sale', buttonLink: '/collections/sale' }
      ],

      // Homepage section order & visibility
      sections: [
        { id: 'hero', label: 'Hero Banner', visible: true },
        { id: 'promoCards', label: 'Promo Cards', visible: true },
        { id: 'ticker', label: 'Marquee Ticker', visible: true },
        { id: 'spotlight', label: 'Spotlight Product', visible: false },
        { id: 'categories', label: 'Category Grid', visible: true },
        { id: 'popular', label: 'Popular Products', visible: true },
        { id: 'theEdit', label: 'The Edit Collection', visible: false },
        { id: 'newArrivals', label: 'New Arrivals Slider', visible: true },
        { id: 'flashSale', label: 'Flash Sale Banner', visible: true },
        { id: 'bestSellers', label: 'Best Sellers', visible: true },
        { id: 'brandStory', label: 'Brand Story Strip', visible: false },
        { id: 'community', label: 'Community / UGC', visible: true },
      ],

      // Promo Cards
      promoCards: [
        { label: 'Where dreams meet couture', href: '/collections/women', img: '/images/bottoms.png', bg: '#E8DDD0' },
        { label: 'Enchanting styles for every women', href: '/collections/women', img: '/images/outerwear.png', bg: '#EDE5E2' }
      ],

      // Marquee Ticker
      tickerItems: [
        { id: 't1', text: 'New Season Drop', active: true },
        { id: 't2', text: 'Free Shipping Over $150', active: true },
        { id: 't3', text: 'Luxury Essentials In', active: true },
        { id: 't4', text: 'Limited Drops Weekly', active: true },
        { id: 't5', text: 'Complimentary Gift Wrapping', active: true }
      ],
      tickerSpeed: 'normal', // 'slow' | 'normal' | 'fast'

      // Social Proof Ticker (replaces or supplements the text marquee)
      socialProof: {
        active: false,
        items: [
          { id: 'sp1', text: '🛍 Someone in Paris just bought the Cashmere Overshirt', active: true },
          { id: 'sp2', text: '⭐ 4.9/5 — 2,400+ verified reviews', active: true },
          { id: 'sp3', text: '🔥 Silk Midi Dress — only 3 left in stock', active: true }
        ]
      },

      // Category Cards
      categoryCards: [
        { id: 'c1', label: 'Shoes', href: '/collections/footwear', img: '/images/sneakers.png' },
        { id: 'c2', label: 'Bags', href: '/collections/accessories', img: '/images/accessories.png' },
        { id: 'c3', label: 'T-Shirts', href: '/collections/women', img: '/images/tops.png' },
        { id: 'c4', label: 'Outerwear', href: '/collections/men', img: '/images/outerwear.png' }
      ],

      // Flash Sale Banner
      flashSale: {
        title: 'Archive Sale',
        description: 'Up to 40% off selected seasonal staples.',
        discountText: 'Up to 40% off',
        ctaText: 'Access Sale',
        ctaLink: '/collections/sale',
        useDeadlineDate: false, // false = daily countdown; true = specific date
        deadlineDate: '' // ISO date string e.g. '2026-12-31T23:59:59'
      },

      // Spotlight Product
      spotlightProductId: '',
      spotlightTagline: 'This season\'s must-have',

      // The Edit — curated collection
      theEdit: {
        name: 'The Summer Edit',
        tagline: 'Hand-picked by our stylists',
        productIds: []
      },

      // Brand Story Strip
      brandStory: {
        text: 'We believe in the quiet power of dressing well.',
        ctaText: 'Discover Our Story',
        ctaLink: '/about'
      },

      // Community / UGC
      community: {
        title: 'Community Voices',
        superLabel: 'Community',
        description: 'Styled by you, curated by us.',
        hashtag: '#ATELIERArchive',
        ctaStyle: 'hashtag', // 'hashtag' | 'instagram'
        instagramHandle: '@atelier',
        images: [
          '/images/outerwear.png',
          '/images/bottoms.png',
          '/images/sneakers.png',
          '/images/knitwear.png'
        ]
      },

      // Section heading labels
      sectionLabels: {
        popularTitle: 'Popular products',
        newArrivalsTitle: 'New Arrivals',
        newArrivalsSuper: 'Just Landed',
        bestSellersTitle: 'Best Sellers',
        bestSellersSuper: 'Most Loved',
        categoriesTitle: 'Browse by categories',
        communityTitle: 'Community Voices',
        communitySuper: 'Community'
      },

      navigation: [
        { id: 1, label: 'New Arrivals', url: '/collections/new-arrivals' },
        { id: 2, label: 'Men', url: '/collections/men' },
        { id: 3, label: 'Women', url: '/collections/women' },
        { id: 4, label: 'Collections', url: '/products' },
        { id: 5, label: 'Luxury Essentials', url: '/collections/premium' },
        { id: 6, label: 'Accessories', url: '/collections/accessories' },
        { id: 7, label: 'Sale', url: '/collections/sale' }
      ],
      seo: { metaTitle: 'ATELIER | Official Online Store', metaDescription: 'Luxury ready-to-wear.', ogImage: '/social.jpg' },
      landingPages: [
        { id: 'LP1', title: 'Summer Sale 2026', url: '/pages/summer-2026', status: 'Draft', scheduledDate: '2026-06-15' },
        { id: 'LP2', title: 'The Archives', url: '/pages/archives', status: 'Published', scheduledDate: 'Past' }
      ],
      banners: [
        { id: 'B1', title: 'NEW SEASON', location: 'Homepage - Top', active: true },
        { id: 'B2', title: 'SALE', location: 'Collection - Top', active: false }
      ],
      featuredCollections: ['SS26', 'FW25 Core'],
      featuredProducts: ['PRD-001', 'PRD-004']
    },
    warehouses: [
      { id: 'WH-01', name: 'Main Fulfillment Center', location: 'Columbus, OH', type: 'Fulfillment', capacity: '85%' },
      { id: 'WH-02', name: 'NYC Retail Flagship', location: 'New York, NY', type: 'Retail', capacity: '60%' },
      { id: 'WH-03', name: 'LA Pop-up', location: 'Los Angeles, CA', type: 'Retail', capacity: '90%' }
    ],
    suppliers: [
      { id: 'SUP-01', name: 'LuxTex Italy', type: 'Raw Materials', leadTime: '45 Days', rating: 4.8 },
      { id: 'SUP-02', name: 'Prime Manufactory', type: 'Finished Goods', leadTime: '30 Days', rating: 4.5 },
      { id: 'SUP-03', name: 'YKK Fasteners', type: 'Hardware', leadTime: '15 Days', rating: 4.9 }
    ],
    purchaseOrders: [
      { id: 'PO-2026-041', supplierId: 'SUP-02', status: 'In Transit', expectedDate: 'Jun 15, 2026', totalValue: 45000, items: 1200 },
      { id: 'PO-2026-042', supplierId: 'SUP-01', status: 'Draft', expectedDate: 'Jul 01, 2026', totalValue: 12500, items: 500 }
    ],
    inventoryLogs: [
      { id: 'LOG-001', date: 'Jun 03, 2026', user: 'System', action: 'PO Received', detail: 'Received 400 units from PO-2026-040' },
      { id: 'LOG-002', date: 'Jun 01, 2026', user: 'Admin', action: 'Stock Transfer', detail: 'Transferred 50 units from WH-01 to WH-02' },
      { id: 'LOG-003', date: 'May 28, 2026', user: 'Admin', action: 'Manual Adjustment', detail: 'Removed 2 units (Damaged)' }
    ],
    settings: {
      storeName: 'ATELIER', email: 'admin@atelier.com', currency: 'USD',
      taxRate: '8.5', freeShippingThreshold: '200', lowStockAlert: '5',
      enableReviews: true, enableWishlist: true, maintenanceMode: false,
    },
    enterpriseSettings: {
      roles: [
        { id: 'R1', name: 'Super Admin', permissions: ['All Access'], users: 2 },
        { id: 'R2', name: 'Support Agent', permissions: ['Read Orders', 'Write Customers', 'Read Products'], users: 15 },
        { id: 'R3', name: 'Merchandiser', permissions: ['Write Products', 'Read Orders', 'Write Inventory'], users: 4 }
      ],
      auditLogs: [
        { id: 'AL-901', timestamp: '2026-06-04 14:32:10', user: 'admin@atelier.com', action: 'Modified Shipping Threshold', ip: '192.168.1.104' },
        { id: 'AL-900', timestamp: '2026-06-04 11:15:00', user: 'system', action: 'Automated Database Backup', ip: 'Internal' },
        { id: 'AL-899', timestamp: '2026-06-03 09:42:15', user: 'admin@atelier.com', action: 'API Key Generated (Stripe Sync)', ip: '192.168.1.104' }
      ],
      apiKeys: [
        { id: 'AK-01', name: 'Headless Frontend Prod', token: 'sk_prod_a7f9...3b21', created: 'Jan 15, 2026', lastUsed: 'Just now', permissions: 'Read Only' },
        { id: 'AK-02', name: 'Inventory Sync Script', token: 'sk_live_89cd...f10a', created: 'Mar 22, 2026', lastUsed: '5 mins ago', permissions: 'Write Inventory' }
      ],
      webhooks: [
        { id: 'WH-01', url: 'https://api.klaviyo.com/v1/webhook', events: ['customer.created', 'order.placed'], status: 'Active', successRate: '99.9%' },
        { id: 'WH-02', url: 'https://hooks.slack.com/services/T00...', events: ['order.placed'], status: 'Active', successRate: '100%' }
      ],
      integrations: [
        { id: 'INT-01', name: 'Klaviyo', category: 'Marketing', connected: true, lastSync: '10 mins ago' },
        { id: 'INT-02', name: 'Stripe', category: 'Payments', connected: true, lastSync: 'Just now' },
        { id: 'INT-03', name: 'Zendesk', category: 'Support', connected: true, lastSync: '1 hour ago' },
        { id: 'INT-04', name: 'NetSuite', category: 'ERP', connected: false, lastSync: 'N/A' }
      ],
      billing: {
        platformTier: 'Enterprise Dedicated Plus',
        nextCycle: 'July 01, 2026',
        monthlyCost: 2450.00,
        paymentMethod: 'Visa ending in 4242',
        invoices: [
          { id: 'INV-2026-05', date: 'Jun 01, 2026', amount: 2450.00, status: 'Paid' },
          { id: 'INV-2026-04', date: 'May 01, 2026', amount: 2450.00, status: 'Paid' }
        ]
      },
      backups: [
        { id: 'BK-0504', date: 'Jun 04, 2026 - 03:00 AM', size: '4.2 GB', status: 'Completed' },
        { id: 'BK-0503', date: 'Jun 03, 2026 - 03:00 AM', size: '4.1 GB', status: 'Completed' },
        { id: 'BK-0502', date: 'Jun 02, 2026 - 03:00 AM', size: '4.1 GB', status: 'Completed' }
      ],
      security: {
        enforce2FA: true,
        sessionTimeout: '60',
        allowedIPs: '192.168.1.0/24'
      }
    },
    campaigns: [
      { id: 'SUMMER20', type: 'Percentage', value: '20%', uses: 142, revenue: 12500, status: 'Active' },
      { id: 'FREESHIP', type: 'Free Shipping', value: 'Free', uses: 89, revenue: 4200, status: 'Active' },
      { id: 'WELCOME10', type: 'Percentage', value: '10%', uses: 412, revenue: 31000, status: 'Active' },
      { id: 'FLASH50', type: 'Fixed Amount', value: '$50.00', uses: 10, revenue: 800, status: 'Expired' },
    ],
    marketingStats: {
      roas: 3.8,
      cac: 24.50,
      totalSpend: 45000,
      totalRevenue: 171000,
      activeCampaigns: 12
    },
    omniCampaigns: [
      { id: 'C1', name: 'Spring Launch', channel: 'Email', sent: 45000, openRate: 42.1, ctr: 4.8, revenue: 24500, status: 'Completed', date: 'Apr 01' },
      { id: 'C2', name: 'Flash Sale SMS', channel: 'SMS', sent: 12000, openRate: 98.2, ctr: 12.4, revenue: 8400, status: 'Completed', date: 'May 15' },
      { id: 'C3', name: 'Cart Abandonment', channel: 'Email', sent: 3200, openRate: 51.5, ctr: 18.2, revenue: 15600, status: 'Active', date: 'Ongoing' },
      { id: 'C4', name: 'App Exclusive Push', channel: 'Push', sent: 8500, openRate: 64.0, ctr: 8.5, revenue: 9200, status: 'Scheduled', date: 'Jun 10' }
    ],
    influencers: [
      { id: 'INF1', name: '@stylebykelsey', platform: 'Instagram', code: 'KELSEY20', usage: 342, revenue: 28500, status: 'Active' },
      { id: 'INF2', name: '@urbanminimal', platform: 'TikTok', code: 'URBAN15', usage: 890, revenue: 42000, status: 'Active' },
      { id: 'INF3', name: '@chicdaily', platform: 'YouTube', code: 'CHIC10', usage: 124, revenue: 9800, status: 'Inactive' }
    ],
    abTests: [
      { id: 'AB1', name: 'Checkout Button Color', status: 'Running', duration: '14 days', control: { name: 'Black', cr: 3.1 }, variant: { name: 'Primary Blue', cr: 3.8 }, winner: 'Pending' },
      { id: 'AB2', name: 'Welcome Email Subject', status: 'Completed', duration: '7 days', control: { name: 'Welcome to ATELIER', cr: 42.1 }, variant: { name: 'Here is your 10% off', cr: 54.3 }, winner: 'Variant' }
    ],
    supportTickets: [
      { id: 'TCK-092', customer: 'Alex Chen', email: 'user1@example.com', subject: 'Return request for Parka', status: 'Open', date: '2 hrs ago', priority: 'High', slaDeadline: '2 hrs', assignedTo: 'Unassigned', escalationLevel: 0 },
      { id: 'TCK-091', customer: 'Morgan Lee', email: 'user4@example.com', subject: 'Where is my order?', status: 'Pending', date: '5 hrs ago', priority: 'Medium', slaDeadline: '12 hrs', assignedTo: 'Sarah M.', escalationLevel: 0 },
      { id: 'TCK-090', customer: 'Sam Rivera', email: 'user3@example.com', subject: 'Defective item received', status: 'Open', date: '1 day ago', priority: 'High', slaDeadline: 'Breached', assignedTo: 'David K.', escalationLevel: 1 },
      { id: 'TCK-089', customer: 'Taylor Swift', email: 'user6@example.com', subject: 'Size exchange', status: 'Closed', date: '2 days ago', priority: 'Low', slaDeadline: 'Resolved', assignedTo: 'Sarah M.', escalationLevel: 0 },
    ],
    liveChats: [
      { id: 'CHAT-001', customer: 'Jamie Doe', status: 'Active', waitTime: '0m', messages: [{ sender: 'Customer', text: 'Hi, I need help with sizing.' }] },
      { id: 'CHAT-002', customer: 'Riley Smith', status: 'Waiting', waitTime: '3m', messages: [{ sender: 'Customer', text: 'Is this item in stock at NYC?' }] }
    ],
    kbArticles: [
      { id: 'KB-101', title: 'How to process a return', category: 'Returns', views: 342, lastUpdated: 'May 15, 2026' },
      { id: 'KB-102', title: 'Escalation Guidelines', category: 'Policies', views: 89, lastUpdated: 'Apr 02, 2026' }
    ],
    faqs: [
      { id: 'FAQ-01', question: 'What is the return policy?', answer: 'Returns are accepted within 30 days.', category: 'Returns', status: 'Published' },
      { id: 'FAQ-02', question: 'Do you ship internationally?', answer: 'Yes, we offer global shipping.', category: 'Shipping', status: 'Published' }
    ],
    supportAnalytics: {
      avgResolutionTime: '4.2 hrs',
      csatScore: '4.8/5.0',
      activeTickets: 24,
      escalationRate: '3.1%',
      agentPerformance: [
        { name: 'Sarah M.', resolved: 145, csat: 4.9, avgTime: '3.5 hrs' },
        { name: 'David K.', resolved: 112, csat: 4.7, avgTime: '4.8 hrs' },
        { name: 'Emily R.', resolved: 89, csat: 4.8, avgTime: '4.1 hrs' }
      ]
    },
    financials: {
      grossRevenue: 342500,
      netRevenue: 284750,
      cogs: 95400,
      shipping: 12500,
      refunds: 8450,
      taxCollected: 26400,
      payouts: [
        { id: 'PO-209', amount: 45200, status: 'Paid', date: 'May 01, 2026' },
        { id: 'PO-208', amount: 38900, status: 'Paid', date: 'Apr 24, 2026' },
        { id: 'PO-207', amount: 42100, status: 'Paid', date: 'Apr 17, 2026' },
        { id: 'PO-206', amount: 51000, status: 'Pending', date: 'May 08, 2026' },
      ],
      expenses: [
        { id: 'EXP-01', category: 'Marketing', amount: 45000, date: 'May 05, 2026', vendor: 'Meta Ads' },
        { id: 'EXP-02', category: 'Software', amount: 2400, date: 'May 02, 2026', vendor: 'Shopify Plus' },
        { id: 'EXP-03', category: 'Payroll', amount: 85000, date: 'May 01, 2026', vendor: 'Gusto' },
        { id: 'EXP-04', category: 'Logistics', amount: 12500, date: 'Apr 28, 2026', vendor: 'FedEx' }
      ],
      invoices: [
        { id: 'INV-1042', client: 'Nordstrom', amount: 125000, status: 'Paid', dueDate: 'May 15, 2026' },
        { id: 'INV-1043', client: 'SSENSE', amount: 84000, status: 'Pending', dueDate: 'Jun 10, 2026' },
        { id: 'INV-1044', client: 'Saks Fifth Avenue', amount: 45000, status: 'Overdue', dueDate: 'May 30, 2026' }
      ],
      taxReports: [
        { region: 'US - California', collected: 12400, remitted: 12400, status: 'Filed' },
        { region: 'US - New York', collected: 8200, remitted: 0, status: 'Pending' },
        { region: 'EU - France', collected: 5800, remitted: 5800, status: 'Filed' }
      ],
      cashFlow: [
        { month: 'Jan', in: 280000, out: 210000 },
        { month: 'Feb', in: 295000, out: 215000 },
        { month: 'Mar', in: 310000, out: 220000 },
        { month: 'Apr', in: 342000, out: 235000 },
        { month: 'May', in: 385000, out: 250000 }
      ],
      forecasting: {
        projectedRevenueQ3: 1250000,
        projectedExpensesQ3: 840000,
        cashRunway: '24 months',
        yoyGrowthTarget: '45%'
      },
      discounts: 12400,
      gatewayFees: 8250,
      pendingTransit: 12000,
      revenueByChannel: [
        { channel: 'Direct to Consumer (Web)', revenue: 185000, percentage: '65%' },
        { channel: 'Wholesale / B2B', revenue: 71150, percentage: '25%' },
        { channel: 'Pop-up Retail (NYC)', revenue: 28600, percentage: '10%' }
      ]
    },
    updateStorefront: (updates) => set(s => ({ storefront: { ...s.storefront, ...updates } })),
    updateStorefrontCMS: (updates) => set(s => ({ storefrontCMS: { ...s.storefrontCMS, ...updates } })),
    updateSettings: (updates) => set(s => ({ settings: { ...s.settings, ...updates } })),
    
    // --- Enterprise Settings Actions ---
    addRole: (role) => set(s => {
      const newActivity = { id: crypto.randomUUID(), time: 'Just now', text: `Created new role "${role.name}".` }
      return { 
        enterpriseSettings: { ...s.enterpriseSettings, roles: [...s.enterpriseSettings.roles, role] },
        activities: [newActivity, ...s.activities].slice(0, 50)
      }
    }),
    deleteRole: (id) => set(s => {
      const role = s.enterpriseSettings.roles.find(r => r.id === id)
      const newActivity = { id: crypto.randomUUID(), time: 'Just now', text: `Deleted role "${role?.name}".` }
      return {
        enterpriseSettings: { ...s.enterpriseSettings, roles: s.enterpriseSettings.roles.filter(r => r.id !== id) },
        activities: [newActivity, ...s.activities].slice(0, 50)
      }
    }),
    updateSecuritySettings: (updates) => set(s => {
      const newActivity = { id: crypto.randomUUID(), time: 'Just now', text: `Updated security settings.` }
      return {
        enterpriseSettings: { ...s.enterpriseSettings, security: { ...s.enterpriseSettings.security, ...updates } },
        activities: [newActivity, ...s.activities].slice(0, 50)
      }
    }),
    generateApiKey: (keyData) => set(s => {
      const newActivity = { id: crypto.randomUUID(), time: 'Just now', text: `Generated API Key "${keyData.name}".` }
      return {
        enterpriseSettings: { ...s.enterpriseSettings, apiKeys: [keyData, ...s.enterpriseSettings.apiKeys] },
        activities: [newActivity, ...s.activities].slice(0, 50)
      }
    }),
    deleteApiKey: (id) => set(s => {
      const key = s.enterpriseSettings.apiKeys.find(k => k.id === id)
      const newActivity = { id: crypto.randomUUID(), time: 'Just now', text: `Revoked API Key "${key?.name}".` }
      return {
        enterpriseSettings: { ...s.enterpriseSettings, apiKeys: s.enterpriseSettings.apiKeys.filter(k => k.id !== id) },
        activities: [newActivity, ...s.activities].slice(0, 50)
      }
    }),
    addWebhook: (webhook) => set(s => {
      const newActivity = { id: crypto.randomUUID(), time: 'Just now', text: `Added Webhook for ${webhook.url}.` }
      return {
        enterpriseSettings: { ...s.enterpriseSettings, webhooks: [webhook, ...s.enterpriseSettings.webhooks] },
        activities: [newActivity, ...s.activities].slice(0, 50)
      }
    }),
    deleteWebhook: (id) => set(s => {
      const newActivity = { id: crypto.randomUUID(), time: 'Just now', text: `Deleted Webhook.` }
      return {
        enterpriseSettings: { ...s.enterpriseSettings, webhooks: s.enterpriseSettings.webhooks.filter(w => w.id !== id) },
        activities: [newActivity, ...s.activities].slice(0, 50)
      }
    }),
    toggleIntegration: (id) => set(s => {
      const int = s.enterpriseSettings.integrations.find(i => i.id === id)
      const newActivity = { id: crypto.randomUUID(), time: 'Just now', text: `${int?.connected ? 'Revoked' : 'Connected'} integration: ${int?.name}.` }
      return {
        enterpriseSettings: {
          ...s.enterpriseSettings,
          integrations: s.enterpriseSettings.integrations.map(i => i.id === id ? { ...i, connected: !i.connected, lastSync: !i.connected ? 'Just now' : 'N/A' } : i)
        },
        activities: [newActivity, ...s.activities].slice(0, 50)
      }
    }),
    triggerBackup: () => set(s => {
      const newBackup = {
        id: `BK-${Date.now().toString().slice(-4)}`,
        date: new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true }),
        size: `${(Math.random() * 2 + 3).toFixed(1)} GB`, // Mock size ~3-5GB
        status: 'Completed'
      }
      const newActivity = { id: crypto.randomUUID(), time: 'Just now', text: `Triggered manual database backup.` }
      return {
        enterpriseSettings: { ...s.enterpriseSettings, backups: [newBackup, ...s.enterpriseSettings.backups] },
        activities: [newActivity, ...s.activities].slice(0, 50)
      }
    }),
    addCampaign: (campaign) => set(s => {
      const newActivity = { id: crypto.randomUUID(), time: 'Just now', text: `New discount code "${campaign.id}" created.` }
      return { campaigns: [campaign, ...s.campaigns], activities: [newActivity, ...s.activities].slice(0, 50) }
    }),
    deleteCampaign: (id) => set(s => {
      const newActivity = { id: crypto.randomUUID(), time: 'Just now', text: `Discount code "${id}" deleted.` }
      return { campaigns: s.campaigns.filter(c => c.id !== id), activities: [newActivity, ...s.activities].slice(0, 50) }
    }),
    
    addActivity: (text) => set(s => {
      const newActivity = { id: crypto.randomUUID(), time: 'Just now', text }
      return { activities: [newActivity, ...s.activities].slice(0, 50) } // Keep last 50
    }),

    addProduct: (product) => set(s => {
      const newActivity = { id: crypto.randomUUID(), time: 'Just now', text: `New product "${product.name}" created.` }
      return { products: [product, ...s.products], activities: [newActivity, ...s.activities].slice(0, 50) }
    }),
    updateProduct: (id, updates) => set(s => ({
      products: s.products.map(p => p.id === id ? { ...p, ...updates } : p)
    })),
    deleteProduct: (id) => set(s => ({ products: s.products.filter(p => p.id !== id) })),
    toggleStock: (id) => set(s => ({
      products: s.products.map(p => p.id === id ? { ...p, inStock: !p.inStock, inventoryCount: p.inStock ? 0 : 50 } : p)
    })),
    resolveTicket: (id) => set(s => ({
      supportTickets: s.supportTickets.map(t => t.id === id ? { ...t, status: 'Closed', slaDeadline: 'Resolved' } : t)
    })),
    escalateTicket: (id) => set(s => {
      const newActivity = { id: crypto.randomUUID(), time: 'Just now', text: `Ticket ${id} escalated to Tier 2.` }
      return {
        supportTickets: s.supportTickets.map(t => t.id === id ? { ...t, escalationLevel: (t.escalationLevel || 0) + 1, priority: 'High' } : t),
        activities: [newActivity, ...s.activities].slice(0, 50)
      }
    }),
    issueTicketRefund: (id) => set(s => {
      const refundAmount = 150 // Mocked fixed refund amount
      const newActivity = { id: crypto.randomUUID(), time: 'Just now', text: `Refund of $${refundAmount} issued for Ticket ${id}.` }
      return {
        supportTickets: s.supportTickets.map(t => t.id === id ? { ...t, status: 'Closed', slaDeadline: 'Resolved' } : t),
        financials: {
          ...s.financials,
          grossRevenue: s.financials.grossRevenue - refundAmount,
          netRevenue: s.financials.netRevenue - refundAmount,
          refunds: s.financials.refunds + refundAmount
        },
        activities: [newActivity, ...s.activities].slice(0, 50)
      }
    }),
    sendChatMessage: (chatId, text, sender = 'Agent') => set(s => ({
      liveChats: s.liveChats.map(c => c.id === chatId ? { ...c, messages: [...c.messages, { sender, text }] } : c)
    })),
    updateOrder: (id, updates) => set(s => {
      const isStatusChange = updates.status && s.orders.find(o => o.id === id)?.status !== updates.status
      let newActivities = s.activities
      if (isStatusChange) {
        newActivities = [{ id: crypto.randomUUID(), time: 'Just now', text: `Order ${id} marked as ${updates.status}.` }, ...s.activities].slice(0, 50)
      }
      return {
        orders: s.orders.map(o => o.id === id ? { ...o, ...updates } : o),
        activities: newActivities
      }
    }),
    bulkUpdateOrders: (ids, updates, trackingGenerator = null) => set(s => {
      const newActivity = { id: crypto.randomUUID(), time: 'Just now', text: `Bulk updated ${ids.size} orders.` }
      return {
        orders: s.orders.map(o => ids.has(o.id) ? { ...o, ...updates, ...(trackingGenerator && { trackingNumber: trackingGenerator() }) } : o),
        activities: [newActivity, ...s.activities].slice(0, 50)
      }
    }),
    addOrderNote: (id, noteStr) => set(s => ({
      orders: s.orders.map(o => {
        if (o.id !== id) return o
        const noteEvent = { type: 'note', title: 'Internal Note', time: 'Just now', user: 'Admin', note: noteStr }
        return { ...o, timeline: [...(o.timeline || []), noteEvent] }
      })
    })),
    bulkUpdateProducts: (ids, updates) => set(s => ({
      products: s.products.map(p => ids.has(p.id) ? { ...p, ...updates } : p)
    })),
    duplicateProduct: (id) => set(s => {
      const prod = s.products.find(p => p.id === id)
      if (!prod) return s
      const duplicate = {
        ...prod,
        id: crypto.randomUUID(),
        name: `${prod.name} (Copy)`,
        slug: `${prod.slug}-copy-${crypto.randomUUID().slice(0, 8)}`,
        lifecycleStatus: 'Draft'
      }
      return { products: [duplicate, ...s.products] }
    }),
    addCustomerNote: (email, noteText) => set(s => {
      const newActivity = { id: crypto.randomUUID(), time: 'Just now', text: `Note added to customer ${email}.` }
      return {
        customers: s.customers.map(c => c.email === email ? {
          ...c,
          notes: [...(c.notes || []), { text: noteText, author: 'Admin', date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) }],
          timeline: [...(c.timeline || []), { type: 'note', icon: 'sticky_note_2', label: 'Internal Note Added', detail: noteText.slice(0, 60), date: 'Just now' }]
        } : c),
        activities: [newActivity, ...s.activities].slice(0, 50)
      }
    }),
    updateCustomerTags: (email, tags) => set(s => ({
      customers: s.customers.map(c => c.email === email ? { ...c, tags } : c)
    })),
    banCustomer: (email) => set(s => {
      const customer = s.customers.find(c => c.email === email)
      const action = customer?.banned ? 'unbanned' : 'banned'
      const newActivity = { id: crypto.randomUUID(), time: 'Just now', text: `Customer ${email} was ${action}.` }
      return {
        customers: s.customers.map(c => c.email === email ? { ...c, banned: !c.banned } : c),
        activities: [newActivity, ...s.activities].slice(0, 50)
      }
    }),
    updateCustomerRisk: (email, riskFlag) => set(s => ({
      customers: s.customers.map(c => c.email === email ? { ...c, riskFlag } : c)
    })),
    addPurchaseOrder: (po) => set(s => ({
      purchaseOrders: [po, ...s.purchaseOrders]
    })),
    updatePOStatus: (id, status) => set(s => ({
      purchaseOrders: s.purchaseOrders.map(po => po.id === id ? { ...po, status } : po)
    })),
    addInventoryLog: (log) => set(s => ({
      inventoryLogs: [log, ...s.inventoryLogs]
    })),
    addCustomer: (customer) => set(s => {
      const newActivity = { id: crypto.randomUUID(), time: 'Just now', text: `Customer ${customer.email} added.` }
      return { customers: [customer, ...s.customers], activities: [newActivity, ...s.activities].slice(0, 50) }
    }),
    updateCustomer: (email, updates) => set(s => ({ customers: s.customers.map(c => c.email === email ? { ...c, ...updates } : c) })),
    deleteCustomer: (email) => set(s => {
      const newActivity = { id: crypto.randomUUID(), time: 'Just now', text: `Customer ${email} deleted.` }
      return { customers: s.customers.filter(c => c.email !== email), activities: [newActivity, ...s.activities].slice(0, 50) }
    }),
    updateCampaign: (id, updates) => set(s => ({ campaigns: s.campaigns.map(c => c.id === id ? { ...c, ...updates } : c) })),
    addOmniCampaign: (campaign) => set(s => ({ omniCampaigns: [campaign, ...s.omniCampaigns] })),
    updateOmniCampaign: (id, updates) => set(s => ({ omniCampaigns: s.omniCampaigns.map(c => c.id === id ? { ...c, ...updates } : c) })),
    deleteOmniCampaign: (id) => set(s => ({ omniCampaigns: s.omniCampaigns.filter(c => c.id !== id) })),
    addOrder: (order) => set(s => ({ orders: [order, ...s.orders] })),
    deleteOrder: (id) => set(s => ({ orders: s.orders.filter(o => o.id !== id) })),
    addTicketReply: (id, message, sender = 'Agent') => set(s => ({
      supportTickets: s.supportTickets.map(t => t.id === id ? { ...t, messages: [...(t.messages || []), { sender, text: message, time: 'Just now' }] } : t)
    })),
    createTicket: (ticket) => set(s => ({ supportTickets: [ticket, ...s.supportTickets] })),
    transferStock: (sku, fromId, toId, quantity) => set(s => {
      const newLog = { id: `LOG-${Date.now()}`, date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }), user: 'Admin', action: 'Stock Transfer', detail: `Transferred ${quantity} units of ${sku} from ${fromId} to ${toId}` }
      return { inventoryLogs: [newLog, ...s.inventoryLogs] }
    }),
    addExpense: (expense) => set(s => ({ financials: { ...s.financials, expenses: [expense, ...s.financials.expenses] } })),
    addInvoice: (invoice) => set(s => ({ financials: { ...s.financials, invoices: [invoice, ...s.financials.invoices] } })),
    updateTaxStatus: (region, status) => set(s => ({ financials: { ...s.financials, taxReports: s.financials.taxReports.map(t => t.region === region ? { ...t, status } : t) } }))
  }),
  { name: 'atelier-admin-v9' }
))
