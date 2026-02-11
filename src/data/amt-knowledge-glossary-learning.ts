// AMT Knowledge Base - Glossary and Learning Path
// Supplementary structures for beginner-friendly navigation

// ============================================================================
// GLOSSARY
// ============================================================================

export interface GlossaryTerm {
  term: string;
  slug: string;
  definition: string;
  related_terms?: string[];
  see_also?: string[]; // article slugs
}

export const glossary: GlossaryTerm[] = [
  {
    term: 'Acceptance',
    slug: 'acceptance',
    definition: 'When price spends time at a level, indicating participants find that price fair. Shown by multiple TPOs at a price level.',
    related_terms: ['Rejection', 'Value Area'],
    see_also: ['the-auction-process-explained']
  },
  {
    term: 'Auction',
    slug: 'auction',
    definition: 'The continuous process of price moving up and down to find levels where buyers and sellers agree to transact.',
    related_terms: ['Price Discovery', 'Two-Way Auction'],
    see_also: ['what-is-auction-market-theory']
  },
  {
    term: 'Balance',
    slug: 'balance',
    definition: 'A market state where price rotates within a defined range. Neither buyers nor sellers have control. Value areas overlap across sessions.',
    related_terms: ['Imbalance', 'Bracket', 'Range'],
    see_also: ['identifying-market-balance', 'trading-in-balanced-markets']
  },
  {
    term: 'Bracket',
    slug: 'bracket',
    definition: 'The high-to-low range containing a balanced market. Price rotates between bracket high and bracket low.',
    related_terms: ['Balance', 'Range'],
    see_also: ['identifying-market-balance']
  },
  {
    term: 'Composite Profile',
    slug: 'composite-profile',
    definition: 'A profile combining multiple sessions into one view, revealing longer-term value areas and significant levels.',
    related_terms: ['Session Profile', 'Volume Profile'],
    see_also: ['composite-profiles-multi-day-analysis']
  },
  {
    term: 'Delta',
    slug: 'delta',
    definition: 'The difference between buying volume and selling volume. Positive delta means more aggressive buying; negative means more aggressive selling.',
    related_terms: ['Order Flow', 'Cumulative Delta'],
    see_also: ['integrating-amt-with-order-flow']
  },
  {
    term: 'Double Distribution',
    slug: 'double-distribution',
    definition: 'A profile shape with two distinct value areas separated by single prints. Indicates the market found value at two different levels during the session.',
    related_terms: ['Day Types', 'Single Prints'],
    see_also: ['market-profile-day-types']
  },
  {
    term: 'Excess',
    slug: 'excess',
    definition: 'Multiple TPOs at a session extreme showing clear rejection. Indicates the auction completed properly at that level. Opposite of a poor high/low.',
    related_terms: ['Poor High', 'Poor Low', 'Rejection'],
    see_also: ['single-prints-poor-structure']
  },
  {
    term: 'Facilitation',
    slug: 'facilitation',
    definition: 'When the market efficiently conducts trade at current prices. High facilitation means price is stable; low facilitation means price is searching.',
    related_terms: ['Price Discovery', 'Acceptance'],
    see_also: ['the-auction-process-explained']
  },
  {
    term: 'Failed Auction',
    slug: 'failed-auction',
    definition: 'When price tests a level but fails to find acceptance and reverses. Often produces strong moves in the opposite direction due to trapped participants.',
    related_terms: ['Failed Breakout', 'Rejection'],
    see_also: ['failed-auctions-reversal-signals']
  },
  {
    term: 'HVN (High Volume Node)',
    slug: 'hvn',
    definition: 'A price level with significantly high volume on a Volume Profile. Indicates acceptance and often acts as support or resistance.',
    related_terms: ['LVN', 'Volume Profile', 'POC'],
    see_also: ['volume-profile-basics']
  },
  {
    term: 'IB (Initial Balance)',
    slug: 'ib',
    definition: 'The price range established during the first hour of regular trading (A and B periods). Provides key reference points for the session.',
    related_terms: ['IB High', 'IB Low', 'Range Extension'],
    see_also: ['initial-balance-first-hour']
  },
  {
    term: 'IB Extension',
    slug: 'ib-extension',
    definition: 'When price breaks beyond the Initial Balance range. Signals conviction and often leads to trend day development.',
    related_terms: ['Initial Balance', 'Range Extension'],
    see_also: ['initial-balance-first-hour']
  },
  {
    term: 'Imbalance',
    slug: 'imbalance',
    definition: 'A market state where one side (buyers or sellers) has control and price moves directionally. Characterized by migrating POC and value areas.',
    related_terms: ['Balance', 'Trend', 'Initiative'],
    see_also: ['recognizing-market-imbalance']
  },
  {
    term: 'Initiative Activity',
    slug: 'initiative-activity',
    definition: 'Aggressive, conviction-driven trading that moves price to new levels. Participants act on information rather than reacting to price.',
    related_terms: ['Responsive Activity', 'Imbalance'],
    see_also: ['initiative-activity-explained']
  },
  {
    term: 'Inventory',
    slug: 'inventory',
    definition: 'The net positioning of participants. Long inventory means participants are net buyers; short inventory means net sellers.',
    related_terms: ['Overnight Inventory', 'Inventory Correction'],
    see_also: ['overnight-inventory-analysis']
  },
  {
    term: 'Inventory Correction',
    slug: 'inventory-correction',
    definition: 'When overnight participants must exit positions that are not confirmed at the open, creating predictable counter-directional flow.',
    related_terms: ['Overnight Inventory', 'Gap'],
    see_also: ['inventory-correction-trades']
  },
  {
    term: 'LVN (Low Volume Node)',
    slug: 'lvn',
    definition: 'A price level with minimal volume on a Volume Profile. Price tends to move quickly through LVNs. Often act as transition zones.',
    related_terms: ['HVN', 'Volume Profile'],
    see_also: ['volume-profile-basics']
  },
  {
    term: 'Market Profile',
    slug: 'market-profile',
    definition: 'A charting method that displays how much TIME price spent at each level, using TPO letters. A charting method developed for institutional auction analysis.',
    related_terms: ['TPO', 'Volume Profile', 'POC'],
    see_also: ['time-price-opportunity-tpo-charts', 'market-profile-vs-volume-profile']
  },
  {
    term: 'Naked POC',
    slug: 'naked-poc',
    definition: 'See Virgin POC.',
    related_terms: ['Virgin POC', 'POC'],
    see_also: ['point-of-control-poc-deep-dive']
  },
  {
    term: 'Normal Day',
    slug: 'normal-day',
    definition: 'A day type with a balanced, bell-shaped profile. IB contains most of the range. Favors mean reversion trading.',
    related_terms: ['Day Types', 'Trend Day'],
    see_also: ['market-profile-day-types']
  },
  {
    term: 'Open-Auction',
    slug: 'open-auction',
    definition: 'An opening type where price tests both directions without conviction. Suggests a balanced session developing.',
    related_terms: ['Opening Types', 'Open-Drive'],
    see_also: ['opening-types-market-profile']
  },
  {
    term: 'Open-Drive',
    slug: 'open-drive',
    definition: 'An opening type where price moves aggressively in one direction from the open with no retracement. Signals strong trend day potential.',
    related_terms: ['Opening Types', 'Trend Day'],
    see_also: ['opening-types-market-profile']
  },
  {
    term: 'Open-Rejection-Reverse',
    slug: 'open-rejection-reverse',
    definition: 'An opening type where price opens near a key level, tests it, gets rejected, and reverses back into prior range.',
    related_terms: ['Opening Types', 'Rejection'],
    see_also: ['opening-types-market-profile']
  },
  {
    term: 'Open-Test-Drive',
    slug: 'open-test-drive',
    definition: 'An opening type where price initially tests one direction, fails, then drives in the opposite direction with conviction.',
    related_terms: ['Opening Types', 'Failed Auction'],
    see_also: ['opening-types-market-profile']
  },
  {
    term: 'Order Flow',
    slug: 'order-flow',
    definition: 'Analysis of actual buying and selling transactions at each price. Shows who is aggressive (market orders) vs passive (limit orders).',
    related_terms: ['Delta', 'Footprint Chart'],
    see_also: ['integrating-amt-with-order-flow']
  },
  {
    term: 'P-Shape Profile',
    slug: 'p-shape',
    definition: 'A profile with wide distribution at the top and thin tail below. Indicates short covering or late buying. Bullish implication.',
    related_terms: ['b-Shape', 'Day Types'],
    see_also: ['market-profile-day-types']
  },
  {
    term: 'POC (Point of Control)',
    slug: 'poc',
    definition: 'The price level with the most activity (TPOs or volume) during a period. Represents the "fairest" price where most agreement occurred.',
    related_terms: ['VPOC', 'Value Area', 'Virgin POC'],
    see_also: ['point-of-control-poc-deep-dive']
  },
  {
    term: 'POC Migration',
    slug: 'poc-migration',
    definition: 'When the POC moves consistently higher or lower across sessions. Indicates genuine trend as participants accept new value levels.',
    related_terms: ['POC', 'Trend', 'Imbalance'],
    see_also: ['poc-migration-signals']
  },
  {
    term: 'Poor High',
    slug: 'poor-high',
    definition: 'A session high with only single prints, indicating the auction did not complete properly. Market may return to test this level.',
    related_terms: ['Poor Low', 'Single Prints', 'Excess'],
    see_also: ['single-prints-poor-structure']
  },
  {
    term: 'Poor Low',
    slug: 'poor-low',
    definition: 'A session low with only single prints, indicating the auction did not complete properly. Market may return to test this level.',
    related_terms: ['Poor High', 'Single Prints', 'Excess'],
    see_also: ['single-prints-poor-structure']
  },
  {
    term: 'Price Discovery',
    slug: 'price-discovery',
    definition: 'The process by which markets determine fair value through continuous auction. Price moves until it finds participants willing to transact.',
    related_terms: ['Auction', 'Facilitation'],
    see_also: ['the-auction-process-explained']
  },
  {
    term: 'Range Extension',
    slug: 'range-extension',
    definition: 'When price moves beyond a previously established range (like IB or prior session range). Signals conviction in that direction.',
    related_terms: ['IB Extension', 'Breakout'],
    see_also: ['initial-balance-first-hour']
  },
  {
    term: 'Rejection',
    slug: 'rejection',
    definition: 'When price quickly moves away from a level, indicating participants did not accept that price. Shown by single prints or minimal TPOs.',
    related_terms: ['Acceptance', 'Single Prints'],
    see_also: ['the-auction-process-explained']
  },
  {
    term: 'Responsive Activity',
    slug: 'responsive-activity',
    definition: 'Value-oriented trading that fades price extremes. Participants wait for price to come to them rather than chasing. Maintains balance.',
    related_terms: ['Initiative Activity', 'Balance', 'Mean Reversion'],
    see_also: ['responsive-activity-explained']
  },
  {
    term: 'Rotation',
    slug: 'rotation',
    definition: 'Price moving back and forth within a range, from high to low and back. Characteristic of balanced markets.',
    related_terms: ['Balance', 'Mean Reversion'],
    see_also: ['trading-in-balanced-markets']
  },
  {
    term: 'Session Profile',
    slug: 'session-profile',
    definition: 'A profile showing a single trading session. The most commonly used timeframe for day trading analysis.',
    related_terms: ['Composite Profile', 'Market Profile'],
    see_also: ['time-price-opportunity-tpo-charts']
  },
  {
    term: 'Single Prints',
    slug: 'single-prints',
    definition: 'Price levels with only one TPO letter. Indicate rapid price movement and low acceptance. Often act as support/resistance.',
    related_terms: ['TPO', 'Poor High', 'Poor Low'],
    see_also: ['single-prints-poor-structure']
  },
  {
    term: 'TPO (Time Price Opportunity)',
    slug: 'tpo',
    definition: 'A single unit of time spent at a price level, represented by a letter (A, B, C, etc.) on a Market Profile chart. Each letter = 30 minutes.',
    related_terms: ['Market Profile', 'Single Prints'],
    see_also: ['time-price-opportunity-tpo-charts']
  },
  {
    term: 'Trend Day',
    slug: 'trend-day',
    definition: 'A day type with elongated, directional profile. POC at or near the extreme. Single prints behind price. Do not fade.',
    related_terms: ['Day Types', 'Normal Day', 'Imbalance'],
    see_also: ['market-profile-day-types', 'trading-trends-with-amt']
  },
  {
    term: 'Two-Way Auction',
    slug: 'two-way-auction',
    definition: 'The concept that markets constantly probe both higher and lower to find where buyers and sellers will transact.',
    related_terms: ['Auction', 'Price Discovery'],
    see_also: ['what-is-auction-market-theory']
  },
  {
    term: 'VA (Value Area)',
    slug: 'value-area',
    definition: 'The price range containing approximately 70% of trading activity. Represents where the market considers prices "fair."',
    related_terms: ['VAH', 'VAL', 'POC'],
    see_also: ['understanding-value-area']
  },
  {
    term: 'VAH (Value Area High)',
    slug: 'vah',
    definition: 'The upper boundary of the Value Area. Often acts as resistance. Price above VAH is considered "expensive."',
    related_terms: ['Value Area', 'VAL', 'Resistance'],
    see_also: ['understanding-value-area', 'vah-trading-strategies']
  },
  {
    term: 'VAL (Value Area Low)',
    slug: 'val',
    definition: 'The lower boundary of the Value Area. Often acts as support. Price below VAL is considered "cheap."',
    related_terms: ['Value Area', 'VAH', 'Support'],
    see_also: ['understanding-value-area', 'val-trading-strategies']
  },
  {
    term: 'Virgin POC',
    slug: 'virgin-poc',
    definition: 'A prior session POC that has not been revisited. Acts as a magnet. High-probability target for mean reversion trades. Also called Naked POC.',
    related_terms: ['POC', 'Naked POC'],
    see_also: ['point-of-control-poc-deep-dive']
  },
  {
    term: 'Volume Profile',
    slug: 'volume-profile',
    definition: 'A charting method that displays how much VOLUME traded at each price level, shown as a horizontal histogram.',
    related_terms: ['Market Profile', 'HVN', 'LVN', 'VPOC'],
    see_also: ['volume-profile-basics', 'market-profile-vs-volume-profile']
  },
  {
    term: 'VPOC (Volume Point of Control)',
    slug: 'vpoc',
    definition: 'The price level with the highest volume on a Volume Profile. May differ from the TPO-based POC.',
    related_terms: ['POC', 'Volume Profile'],
    see_also: ['volume-profile-basics']
  },
  {
    term: 'b-Shape Profile',
    slug: 'b-shape',
    definition: 'A profile with wide distribution at the bottom and thin tail above. Indicates long liquidation or late selling. Bearish implication.',
    related_terms: ['P-Shape', 'Day Types'],
    see_also: ['market-profile-day-types']
  }
];

