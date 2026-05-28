#!/usr/bin/env node
const fs = require('fs')
const path = require('path')

const SCREENS = [
  { component: 'HomeDetailed', file: 'home-detailed.html', title: 'Atelier | Home (Highly Detailed)', tag: 'DARK' },
  { component: 'HomeLight', file: 'home-light.html', title: 'Atelier | Home (Light Theme)', tag: 'LIGHT' },
  { component: 'EditorialHome', file: 'editorial-home.html', title: 'Atelier | Cinematic Editorial Home', tag: 'LIGHT' },
  { component: 'PDP', file: 'pdp.html', title: 'Atelier | Premium PDP', tag: 'LIGHT' },
  { component: 'Parka', file: 'parka.html', title: 'Atelier | Metropolis Parka', tag: 'LIGHT' },
  { component: 'Cart', file: 'cart.html', title: 'Atelier | Cart & Checkout', tag: 'LIGHT' },
  { component: 'CartPremium', file: 'cart-premium.html', title: 'Atelier | Premium Cart & Checkout', tag: 'LIGHT' },
  { component: 'Women', file: 'women.html', title: "Atelier | Women's Collection", tag: 'DARK' },
  { component: 'Men', file: 'men.html', title: "Atelier | Men's Collection", tag: 'DARK' },
  { component: 'Sneakers', file: 'sneakers.html', title: 'Atelier | Sneakers & Kicks', tag: 'DARK' },
  { component: 'Footwear', file: 'footwear.html', title: 'Atelier | Footwear Collection', tag: 'DARK' },
  { component: 'Accessories', file: 'accessories.html', title: 'Atelier | Accessories Collection', tag: 'DARK' },
  { component: 'Oversized', file: 'oversized.html', title: 'Atelier | Oversized Collection', tag: 'DARK' },
  { component: 'Premium', file: 'premium.html', title: 'Atelier | Premium Collection', tag: 'DARK' },
  { component: 'BestSellers', file: 'best-sellers.html', title: 'Atelier | Best Sellers', tag: 'DARK' },
  { component: 'Trending', file: 'trending.html', title: 'Atelier | Trending Now', tag: 'DARK' },
  { component: 'NewArrivals', file: 'new-arrivals.html', title: 'Atelier | New Arrivals', tag: 'DARK' },
  { component: 'Limited', file: 'limited.html', title: 'Atelier | Limited Edition', tag: 'DARK' },
  { component: 'Sale', file: 'sale.html', title: 'Atelier | Sale & Archive', tag: 'DARK' },
  { component: 'Summer', file: 'summer.html', title: 'Atelier | Summer Collection', tag: 'DARK' },
  { component: 'Winter', file: 'winter.html', title: 'Atelier | Winter Collection', tag: 'DARK' },
  { component: 'Festival', file: 'festival.html', title: 'Atelier | Festival Collection', tag: 'DARK' },
  { component: 'StreetwearCore', file: 'streetwear-core.html', title: 'Atelier | Streetwear Core', tag: 'DARK' },
  { component: 'StreetwearLight', file: 'streetwear-light.html', title: 'Atelier | Streetwear Collection', tag: 'LIGHT' },
  { component: 'Anime', file: 'anime.html', title: 'Atelier | Anime Capsule', tag: 'DARK' },
  { component: 'Marvel', file: 'marvel.html', title: 'Atelier | Marvel Collaboration', tag: 'DARK' },
  { component: 'Collab', file: 'collab.html', title: 'Atelier | Collaboration Hub', tag: 'DARK' },
  { component: 'Gym', file: 'gym.html', title: 'Atelier | Performance Gym Wear', tag: 'DARK' },
  { component: 'Dashboard', file: 'dashboard.html', title: 'Atelier | Member Dashboard', tag: 'LIGHT' },
  { component: 'Admin', file: 'admin.html', title: 'Atelier | Admin Console', tag: 'LIGHT' },
]

const pagesDir = path.join(__dirname, 'src', 'pages')
if (!fs.existsSync(pagesDir)) fs.mkdirSync(pagesDir, { recursive: true })

SCREENS.forEach(({ component, file, title, tag }) => {
  const content = `import ScreenFrame from '../components/ScreenFrame'

export default function ${component}() {
  return <ScreenFrame file="${file}" title="${title}" tag="${tag}" />
}
`
  const filename = path.join(pagesDir, `${component}.jsx`)
  fs.writeFileSync(filename, content)
  console.log(`✓ Created src/pages/${component}.jsx`)
})

console.log(`\n✅ Generated ${SCREENS.length} page components!`)
