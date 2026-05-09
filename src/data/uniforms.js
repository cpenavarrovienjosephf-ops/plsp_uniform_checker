// PLSP Uniform & Dress Code Policy
// Based on Pamantasan ng Lungsod ng San Pablo – Office of Student Affairs and Services

// ─── WEEKLY SCHEDULE ────────────────────────────────────────────────────────
export const SCHEDULE = {
  Monday:    'Prescribed Official School Uniform',
  Tuesday:   'Wash Day',
  Wednesday: 'Prescribed Official School Uniform',
  Thursday:  'Wash Day',
  Friday:    'Prescribed Official School Uniform',
  Saturday:  'Freestyle',
  Sunday:    'Freestyle',
}

export const WASH_DAY_OPTIONS = [
  'Organization Shirt',
  'Department Shirt',
  'White Polo Shirt paired with slacks or pants',
  'Corporate Attire',
]

export const FREESTYLE_PROHIBITED = [
  'Slippers',
  'Shorts',
  'Tattered Denim Pants (male students)',
  'Wooden Shoes',
  'Mini Skirts (female students)',
  'Sleeveless / Hanging Blouses',
]

// ─── DRESS CODE SPECS ───────────────────────────────────────────────────────
export const DRESS_CODE_SPECS = [
  { spec: 'Hair Color', rule: 'Natural hair tones allowed (including natural brown). Unnatural/extremely bright colors (blonde, neon, blue, red, green, violet, pink, orange, yellow, white, ash gray) and highlights are not allowed.' },
  { spec: 'Makeup', rule: 'Light makeup is allowed. Heavy makeup is not allowed.' },
  { spec: 'Shoes', rule: 'Black closed shoes required when wearing school uniform. Non-black closed shoes allowed when not in school uniform.' },
  { spec: 'Heel Height', rule: 'No limitation on heel height.' },
  { spec: 'Skirt Length', rule: 'Shortest allowable length is 2 inches above the knee.' },
  { spec: 'Socks', rule: 'Socks are not permitted with the prescribed uniform. Skin-colored stockings are allowed.' },
  { spec: 'Cross-Dressing', rule: 'Not permitted under existing dress code policy. Pending motion for reconsideration subject to Management Committee and Board of Regents approval.' },
]

