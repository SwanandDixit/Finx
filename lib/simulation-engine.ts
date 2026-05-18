export interface SimulationEvent {
  id: string
  turn: number
  date: string
  title: string
  description: string
  options: { id: string; label: string; action: string }[]
  marketPrice?: number
  headline?: string
}

export interface Decision {
  turn: number
  timestamp: string
  eventId: string
  choice: string
  portfolioValueBefore: number
  portfolioValueAfter: number
  marketPriceAtDecision: number
}

export interface SimulationState {
  sessionId: string
  simulationSlug: string
  currentTurn: number
  totalTurns: number
  portfolio: Record<string, number>
  cashBalance: number
  decisions: Decision[]
  currentEvent: SimulationEvent | null
  status: 'active' | 'completed'
  marketData: { date: string; price: number; asset?: string }[]
  startingValue: number
}

export interface SimulationConfig {
  slug: string
  name: string
  description: string
  difficulty: 'easy' | 'medium' | 'hard'
  duration_mins: number
  startingCapital: number
  events: SimulationEvent[]
  headlines: { date: string; text: string }[]
  assets: string[]
  datePeriodStart: string
  datePeriodEnd: string
}

// ========== SIMULATION CONFIGS ==========

export const SIMULATIONS: SimulationConfig[] = [
  {
    slug: 'crypto-bull-bear-2020-2022',
    name: 'Crypto Bull & Bear',
    description: 'Navigate the wildest crypto cycle in history. From pandemic lows to ATH to total collapse.',
    difficulty: 'hard',
    duration_mins: 15,
    startingCapital: 100000,
    assets: ['BTC', 'ETH'],
    datePeriodStart: '2020-10-01',
    datePeriodEnd: '2022-12-31',
    headlines: [
      { date: '2020-10-01', text: 'PayPal announces crypto support — BTC surges past $10K' },
      { date: '2021-03-15', text: 'Tesla buys $1.5B in Bitcoin — institutional adoption accelerates' },
      { date: '2021-11-10', text: 'Bitcoin hits all-time high near $69K — euphoria everywhere' },
      { date: '2022-05-12', text: 'LUNA crashes to $0 — $40B wiped out in 48 hours' },
      { date: '2022-11-11', text: 'FTX files for bankruptcy — Sam Bankman-Fried arrested' },
    ],
    events: [
      {
        id: 'crypto-1', turn: 1, date: '2020-10-01',
        title: 'The Quiet Before the Storm',
        description: 'Bitcoin is trading at ₹8.5L. The pandemic recovery is underway. PayPal just announced crypto support. Institutional interest is growing but retail hasn\'t caught on yet.',
        options: [
          { id: 'buy', label: 'Buy BTC (₹50K)', action: 'buy_btc_50k' },
          { id: 'wait', label: 'Wait & Watch', action: 'hold' },
          { id: 'split', label: 'Split: ₹25K BTC + ₹25K ETH', action: 'split_25k' },
        ],
      },
      {
        id: 'crypto-2', turn: 2, date: '2021-03-15',
        title: 'The Bull Run Accelerates',
        description: 'BTC has surged to ₹42L. Tesla bought $1.5B in Bitcoin. NFTs are exploding. Your portfolio is up significantly. Crypto Twitter is euphoric.',
        options: [
          { id: 'profit', label: 'Take 50% Profits', action: 'sell_half' },
          { id: 'hold', label: 'Hold Everything', action: 'hold' },
          { id: 'more', label: 'Buy More (₹30K)', action: 'buy_more_30k' },
        ],
      },
      {
        id: 'crypto-3', turn: 3, date: '2021-11-10',
        title: 'Peak Euphoria',
        description: 'BTC is at ₹48L — near all-time high. "Bitcoin to $100K" is trending. Celebrities are launching tokens. Everyone you know is talking about crypto.',
        options: [
          { id: 'sell', label: 'Sell Everything', action: 'sell_all' },
          { id: 'hold', label: 'Diamond Hands — Hold', action: 'hold' },
          { id: 'eth', label: 'Rotate to ETH', action: 'rotate_eth' },
        ],
      },
      {
        id: 'crypto-4', turn: 4, date: '2022-05-12',
        title: 'The LUNA Collapse',
        description: 'LUNA crashed from $80 to $0 in 48 hours. UST depegged. BTC dropped to ₹23L. Fear is everywhere. "Is crypto dead?" headlines dominate.',
        options: [
          { id: 'panic', label: 'Panic Sell Everything', action: 'sell_all' },
          { id: 'hold', label: 'Hold Through the Pain', action: 'hold' },
          { id: 'dip', label: 'Buy the Dip (₹20K)', action: 'buy_dip_20k' },
        ],
      },
      {
        id: 'crypto-5', turn: 5, date: '2022-11-11',
        title: 'FTX Implosion',
        description: 'FTX — the second-largest exchange — collapsed. Customer funds missing. BTC crashed to ₹13L. Trust in crypto is at rock bottom.',
        options: [
          { id: 'exit', label: 'Exit Crypto Completely', action: 'sell_all' },
          { id: 'hold', label: 'Hold — This Too Shall Pass', action: 'hold' },
          { id: 'avg', label: 'Average Down (₹15K)', action: 'avg_down_15k' },
        ],
      },
    ],
  },
  {
    slug: 'first-salary',
    name: 'First Salary Survival',
    description: '₹30K first salary. 6 months. Real expenses. Random life events. Can you build a safety net?',
    difficulty: 'easy',
    duration_mins: 10,
    startingCapital: 30000,
    assets: ['savings', 'investments'],
    datePeriodStart: '2024-01-01',
    datePeriodEnd: '2024-06-30',
    headlines: [
      { date: '2024-01-01', text: 'First job, first salary — the real world begins' },
      { date: '2024-02-01', text: 'Inflation hits food prices — monthly grocery bills up 12%' },
      { date: '2024-03-01', text: 'Festival season — family expectations and social pressure mount' },
      { date: '2024-04-01', text: 'Travel costs surge — flight and hotel prices at yearly high' },
      { date: '2024-05-01', text: 'RBI holds rates — SIP returns stable at 12% annualized' },
      { date: '2024-06-01', text: 'Appraisal season — will the increment match inflation?' },
    ],
    events: [
      {
        id: 'salary-1', turn: 1, date: '2024-01-01',
        title: 'Month 1: The Beginning',
        description: 'Your first ₹30,000 salary just hit your account. Rent is ₹10,000. Food will cost about ₹5,000. Transport ₹2,000. You have the rest to allocate.',
        options: [
          { id: 'save', label: 'Save ₹8K + Invest ₹5K', action: 'save_8k_invest_5k' },
          { id: 'invest', label: 'Save ₹3K + Invest ₹10K', action: 'save_3k_invest_10k' },
          { id: 'enjoy', label: 'Save ₹5K + Fun ₹8K', action: 'save_5k_fun_8k' },
        ],
      },
      {
        id: 'salary-2', turn: 2, date: '2024-02-01',
        title: 'Month 2: Phone Screen Cracked',
        description: 'Your phone screen cracked. Repair costs ₹3,500. New phone costs ₹15,000. Your salary is ₹30,000 minus fixed expenses (₹17,000).',
        options: [
          { id: 'repair', label: 'Repair for ₹3,500', action: 'expense_3500' },
          { id: 'new', label: 'Buy New Phone ₹15,000 (EMI)', action: 'expense_15000_emi' },
          { id: 'ignore', label: 'Use Cracked — Save Money', action: 'no_expense' },
        ],
      },
      {
        id: 'salary-3', turn: 3, date: '2024-03-01',
        title: 'Month 3: Festival Pressure',
        description: 'Holi and family gatherings. Parents expect ₹5,000 contribution. Colleagues are planning a team dinner at ₹1,500/person.',
        options: [
          { id: 'both', label: 'Family ₹5K + Dinner ₹1.5K', action: 'expense_6500' },
          { id: 'family', label: 'Family ₹5K Only', action: 'expense_5000' },
          { id: 'skip', label: 'Send ₹2K to Family, Skip Dinner', action: 'expense_2000' },
        ],
      },
      {
        id: 'salary-4', turn: 4, date: '2024-04-01',
        title: 'Month 4: Friend\'s Birthday Trip',
        description: 'Your friend group is planning a Goa trip. Your share: ₹8,000 for 3 days. Everyone is going. FOMO is real.',
        options: [
          { id: 'go', label: 'Go on Trip — ₹8,000', action: 'expense_8000' },
          { id: 'cheap', label: 'Suggest Cheaper Plan — ₹3,000', action: 'expense_3000' },
          { id: 'skip', label: 'Skip — Protect Savings', action: 'no_expense' },
        ],
      },
      {
        id: 'salary-5', turn: 5, date: '2024-05-01',
        title: 'Month 5: SIP vs Survival',
        description: 'Your SIP auto-debit is tomorrow (₹5,000 if you started one). But your discretionary fund is running low. Rent is due in 3 days.',
        options: [
          { id: 'continue', label: 'Keep SIP — Cut Food Budget', action: 'keep_sip' },
          { id: 'pause', label: 'Pause SIP This Month', action: 'pause_sip' },
          { id: 'partial', label: 'Reduce SIP to ₹2,000', action: 'reduce_sip' },
        ],
      },
      {
        id: 'salary-6', turn: 6, date: '2024-06-01',
        title: 'Month 6: Appraisal Results',
        description: 'Appraisal time. 60% chance of ₹3,000 increment. Time to review your 6-month journey. How do you plan ahead?',
        options: [
          { id: 'increase', label: 'Increase SIP by Increment', action: 'increase_sip' },
          { id: 'save', label: 'Build Emergency Fund First', action: 'build_emergency' },
          { id: 'lifestyle', label: 'Upgrade Lifestyle', action: 'lifestyle_upgrade' },
        ],
      },
    ],
  },
  {
    slug: 'market-crash-2020',
    name: '2020 Market Crash',
    description: '₹5L portfolio. 5 real NSE stocks. COVID crashes everything. What do you do?',
    difficulty: 'medium',
    duration_mins: 12,
    startingCapital: 500000,
    assets: ['RELIANCE.NS', 'TCS.NS', 'HDFCBANK.NS', 'INFY.NS', 'TATAMOTORS.NS'],
    datePeriodStart: '2020-01-01',
    datePeriodEnd: '2020-12-31',
    headlines: [
      { date: '2020-01-15', text: 'Sensex at 41,952 — markets near all-time high' },
      { date: '2020-03-20', text: 'Sensex crashes 13% in one day — circuit breakers triggered' },
      { date: '2020-04-15', text: 'Partial recovery as lockdown eases — is the worst over?' },
      { date: '2020-06-01', text: 'V-shaped recovery gaining steam — Reliance surges on Jio deals' },
      { date: '2020-12-15', text: 'Sensex at 47,000 — full recovery complete, new highs ahead' },
    ],
    events: [
      {
        id: 'crash-1', turn: 1, date: '2020-01-15',
        title: 'Markets at All-Time High',
        description: 'Sensex just hit 41,952. Your ₹5L is allocated across 5 stocks. Markets feel invincible. Some analysts warn of overvaluation.',
        options: [
          { id: 'rebalance', label: 'Book Profits — Move 30% to FD', action: 'rebalance_30_fd' },
          { id: 'hold', label: 'Hold — Bull Run Continues', action: 'hold' },
          { id: 'add', label: 'Add ₹50K More to Stocks', action: 'add_50k' },
        ],
      },
      {
        id: 'crash-2', turn: 2, date: '2020-03-20',
        title: 'Black Thursday',
        description: 'Sensex crashed 13% TODAY. Circuit breakers triggered. Your portfolio is down ~35%. COVID lockdowns announced. Pure panic everywhere.',
        options: [
          { id: 'panic', label: 'Sell Everything — Go to Cash', action: 'sell_all' },
          { id: 'hold', label: 'Hold — Don\'t Look at Portfolio', action: 'hold' },
          { id: 'buy', label: 'Buy More — Stocks Are on Sale', action: 'buy_more_50k' },
        ],
      },
      {
        id: 'crash-3', turn: 3, date: '2020-04-15',
        title: 'Dead Cat Bounce?',
        description: 'Markets bounced 15% from lows. Some say recovery, others say dead cat bounce. Lockdown extended. Uncertainty is extreme.',
        options: [
          { id: 'exit', label: 'Exit — Take What\'s Left', action: 'sell_all' },
          { id: 'hold', label: 'Hold Position', action: 'hold' },
          { id: 'avg', label: 'Average Down — Add ₹30K', action: 'avg_down_30k' },
        ],
      },
      {
        id: 'crash-4', turn: 4, date: '2020-06-01',
        title: 'Recovery Gains Steam',
        description: 'Markets are recovering strongly. Reliance surging on Jio deals. Your portfolio is recovering but still below January levels.',
        options: [
          { id: 'profit', label: 'Book Profits on Winners', action: 'book_profits' },
          { id: 'hold', label: 'Hold Everything', action: 'hold' },
          { id: 'rotate', label: 'Rotate to Recovery Stocks', action: 'rotate_recovery' },
        ],
      },
      {
        id: 'crash-5', turn: 5, date: '2020-12-15',
        title: 'Full Recovery + New Highs',
        description: 'Sensex at 47,000. Full recovery from March lows. Your portfolio\'s final value depends on every decision you made this year.',
        options: [
          { id: 'sell', label: 'Sell All — Lock In Gains', action: 'sell_all' },
          { id: 'hold', label: 'Hold for 2021 Bull Run', action: 'hold' },
          { id: 'rebal', label: 'Rebalance — Diversify Gains', action: 'rebalance' },
        ],
      },
    ],
  },
  {
    slug: 'recession-survival',
    name: 'Recession Survival',
    description: '₹2L savings. No income. 6 months to survive. Every rupee matters.',
    difficulty: 'hard',
    duration_mins: 12,
    startingCapital: 200000,
    assets: ['savings', 'investments'],
    datePeriodStart: '2020-03-01',
    datePeriodEnd: '2020-08-31',
    headlines: [
      { date: '2020-03-01', text: 'COVID-19 lockdown announced — all non-essential businesses shut' },
      { date: '2020-04-01', text: 'Layoffs surge — unemployment at 23.5% in April 2020' },
      { date: '2020-05-01', text: 'Lockdown extended — gig economy collapses' },
      { date: '2020-06-01', text: 'Partial unlocking — some businesses reopen cautiously' },
      { date: '2020-07-01', text: 'Job market slowly recovering — remote work becomes norm' },
      { date: '2020-08-01', text: 'RBI moratorium ends — EMI payments resume' },
    ],
    events: [
      {
        id: 'recess-1', turn: 1, date: '2020-03-01',
        title: 'Month 1: Lockdown Begins',
        description: 'You just lost your job. You have ₹2,00,000 in savings. Monthly essentials: Rent ₹12K, Food ₹6K, Phone/Internet ₹1K, EMI ₹8K. Total: ₹27K/month.',
        options: [
          { id: 'full', label: 'Pay Everything — Dip into Savings', action: 'pay_all_27k' },
          { id: 'negotiate', label: 'Negotiate Rent Down + Skip EMI', action: 'negotiate_save' },
          { id: 'extreme', label: 'Move to Parents + Pause EMI', action: 'extreme_save' },
        ],
      },
      {
        id: 'recess-2', turn: 2, date: '2020-04-01',
        title: 'Month 2: No End in Sight',
        description: 'Lockdown extended. No job prospects. Your savings are depleting. A friend offers freelance work (₹8K, takes 2 weeks).',
        options: [
          { id: 'freelance', label: 'Take Freelance Work', action: 'freelance_8k' },
          { id: 'search', label: 'Focus on Job Search', action: 'job_search' },
          { id: 'liquidate', label: 'Liquidate Investments', action: 'liquidate_inv' },
        ],
      },
      {
        id: 'recess-3', turn: 3, date: '2020-05-01',
        title: 'Month 3: Medical Emergency',
        description: 'You develop a health issue. Doctor visit + tests + medicines = ₹15,000. Health insurance claim takes 45 days to process.',
        options: [
          { id: 'pay', label: 'Pay from Savings', action: 'medical_15k' },
          { id: 'borrow', label: 'Borrow from Family', action: 'borrow_family' },
          { id: 'delay', label: 'Delay Non-Urgent Treatment', action: 'delay_treatment' },
        ],
      },
      {
        id: 'recess-4', turn: 4, date: '2020-06-01',
        title: 'Month 4: Job Offer',
        description: 'You receive a job offer at ₹25K/month (₹5K less than before). But you hear rumors of a better opening at ₹35K in 2-3 weeks.',
        options: [
          { id: 'accept', label: 'Accept ₹25K Offer Now', action: 'accept_25k' },
          { id: 'wait', label: 'Wait for ₹35K Opportunity', action: 'wait_35k' },
          { id: 'negotiate', label: 'Counter-Offer at ₹30K', action: 'counter_30k' },
        ],
      },
      {
        id: 'recess-5', turn: 5, date: '2020-07-01',
        title: 'Month 5: Rebuilding',
        description: 'Whether employed or not, you need to rebuild. Savings are significantly depleted. EMI moratorium is ending next month.',
        options: [
          { id: 'aggressive', label: 'Aggressive Saving — Cut All Extras', action: 'aggressive_save' },
          { id: 'balanced', label: 'Balanced — Rebuild Slowly', action: 'balanced_rebuild' },
          { id: 'invest', label: 'Start Investing in Crashed Market', action: 'invest_crash' },
        ],
      },
      {
        id: 'recess-6', turn: 6, date: '2020-08-01',
        title: 'Month 6: The Reckoning',
        description: 'Moratorium over. All dues resume. How much did you preserve? Time to assess your survival strategy.',
        options: [
          { id: 'repay', label: 'Prioritize Debt Repayment', action: 'repay_debt' },
          { id: 'emergency', label: 'Rebuild Emergency Fund', action: 'rebuild_emergency' },
          { id: 'resume', label: 'Resume Pre-COVID Lifestyle', action: 'resume_lifestyle' },
        ],
      },
    ],
  },
]

