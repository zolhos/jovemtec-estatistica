# 📊 Estatística — Cursinho Pré-Vestibulinho

**Ambiente Digital Interativo de Aprendizagem de Estatística & Ciências Sociais**  
**Autor:** Prof. Diego Gonçalves (`z.olhos`)  
**Público-Alvo:** Estudantes de 14 a 17 anos (Pré-Vestibulinho COTUCA / Institutos Federais)  
**Hospedagem:** GitHub Pages  

---

## 🎯 Sobre o Projeto

O **Estatística** é uma plataforma educacional desenvolvida para conectar conceitos de **Estatística Descritiva e Inferencial** (Média, Mediana, Moda, Desvio Simples, Variância e Desvio Padrão $\sigma$) com a análise crítica de **Ciências Sociais** (desigualdade de renda, racismo estrutural, equidade de políticas públicas e indicadores do IBGE/UNICEF e do Anuário Brasileiro de Segurança Pública).

### Destaques do Sistema:
- **Design Dual (Mobile vs. DataShow):** Detecta automaticamente se o usuário está acessando pelo smartphone (Modo Aluno) ou por projetor (Modo DataShow com suporte a atalhos de teclado).
- **🛡️ Cards de Evidência Social (Anuário da Violência):** Módulos modulares estilizados distribuídos ao longo de toda a página (Blocos 1, 2, 3 e 4) conectando proporcionalidade, tipos de variáveis em crimes virtuais, perfil modal socioeducativo e viés de subnotificação aos tópicos da aula.
- **Pesquisa de Campo ao Vivo (Bloco 1):** Coleta de dados reais da sala via Google Forms com visualização gráfica instantânea no DataShow.
- **Classificador Gamificado de Variáveis:** Teste interativo para fixação dos 4 tipos de variáveis (Qualitativa Nominal, Ordinal, Quantitativa Discreta e Contínua).
- **Simulador Interativo Outlier ("Efeito Neymar"):** Demonstração tátil de como a Média é disparada por *outliers* enquanto a Mediana permanece estável.
- **Visualizadores de Mediana (Rol) e Moda:** Ferramentas interativas para ordenar o Rol e calcular a Moda em tempo real.
- **Simulador de Alocação de Verbas e Equidade ($\sigma$):** Ajuste de orçamentos escolares com labels dinâmicos em R$ para medir a variação do Desvio Padrão ($\sigma$).
- **Oficina de Resolução COTUCA & Anuário:** Quiz com questões históricas do COTUCA e exercícios práticos do Anuário da Violência.

---

## 🛠️ Tecnologias Utilizadas

- **HTML5 & Vanilla JS (ES6+)**
- **Tailwind CSS (via CDN)**
- **KaTeX:** Renderização ultraleve de fórmulas LaTeX com containers roláveis ao toque.
- **Chart.js:** Gráficos dinâmicos em tempo real.
- **Google Apps Script:** Backend API REST serverless para integração com Google Forms/Sheets.

---

## 🚀 Como Executar

### 1. Acesso Online (GitHub Pages)
Acesse diretamente via navegador:
`https://zolhos.github.io/jovemtec-estatistica/`

- Para ativar o **Modo DataShow (Projeção)** no projetor:
`https://zolhos.github.io/jovemtec-estatistica/?view=datashow`

### 2. Execução Local
Basta clonar o repositório e abrir o arquivo `index.html` em qualquer navegador:
```bash
git clone https://github.com/zolhos/jovemtec-estatistica.git
cd jovemtec-estatistica
```

---

## 📜 Licença
Projeto desenvolvido para fins educacionais no cursinho pré-vestibulinho. Autor: **Prof. Diego Gonçalves (z.olhos)**.
