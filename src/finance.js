// Dados extraídos de Case_II_-_Grupo_6.xlsx em 06/08/2026.
// Fonte: aba "Input" (histórico 2015-2025) e aba "Valuation"
// (WACC via CAPM com comparáveis, FCFF, sensibilidade g × WACC).
// Isto NÃO é mock — são os números que já estavam calculados na
// planilha do grupo. Se a planilha for atualizada, esses valores
// precisam ser re-extraídos manualmente (não há link ao vivo).

export const HISTORICAL_REVENUE = [
  { year: 2015, revenue: 490112, ebitda: 52236 },
  { year: 2016, revenue: 504322, ebitda: 46989 },
  { year: 2017, revenue: 495550, ebitda: 49733 },
  { year: 2018, revenue: 468438, ebitda: 43932 },
  { year: 2019, revenue: 442704, ebitda: 43822 },
  { year: 2020, revenue: 356349, ebitda: -1283 },
  { year: 2021, revenue: 403942, ebitda: 25809 },
  { year: 2022, revenue: 398406, ebitda: 7897 },
  { year: 2023, revenue: 372588, ebitda: 12572 },
  { year: 2024, revenue: 345060, ebitda: -11085 },
  { year: 2025, revenue: 328251, ebitda: -28305 },
]

// Valuation base (aba "Valuation", células B78, B95, B96-B98)
export const WACC_BASE = 0.2275451792742015
export const ENTERPRISE_VALUE_BASE = 142776.99941719088
export const CASH = 51000
export const GROSS_DEBT = 0
export const EQUITY_VALUE_BASE = 193776.99941719088
export const PERPETUITY_GROWTH_BASE = 0.035 // "g", célula B72

// Tabela de sensibilidade Equity Value Justo (g × WACC), extraída
// literalmente da aba "Valuation" (células K97:P103). Os únicos
// valores "corretos" segundo o modelo do grupo são estes — por isso
// os controles do dashboard fazem snap para essas grades em vez de
// interpolar valores que a planilha nunca calculou.
export const WACC_GRID = [0.2175, 0.2225, 0.2275, 0.2325, 0.2375]
export const G_GRID = [0.039, 0.037, 0.035, 0.033, 0.031, 0.029]

export const EQUITY_SENSITIVITY = {
  0.039: [154598.31019233755, 148967.7751123306, 143653.93575275014, 138631.85682650155, 133879.12596777428],
  0.037: [154090.48297202654, 148506.40183030107, 143234.08033748303, 138249.18711321737, 133529.82954540098],
  0.035: [153593.78621133877, 148054.87117828816, 142822.94919058515, 137874.26767260727, 133187.43280544496],
  0.033: [153107.85794410767, 147612.87151629134, 142420.27318295505, 137506.8654137638, 132851.73331223623],
  0.031: [152632.35173086543, 147180.10422321357, 142025.79414240143, 137146.75650000904, 132522.53647264896],
  0.029: [152166.93583514553, 146756.2830240495, 141639.26430165744, 136793.72589414133, 132199.65515996027],
}

export function lookupEquityValue(g, wacc) {
  const gKey = closest(G_GRID, g)
  const waccIdx = closestIndex(WACC_GRID, wacc)
  return EQUITY_SENSITIVITY[gKey][waccIdx]
}

function closest(arr, target) {
  return arr.reduce((a, b) => (Math.abs(b - target) < Math.abs(a - target) ? b : a))
}

function closestIndex(arr, target) {
  let bestIdx = 0
  let bestDiff = Infinity
  arr.forEach((v, i) => {
    const diff = Math.abs(v - target)
    if (diff < bestDiff) { bestDiff = diff; bestIdx = i }
  })
  return bestIdx
}

export function formatBRL(value) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })
}

export function formatPct(value, digits = 1) {
  return `${value.toFixed(digits)}%`
}
