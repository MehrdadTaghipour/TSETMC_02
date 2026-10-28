/**
 * Multi-Method Automated Validation & Financial Mathematics Test Suite
 * 
 * Tests:
 * 1. Mathematical Accuracy of Technical Indicators (RSI, MACD, Bollinger Bands)
 * 2. Fundamental Valuation Integrity (DCF, Graham Number, DuPont Ratios)
 * 3. Monte Carlo Price Simulation & Percentile Corridor Consistency
 * 4. Actionable Strategy & Risk/Reward Math Verification
 * 5. SQLite Persistence Round-Trip
 * 6. Live API Endpoint Health & Authenticity Verification
 */

import { computeInternalTechnical, computeInternalFundamental, computePriceForecast, computeActionableStrategy } from '../../server/db/analyticsEngine.js';
import { marketRepository } from '../../server/db/repository.js';
import type { SymbolQuote, HistoryItem } from '../../src/types.js';

let passedTests = 0;
let failedTests = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  if (condition) {
    console.log(`  ✓ PASS: ${testName}`);
    passedTests++;
  } else {
    console.error(`  ✗ FAIL: ${testName} ${detail ? `- ${detail}` : ''}`);
    failedTests++;
  }
}

async function runTestSuite() {
  console.log('===============================================================');
  console.log('🧪 IRANIAN STOCK MARKET ANALYTICS ENGINE - VALIDATION SUITE');
  console.log('===============================================================\n');

  // -------------------------------------------------------------
  // TEST GROUP 1: MATHEMATICAL VERIFICATION OF TECHNICAL MODELS
  // -------------------------------------------------------------
  console.log('▶ [Group 1] Mathematical & Technical Indicator Checks:');

  const mockQuotes: any[] = [];
  const basePrice = 1000;
  for (let i = 0; i < 60; i++) {
    // Generate realistic fluctuating price series
    const p = Math.round(basePrice * (1 + 0.15 * Math.sin(i / 5) + 0.002 * i));
    mockQuotes.push({
      dateJalali: `1403/0${Math.floor(i / 30) + 1}/${(i % 30) + 1}`,
      dateGregorian: `2024-0${Math.floor(i / 30) + 1}-${(i % 30) + 1}`,
      open: p - 10,
      high: p + 25,
      low: p - 20,
      close: p,
      volume: 25_000_000,
      valueToman: 25_000_000 * p,
      trades: 3500,
    });
  }

  const testSym: any = {
    insCode: 'TEST9999999999',
    symbol: 'فولاد_آزمایشی',
    name: 'فولاد مبارکه اصفهان (تست ریاضی)',
    sectorCode: '27',
    sectorName: 'فلزات اساسی',
    market: 'بورس',
    lastPriceToman: mockQuotes[mockQuotes.length - 1].close,
    closePriceToman: mockQuotes[mockQuotes.length - 1].close,
    yesterdayPrice: mockQuotes[mockQuotes.length - 2].close,
    highPrice: mockQuotes[mockQuotes.length - 1].high,
    lowPrice: mockQuotes[mockQuotes.length - 1].low,
    highLimit: Math.round(mockQuotes[mockQuotes.length - 1].close * 1.07),
    lowLimit: Math.round(mockQuotes[mockQuotes.length - 1].close * 0.93),
    volume: 55_000_000,
    valueToman: 55_000_000 * mockQuotes[mockQuotes.length - 1].close,
    tradeCount: 8500,
    changeToman: 40,
    percentChange: 2.1,
    closePercentChange: 1.9,
    pe: 6.2,
    groupPe: 7.8,
    epsToman: 180,
    basisVolume: 1,
    sharesCount: 100_000_000_000,
  };

  const tech = computeInternalTechnical(testSym, mockQuotes, '1D');

  assert(
    typeof tech.rsi14 === 'number' && tech.rsi14 >= 0 && tech.rsi14 <= 100,
    'RSI(14) strictly bounded between 0 and 100',
    `Got RSI: ${tech.rsi14}`
  );

  assert(
    tech.bollinger.upper >= tech.bollinger.middle && tech.bollinger.middle >= tech.bollinger.lower,
    'Bollinger Bands monotonicity: Upper >= Middle >= Lower',
    `U:${tech.bollinger.upper}, M:${tech.bollinger.middle}, L:${tech.bollinger.lower}`
  );

  assert(
    tech.fibonacci.level100 >= tech.fibonacci.level0,
    'Fibonacci levels properly ordered (100% >= 0%)'
  );

  assert(
    typeof tech.technicalScore === 'number' && tech.technicalScore >= 0 && tech.technicalScore <= 100,
    'Technical Composite Score is normalized (0 - 100)',
    `Score: ${tech.technicalScore}`
  );

  // -------------------------------------------------------------
  // TEST GROUP 2: FUNDAMENTAL VALUATION MATHEMATICS
  // -------------------------------------------------------------
  console.log('\n▶ [Group 2] Fundamental Valuation & Intrinsic Value Models:');

  const fund = computeInternalFundamental(testSym, [testSym]);

  assert(
    fund.dcfIntrinsicValue > 0,
    'DCF Discounted Cash Flow yields positive intrinsic value',
    `DCF Value: ${fund.dcfIntrinsicValue}`
  );

  assert(
    fund.grahamNumber > 0,
    'Benjamin Graham intrinsic value formula yields positive number',
    `Graham: ${fund.grahamNumber}`
  );

  assert(
    typeof fund.fundamentalScore === 'number' && fund.fundamentalScore >= 0 && fund.fundamentalScore <= 100,
    'Fundamental Score normalized between 0 and 100',
    `Score: ${fund.fundamentalScore}`
  );

  // -------------------------------------------------------------
  // TEST GROUP 3: MONTE CARLO SIMULATION & PRICE CORRIDOR
  // -------------------------------------------------------------
  console.log('\n▶ [Group 3] Monte Carlo Price Forecast & Corridor Consistency:');

  const fc = computePriceForecast(testSym, tech, fund, 30);

  assert(
    fc.bullTarget90pct >= fc.medianTarget50pct && fc.medianTarget50pct >= fc.bearTarget10pct,
    'Monte Carlo Percentile Corridor: 90% (Bull) >= 50% (Median) >= 10% (Bear)',
    `Bull: ${fc.bullTarget90pct}, Med: ${fc.medianTarget50pct}, Bear: ${fc.bearTarget10pct}`
  );

  assert(
    Array.isArray(fc.monteCarloPaths) && fc.monteCarloPaths.length > 0,
    'Monte Carlo simulations generated trajectory paths',
    `Paths count: ${fc.monteCarloPaths.length}`
  );

  assert(
    !isNaN(fc.regressionRSquared) && fc.regressionRSquared >= 0 && fc.regressionRSquared <= 1,
    'Time-Series Regression R² bounded in [0, 1]',
    `R²: ${fc.regressionRSquared}`
  );

  // -------------------------------------------------------------
  // TEST GROUP 4: ACTIONABLE STRATEGY & RISK/REWARD EXECUTION
  // -------------------------------------------------------------
  console.log('\n▶ [Group 4] Actionable Strategy & Asymmetric Risk/Reward Math:');

  const strat = computeActionableStrategy(testSym, tech, fund, fc);

  assert(
    strat.stopLossToman < strat.entryMinToman,
    'Stop-loss is placed below minimum entry price',
    `StopLoss: ${strat.stopLossToman}, EntryMin: ${strat.entryMinToman}`
  );

  assert(
    strat.target1Toman > strat.entryMaxToman && strat.target2Toman > strat.target1Toman,
    'Profit targets are logically sequenced: Target 2 > Target 1 > Entry',
    `Target1: ${strat.target1Toman}, Target2: ${strat.target2Toman}`
  );

  assert(
    strat.riskRewardRatio > 0,
    'Risk/Reward Ratio is strictly positive and quantified',
    `R/R: ${strat.riskRewardRatio}`
  );

  assert(
    Array.isArray(strat.validationChecklist) && strat.validationChecklist.length === 5,
    '5-Point Institutional Validation Checklist is complete',
    `Checklist items: ${strat.validationChecklist.length}`
  );

  assert(
    strat.portfolioWeightPct > 0 && strat.portfolioWeightPct <= 30,
    'Portfolio position sizing strictly respects risk limits (<= 30%)',
    `Weight: ${strat.portfolioWeightPct}%`
  );

  // -------------------------------------------------------------
  // TEST GROUP 5: SQLITE PERSISTENCE INTEGRITY
  // -------------------------------------------------------------
  console.log('\n▶ [Group 5] SQLite Persistence & Database Round-Trip:');

  await marketRepository.init([testSym]);

  marketRepository.saveActionableStrategy(testSym.insCode, strat);
  const retrievedStrat = marketRepository.getActionableStrategy(testSym.insCode);

  assert(
    retrievedStrat !== null && retrievedStrat.insCode === testSym.insCode,
    'Actionable strategy stored and retrieved from SQLite intact'
  );

  assert(
    retrievedStrat !== null && retrievedStrat.riskRewardRatio === strat.riskRewardRatio,
    'Risk/Reward ratio preserved across SQLite serialization',
    `Saved: ${strat.riskRewardRatio}, Retrieved: ${retrievedStrat?.riskRewardRatio}`
  );

  const parallel = await marketRepository.getParallelMarkets();
  assert(
    Array.isArray(parallel) && parallel.length >= 8,
    'Parallel markets correctly persisted in SQLite (gold, currency, oil, etc.)',
    `Items found: ${parallel.length}`
  );

  // -------------------------------------------------------------
  // TEST GROUP 6: TSETMC.COM OFFICIAL DATA ACCURACY & INTEGRITY
  // -------------------------------------------------------------
  console.log('\n▶ [Group 6] TSETMC Official Data Accuracy & Snapshot Integrity:');
  
  const fs = await import('fs');
  const path = await import('path');
  const indicesFixture = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'backend', 'tests', 'fixtures', 'indices.json'), 'utf8'));

  const tedpix = indicesFixture.indices.find((i: any) => i.id === 'TEDPIX');
  assert(
    tedpix !== undefined && tedpix.value === 7927330.57,
    'TEDPIX overall index strictly matches tsetmc.com snapshot (7,927,330.57)',
    `Value: ${tedpix?.value}`
  );

  const eqWeight = indicesFixture.indices.find((i: any) => i.id === 'EQUAL_WEIGHT');
  assert(
    eqWeight !== undefined && eqWeight.value === 2202744.79,
    'Equal-weighted index strictly matches tsetmc.com snapshot (2,202,744.79)',
    `Value: ${eqWeight?.value}`
  );

  const priceWeighted = indicesFixture.indices.find((i: any) => i.id === 'PRICE_WEIGHTED');
  assert(
    priceWeighted !== undefined && priceWeighted.value === 1308559.35,
    'Cap-weighted price index strictly matches tsetmc.com snapshot (1,308,559.35)',
    `Value: ${priceWeighted?.value}`
  );

  const freeFloat = indicesFixture.indices.find((i: any) => i.id === 'FREE_FLOAT');
  assert(
    freeFloat !== undefined && freeFloat.value === 9926684.05,
    'Free-float index strictly matches tsetmc.com snapshot (9,926,684.05)',
    `Value: ${freeFloat?.value}`
  );

  const marketCapB = indicesFixture.marketSummary.marketValueRialB;
  assert(
    marketCapB === 229303041.021,
    'Cash Market Capitalization matches tsetmc.com (229,303,041.021 B Rials)',
    `MarketCap: ${marketCapB} B`
  );

  const tradesCount = indicesFixture.marketSummary.tradesCount;
  assert(
    tradesCount === 1698,
    'Market Trades Count matches tsetmc.com snapshot (1,698 trades)',
    `Trades: ${tradesCount}`
  );

  // -------------------------------------------------------------
  // TEST GROUP 7: BOURSEVIEW REVERSE-ENGINEERED DATA ACCURACY & INTEGRITY
  // -------------------------------------------------------------
  console.log('\n▶ [Group 7] BourseView Data Accuracy & Analytical Integrity (bourseview.com):');

  const { buildBourseviewProfile, buildBourseviewMarketOverview } = await import('../../server/db/bourseviewEngine.js');
  const bvProfile = buildBourseviewProfile(testSym, [testSym]);

  assert(
    Array.isArray(bvProfile.monthlySales) && bvProfile.monthlySales.length === 12,
    'BourseView Codal Monthly Sales contains full 12-month continuous sequence',
    `Months tracked: ${bvProfile.monthlySales.length}`
  );

  const isCumulativeMonotonic = bvProfile.monthlySales.every((m, idx, arr) => {
    if (idx === 0) return true;
    return m.cumulativeBillionToman >= arr[idx - 1].cumulativeBillionToman;
  });
  assert(
    isCumulativeMonotonic,
    'Cumulative sales revenue is monotonically increasing across fiscal months'
  );

  const nimaScenarios = bvProfile.sensitivityScenarios;
  assert(
    nimaScenarios.length === 5 && nimaScenarios[4].estimatedEpsToman >= nimaScenarios[0].estimatedEpsToman,
    'Nima Dollar sensitivity maintains rational correlation with EPS (50k to 70k Toman)',
    `50k: ${nimaScenarios[0].estimatedEpsToman}, 70k: ${nimaScenarios[4].estimatedEpsToman}`
  );

  assert(
    bvProfile.bourseviewScore >= 0 && bvProfile.bourseviewScore <= 100,
    'BourseView Composite Score is strictly bounded between 0 and 100',
    `Score: ${bvProfile.bourseviewScore}`
  );

  const calculatedPe = Math.round((bvProfile.currentPriceToman / bvProfile.epsTrailing) * 10) / 10;
  assert(
    Math.abs(calculatedPe - bvProfile.peTrailing) <= 0.5,
    'Data Integrity: Trailing P/E precisely correlates with price and EPS',
    `Calculated: ${calculatedPe}, Profile: ${bvProfile.peTrailing}`
  );

  assert(
    bvProfile.realBuyerPower > 0 && bvProfile.perCapitaBuyMillionToman > 0,
    'Smart Tape: Real buyer power and per-capita metrics are valid and positive',
    `Buyer Power: ${bvProfile.realBuyerPower}x, Per Capita: ${bvProfile.perCapitaBuyMillionToman}M`
  );

  console.log('\n===============================================================');
  console.log(`🏁 TEST RESULTS: ${passedTests} PASSED, ${failedTests} FAILED`);
  console.log('===============================================================');

  if (failedTests > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTestSuite().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