// ============================================================================
// LEARNING PATH
// ============================================================================

export interface LearningPathStep {
  order: number;
  article_slug: string;
  title: string;
  description: string;
}

export interface LearningPathLevel {
  level: number;
  name: string;
  description: string;
  estimated_time: string;
  steps: LearningPathStep[];
}

export const learningPath: LearningPathLevel[] = [
  {
    level: 1,
    name: 'Foundation',
    description: 'Understand what AMT is and how to read the basic charts. This is essential before anything else.',
    estimated_time: '25 minutes',
    steps: [
      {
        order: 1,
        article_slug: 'what-is-auction-market-theory',
        title: 'What is Auction Market Theory?',
        description: 'Start here. Learn why markets move and the core philosophy behind AMT.'
      },
      {
        order: 2,
        article_slug: 'the-auction-process-explained',
        title: 'The Auction Process Explained',
        description: 'Understand price discovery, facilitation, and acceptance vs rejection.'
      },
      {
        order: 3,
        article_slug: 'time-price-opportunity-tpo-charts',
        title: 'TPO Charts',
        description: 'Learn to read Market Profile charts - the letters, shapes, and what they mean.'
      },
      {
        order: 4,
        article_slug: 'volume-profile-basics',
        title: 'Volume Profile Basics',
        description: 'Understand how Volume Profile shows where actual trading occurred.'
      },
      {
        order: 5,
        article_slug: 'market-profile-vs-volume-profile',
        title: 'Market Profile vs Volume Profile',
        description: 'Know when to use each tool and how they complement each other.'
      }
    ]
  },
  {
    level: 2,
    name: 'Core Concepts',
    description: 'Master the key reference points you will use every single day: Value Area and Point of Control.',
    estimated_time: '25 minutes',
    steps: [
      {
        order: 1,
        article_slug: 'understanding-value-area',
        title: 'Understanding Value Area',
        description: 'The 70% rule and why Value Area boundaries matter for every trade.'
      },
      {
        order: 2,
        article_slug: 'point-of-control-poc-deep-dive',
        title: 'Point of Control Deep Dive',
        description: 'Session POC, developing POC, virgin POCs - your most important reference point.'
      },
      {
        order: 3,
        article_slug: 'poc-migration-signals',
        title: 'POC Migration',
        description: 'How POC movement reveals trend strength and conviction.'
      },
      {
        order: 4,
        article_slug: 'vah-trading-strategies',
        title: 'VAH Trading Strategies',
        description: 'Specific setups for trading at Value Area High.'
      },
      {
        order: 5,
        article_slug: 'val-trading-strategies',
        title: 'VAL Trading Strategies',
        description: 'Specific setups for trading at Value Area Low.'
      }
    ]
  },
  {
    level: 3,
    name: 'Market States',
    description: 'Learn to identify whether the market is balanced or trending - this determines your entire strategy.',
    estimated_time: '25 minutes',
    steps: [
      {
        order: 1,
        article_slug: 'identifying-market-balance',
        title: 'Identifying Market Balance',
        description: 'Recognize when the market is range-bound and how to spot it.'
      },
      {
        order: 2,
        article_slug: 'trading-in-balanced-markets',
        title: 'Trading in Balanced Markets',
        description: 'Mean reversion strategies, fading extremes, bracket trading.'
      },
      {
        order: 3,
        article_slug: 'recognizing-market-imbalance',
        title: 'Recognizing Imbalance',
        description: 'Identify when one side has control and the market is trending.'
      },
      {
        order: 4,
        article_slug: 'trading-trends-with-amt',
        title: 'Trading Trends with AMT',
        description: 'Pullback strategies and continuation setups in trending markets.'
      },
      {
        order: 5,
        article_slug: 'balance-to-imbalance-transitions',
        title: 'Balance to Imbalance Transitions',
        description: 'Trading breakouts and recognizing when ranges are about to break.'
      }
    ]
  },
  {
    level: 4,
    name: 'Participant Behavior',
    description: 'Understand WHO is trading and WHY - the key to reading market intent.',
    estimated_time: '15 minutes',
    steps: [
      {
        order: 1,
        article_slug: 'initiative-activity-explained',
        title: 'Initiative Activity',
        description: 'Recognize aggressive, conviction-driven trading that moves markets.'
      },
      {
        order: 2,
        article_slug: 'responsive-activity-explained',
        title: 'Responsive Activity',
        description: 'Understand value traders who fade extremes and provide liquidity.'
      },
      {
        order: 3,
        article_slug: 'when-responsive-becomes-initiative',
        title: 'When Responsive Becomes Initiative',
        description: 'The powerful transition that creates strong reversal moves.'
      }
    ]
  },
  {
    level: 5,
    name: 'Session Structure',
    description: 'Learn to read the developing session - opening types, initial balance, and day types.',
    estimated_time: '20 minutes',
    steps: [
      {
        order: 1,
        article_slug: 'opening-types-market-profile',
        title: 'Opening Types',
        description: 'The four opening types and what each tells you about the coming session.'
      },
      {
        order: 2,
        article_slug: 'initial-balance-first-hour',
        title: 'Initial Balance',
        description: 'Why the first hour matters and how to trade around IB.'
      },
      {
        order: 3,
        article_slug: 'single-prints-poor-structure',
        title: 'Single Prints and Poor Structure',
        description: 'Identify unfinished auctions and levels the market may revisit.'
      },
      {
        order: 4,
        article_slug: 'market-profile-day-types',
        title: 'Day Types',
        description: 'Normal, Trend, Double Distribution, P-shape, b-shape - recognize them early.'
      }
    ]
  },
  {
    level: 6,
    name: 'Pre-Market Prep',
    description: 'Learn to analyze overnight activity and prepare for the trading day.',
    estimated_time: '15 minutes',
    steps: [
      {
        order: 1,
        article_slug: 'overnight-inventory-analysis',
        title: 'Overnight Inventory Analysis',
        description: 'Assess overnight positioning before the regular session opens.'
      },
      {
        order: 2,
        article_slug: 'inventory-correction-trades',
        title: 'Inventory Correction Trades',
        description: 'High-probability setup when overnight inventory unwinds.'
      },
      {
        order: 3,
        article_slug: 'position-management-using-amt',
        title: 'Position Management',
        description: 'Structural stops, targets, and trade management rules.'
      }
    ]
  },
  {
    level: 7,
    name: 'Advanced Application',
    description: 'Combine everything into complete analysis and trade planning.',
    estimated_time: '30 minutes',
    steps: [
      {
        order: 1,
        article_slug: 'composite-profiles-multi-day-analysis',
        title: 'Composite Profiles',
        description: 'Multi-day analysis for bigger picture context.'
      },
      {
        order: 2,
        article_slug: 'failed-auctions-reversal-signals',
        title: 'Failed Auctions',
        description: 'One of the most powerful reversal signals in AMT.'
      },
      {
        order: 3,
        article_slug: 'integrating-amt-with-order-flow',
        title: 'Integrating with Order Flow',
        description: 'Combine AMT with delta and footprint analysis for confirmation.'
      },
      {
        order: 4,
        article_slug: 'building-trade-plans-amt-framework',
        title: 'Building Trade Plans',
        description: 'Create complete, structured trade plans using AMT principles.'
      },
      {
        order: 5,
        article_slug: 'common-amt-trading-setups',
        title: 'Common AMT Setups',
        description: 'Reference guide for the most reliable AMT-based trades.'
      }
    ]
  }
];

