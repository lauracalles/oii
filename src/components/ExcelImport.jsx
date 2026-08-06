import { useRef, useState } from 'react'
import * as XLSX from 'xlsx'

// Mapa de rótulos aceitos na planilha (linha 1 = rótulo, linha 2 = valor).
// Aceita variações comuns de escrita/acentuação — comparação é
// case-insensitive e ignora acento.
const FIELD_ALIASES = {
  receita: 'baseRevenue',
  'receita mensal': 'baseRevenue',
  'receita mensal base': 'baseRevenue',
  'custo fixo': 'fixedCost',
  'custo fixo mensal': 'fixedCost',
  'custo variavel': 'variableCostRatioPct',
  'custo variavel (%)': 'variableCostRatioPct',
  'custo variavel %': 'variableCostRatioPct',
  investimento: 'initialInvestment',
  'investimento inicial': 'initialInvestment',
  'taxa de desconto': 'discountRatePct',
  'taxa de desconto (%)': 'discountRatePct',
  wacc: 'discountRatePct',
  crescimento: 'monthlyGrowthPct',
  'crescimento mensal': 'monthlyGrowthPct',
  'crescimento mensal (%)': 'monthlyGrowthPct',
}

function normalize(str) {
  return String(str ?? '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

export default function ExcelImport({ onImport }) {
  const inputRef = useRef(null)
  const [status, setStatus] = useState(null) // { type: 'ok'|'error', message }

  function handleFile(e) {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target.result)
        const workbook = XLSX.read(data, { type: 'array' })
        const sheet = workbook.Sheets[workbook.SheetNames[0]]
        const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 })

        const found = {}
        rows.forEach((row) => {
          if (!row || row.length < 2) return
          const key = FIELD_ALIASES[normalize(row[0])]
          const value = parseFloat(String(row[1]).replace(',', '.'))
          if (key && Number.isFinite(value)) {
            found[key] = value
          }
        })

        const count = Object.keys(found).length
        if (count === 0) {
          setStatus({
            type: 'error',
            message: 'Nenhum campo reconhecido. Confira se a planilha tem rótulo na coluna A e valor na coluna B (ver modelo).',
          })
          return
        }

        onImport(found)
        setStatus({ type: 'ok', message: `${count} premissa(s) importada(s) da planilha.` })
      } catch (err) {
        setStatus({ type: 'error', message: 'Não consegui ler esse arquivo. Confira se é .xlsx ou .csv válido.' })
      }
    }
    reader.readAsArrayBuffer(file)
    e.target.value = '' // permite reimportar o mesmo arquivo depois
  }

  function downloadTemplate() {
    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.aoa_to_sheet([
      ['Premissa', 'Valor'],
      ['Receita mensal', 42000],
      ['Custo fixo mensal', 18500],
      ['Custo variável (%)', 28],
      ['Investimento inicial', 65000],
      ['Taxa de desconto (%)', 18],
      ['Crescimento mensal (%)', 2],
    ])
    XLSX.utils.book_append_sheet(wb, ws, 'Premissas')
    XLSX.writeFile(wb, 'modelo-premissas-nogueira.xlsx')
  }

  return (
    <div className="excel-import">
      <div className="excel-import__actions">
        <button type="button" className="excel-import__btn" onClick={() => inputRef.current?.click()}>
          Importar planilha (.xlsx)
        </button>
        <button type="button" className="excel-import__btn excel-import__btn--ghost" onClick={downloadTemplate}>
          Baixar modelo
        </button>
        <input
          ref={inputRef}
          type="file"
          accept=".xlsx,.xls,.csv"
          onChange={handleFile}
          style={{ display: 'none' }}
        />
      </div>
      {status && (
        <p className={`excel-import__status excel-import__status--${status.type}`}>
          {status.message}
        </p>
      )}
    </div>
  )
}
