import { useEffect, useRef, useState } from 'react'
import './LoginPage.css'

// ATENÇÃO — limitação conhecida e assumida (ver briefing do case):
// Login sem backend. As credenciais abaixo ficam expostas no bundle
// JS enviado ao navegador — qualquer pessoa pode abrir o DevTools e
// lê-las. Isso NÃO é autenticação real, é uma barreira de fachada
// pedida explicitamente no escopo ("login e senha, mas sem backend").
// Antes de qualquer uso além da apresentação do case, isso precisa
// virar um login de verdade (ex.: Supabase Auth, NextAuth + DB).
const VALID_USER = 'claudemirnogueira'
const VALID_PASS = 'grupo6*'

const STAGES = [
  { key: 'sujo', label: '1. Chegada', caption: 'O carro chega sujo da rotina do dia a dia.', tone: '#7C93B3' },
  { key: 'espuma', label: '2. Pré-lavagem', caption: 'Espuma cobre a lataria e solta a sujeira mais pesada.', tone: '#38BDF8' },
  { key: 'jato', label: '3. Enxágue', caption: 'O jato de água tira o excesso e revela a cor por baixo.', tone: '#2F6FB0' },
  { key: 'brilho', label: '4. Finalização', caption: 'Secagem e brilho — pronto pra revelar os números também.', tone: '#14428A' },
]

const STAGE_COUNT = STAGES.length