// ─── UNIFORM ITEMS ──────────────────────────────────────────────────────────
export const UNIFORMS = [

  // ── PROPER: Prescribed Official School Uniform (Mon / Wed / Fri) ──────────
  {
    uniform_id: 1,
    category: 'Top',
    day_type: 'Official Uniform',
    is_proper: true,
    label: 'Official School Uniform (Top)',
    description: 'Prescribed PLSP official school uniform top. Required on Monday, Wednesday, and Friday.',
    color: '#e8f4e8',
    accent: '#1a5c2e',
  },
  {
    uniform_id: 2,
    category: 'Top',
    day_type: 'Official Uniform',
    is_proper: true,
    label: 'OJT / Internship Uniform',
    description: 'OJT or internship uniform is an accepted alternative to the official school uniform on Mon/Wed/Fri.',
    color: '#e8f4e8',
    accent: '#2e7d32',
  },

  // ── PROPER: Wash Day (Tue / Thu) ──────────────────────────────────────────
  {
    uniform_id: 3,
    category: 'Top',
    day_type: 'Wash Day',
    is_proper: true,
    label: 'Organization Shirt',
    description: 'Recognized organization shirt. Acceptable attire on Wash Days (Tuesday & Thursday).',
    color: '#e8f0fd',
    accent: '#1a3a6e',
  },
  {
    uniform_id: 4,
    category: 'Top',
    day_type: 'Wash Day',
    is_proper: true,
    label: 'Department Shirt',
    description: 'Official department shirt. Acceptable attire on Wash Days (Tuesday & Thursday).',
    color: '#e8f0fd',
    accent: '#1565c0',
  },
  {
    uniform_id: 5,
    category: 'Top',
    day_type: 'Wash Day',
    is_proper: true,
    label: 'White Polo Shirt + Slacks/Pants',
    description: 'A white polo shirt paired with slacks or pants is allowed on Wash Days.',
    color: '#f5f5f5',
    accent: '#37474f',
  },
  {
    uniform_id: 6,
    category: 'Top',
    day_type: 'Wash Day',
    is_proper: true,
    label: 'Corporate Attire',
    description: 'Professional corporate attire is an approved option on Wash Days (Tuesday & Thursday).',
    color: '#ede8f8',
    accent: '#4a148c',
  },

  // ── PROPER: Footwear ──────────────────────────────────────────────────────
  {
    uniform_id: 7,
    category: 'Shoes',
    day_type: 'Official Uniform',
    is_proper: true,
    label: 'Black Closed Shoes',
    description: 'Polished black closed shoes are required when wearing the official school uniform.',
    color: '#f0f0f0',
    accent: '#212121',
  },
  {
    uniform_id: 8,
    category: 'Shoes',
    day_type: 'Wash Day / Freestyle',
    is_proper: true,
    label: 'Non-Black Closed Shoes',
    description: 'Closed shoes in any color are allowed when not wearing the official school uniform.',
    color: '#fff3e0',
    accent: '#e65100',
  },

  // ── PROPER: Bottom ────────────────────────────────────────────────────────
  {
    uniform_id: 9,
    category: 'Bottom',
    day_type: 'Official Uniform',
    is_proper: true,
    label: 'Skirt (max 2 in. above knee)',
    description: 'Skirt length must not be shorter than 2 inches above the knee, per Section 4.5 of the dress code.',
    color: '#fce4ec',
    accent: '#880e4f',
  },
  {
    uniform_id: 10,
    category: 'Bottom',
    day_type: 'Official Uniform / Wash Day',
    is_proper: true,
    label: 'Slacks / Pants',
    description: 'Pressed slacks or trousers are part of the official uniform and acceptable on Wash Days.',
    color: '#eaf0fb',
    accent: '#1a3a6e',
  },

  // ── PROPER: Accessories ───────────────────────────────────────────────────
  {
    uniform_id: 11,
    category: 'Accessories',
    day_type: 'All Days',
    is_proper: true,
    label: 'School ID / Lanyard',
    description: 'Official PLSP ID must be worn visibly at all times within campus premises.',
    color: '#fff8e1',
    accent: '#c9a32e',
  },
  {
    uniform_id: 12,
    category: 'Accessories',
    day_type: 'Official Uniform',
    is_proper: true,
    label: 'Skin-Colored Stockings',
    description: 'Skin-colored stockings are permitted with the official uniform. Regular socks are NOT allowed.',
    color: '#fdf3ec',
    accent: '#a0522d',
  },

  // ── IMPROPER: Hair ────────────────────────────────────────────────────────
  {
    uniform_id: 13,
    category: 'Hair',
    day_type: 'All Days',
    is_proper: false,
    label: 'Unnatural Hair Color',
    description: 'Blue, red, green, violet, pink, orange, yellow, white, ash gray, blonde, neon, or highlighted hair is prohibited on any day.',
    color: '#fde8e8',
    accent: '#c0392b',
  },

  // ── IMPROPER: Footwear ────────────────────────────────────────────────────
  {
    uniform_id: 14,
    category: 'Shoes',
    day_type: 'All Days',
    is_proper: false,
    label: 'Slippers',
    description: 'Slippers are strictly prohibited on all school days, including Freestyle days (Saturday & Sunday).',
    color: '#fff0e8',
    accent: '#d35400',
  },
  {
    uniform_id: 15,
    category: 'Shoes',
    day_type: 'All Days',
    is_proper: false,
    label: 'Wooden Shoes',
    description: 'Wooden shoes (bakya) are not allowed on campus on any day.',
    color: '#fff0e8',
    accent: '#bf360c',
  },

  // ── IMPROPER: Bottom ──────────────────────────────────────────────────────
  {
    uniform_id: 16,
    category: 'Bottom',
    day_type: 'All Days',
    is_proper: false,
    label: 'Shorts',
    description: 'Shorts are prohibited on all school days, including Freestyle days.',
    color: '#fde8f4',
    accent: '#8e1f6e',
  },
  {
    uniform_id: 17,
    category: 'Bottom',
    day_type: 'All Days (Male)',
    is_proper: false,
    label: 'Tattered Denim Pants (Male)',
    description: 'Tattered/distressed denim pants are prohibited for male students on all days including Freestyle.',
    color: '#e8effe',
    accent: '#2c3e80',
  },
  {
    uniform_id: 18,
    category: 'Bottom',
    day_type: 'All Days (Female)',
    is_proper: false,
    label: 'Mini Skirt (Female)',
    description: 'Mini skirts shorter than 2 inches above the knee are prohibited. This also applies on Freestyle days.',
    color: '#fde8f4',
    accent: '#ad1457',
  },

  // ── IMPROPER: Top ─────────────────────────────────────────────────────────
  {
    uniform_id: 19,
    category: 'Top',
    day_type: 'All Days',
    is_proper: false,
    label: 'Sleeveless / Hanging Blouse',
    description: 'Sleeveless tops and hanging blouses are prohibited on all school days, including Freestyle.',
    color: '#fdecea',
    accent: '#b71c1c',
  },

  // ── IMPROPER: Accessories/Makeup ──────────────────────────────────────────
  {
    uniform_id: 20,
    category: 'Accessories',
    day_type: 'All Days',
    is_proper: false,
    label: 'Heavy Makeup',
    description: 'Heavy makeup is not allowed. Light makeup is acceptable.',
    color: '#fef9e8',
    accent: '#b7950b',
  },

  // ── IMPROPER: Socks ───────────────────────────────────────────────────────
  {
    uniform_id: 21,
    category: 'Accessories',
    day_type: 'Official Uniform',
    is_proper: false,
    label: 'Socks with Official Uniform',
    description: 'Regular socks are not permitted under the prescribed uniform dress code. Only skin-colored stockings are allowed.',
    color: '#f5f5f5',
    accent: '#546e7a',
  },
]
