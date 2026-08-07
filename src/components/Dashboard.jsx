import { useMemo, useState } from 'react'
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts'
import {
  HISTORICAL_REVENUE, WACC_BASE, ENTERPRISE_VALUE_BASE, CASH, GROSS_DEBT,
  EQUITY_VALUE_BASE, PERPETUITY_GROWTH_BASE, WACC_GRID, G_GRID,
  lookupEquityValue, formatBRL, formatPct,
} from '../finance.js'
import './Dashboard.css'

export default function Dashboard({ user, onLogout }) {
  const [wacc, setWacc] = useState(WACC_BASE)
  const [g, setG] = useState(PERPETUITY_GROWTH_BASE)

  const equityValue = useMemo(() => lookupEquityValue(g, wacc), [g, wacc])
  const isBaseCase = wacc === WACC_BASE && g === PERPETUITY_GROWTH_BASE
  const enterpriseValueAdj = equityValue - CASH + GROSS_DEBT

  const revenueChartData = HISTORICAL_REVENUE.map((r) => ({
    ano: r.year,
    'Receita Bruta': r.revenue,
    EBITDA: r.ebitda,
  }))

  const last = HISTORICAL_REVENUE[HISTORICAL_REVENUE.length - 1]
  const first = HISTORICAL_REVENUE[0]
  const cagr = (Math.pow(last.revenue / first.revenue, 1 / (last.year - first.year)) - 1) * 100

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
          <a className="dash__nav-item dash__nav-item--active" href="#top">Valuation</a>
          <span className="dash__nav-label">Fonte dos dados</span>
          <p className="dash__nav-note">
            Números extraídos de <code>Case_II_-_Grupo_6.xlsx</code>, abas
            "Input" e "Valuation" — não são estimativas, são o resultado
            do modelo de DCF do grupo (WACC via CAPM, FCFF, perpetuidade).
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
            <h1>Valuation — Nogueira: Cuidados e Lavagem Automotiva</h1>
            <p>Enterprise Value e Equity Value calculados por fluxo de caixa descontado (FCFF), com sensibilidade a g e WACC extraída direto do modelo do grupo.</p>
          </div>

          <section className="panel">
            <div className="panel__head-row">
              <h2>Contexto: receita e EBITDA histórico (2015–2025)</h2>
              <span className="data-badge data-badge--real">Dado real da planilha</span>
            </div>
            <p className="panel__hint">
              A receita caiu {formatPct(((first.revenue - last.revenue) / first.revenue) * 100, 0)} em 10 anos
              (CAGR de {formatPct(cagr, 1)} ao ano) e o EBITDA está negativo desde 2024 —
              é o pano de fundo que justifica o reposicionamento estratégico do case.
            </p>
            <div className="chart-wrap">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={revenueChartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <CartesianGrid stroke="#DCE6F0" vertical={false} />
                  <XAxis dataKey="ano" tick={{ fontSize: 11, fill: '#4A5D78' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#4A5D78' }} tickFormatter={(v) => `${Math.round(v / 1000)}k`} />
                  <Tooltip formatter={(value) => formatBRL(value)} contentStyle={{ borderRadius: 10, border: '1px solid #DCE6F0', fontFamily: 'Inter' }} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="Receita Bruta" fill="#38BDF8" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="EBITDA" fill="#14428A" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>

          <section className="panel">
            <h2>Premissas do valuation</h2>
            <p className="panel__hint">
              Os controles abaixo fazem "snap" para os valores que a planilha
              realmente calculou na matriz de sensibilidade (g × WACC) — não
              interpolo números que o modelo do grupo não testou.
            </p>
            <div className="sliders">
              <SliderField
                label="WACC"
                value={wacc}
                onChange={setWacc}
                options={WACC_GRID}
                display={formatPct(wacc * 100, 2)}
              />
              <SliderField
                label="Crescimento na perpetuidade (g)"
                value={g}
                onChange={setG}
                options={G_GRID}
                display={formatPct(g * 100, 1)}
              />
            </div>
          </section>

          <section className="kpi-row">
            <KpiCard
              label="Equity Value Justo"
              value={formatBRL(equityValue)}
              tone="gain"
              note={isBaseCase ? 'Cenário-base do modelo (WACC e g originais)' : 'Cenário ajustado pelos controles acima'}
            />
            <KpiCard
              label="Enterprise Value implícito"
              value={formatBRL(enterpriseValueAdj)}
              tone="gain"
              note="Equity Value − caixa + dívida bruta, no cenário selecionado"
            />
            <KpiCard
              label="WACC do cenário-base"
              value={formatPct(WACC_BASE * 100, 2)}
              tone="risk"
              note="Alto pela combinação de risco-país (CRP) e beta setorial — típico de PME em turnaround"
            />
          </section>

          <section className="panel">
            <h2>Sensibilidade — Equity Value Justo (g × WACC)</h2>
            <p className="panel__hint">Tabela extraída diretamente da aba "Valuation" do case. Linha e coluna do cenário selecionado ficam destacadas.</p>
            <div className="sens-table-wrap">
              <table className="sens-table">
                <thead>
                  <tr>
                    <th>g \ WACC</th>
                    {WACC_GRID.map((w) => (
                      <th key={w} className={w === wacc ? 'sens-table__active-col' : ''}>{formatPct(w * 100, 2)}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {G_GRID.map((gRow) => (
                    <tr key={gRow} className={gRow === g ? 'sens-table__active-row' : ''}>
                      <th>{formatPct(gRow * 100, 1)}</th>
                      {WACC_GRID.map((w, i) => {
                        const val = lookupEquityValue(gRow, w)
                        const active = gRow === g && w === wacc
                        return (
                          <td key={i} className={active ? 'sens-table__active-cell' : ''}>
                            {formatBRL(val)}
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </main>
      </div>
    </div>
  )
}

function SliderField({ label, value, onChange, options, display }) {
  const min = Math.min(...options)
  const max = Math.max(...options)
  const step = Math.abs(options[1] - options[0])
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
        onChange={(e) => {
          const raw = parseFloat(e.target.value)
          const closest = options.reduce((a, b) => (Math.abs(b - raw) < Math.abs(a - raw) ? b : a))
          onChange(closest)
        }}
      />
      <div className="slider-field__ticks">
        {options.slice().sort((a, b) => a - b).map((o) => <span key={o}>{formatPct(o * 100, 1)}</span>)}
      </div>
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
