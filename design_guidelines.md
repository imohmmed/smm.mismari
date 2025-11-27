# SMM Panel Design Guidelines

## Design Approach
**Mobile-First Utility Design** inspired by Telegram's clean aesthetic and Amazing SMM's functional layout. Focus on clarity, efficiency, and seamless Arabic/English switching with RTL support.

## Typography Hierarchy

**Arabic Font**: IBM Plex Sans Arabic (Google Fonts)
**English Font**: Inter (Google Fonts)

- **Hero/Page Titles**: text-2xl to text-3xl, font-bold
- **Section Headings**: text-xl, font-semibold
- **Card Titles**: text-lg, font-medium
- **Body Text**: text-base, font-normal
- **Captions/Meta**: text-sm, text-gray-600
- **Prices**: text-lg to text-xl, font-bold

## Layout System

**Spacing Units**: Consistent use of 4, 6, 8, 12, 16 (tailwind p-4, p-6, p-8, etc.)

**Container Structure**:
- Mobile: Full width with px-4 padding
- Desktop: max-w-7xl mx-auto px-6
- Cards: p-4 to p-6 spacing
- Sections: py-8 to py-12 vertical spacing

**Grid Patterns**:
- Service cards: grid-cols-1 md:grid-cols-2 lg:grid-cols-3
- App icons: grid-cols-3 md:grid-cols-4 lg:grid-cols-6
- Stats/metrics: grid-cols-2 md:grid-cols-4

## Component Library

### Navigation
**Bottom Navigation Bar** (Mobile-primary):
- Fixed bottom position, h-16
- 5 items: Account | Orders | Add Order (center) | Add Funds | Support
- Center button: Larger, green circular bg, elevated with shadow
- Icons with labels beneath
- Active state: Blue text color
- Background: White with subtle top border shadow

**Top Header**:
- Language switcher (AR/EN) - right aligned
- Logo left, user balance center-right
- h-14 with shadow-sm

### Service Selection Interface

**App Icon Grid**:
- Circular icon containers (w-16 h-16)
- Platform logos (Instagram, TikTok, YouTube, Facebook, etc.)
- Platform name beneath icon
- Tap interaction: scale effect
- Grid layout with gap-4

**Dropdown Flow**:
- "All Services" triggers cascading dropdowns:
  1. Select App (shows app grid overlay)
  2. Select Category (Comments, Likes, Views, Followers)
  3. Select Service (specific service details)
- Direct logo tap: Skips to Category selection
- Clean, card-based dropdown UI

### Order Form Components

**Service Card**:
- White background, rounded-lg, shadow-md
- Service name (text-lg, font-semibold)
- Price per 1000 with 15% markup badge
- Min/Max quantity indicators
- Description text (text-sm, text-gray-600)

**Input Fields**:
- Link input: Full width, border-2, rounded-lg, p-3
- Quantity input: inputmode="numeric" for mobile keyboard
- Real-time price calculation display
- Estimated delivery time indicator

**Order Summary Card**:
- Sticky bottom or prominent placement
- Total cost (large, bold)
- Estimated time
- Green "Confirm Order" button (w-full, py-3, rounded-lg)

### Dashboard Components

**Balance Card**:
- Prominent placement, gradient blue background
- Large balance text (white, text-3xl, font-bold)
- Currency indicator
- "Add Funds" CTA button

**Order History Cards**:
- Status badge (blue: processing, green: completed, red: cancelled)
- Service name and platform icon
- Order ID, date, quantity, price
- Progress indicator if applicable
- Collapsible details

**Empty State**:
- Centered icon (gray-400)
- "No orders yet" message
- "Create your first order" CTA button

### Payment Method Cards

**Payment Options**:
- Card layout with payment logo
- MasterCard/Visa icon
- Zain Cash logo (custom)
- Asia Cell logo (custom)
- Instructions expandable section
- "Select Payment" radio button

### Information Sections

**Service Info Accordion**:
- "Read Before Ordering" (expandable)
- "Newly Added Services" (badge indicator)
- "Service Details" (expandable)
- Terms and conditions
- FAQ items

## Color Palette (Telegram-Inspired)

**Primary**: Blue #0088cc (Telegram blue)
**Secondary**: Green #34C759 (success, add order button)
**Background**: White #FFFFFF
**Surface**: Gray-50 #F9FAFB (card backgrounds)
**Text Primary**: Gray-900 #111827
**Text Secondary**: Gray-600 #4B5563
**Border**: Gray-200 #E5E7EB
**Danger**: Red-500 #EF4444
**Success**: Green-500 #10B981

## Bilingual RTL Support

**Arabic Mode**:
- dir="rtl" on html
- Text right-aligned
- Icons flip position (chevrons, arrows)
- Padding/margin mirror
- Bottom nav order reverses

**Language Toggle**:
- Persistent position (top-right in LTR, top-left in RTL)
- Flag icons or AR/EN text
- Smooth transition, no page reload

## Interaction Patterns

**Buttons**:
- Primary: Blue background, white text, py-3 px-6, rounded-lg
- Secondary: Blue outline, blue text, py-3 px-6, rounded-lg
- Success: Green background, white text (for confirmations)
- Hover: Slight darkening (hover:bg-blue-600)
- Active: Scale effect (active:scale-95)

**Cards**:
- Subtle shadow-md, hover:shadow-lg transition
- Rounded corners (rounded-lg)
- Clean borders when needed

**Inputs**:
- Focus: Blue ring (focus:ring-2 focus:ring-blue-500)
- Error state: Red border
- Success: Green checkmark icon

## Images

**No large hero image needed** - This is a utility web app focused on functionality.

**Icons/Logos**:
- Social platform logos (Instagram, TikTok, etc.) via Font Awesome or custom SVG
- Payment method logos (MasterCard, Zain Cash, Asia Cell) - use official logos
- User avatar placeholder icons

**Illustrations** (optional):
- Empty state illustrations (simple, line-art style)
- Success confirmation graphics (minimal)

## Animation Guidelines

**Minimal, purposeful animations**:
- Page transitions: Fade in (200ms)
- Modal/dropdown: Slide from bottom (300ms)
- Loading states: Spinner or skeleton screens
- Button interactions: Scale (100ms)
- NO parallax, NO scroll-triggered animations