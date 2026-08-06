// TODO(dados-reais): todo o bloco abaixo usa premissas e valores base
// FICTÍCIOS, só para dar forma ao painel antes da planilha financeira
// real do case chegar. Quando a planilha existir, substituir:
//   - BASE_MONTHLY_REVENUE, BASE_FIXED_COST, BASE_VARIABLE_COST_RATIO,
//     INITIAL_INVESTMENT (todas nesta seção)
// Nada aqui deve ser citado como número real da Nogueira: Cuidados e Lavagem Automotiva
// até essa substituição acontecer.

export const BASE_MONTHLY_REVENUE = 42000 // TODO(dados-reais)
export const BASE_FIXED_COST = 18500      // TODO(dados-reais)
export const BASE_VARIABLE_COST_RATIO = 0.28 // TODO(dados-reais) — % da receita
export const INITIAL_INVESTMENT = 65000   // TODO(dados-reais) — reforma/branding/registro

/**
 * Projeta fluxo de caixa mensal simples com crescimento composto de receita.
 * @param {object} p premissas
 * @returns {{month:number, revenue:number, cost:number, net:number}[]}
 */
export function projectCashflow({
  months = 36,
  monthlyGrowthPct, // ex: 1.5 significa 1.5% ao mês
  fixedCost,
  variableCostRatioPct, // ex: 28 significa 28%
  baseRevenue = BASE_MONTHLY_REVENUE,
}) {
  const growth = monthlyGrowthPct / 100
  const varRatio = variableCostRatioPct / 100
  const rows = []
  let revenue = baseRevenue
  for (let m = 1; m <= months; m++) {
    revenue = m === 1 ? baseRevenue : revenue * (1 + growth)
    const variableCost = revenue * varRatio
    const cost = fixedCost + variableCost
    const net = revenue - cost
    rows.push({ month: m, revenue, cost, net })
  }
  return rows
}

/** VPL — desconta o fluxo mensal a uma taxa mensal equivalente à taxa anual informada. */
export function calcNPV({ cashflowRows, annualDiscountRatePct, initialInvestment }) {
  const monthlyRate = Math.pow(1 + annualDiscountRatePct / 100, 1 / 12) - 1
  let npv = -initialInvestment
  cashflowRows.forEach((row) => {
    npv += row.net / Math.pow(1 + monthlyRate, row.month)
  })
  return npv
}

/** TIR mensal, anualizada — Newton-Raphson simples sobre o fluxo com investimento inicial negativo. */
export function calcIRR({ cashflowRows, initialInvestment }) {
  const flows = [-initialInvestment, ...cashflowRows.map((r) => r.net)]

  function npvAt(rate) {
    return flows.reduce((acc, cf, i) => acc + cf / Math.pow(1 + rate, i), 0)
  }

  let rate = 0.02 // chute inicial mensal
  for (let i = 0; i < 200; i++) {
    const f = npvAt(rate)
    const dRate = 1e-6
    const derivative = (npvAt(rate + dRate) - f) / dRate
    if (Math.abs(derivative) < 1e-9) break
    const nextRate = rate - f / derivative
    if (!Number.isFinite(nextRate)) break
    if (Math.abs(nextRate - rate) < 1e-8) {
      rate = nextRate
      break
    }
    rate = nextRate
  }

  const annualRate = Math.pow(1 + rate, 12) - 1
  return { monthly: rate, annual: annualRate }
}

export function calcPayback(cashflowRows, initialInvestment) {
  let cumulative = -initialInvestment
  for (const row of cashflowRows) {
    cumulative += row.net
    if (cumulative >= 0) return row.month
  }
  return null // não recupera dentro do horizonte projetado
}

export function formatBRL(value) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })
}

export function formatPct(value, digits = 1) {
  return `${value.toFixed(digits)}%`
}
