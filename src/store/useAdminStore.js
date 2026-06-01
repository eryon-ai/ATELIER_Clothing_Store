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

export const useAdminStore = create(persist(
  (set) => ({
    customers: generateCustomers(),
    products: PRODUCTS.slice(0, 30),
    orders: generateOrders(),
    stats: {
      revenue: 284750,
      orders: 1247,
      customers: 8934,
      conversion: 3.2,
    },
    storefront: {
      title: 'The Architectural\nSilhouette.',
      subtitle: 'Spring / Summer 2026 — Campaign One',
      buttonText: 'Shop Women',
      buttonLink: '/collections/women',
      image: '/hero-bg.jpg',
    },
    campaigns: [
      { id: 'SUMMER20', type: 'Percentage', value: '20%', uses: 142, status: 'Active' },
      { id: 'FREESHIP', type: 'Free Shipping', value: 'Free', uses: 89, status: 'Active' },
      { id: 'WELCOME10', type: 'Percentage', value: '10%', uses: 412, status: 'Active' },
      { id: 'FLASH50', type: 'Fixed Amount', value: '$50.00', uses: 10, status: 'Expired' },
    ],
    supportTickets: [
      { id: 'TCK-092', customer: 'Alex Chen', subject: 'Return request for Parka', status: 'Open', date: '2 hrs ago' },
      { id: 'TCK-091', customer: 'Morgan Lee', subject: 'Where is my order?', status: 'Pending', date: '5 hrs ago' },
      { id: 'TCK-090', customer: 'Sam Rivera', subject: 'Defective item received', status: 'Open', date: '1 day ago' },
      { id: 'TCK-089', customer: 'Taylor Swift', subject: 'Size exchange', status: 'Closed', date: '2 days ago' },
    ],
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
      ]
    },
    updateStorefront: (updates) => set(s => ({ storefront: { ...s.storefront, ...updates } })),
    addCampaign: (campaign) => set(s => ({ campaigns: [campaign, ...s.campaigns] })),
    addProduct: (product) => set(s => ({ products: [product, ...s.products] })),
    updateProduct: (id, updates) => set(s => ({
      products: s.products.map(p => p.id === id ? { ...p, ...updates } : p)
    })),
    deleteProduct: (id) => set(s => ({ products: s.products.filter(p => p.id !== id) })),
    toggleStock: (id) => set(s => ({
      products: s.products.map(p => p.id === id ? { ...p, inStock: !p.inStock } : p)
    })),
    resolveTicket: (id) => set(s => ({
      supportTickets: s.supportTickets.map(t => t.id === id ? { ...t, status: 'Closed' } : t)
    })),
    updateOrder: (id, updates) => set(s => ({
      orders: s.orders.map(o => o.id === id ? { ...o, ...updates } : o)
    })),
    bulkUpdateOrders: (ids, updates) => set(s => ({
      orders: s.orders.map(o => ids.has(o.id) ? { ...o, ...updates } : o)
    })),
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
      const p = s.products.find(p => p.id === id)
      if (!p) return s
      const duplicate = {
        ...p,
        id: Date.now(),
        name: `${p.name} (Copy)`,
        slug: `${p.slug}-copy-${Math.floor(Math.random() * 1000)}`,
        lifecycleStatus: 'Draft'
      }
      return { products: [duplicate, ...s.products] }
    }),
    addCustomerNote: (email, noteText) => set(s => ({
      customers: s.customers.map(c => c.email === email ? {
        ...c,
        notes: [...c.notes, { text: noteText, author: 'Admin', date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) }],
        timeline: [...c.timeline, { type: 'note', icon: 'sticky_note_2', label: 'Internal Note Added', detail: noteText.slice(0, 60), date: 'Just now' }]
      } : c)
    })),
    updateCustomerTags: (email, tags) => set(s => ({
      customers: s.customers.map(c => c.email === email ? { ...c, tags } : c)
    })),
    banCustomer: (email) => set(s => ({
      customers: s.customers.map(c => c.email === email ? { ...c, banned: !c.banned } : c)
    })),
    updateCustomerRisk: (email, riskFlag) => set(s => ({
      customers: s.customers.map(c => c.email === email ? { ...c, riskFlag } : c)
    }))
  }),
  { name: 'atelier-admin-v3' }
))