export function getSimulationConfig(slug: string): SimulationConfig | undefined {
  return SIMULATIONS.find(s => s.slug === slug)
}

export function initSimulationState(config: SimulationConfig, sessionId: string): SimulationState {
  const portfolio: Record<string, number> = {}
  if (config.slug === 'market-crash-2020') {
    const perStock = config.startingCapital / config.assets.length
    config.assets.forEach(a => { portfolio[a] = perStock })
  }
  return {
    sessionId, simulationSlug: config.slug, currentTurn: 1, totalTurns: config.events.length,
    portfolio, cashBalance: config.slug === 'market-crash-2020' ? 0 : config.startingCapital,
    decisions: [], currentEvent: config.events[0], status: 'active', marketData: [], startingValue: config.startingCapital,
  }
}

export function calculatePortfolioValue(state: SimulationState): number {
  const stockValue = Object.values(state.portfolio).reduce((s, v) => s + v, 0)
  return state.cashBalance + stockValue
}

export function calculateOptimalOutcome(config: SimulationConfig): number {
  switch (config.slug) {
    case 'crypto-bull-bear-2020-2022': return 850000
    case 'first-salary': return 52000
    case 'market-crash-2020': return 1250000
    case 'recession-survival': return 165000
    default: return config.startingCapital * 2
  }
}
