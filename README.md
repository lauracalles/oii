# Nogueira: Cuidados e Lavagem Automotiva — Painel Financeiro

Dashboard interativo (React + Vite) com premissas financeiras ajustáveis
por sliders, projeção de fluxo de caixa, VPL e TIR. Feito para o
entregável "Tech para Business" do case.

## ⚠️ Antes de apresentar: dados fictícios

Todo número financeiro exibido por padrão é placeholder. Existem duas formas de trocar por dados reais:

**Opção A — importar pela interface (recomendado):** dentro do dashboard, no painel "Dados de origem", clique em **"Baixar modelo"** para pegar um `.xlsx` de exemplo, preencha com os valores reais (rótulo na coluna A, valor na coluna B) e clique em **"Importar planilha"**. O badge muda de "Dados de exemplo" para "Planilha importada".

**Opção B — editar o código diretamente:** abra `src/finance.js` e altere `BASE_MONTHLY_REVENUE`, `BASE_FIXED_COST`, `BASE_VARIABLE_COST_RATIO`, `INITIAL_INVESTMENT`.

Em ambos os casos, confira se os limites (`min`/`max`) dos sliders em
`src/components/Dashboard.jsx` ainda fazem sentido para a escala real
dos números.

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