export default function LoginPage({ onSuccess }) {
  const [usuario, setUsuario] = useState('')
  const [senha, setSenha] = useState('')
  const [error, setError] = useState('')
  const [stageIndex, setStageIndex] = useState(0)
  const stageSectionRef = useRef(null)

  useEffect(() => {
    function handleScroll() {
      const el = stageSectionRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      const total = rect.height - window.innerHeight
      if (total <= 0) return
      const scrolled = Math.min(Math.max(-rect.top, 0), total)
      const progress = scrolled / total
      const idx = Math.min(STAGE_COUNT - 1, Math.floor(progress * STAGE_COUNT))
      setStageIndex(idx)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  function goToStage(i) {
    const el = stageSectionRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const total = rect.height - window.innerHeight
    const targetScroll = window.scrollY + rect.top + (total * (i / STAGE_COUNT)) + 10
    window.scrollTo({ top: targetScroll, behavior: 'smooth' })
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (usuario.trim() === VALID_USER && senha === VALID_PASS) {
      setError('')
      onSuccess({ name: 'Claudemir Nogueira', role: 'Administrador' })
    } else {
      setError('Usuário ou senha incorretos.')
    }
  }

  return (
    <div className="login-page">
      <section className="stage-section" ref={stageSectionRef} style={{ height: `${STAGE_COUNT * 100}vh` }}>
        <div className="stage-sticky">
          <span className="stage-eyebrow">Nogueira: Cuidados e Lavagem Automotiva · Moema</span>
          <CarStage stageIndex={stageIndex} />
          <h1>{STAGES[stageIndex].caption}</h1>

          <div className="stage-dots" role="tablist" aria-label="Etapas da lavagem">
            {STAGES.map((s, i) => (
              <button
                key={s.key}
                role="tab"
                aria-selected={i === stageIndex}
                className={`stage-dot ${i === stageIndex ? 'stage-dot--active' : ''}`}
                onClick={() => goToStage(i)}
                title={s.label}
              >
                <span>{s.label}</span>
              </button>
            ))}
          </div>

          <p className="stage-hint">Role a página ou clique nas etapas acima</p>
        </div>
      </section>

      <section className="login-panel login-panel--standalone">
        <div className="login-panel__inner">
          <div className="login-brand">
            <DropletMark />
            <div>
              <strong>NOGUEIRA</strong>
              <span>CUIDADOS &amp; LAVAGEM</span>
            </div>
          </div>

          <h2>Acesse o painel financeiro</h2>
          <p className="login-panel__sub">Uso interno — projeções, VPL e TIR do negócio.</p>

          <form onSubmit={handleSubmit} noValidate>
            <label htmlFor="usuario">Usuário</label>
            <input
              id="usuario"
              type="text"
              autoComplete="username"
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
              placeholder="claudemirnogueira"
            />

            <label htmlFor="senha">Senha</label>
            <input
              id="senha"
              type="password"
              autoComplete="current-password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="••••••••"
            />

            {error && <p className="login-error" role="alert">{error}</p>}

            <button type="submit">Entrar</button>
          </form>

          <p className="login-panel__note">
            Acesso restrito à administração da Nogueira: Cuidados e Lavagem Automotiva.
          </p>
        </div>
      </section>
    </div>
  )
}

function DropletMark() {
  return (
    <svg width="34" height="34" viewBox="0 0 34 34" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M17 2C17 2 6 15.5 6 22.5C6 28.85 10.925 32 17 32C23.075 32 28 28.85 28 22.5C28 15.5 17 2 17 2Z"
        fill="url(#dropGrad)"
      />
      <defs>
        <linearGradient id="dropGrad" x1="6" y1="2" x2="28" y2="32" gradientUnits="userSpaceOnUse">
          <stop stopColor="#38BDF8" />
          <stop offset="1" stopColor="#14428A" />
        </linearGradient>
      </defs>
    </svg>
  )
}

// Ilustração do carro com 4 estados visuais controlados por stageIndex.
// Todas as camadas ficam sempre montadas no DOM; o que muda é a opacidade
// (CSS transition = crossfade suave) e cada camada tem sua própria
// animação contínua (bolha sobe, água escorre, brilho varre) em vez de
// ficar parada — é isso que dá a sensação de "vivo" tipo Cyclemon.
function CarStage({ stageIndex }) {
  const stage = STAGES[stageIndex]
  const bodyPainted = stageIndex >= 2
  return (
    <div className="car-stage" style={{ '--stage-tone': stage.tone }}>
      <svg className="car-stage__svg" viewBox="0 0 600 260" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="bodyGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#38BDF8" />
            <stop offset="55%" stopColor="#2F6FB0" />
            <stop offset="100%" stopColor="#0B2545" />
          </linearGradient>
          <radialGradient id="soapGrad" cx="50%" cy="30%" r="80%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#DCE6F0" stopOpacity="0.55" />
          </radialGradient>
          <linearGradient id="shineSweep" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="white" stopOpacity="0" />
            <stop offset="50%" stopColor="white" stopOpacity="0.65" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </linearGradient>
        </defs>

        <g className="car-body" style={{ transition: 'filter 0.5s ease' }}>
          <CarPath
            fill={bodyPainted ? 'url(#bodyGrad)' : 'none'}
            stroke={bodyPainted ? '#0B2545' : '#9AACC6'}
          />
        </g>

        <g className={`stage-layer ${stageIndex === 0 ? 'stage-layer--on' : ''}`}>
          <DustSpecks />
        </g>
        <g className={`stage-layer ${stageIndex === 1 ? 'stage-layer--on' : ''}`}>
          <SoapLayer />
        </g>
        <g className={`stage-layer ${stageIndex === 2 ? 'stage-layer--on' : ''}`}>
          <WaterJets />
        </g>
        <g className={`stage-layer ${stageIndex === 3 ? 'stage-layer--on' : ''}`}>
          <ShineSparkles />
          {/* faixa de brilho que varre a lataria continuamente */}
          <rect x="-200" y="60" width="160" height="140" fill="url(#shineSweep)" className="shine-sweep" />
        </g>
      </svg>
    </div>
  )
}

function DustSpecks() {
  const dots = [[120, 60], [160, 45], [90, 100], [400, 50], [440, 70], [480, 40], [230, 55], [350, 65]]
  return (
    <g fill="#B7A98A" opacity="0.7">
      {dots.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={3 + (i % 3)} className="dust-speck" style={{ animationDelay: `${i * 0.3}s` }} />
      ))}
    </g>
  )
}

function SoapLayer() {
  // Bolhas posicionadas acompanhando o perfil do teto/capô do carro,
  // cada uma com brilho próprio (gradiente + ponto de luz), em vez de
  // uma elipse opaca cobrindo tudo.
  const bubbles = [
    [70, 148, 14], [92, 130, 20], [118, 112, 24], [148, 96, 22], [176, 82, 26],
    [206, 74, 20], [236, 68, 24], [268, 66, 18], [298, 65, 26], [330, 66, 20],
    [360, 70, 24], [390, 80, 20], [418, 92, 26], [444, 106, 20], [468, 120, 24],
    [492, 132, 18], [512, 142, 22], [100, 150, 16], [140, 138, 14], [400, 140, 16],
    [440, 132, 14], [200, 100, 14], [320, 96, 16], [260, 90, 12],
  ]
  return (
    <g>
      <defs>
        <radialGradient id="bubbleGrad" cx="35%" cy="30%" r="75%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="55%" stopColor="#EAF3FC" />
          <stop offset="100%" stopColor="#C7DCF0" />
        </radialGradient>
      </defs>
      {bubbles.map(([cx, cy, r], i) => (
        <g key={i} className="soap-bubble" style={{ animationDelay: `${(i % 7) * 0.3}s`, animationDuration: `${2.6 + (i % 4) * 0.4}s` }}>
          <circle cx={cx} cy={cy} r={r} fill="url(#bubbleGrad)" stroke="#B7CBE6" strokeWidth="0.75" opacity="0.92" />
          <circle cx={cx - r * 0.32} cy={cy - r * 0.35} r={r * 0.22} fill="white" opacity="0.85" />
        </g>
      ))}
      {/* fios de espuma escorrendo pelas laterais */}
      {[96, 168, 244, 336, 412, 476].map((x, i) => (
        <line
          key={`drip-${i}`}
          x1={x} y1="150" x2={x} y2={150 + 18 + (i % 3) * 8}
          stroke="#EAF3FC" strokeWidth="5" strokeLinecap="round" opacity="0.7"
          className="soap-drip"
          style={{ animationDelay: `${i * 0.25}s` }}
        />
      ))}
    </g>
  )
}

function WaterJets() {
  return (
    <g stroke="#38BDF8" strokeWidth="3" strokeLinecap="round">
      {[...Array(9)].map((_, i) => (
        <line
          key={i}
          x1={60 + i * 60} y1="10" x2={45 + i * 60} y2="80"
          className="water-jet"
          style={{ animationDelay: `${(i % 4) * 0.15}s` }}
        />
      ))}
    </g>
  )
}

function ShineSparkles() {
  return (
    <g fill="#FFFFFF">
      <path d="M180 60 L186 76 L202 82 L186 88 L180 104 L174 88 L158 82 L174 76 Z" className="sparkle" style={{ animationDelay: '0s' }} />
      <path d="M420 50 L424 60 L434 64 L424 68 L420 78 L416 68 L406 64 L416 60 Z" className="sparkle" style={{ animationDelay: '0.5s' }} />
      <path d="M320 100 L324 110 L334 114 L324 118 L320 128 L316 118 L306 114 L316 110 Z" className="sparkle" style={{ animationDelay: '1s' }} />
    </g>
  )
}

function CarPath({ fill, stroke }) {
  return (
    <g fill={fill} stroke={stroke} strokeWidth="3.5" strokeLinejoin="round" strokeLinecap="round">
      {/* sombra de contato no chão */}
      <ellipse cx="300" cy="222" rx="248" ry="10" fill="#000000" opacity="0.18" stroke="none" />

      {/* carroceria — perfil de sedã/SUV esportivo, capô baixo e teto fluido */}
      <path d="M18 176
               C 18 160, 34 152, 54 150
               L 96 146
               C 118 108, 158 78, 210 70
               C 248 64, 292 62, 330 64
               C 380 67, 420 78, 452 100
               L 480 122
               L 552 132
               C 574 135, 584 148, 584 166
               L 584 182
               L 560 182
               L 560 176
               C 560 162, 550 154, 536 154
               L 486 154
               C 486 172, 472 186, 454 186
               C 436 186, 422 172, 422 154
               L 210 154
               C 210 172, 196 186, 178 186
               C 160 186, 146 172, 146 154
               L 60 154
               C 40 154, 26 166, 26 182
               L 18 182
               Z" />

      {/* linha de cintura / friso lateral */}
      <path d="M60 148 L480 118" strokeWidth="2" opacity="0.35" fill="none" />

      {/* para-brisa dianteiro */}
      <path d="M212 72 C 176 82, 148 106, 128 142 L 208 142 L 214 76 Z" fill="#0B2545" opacity="0.22" stroke="none" />
      {/* vidros laterais */}
      <path d="M222 70 L326 66 C 350 68, 372 74, 390 84 L 388 142 L 220 142 Z" fill="#0B2545" opacity="0.22" stroke="none" />
      {/* vidro traseiro */}
      <path d="M398 88 C 424 100, 444 116, 456 138 L 396 142 L 396 90 Z" fill="#0B2545" opacity="0.22" stroke="none" />

      {/* retrovisor */}
      <path d="M204 108 L188 104 L188 116 L202 116 Z" opacity="0.8" />

      {/* farol dianteiro */}
      <ellipse cx="572" cy="152" rx="10" ry="6" fill="#38BDF8" opacity="0.9" stroke="none" />
      {/* lanterna traseira */}
      <ellipse cx="30" cy="160" rx="7" ry="10" fill="#38BDF8" opacity="0.55" stroke="none" />

      {/* saia / spoiler traseiro sutil */}
      <path d="M18 176 L44 176 L44 168 L18 172 Z" opacity="0.5" />

      {/* rodas — aro esportivo maior */}
      <circle cx="178" cy="186" r="40" fill="#0B2545" stroke={stroke} />
      <circle cx="178" cy="186" r="24" fill="none" stroke="#9AACC6" strokeWidth="2" opacity="0.6" />
      <circle cx="178" cy="186" r="8" fill="#9AACC6" stroke="none" />

      <circle cx="454" cy="186" r="40" fill="#0B2545" stroke={stroke} />
      <circle cx="454" cy="186" r="24" fill="none" stroke="#9AACC6" strokeWidth="2" opacity="0.6" />
      <circle cx="454" cy="186" r="8" fill="#9AACC6" stroke="none" />
    </g>
  )
}
