import { useMemo, useState } from 'react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import {
  projectCashflow, calcNPV, calcIRR, calcPayback,
  formatBRL, formatPct,
  BASE_FIXED_COST, BASE_VARIABLE_COST_RATIO, INITIAL_INVESTMENT, BASE_MONTHLY_REVENUE,
} from '../finance.js'
import ExcelImport from './ExcelImport.jsx'
import './Dashboard.css'

export default function Dashboard({ user, onLogout }) {
  const [monthlyGrowthPct, setMonthlyGrowthPct] = useState(2.0)
  const [fixedCost, setFixedCost] = useState(BASE_FIXED_COST)
  const [variableCostRatioPct, setVariableCostRatioPct] = useState(BASE_VARIABLE_COST_RATIO * 100)
  const [discountRatePct, setDiscountRatePct] = useState(18)
  const [initialInvestment, setInitialInvestment] = useState(INITIAL_INVESTMENT)
  const [horizonMonths, setHorizonMonths] = useState(36)
  const [baseRevenue, setBaseRevenue] = useState(BASE_MONTHLY_REVENUE)
  const [isRealData, setIsRealData] = useState(false)

  function handleExcelImport(found) {
    if (found.baseRevenue !== undefined) setBaseRevenue(found.baseRevenue)
    if (found.fixedCost !== undefined) setFixedCost(found.fixedCost)
    if (found.variableCostRatioPct !== undefined) setVariableCostRatioPct(found.variableCostRatioPct)
    if (found.initialInvestment !== undefined) setInitialInvestment(found.initialInvestment)
    if (found.discountRatePct !== undefined) setDiscountRatePct(found.discountRatePct)
    if (found.monthlyGrowthPct !== undefined) setMonthlyGrowthPct(found.monthlyGrowthPct)
    setIsRealData(true)
  }

  const cashflowRows = useMemo(() => projectCashflow({
    months: horizonMonths,
    monthlyGrowthPct,
    fixedCost,
    variableCostRatioPct,
    baseRevenue,
  }), [horizonMonths, monthlyGrowthPct, fixedCost, variableCostRatioPct, baseRevenue])

  const npv = useMemo(() => calcNPV({ cashflowRows, annualDiscountRatePct: discountRatePct, initialInvestment }),
    [cashflowRows, discountRatePct, initialInvestment])

  const irr = useMemo(() => calcIRR({ cashflowRows, initialInvestment }), [cashflowRows, initialInvestment])

  const payback = useMemo(() => calcPayback(cashflowRows, initialInvestment), [cashflowRows, initialInvestment])

  const chartData = useMemo(() => {
    let cumulative = -initialInvestment
    return cashflowRows.map((row) => {
      cumulative += row.net
      return {
        month: `M${row.month}`,
        Receita: Math.round(row.revenue),
        Custo: Math.round(row.cost),
        'Caixa acumulado': Math.round(cumulative),
      }
    })
  }, [cashflowRows, initialInvestment])

  return (
    <div className="dash">
      <aside className="dash__sidebar">
        <div className="dash__brand">
          <DropletMark />
          <div>
            <strong>NOGUEIRA</strong>
            <span>CUIDADOS &amp; LAVAGEM</span>
          </div>
        </div>
        <nav className="dash__nav">
          <span className="dash__nav-label">Painel</span>
          <a className="dash__nav-item dash__nav-item--active" href="#top">Projeção financeira</a>
          <span className="dash__nav-label">Fonte dos dados</span>
          <p className="dash__nav-note">
            Use o botão "Importar planilha" no painel para carregar os
            valores reais do case. Até lá, os números exibidos são
            estimativas de exemplo.
          </p>
        </nav>
      </aside>

      <div className="dash__main">
        <header className="dash__header">
          <div>
            <strong>{user?.name ?? 'Administrador'}</strong>
            <span>{user?.role ?? 'Administrador'}</span>
          </div>
          <button className="dash__logout" onClick={onLogout}>Sair</button>
        </header>

        <main className="dash__content" id="top">
          <div className="dash__title-row">
            <h1>Projeção financeira</h1>
            <p>Mexa nas premissas abaixo para ver VPL, TIR e payback recalcularem em tempo real.</p>
          </div>

          <section className="panel">
            <div className="panel__head-row">
              <h2>Dados de origem</h2>
              <span className={`data-badge ${isRealData ? 'data-badge--real' : 'data-badge--mock'}`}>
                {isRealData ? 'Planilha importada' : 'Dados de exemplo (fictícios)'}
              </span>
            </div>
            <p className="panel__hint">
              Importe a planilha financeira real do case para substituir os valores de exemplo.
              Rótulo na coluna A, valor na coluna B — baixe o modelo se tiver dúvida do formato.
            </p>
            <ExcelImport onImport={handleExcelImport} />
          </section>

          <section className="panel">
            <h2>Premissas</h2>
            <div className="sliders">
              <SliderField
                label="Receita mensal base"
                value={baseRevenue}
                onChange={setBaseRevenue}
                min={5000} max={150000} step={500}
                display={formatBRL(baseRevenue)}
              />
              <SliderField
                label="Crescimento mensal de receita"
                value={monthlyGrowthPct}
                onChange={setMonthlyGrowthPct}
                min={-2} max={8} step={0.1}
                display={formatPct(monthlyGrowthPct)}
              />
              <SliderField
                label="Custo fixo mensal"
                value={fixedCost}
                onChange={setFixedCost}
                min={5000} max={40000} step={500}
                display={formatBRL(fixedCost)}
              />
              <SliderField
                label="Custo variável (% da receita)"
                value={variableCostRatioPct}
                onChange={setVariableCostRatioPct}
                min={10} max={50} step={1}
                display={formatPct(variableCostRatioPct, 0)}
              />
              <SliderField
                label="Taxa de desconto anual (WACC)"
                value={discountRatePct}
                onChange={setDiscountRatePct}
                min={5} max={35} step={0.5}
                display={formatPct(discountRatePct, 1)}
              />
              <SliderField
                label="Investimento inicial"
                value={initialInvestment}
                onChange={setInitialInvestment}
                min={10000} max={150000} step={1000}
                display={formatBRL(initialInvestment)}
              />
              <SliderField
                label="Horizonte de projeção"
                value={horizonMonths}
                onChange={setHorizonMonths}
                min={12} max={60} step={6}
                display={`${horizonMonths} meses`}
              />
            </div>
          </section>

          <section className="kpi-row">
            <KpiCard label="VPL (valor presente líquido)" value={formatBRL(npv)} tone={npv >= 0 ? 'gain' : 'risk'}
              note={npv >= 0 ? 'Projeto agrega valor na taxa de desconto informada' : 'Projeto destrói valor na taxa de desconto informada'} />
            <KpiCard label="TIR anualizada" value={formatPct(irr.annual * 100, 1)} tone={irr.annual * 100 >= discountRatePct ? 'gain' : 'risk'}
              note={irr.annual * 100 >= discountRatePct ? 'Acima do WACC — atrativo' : 'Abaixo do WACC — reavaliar premissas'} />
            <KpiCard label="Payback" value={payback ? `${payback} meses` : `> ${horizonMonths} meses`} tone={payback ? 'gain' : 'risk'}
              note={payback ? 'Tempo para recuperar o investimento inicial' : 'Não recupera dentro do horizonte projetado'} />
          </section>

          <section className="panel">
            <h2>Receita, custo e caixa acumulado</h2>
            <div className="chart-wrap">
              <ResponsiveContainer width="100%" height={340}>
                <AreaChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#38BDF8" stopOpacity={0.5} />
                      <stop offset="100%" stopColor="#38BDF8" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="cashGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#14428A" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="#14428A" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#DCE6F0" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#4A5D78' }} interval={Math.ceil(horizonMonths / 12)} />
                  <YAxis tick={{ fontSize: 11, fill: '#4A5D78' }} tickFormatter={(v) => `${Math.round(v / 1000)}k`} />
                  <Tooltip formatter={(value) => formatBRL(value)} contentStyle={{ borderRadius: 10, border: '1px solid #DCE6F0', fontFamily: 'Inter' }} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Area type="monotone" dataKey="Receita" stroke="#38BDF8" fill="url(#revGrad)" strokeWidth={2} />
                  <Area type="monotone" dataKey="Caixa acumulado" stroke="#14428A" fill="url(#cashGrad)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </section>
        </main>
      </div>
    </div>
  )
}

function SliderField({ label, value, onChange, min, max, step, display }) {
  return (
    <label className="slider-field">
      <div className="slider-field__head">
        <span>{label}</span>
        <strong>{display}</strong>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
      />
    </label>
  )
}

function KpiCard({ label, value, note, tone }) {
  return (
    <div className={`kpi-card kpi-card--${tone}`}>
      <span className="kpi-card__label">{label}</span>
      <strong className="kpi-card__value">{value}</strong>
      <span className="kpi-card__note">{note}</span>
    </div>
  )
}

function DropletMark() {
  return (
    <svg width="28" height="28" viewBox="0 0 34 34" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M17 2C17 2 6 15.5 6 22.5C6 28.85 10.925 32 17 32C23.075 32 28 28.85 28 22.5C28 15.5 17 2 17 2Z"
        fill="url(#dropGrad2)"
      />
      <defs>
        <linearGradient id="dropGrad2" x1="6" y1="2" x2="28" y2="32" gradientUnits="userSpaceOnUse">
          <stop stopColor="#38BDF8" />
          <stop offset="1" stopColor="#14428A" />
        </linearGradient>
      </defs>
    </svg>
  )
}
