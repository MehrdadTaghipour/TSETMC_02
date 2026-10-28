999/

* Realistic Iranian Market Mock Dataset (TSETMC & Codal.ir Data)

* Strictly typed against the BourseView Data Contracts.

* File: bourseview_mock_dataset.ts
  \*/

import {
MarketSummaryBarometer,
TickerMarketData
} from './bourseview_data_contracts';

export const MOCK_MARKET_BAROMETER: MarketSummaryBarometer = {
timestamp: '2026-10-28T09:45:00.000Z',
tedpix: {
value: 2_184_620,
delta: 14_350,
percent: 0.66
},
tedpixEqualWeighted: {
value: 712_430,
delta: 4_820,
percent: 0.68
},
totalMarketCapIRR: 82_450_000_000_000_000, // 8,245 همت
totalMarketTurnoverIRR: 194_200_000_000_000, // 19.4 همت (شامل اوراق و فیکس اینکام)
equityTurnoverIRR: 58_400_000_000_000,       // 5.84 همت معاملات خرد
fixedIncomeTurnoverIRR: 85_600_000_000_000,  // 8.56 همت درآمد ثابت
goldTurnoverIRR: 18_900_000_000_000,         // 1.89 همت صندوق‌های طلا
netRetailFlowIRR: 3_420_000_000_000,         // +342 میلیارد تومان ورود پول حقیقی
netRetailGoldFlowIRR: 850_000_000_000,       // +85 میلیارد تومان ورود به طلا
smartMoneyInflowIRR: 12_650_000_000_000,     // 1.26 همت نمادهای با قدرت بالای 2
buyQueueValueIRR: 7_820_000_000_000,         // 782 میلیارد تومان صف خرید
sellQueueValueIRR: 2_150_000_000_000,        // 215 میلیارد تومان صف فروش
advancersCount: 394,
declinersCount: 226,
neutralCount: 68
};

