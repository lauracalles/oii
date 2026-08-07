# Nogueira: Cuidados e Lavagem Automotiva — Painel Financeiro

Dashboard interativo (React + Vite) com premissas financeiras ajustáveis
por sliders, projeção de fluxo de caixa, VPL e TIR. Feito para o
entregável "Tech para Business" do case.

## Dados: valuation real da empresa

O dashboard agora mostra o **valuation real** de Nogueira: Cuidados e
Lavagem Automotiva, extraído de `Case_II_-_Grupo_6.xlsx` (abas
"Input" e "Valuation"): Enterprise Value, Equity Value Justo, WACC via
CAPM com comparáveis, e a tabela de sensibilidade g × WACC — os
mesmos números que já estavam calculados na planilha do grupo, sem
reinvenção de fórmula.

Se a planilha for atualizada (novo WACC, novo g, nova base de
caixa/dívida), os valores em `src/finance.js` precisam ser
re-extraídos manualmente — não há link ao vivo com o Excel.

## Login

Sem backend — autenticação apenas de fachada, credenciais fixas no
código-fonte (visíveis no bundle JS, não é segurança real):

- Usuário: `claudemirnogueira`
- Senha: `grupo6*`

Ver comentário em `src/components/LoginPage.jsx` para o disclaimer completo.

## Rodando localmente

Requer [Node.js](https://nodejs.org) 18+ instalado.

```bash
npm install
npm run dev
```

Abre em `http://localhost:5173`.

## Publicando no GitHub

```bash
git init
git add .
git commit -m "Painel financeiro Nogueira: Cuidados e Lavagem Automotiva"
git branch -M main
git remote add origin <URL_DO_SEU_REPOSITORIO_GITHUB>
git push -u origin main
```

Se ainda não tem o repositório: crie um novo em https://github.com/new
(pode ser público ou privado) e copie a URL antes do `git remote add`.

## Deploy no Vercel

1. Acesse https://vercel.com e faça login (dá para usar a conta do GitHub).
2. Clique em **Add New → Project**.
3. Selecione o repositório que você acabou de subir.
4. O Vercel detecta Vite automaticamente (build command `vite build`,
   output `dist`) — não precisa mexer em nada, é só clicar em **Deploy**.
5. Em alguns minutos você recebe uma URL pública (`algo.vercel.app`).

## Estrutura

```
src/
  finance.js              # cálculo de VPL, TIR, payback, projeção de caixa
  App.jsx                 # alterna entre login e dashboard
  components/
    LoginPage.jsx / .css   # capa com interação de "revelar" o carro
    Dashboard.jsx / .css   # sliders de premissas + gráficos + KPIs
```