// ============================================================================
// QUICK REFERENCE CHECKLISTS
// ============================================================================

export interface Checklist {
  id: string;
  title: string;
  description: string;
  items: string[];
}

export const checklists: Checklist[] = [
  {
    id: 'pre-market',
    title: 'Pre-Market Checklist',
    description: 'Review before every trading session',
    items: [
      'Note prior session POC, VAH, VAL',
      'Identify any virgin POCs from recent sessions',
      'Check overnight range and inventory (long/short/neutral)',
      'Determine expected open location (within value, above, below)',
      'Mark single prints and poor structure from prior session',
      'Assess multi-day context (balance or trend?)',
      'Plan scenarios for different opening types'
    ]
  },
  {
    id: 'balance-day',
    title: 'Balance Day Playbook',
    description: 'When the market is range-bound',
    items: [
      'Fade moves to bracket high and bracket low',
      'Target POC on rotation trades',
      'Wait for price at extremes - do not trade the middle',
      'Look for rejection confirmation before entry',
      'Use VA boundaries for stop placement',
      'Take profits at structural levels',
      'Watch for breakout signs late in session'
    ]
  },
  {
    id: 'trend-day',
    title: 'Trend Day Playbook',
    description: 'When one side has control',
    items: [
      'Do NOT fade - trade with the trend',
      'Enter on pullbacks to prior POC or VA levels',
      'Use single print zones as pullback entry areas',
      'Trail stops below developing structure',
      'Let winners run - trend days can extend',
      'POC should migrate in trend direction',
      'Watch for exhaustion signs late in session'
    ]
  },
  {
    id: 'at-vah',
    title: 'At VAH Checklist',
    description: 'When price reaches Value Area High',
    items: [
      'Is the market balanced or trending?',
      'Look for rejection: long upper wicks, bearish candles',
      'Check delta - should shift negative for fade',
      'Is there acceptance above VAH? (multiple TPOs)',
      'In balance: fade with stop above rejection high',
      'In trend: wait for acceptance, buy pullback to VAH',
      'Failed breakout at VAH = aggressive short opportunity'
    ]
  },
  {
    id: 'at-val',
    title: 'At VAL Checklist',
    description: 'When price reaches Value Area Low',
    items: [
      'Is the market balanced or trending?',
      'Look for support: long lower wicks, bullish candles',
      'Check delta - should shift positive for bounce',
      'Watch for shakeout below VAL before reversal',
      'In balance: buy with stop below shakeout low',
      'In trend: wait for acceptance below, sell rally to VAL',
      'Failed breakdown at VAL = aggressive long opportunity'
    ]
  },
  {
    id: 'opening-assessment',
    title: 'Opening Assessment (First 30 Min)',
    description: 'Identify the opening type',
    items: [
      'Open-Drive: Immediate direction, no rotation - trade with it',
      'Open-Test-Drive: Initial move fails, reverses - trade the drive',
      'Open-Rejection-Reverse: Key level test and reject - fade to value',
      'Open-Auction: Two-sided, choppy - wait for IB, trade balance',
      'Check if overnight inventory is being confirmed or corrected',
      'Note IB range size (narrow = potential expansion)',
      'Watch for single prints forming (initiative activity)'
    ]
  }
];

// ============================================================================
// HELPER FUNCTION: Get articles by learning level
// ============================================================================

export function getArticlesForLevel(level: number): string[] {
  const pathLevel = learningPath.find(l => l.level === level);
  return pathLevel ? pathLevel.steps.map(s => s.article_slug) : [];
}

// ============================================================================
// HELPER FUNCTION: Get glossary terms for an article
// ============================================================================

export function getGlossaryTermsForArticle(articleSlug: string): GlossaryTerm[] {
  return glossary.filter(term => 
    term.see_also?.includes(articleSlug)
  );
}

// ============================================================================
// HELPER FUNCTION: Calculate total learning time
// ============================================================================

export function getTotalLearningTime(): string {
  const totalMinutes = learningPath.reduce((acc, level) => {
    const minutes = parseInt(level.estimated_time);
    return acc + (isNaN(minutes) ? 0 : minutes);
  }, 0);
  
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  
  return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
}