export const MOCK_TICKERS: TickerMarketData\[\] = \[
// 1. فولاد - فولاد مبارکه اصفهان
{
symbolFa: 'فولاد',
symbolEn: 'FOLD1',
companyName: 'فولاد مبارکه اصفهان',
sectorCode: '27',
sectorName: 'فلزات اساسی',
subSectorName: 'تولید آهن و فولاد پایه',
marketType: 'TSE',
board: 'MAIN_1',
prices: {
last: 5120,
lastPercent: 2.81,
close: 5080,
closePercent: 2.01,
yesterdayClose: 4980,
open: 5000,
high: 5220,
low: 4990,
tickUpperLimit: 5320,
tickLowerLimit: 4640
},
volumes: {
tradeCount: 12840,
volumeShares: 245_000_000,
turnoverIRR: 1_244_600_000_000, // 124.4 میلیارد تومان
monthlyAverageVolume: 110_000_000,
volumeSurgeRatio: 2.23
},
actors: {
retail: {
buyCount: 3120,
buyVolume: 185_000_000,
buyValueIRR: 940_000_000_000,
buyPerCapitaIRR: 301_282_051, // \~30.1 میلیون تومان
sellCount: 4890,
sellVolume: 140_000_000,
sellValueIRR: 711_200_000_000,
sellPerCapitaIRR: 145_439_672  // \~14.5 میلیون تومان
},
institutional: {
buyCount: 14,
buyVolume: 60_000_000,
buyValueIRR: 304_600_000_000,
sellCount: 22,
sellVolume: 105_000_000,
sellValueIRR: 533_400_000_000
},
buyerPowerRatio: 2.07, // 30.1 / 14.5
netRetailCapitalFlowIRR: 228_800_000_000, // +22.8 میلیارد تومان
ownershipChangePercent: 0.18
},
depth: \[
{ level: 1, buyOrdersCount: 84, buyVolume: 12_400_000, buyPrice: 5120, sellPrice: 5130, sellVolume: 3_200_000, sellOrdersCount: 22 },
{ level: 2, buyOrdersCount: 65, buyVolume: 8_900_000,  buyPrice: 5110, sellPrice: 5140, sellVolume: 4_800_000, sellOrdersCount: 31 },
{ level: 3, buyOrdersCount: 42, buyVolume: 6_100_000,  buyPrice: 5100, sellPrice: 5150, sellVolume: 7_150_000, sellOrdersCount: 54 },
{ level: 4, buyOrdersCount: 38, buyVolume: 4_500_000,  buyPrice: 5090, sellPrice: 5160, sellVolume: 5_200_000, sellOrdersCount: 40 },
{ level: 5, buyOrdersCount: 91, buyVolume: 15_200_000, buyPrice: 5080, sellPrice: 5170, sellVolume: 9_300_000, sellOrdersCount: 66 }
\],
fundamentals: {
peTTM: 5.8,
sectorAveragePE: 6.4,
pbRatio: 1.82,
psRatio: 1.45,
epsTTM: 880,
dividendYield: 0.165,
payoutRatio: 0.78,
floatingSharesPercent: 24,
baseVolume: 18_500_000,
capitalIRR: 1_080_000_000_000_000,
sharesCount: 1_080_000_000_000
},
latestMonthlyReport: {
tracingNo: '1194821',
symbol: 'فولاد',
periodEndToDate: '1405/07/30',
publishDateTime: '1405/08/04 17:15:00',
totalMonthlyRevenueIRR: 248_900_000_000_000,
totalCumulativeRevenueIRR: 1_652_000_000_000_000,
momRevenueGrowthPercent: 12.4,
yoyRevenueGrowthPercent: 34.8,
items: \[
{
productGroupName: 'محصولات گرم',
productionUnit: 'تن',
currentMonth: {
productionVolume: 485_000,
salesVolume: 460_000,
salesRateIRR: 345_000_000,
salesRevenueIRR: 158_700_000_000_000
},
cumulativeYTD: {
productionVolume: 3_210_000,
salesVolume: 3_140_000,
salesRevenueIRR: 1_050_000_000_000_000
}
},
{
productGroupName: 'محصولات سرد',
productionUnit: 'تن',
currentMonth: {
productionVolume: 135_000,
salesVolume: 128_000,
salesRateIRR: 442_000_000,
salesRevenueIRR: 56_576_000_000_000
},
cumulativeYTD: {
productionVolume: 910_000,
salesVolume: 895_000,
salesRevenueIRR: 382_000_000_000_000
}
}
\]
}
},

// 2. فارس - صنایع پتروشیمی خلیج فارس
{
symbolFa: 'فارس',
symbolEn: 'PKLJ1',
companyName: 'صنایع پتروشیمی خلیج فارس',
sectorCode: '44',
sectorName: 'محصولات شیمیایی',
subSectorName: 'هلدینگ پتروشیمی',
marketType: 'TSE',
board: 'MAIN_1',
prices: {
last: 7850,
lastPercent: 1.15,
close: 7820,
closePercent: 0.77,
yesterdayClose: 7760,
open: 7780,
high: 7900,
low: 7750,
tickUpperLimit: 8300,
tickLowerLimit: 7220
},
volumes: {
tradeCount: 6420,
volumeShares: 68_000_000,
turnoverIRR: 531_760_000_000,
monthlyAverageVolume: 52_000_000,
volumeSurgeRatio: 1.31
},
actors: {
retail: {
buyCount: 1840,
buyVolume: 42_000_000,
buyValueIRR: 328_440_000_000,
buyPerCapitaIRR: 178_500_000,
sellCount: 2210,
sellVolume: 45_000_000,
sellValueIRR: 351_900_000_000,
sellPerCapitaIRR: 159_230_769
},
institutional: {
buyCount: 8,
buyVolume: 26_000_000,
buyValueIRR: 203_320_000_000,
sellCount: 5,
sellVolume: 23_000_000,
sellValueIRR: 179_860_000_000
},
buyerPowerRatio: 1.12,
netRetailCapitalFlowIRR: -23_460_000_000,
ownershipChangePercent: -0.03
},
depth: \[
{ level: 1, buyOrdersCount: 32, buyVolume: 2_400_000, buyPrice: 7850, sellPrice: 7860, sellVolume: 3_100_000, sellOrdersCount: 28 },
{ level: 2, buyOrdersCount: 45, buyVolume: 3_200_000, buyPrice: 7840, sellPrice: 7870, sellVolume: 4_500_000, sellOrdersCount: 39 },
{ level: 3, buyOrdersCount: 29, buyVolume: 1_850_000, buyPrice: 7830, sellPrice: 7880, sellVolume: 5_200_000, sellOrdersCount: 44 },
{ level: 4, buyOrdersCount: 51, buyVolume: 4_100_000, buyPrice: 7820, sellPrice: 7890, sellVolume: 3_600_000, sellOrdersCount: 19 },
{ level: 5, buyOrdersCount: 68, buyVolume: 6_900_000, buyPrice: 7810, sellPrice: 7900, sellVolume: 8_100_000, sellOrdersCount: 72 }
\],
fundamentals: {
peTTM: 6.2,
sectorAveragePE: 6.8,
pbRatio: 2.1,
psRatio: 2.9,
epsTTM: 1260,
dividendYield: 0.145,
payoutRatio: 0.85,
floatingSharesPercent: 12,
baseVolume: 12_000_000,
capitalIRR: 489_000_000_000_000,
sharesCount: 489_000_000_000
}
},

// 3. خودرو - ایران خودرو
{
symbolFa: 'خودرو',
symbolEn: 'IKCO1',
companyName: 'ایران خودرو',
sectorCode: '34',
sectorName: 'خودرو و ساخت قطعات',
subSectorName: 'تولید وسایل نقلیه موتوری',
marketType: 'TSE',
board: 'MAIN_2',
prices: {
last: 2940,
lastPercent: 4.98, // صف خرید کامل
close: 2920,
closePercent: 4.28,
yesterdayClose: 2800,
open: 2850,
high: 2940,
low: 2840,
tickUpperLimit: 2940,
tickLowerLimit: 2660
},
volumes: {
tradeCount: 22100,
volumeShares: 680_000_000,
turnoverIRR: 1_985_600_000_000,
monthlyAverageVolume: 220_000_000,
volumeSurgeRatio: 3.09 // حجم مشکوک
},
actors: {
retail: {
buyCount: 8400,
buyVolume: 590_000_000,
buyValueIRR: 1_722_800_000_000,
buyPerCapitaIRR: 205_095_238, // \~20.5 میلیون تومان
sellCount: 16200,
sellVolume: 510_000_000,
sellValueIRR: 1_489_200_000_000,
sellPerCapitaIRR: 91_925_925   // \~9.1 میلیون تومان
},
institutional: {
buyCount: 18,
buyVolume: 90_000_000,
buyValueIRR: 262_800_000_000,
sellCount: 31,
sellVolume: 170_000_000,
sellValueIRR: 496_400_000_000
},
buyerPowerRatio: 2.23, // 20.5 / 9.1
netRetailCapitalFlowIRR: 233_600_000_000, // +23.3 میلیارد تومان
ownershipChangePercent: 0.28
},
depth: \[
{ level: 1, buyOrdersCount: 1420, buyVolume: 82_000_000, buyPrice: 2940, sellPrice: 0, sellVolume: 0, sellOrdersCount: 0 },
{ level: 2, buyOrdersCount: 450,  buyVolume: 35_000_000, buyPrice: 2930, sellPrice: 0, sellVolume: 0, sellOrdersCount: 0 },
{ level: 3, buyOrdersCount: 210,  buyVolume: 18_500_000, buyPrice: 2920, sellPrice: 0, sellVolume: 0, sellOrdersCount: 0 },
{ level: 4, buyOrdersCount: 120,  buyVolume: 11_000_000, buyPrice: 2910, sellPrice: 0, sellVolume: 0, sellOrdersCount: 0 },
{ level: 5, buyOrdersCount: 85,   buyVolume: 7_800_000,  buyPrice: 2900, sellPrice: 0, sellVolume: 0, sellOrdersCount: 0 }
\],
fundamentals: {
peTTM: -8.4, // زیان‌ده عملیاتی
sectorAveragePE: 14.2,
pbRatio: 3.4,
psRatio: 0.42,
epsTTM: -350,
dividendYield: 0.0,
payoutRatio: 0.0,
floatingSharesPercent: 32,
baseVolume: 65_000_000,
capitalIRR: 301_000_000_000_000,
sharesCount: 301_000_000_000
}
},

// 4. فملی - ملی صنایع مس ایران
{
symbolFa: 'فملی',
symbolEn: 'MSMI1',
companyName: 'ملی صنایع مس ایران',
sectorCode: '27',
sectorName: 'فلزات اساسی',
subSectorName: 'تولید فلزات گرانبها و مس',
marketType: 'TSE',
board: 'MAIN_1',
prices: {
last: 7420,
lastPercent: 3.48,
close: 7360,
closePercent: 2.65,
yesterdayClose: 7170,
open: 7200,
high: 7480,
low: 7190,
tickUpperLimit: 7670,
tickLowerLimit: 6670
},
volumes: {
tradeCount: 9150,
volumeShares: 118_000_000,
turnoverIRR: 868_480_000_000,
monthlyAverageVolume: 65_000_000,
volumeSurgeRatio: 1.81
},
actors: {
retail: {
buyCount: 2280,
buyVolume: 84_000_000,
buyValueIRR: 618_240_000_000,
buyPerCapitaIRR: 271_157_894, // \~27.1 میلیون تومان
sellCount: 3950,
sellVolume: 72_000_000,
sellValueIRR: 529_920_000_000,
sellPerCapitaIRR: 134_156_962  // \~13.4 میلیون تومان
},
institutional: {
buyCount: 11,
buyVolume: 34_000_000,
buyValueIRR: 250_240_000_000,
sellCount: 16,
sellVolume: 46_000_000,
sellValueIRR: 338_560_000_000
},
buyerPowerRatio: 2.02,
netRetailCapitalFlowIRR: 88_320_000_000,
ownershipChangePercent: 0.12
},
depth: \[
{ level: 1, buyOrdersCount: 48, buyVolume: 3_800_000, buyPrice: 7420, sellPrice: 7440, sellVolume: 1_200_000, sellOrdersCount: 15 },
{ level: 2, buyOrdersCount: 62, buyVolume: 5_100_000, buyPrice: 7410, sellPrice: 7450, sellVolume: 2_800_000, sellOrdersCount: 29 },
{ level: 3, buyOrdersCount: 35, buyVolume: 2_900_000, buyPrice: 7400, sellPrice: 7460, sellVolume: 4_300_000, sellOrdersCount: 38 },
{ level: 4, buyOrdersCount: 40, buyVolume: 3_150_000, buyPrice: 7390, sellPrice: 7470, sellVolume: 2_950_000, sellOrdersCount: 24 },
{ level: 5, buyOrdersCount: 77, buyVolume: 8_200_000, buyPrice: 7380, sellPrice: 7480, sellVolume: 6_400_000, sellOrdersCount: 49 }
\],
fundamentals: {
peTTM: 5.4,
sectorAveragePE: 6.4,
pbRatio: 2.25,
psRatio: 1.85,
epsTTM: 1360,
dividendYield: 0.178,
payoutRatio: 0.82,
floatingSharesPercent: 18,
baseVolume: 14_000_000,
capitalIRR: 780_000_000_000_000,
sharesCount: 780_000_000_000
}
},

// 5. طلا - صندوق پشتوانه طلای لوتوس
{
symbolFa: 'طلا',
symbolEn: 'LTGD1',
companyName: 'صندوق پشتوانه طلای لوتوس',
sectorCode: '68',
sectorName: 'صندوق‌های سرمایه‌گذاری قابل معامله',
subSectorName: 'صندوق مبتنی بر طلا',
marketType: 'IFB',
board: 'SANDOOGH_ETF',
prices: {
last: 384500,
lastPercent: 1.85,
close: 383200,
closePercent: 1.51,
yesterdayClose: 377500,
open: 379000,
high: 386000,
low: 378000,
tickUpperLimit: 415250, // دامنه نوسان ۱۰٪
tickLowerLimit: 339750
},
volumes: {
tradeCount: 15420,
volumeShares: 18_400_000,
turnoverIRR: 7_050_880_000_000, // 705 میلیارد تومان
monthlyAverageVolume: 12_000_000,
volumeSurgeRatio: 1.53
},
actors: {
retail: {
buyCount: 4200,
buyVolume: 14_800_000,
buyValueIRR: 5_671_360_000_000,
buyPerCapitaIRR: 1_350_323_809, // \~135 میلیون تومان سرانه طلا
sellCount: 5800,
sellVolume: 13_200_000,
sellValueIRR: 5_058_240_000_000,
sellPerCapitaIRR: 872_110_344   // \~87.2 میلیون تومان
},
institutional: {
buyCount: 32,
buyVolume: 3_600_000,
buyValueIRR: 1_379_520_000_000,
sellCount: 26,
sellVolume: 5_200_000,
sellValueIRR: 1_992_640_000_000
},
buyerPowerRatio: 1.55,
netRetailCapitalFlowIRR: 613_120_000_000, // +61.3 میلیارد تومان
ownershipChangePercent: 0.35
},
depth: \[
{ level: 1, buyOrdersCount: 54, buyVolume: 240_000, buyPrice: 384500, sellPrice: 384800, sellVolume: 110_000, sellOrdersCount: 18 },
{ level: 2, buyOrdersCount: 68, buyVolume: 380_000, buyPrice: 384000, sellPrice: 385000, sellVolume: 420_000, sellOrdersCount: 32 },
{ level: 3, buyOrdersCount: 42, buyVolume: 190_000, buyPrice: 383500, sellPrice: 385500, sellVolume: 290_000, sellOrdersCount: 25 },
{ level: 4, buyOrdersCount: 88, buyVolume: 520_000, buyPrice: 383000, sellPrice: 386000, sellVolume: 640_000, sellOrdersCount: 44 },
{ level: 5, buyOrdersCount: 95, buyVolume: 710_000, buyPrice: 382500, sellPrice: 386500, sellVolume: 850_000, sellOrdersCount: 56 }
\],
fundamentals: {
peTTM: 0,
sectorAveragePE: 0,
pbRatio: 1.01, // P/NAV
psRatio: 0,
epsTTM: 0,
dividendYield: 0.0,
payoutRatio: 0.0,
floatingSharesPercent: 100,
baseVolume: 1, // صندوق‌ها حجم مبنای ۱ دارند
capitalIRR: 45_000_000_000_000,
sharesCount: 117_000_000
}
}
\];