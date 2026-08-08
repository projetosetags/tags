const client = window.clientQueimadas
/*=========================================================
000-A QUEIMADAS CONTROLE DE ACESSO
=========================================================*/
let queimadasUser=null
/*=========================================================
000-B QUEIMADAS FUNCTION LOGIN
=========================================================*/
async function loginQueimadas(){
let usuario=document.getElementById('queimadas-user')?.value.trim().toLowerCase()
let senha=document.getElementById('queimadas-pass')?.value.trim()
let erro=document.getElementById('queimadas-login-erro')
if(!usuario||!senha){
if(erro)erro.innerText='Informe usuário e senha.'
return
}
if(erro){
erro.style.color='#64748b'
erro.innerText='Verificando acesso...'
}
if(!window.clientPublic){
console.error('Cliente public não encontrado.')
if(erro){
erro.style.color='#dc2626'
erro.innerText='Erro de configuração do sistema.'
}
return
}
let{data,error}=await window.clientPublic
.from('perfistce')
.select('*')
.eq('username',usuario)
.limit(1)
if(error){
console.error('Erro no login:',error)
if(erro){
erro.style.color='#dc2626'
erro.innerText='Erro ao consultar usuário.'
}
return
}
let perfil=data?.[0]
if(!perfil){
if(erro){
erro.style.color='#dc2626'
erro.innerText='Usuário não encontrado.'
}
return
}
if(String(perfil.senha||'')!==String(senha)){
if(erro){
erro.style.color='#dc2626'
erro.innerText='Senha inválida.'
}
return
}
if(perfil.ativo===false){
if(erro){
erro.style.color='#dc2626'
erro.innerText='Usuário inativo.'
}
return
}
queimadasUser=perfil
sessionStorage.setItem('queimadasUser',JSON.stringify(perfil))
if(erro)erro.innerText=''
abrirPainelQueimadas()
}
/*=========================================================
000-C QUEIMADAS FUNCTION ABRIRPAINEL
=========================================================*/
function abrirPainelQueimadas(){
let login=document.getElementById('login-queimadas')
let app=document.getElementById('app-queimadas')
if(login)login.style.display='none'
if(app)app.style.display='block'
let info=document.getElementById('queimadas-user-info')
if(info&&queimadasUser){
info.innerText=
(queimadasUser.nome_completo||queimadasUser.username||'-')+
' • '+
(queimadasUser.cargo||'TCE-RO')
}
}
/*=========================================================
000-D QUEIMADAS FUNCTION LOGOUT
=========================================================*/
function logoutQueimadas(){
sessionStorage.removeItem('queimadasUser')
queimadasUser=null
let app=document.getElementById('app-queimadas')
let login=document.getElementById('login-queimadas')
if(app)app.style.display='none'
if(login)login.style.display='flex'
let senha=document.getElementById('queimadas-pass')
if(senha)senha.value=''
}
/*=========================================================
000-E QUEIMADAS FUNCTION RESTAURARSESSAO
=========================================================*/
document.addEventListener('DOMContentLoaded',()=>{
let salvo=sessionStorage.getItem('queimadasUser')
if(salvo){
try{
queimadasUser=JSON.parse(salvo)
abrirPainelQueimadas()
}catch(e){
sessionStorage.removeItem('queimadasUser')
}
}else{
let login=document.getElementById('login-queimadas')
let app=document.getElementById('app-queimadas')
if(login)login.style.display='flex'
if(app)app.style.display='none'
}
})
/*=========================================================
001 QUEIMADAS FUNCTION FORMATARDATABR
=========================================================*/
function formatarDataBR(data){
if(!data)return'-'
let d=new Date(data)
if(isNaN(d.getTime())){
let txt=String(data).trim()
if(/^\d{2}\/\d{2}\/\d{4}$/.test(txt)){
let[p,m,a]=txt.split('/')
return`${p}-${m}-${String(a).slice(-2)}`
}
return txt
}
let dia=String(d.getDate()).padStart(2,'0')
let mes=String(d.getMonth()+1).padStart(2,'0')
let ano=String(d.getFullYear()).slice(-2)
return`${dia}-${mes}-${ano}`
}
/*=========================================================
002 QUEIMADAS FUNCTION NORMALIZARMUNICIPIO
=========================================================*/
function normalizarMunicipio(txt){
return String(txt||'')
.normalize('NFD')
.replace(/[\u0300-\u036f]/g,'')
.replace(/[’']/g,'')
.replace(/\bDO OESTE\b/g,'DOESTE')
.replace(/\bD OESTE\b/g,'DOESTE')
.replace(/\bPRESIDENTE MEDICI\b/g,'PRESIDENTE MEDICI')
.replace(/\bSAO MIGUEL DO GUAPORE\b/g,'SAO MIGUEL DO GUAPORE')
.replace(/\bESPIGAO D OESTE\b/g,'ESPIGAO DOESTE')
.replace(/\bALTA FLORESTA D OESTE\b/g,'ALTA FLORESTA DOESTE')
.replace(/\s+/g,' ')
.toUpperCase()
.trim()
}
/*=========================================================
003 QUEIMADAS FUNCTION FORMATARNUMERO
=========================================================*/
function formatarNumero(v){
let n=Number(v||0)
if(!isFinite(n))n=0
return n.toLocaleString('pt-BR')
}
/*=========================================================
004 QUEIMADAS INFO DOS PAINÉIS
=========================================================*/
const infoPaineis={
PlanoUnificado:{
titulo:"📘 O que é o Plano Unificado?",
objetivo:"Consolida a estratégia estadual integrada para prevenção, preparação, resposta e recuperação frente às queimadas e incêndios florestais.",
interpretacao:"Permite visualizar como CBMRO, SEDAM, Defesa Civil, CEPCIF, Municípios e Tribunal de Contas atuam de forma coordenada.",
decisao:"Identificar lacunas, sobreposição de competências, necessidade de integração institucional e prioridades estratégicas.",
fonte:"Plano Unificado 2026 • TCERO • CBMRO • SEDAM • CEPCIF • Defesa Civil."
},
PlanoSedam:{
titulo:"🌿 O que é o Plano da SEDAM?",
objetivo:"Apresenta o conjunto de ações ambientais executadas pela Secretaria de Estado do Desenvolvimento Ambiental.",
interpretacao:"Demonstra prevenção, fiscalização, monitoramento, recuperação ambiental e ações de comando e controle.",
decisao:"Avaliar cumprimento das metas ambientais e priorizar ações corretivas.",
fonte:"Plano de Ação SEDAM 2026 • Política Estadual de Meio Ambiente."
},
PlanoCBM:{
titulo:"🚒 O que é o Plano Operacional do CBMRO?",
objetivo:"Apresenta o planejamento operacional da temporada de incêndios florestais.",
interpretacao:"Mostra brigadas, prevenção, combate, controle e recuperação durante todo o ciclo operacional.",
decisao:"Dimensionar recursos humanos, equipamentos e logística operacional.",
fonte:"POTIF 2026 • Corpo de Bombeiros Militar de Rondônia."
},
CadeiaValor:{
titulo:"🔗 O que é a Cadeia de Valor?",
objetivo:"Representa como recursos públicos são transformados em benefícios concretos para a sociedade.",
interpretacao:"Recursos → Planejamento → Execução → Produtos → Resultados → Impactos → Benefícios.",
decisao:"Identificar gargalos e perdas de eficiência ao longo da política pública.",
fonte:"TCU • Referencial Básico de Governança • INTOSAI GOV 9130 • OECD • Banco Mundial."
},
TeoriaMudanca:{
titulo:"🎯 O que é a Teoria da Mudança?",
objetivo:"Explica como as ações executadas produzem resultados e impactos ambientais.",
interpretacao:"Problema → Causas → Ações → Produtos → Resultados → Impactos → Benefícios.",
decisao:"Caso os impactos esperados não ocorram, a estratégia institucional deve ser revista.",
fonte:"OECD • UNDP • Banco Mundial • Avaliação de Políticas Públicas do TCU."
},
ODS:{
titulo:"🌎 ODS e Agenda 2030",
objetivo:"Relaciona todas as ações monitoradas com os Objetivos do Desenvolvimento Sustentável.",
interpretacao:"Quanto maior a aderência institucional, maior a contribuição para a Agenda 2030.",
decisao:"Identificar quais ODS recebem maior contribuição das ações desenvolvidas.",
fonte:"ONU • Agenda 2030 • Objetivos do Desenvolvimento Sustentável."
},
ODSEvidencias:{
titulo:"📑 O que são as Evidências dos ODS?",
objetivo:"Reunir documentos, indicadores, relatórios, imagens e demais comprovações da execução das ações relacionadas à Agenda 2030.",
interpretacao:"Quanto maior a quantidade e qualidade das evidências, maior a confiabilidade da avaliação institucional.",
decisao:"Permite verificar se os resultados apresentados possuem comprovação objetiva e auditável.",
fonte:"TCERO • Agenda 2030 • Normas Internacionais de Auditoria • INTOSAI."
},
RadarODS:{
titulo:"📡 O que representa o Radar de Aderência?",
objetivo:"Demonstrar visualmente o nível de contribuição institucional para cada Objetivo do Desenvolvimento Sustentável.",
interpretacao:"Quanto mais distante do centro estiver cada eixo, maior é a aderência institucional.",
decisao:"Identificar rapidamente quais ODS necessitam de fortalecimento.",
fonte:"Agenda 2030 • ONU • IA-CHAP."
},
MaturidadeODS:{
titulo:"📊 O que representa a Maturidade dos ODS?",
objetivo:"Avaliar o estágio de evolução institucional na implementação da Agenda 2030.",
interpretacao:"Os níveis representam a capacidade da organização em incorporar os ODS ao planejamento, execução, monitoramento e avaliação.",
decisao:"Direcionar investimentos para fortalecer a governança climática e institucional.",
fonte:"Modelo CHAP • Governança Pública • OECD • TCU."
},
IA:{
titulo:"🤖 Como funciona a Análise Inteligente?",
objetivo:"Utilizar Inteligência Artificial para apoiar a interpretação dos indicadores monitorados.",
interpretacao:"A IA identifica padrões, tendências, riscos, oportunidades e níveis de aderência aos ODS.",
decisao:"As recomendações servem como apoio ao gestor, sem substituir a análise técnica especializada.",
fonte:"Modelo IA-CHAP • TCERO • Inteligência Analítica."
},
Gantt:{
titulo:"📅 O que representa o Cronograma Gantt?",
objetivo:"Apresentar a programação temporal das ações estratégicas.",
interpretacao:"Cada barra representa a duração prevista de uma atividade. Barras maiores indicam ações contínuas ou de longa duração.",
decisao:"Identificar atrasos, antecipações e conflitos entre atividades estratégicas.",
fonte:"PMBOK • Planejamento Estratégico • Gestão de Projetos."
},
Marcos:{
titulo:"🏁 O que são os Marcos Estratégicos?",
objetivo:"Registrar as principais entregas, eventos e pontos de controle do projeto.",
interpretacao:"Cada marco representa uma entrega importante ou uma etapa decisiva do planejamento.",
decisao:"Permite acompanhar a evolução do projeto e cobrar tempestivamente os responsáveis.",
fonte:"Planejamento Estratégico • TCERO • CBMRO • SEDAM."
}
}

/*=========================================================
005 QUEIMADAS RENDER INFO PAINEL
=========================================================*/
function renderInfoPainel(id,chave){
let box=document.getElementById(id)
if(!box)return
let i=infoPaineis[chave]
if(!i)return
box.innerHTML=`
<details class="infoPainel">
<summary>${i.titulo}</summary>
<p><b>Objetivo:</b> ${i.objetivo}</p>
<p><b>Como interpretar:</b> ${i.interpretacao}</p>
<p><b>Tomada de decisão:</b> ${i.decisao}</p>
<div class="fonte-card">
<b>Fonte metodológica:</b><br>
${i.fonte}
</div>
</details>
`
}
function renderInfoPaineis(){
renderInfoPainel("infoPlanoUnificado","PlanoUnificado")
renderInfoPainel("infoPlanoSedam","PlanoSedam")
renderInfoPainel("infoPlanoCBM","PlanoCBM")
renderInfoPainel("infoCadeiaValor","CadeiaValor")
renderInfoPainel("infoTeoriaMudanca","TeoriaMudanca")
renderInfoPainel("infoODS","ODS")
renderInfoPainel("infoODSEvidencias","ODSEvidencias")
renderInfoPainel("infoRadarODS","RadarODS")
renderInfoPainel("infoMaturidadeODS","MaturidadeODS")
renderInfoPainel("infoIA","IA")
renderInfoPainel("infoGantt","Gantt")
renderInfoPainel("infoMarcos","Marcos")
}
/*=========================================================
004 QUEIMADAS FUNCTION RENDERCADEIAVALOR
=========================================================*/
async function renderCadeiaValor(){

let box=document.getElementById('painelCadeiaValor')
if(!box)return

let[
{data:monitoramento=[]},
{data:mapbiomas=[]},
{data:prodes=[]}
]=await Promise.all([
client.from('queimadas_monitoramento').select('*'),
client.from('queimadas_mapbiomas').select('*'),
client.from('queimadas_prodes').select('*')
])

let total=(monitoramento||[]).length

let andamento=(monitoramento||[])
.filter(i=>Number(i.percentual||0)>0).length

let concluidos=(monitoramento||[])
.filter(i=>Number(i.percentual||0)>=100).length

let areaQueimada=(mapbiomas||[])
.reduce((s,i)=>s+Number(i.area_queimada||i.area||0),0)

let areaDesmatada=(prodes||[])
.reduce((s,i)=>s+Number(i.area_desmatada||i.area||0),0)

/*=========================================================
004 QUEIMADAS FUNCTION RENDERCADEIAVALOR
=========================================================*/
async function renderCadeiaValor(){

let box=document.getElementById('painelCadeiaValor')
if(!box)return

let[
{data:monitoramento=[]},
{data:mapbiomas=[]},
{data:prodes=[]}
]=await Promise.all([
client.from('queimadas_monitoramento').select('*'),
client.from('queimadas_mapbiomas').select('*'),
client.from('queimadas_prodes').select('*')
])

let total=(monitoramento||[]).length

let andamento=(monitoramento||[])
.filter(i=>Number(i.percentual||0)>0).length

let concluidos=(monitoramento||[])
.filter(i=>Number(i.percentual||0)>=100).length

let areaQueimada=(mapbiomas||[])
.reduce((s,i)=>s+Number(i.area_queimada||i.area||0),0)

let areaDesmatada=(prodes||[])
.reduce((s,i)=>s+Number(i.area_desmatada||i.area||0),0)

box.innerHTML=`

<div class="cadeia-card">

<div class="cadeia-item">
CADEIA DE VALOR DO ENFRENTAMENTO ÀS QUEIMADAS E AO DESMATAMENTO
</div>

<div class="cadeia-flow">

<div class="cadeia-box cadeia-insumo">

<div class="titulo-etapa">
INSUMOS
</div>

📥<br>

<b>Recursos</b><br>
Equipes<br>
Sistemas<br>
Infraestrutura

</div>

<div class="cadeia-seta">➜</div>

<div class="cadeia-box cadeia-atividade">

<div class="titulo-etapa">
ATIVIDADES
</div>

⚙️<br>

<b>${formatarNumero(total)}</b><br>

Ações Planejadas

</div>

<div class="cadeia-seta">➜</div>

<div class="cadeia-box cadeia-produto">

<div class="titulo-etapa">
PRODUTOS
</div>

📦<br>

<b>${formatarNumero(andamento)}</b><br>

Ações Executadas

</div>

<div class="cadeia-seta">➜</div>

<div class="cadeia-box cadeia-resultado">

<div class="titulo-etapa">
RESULTADOS
</div>

📈<br>

<b>${formatarNumero(concluidos)}</b><br>

Ações Concluídas

</div>

<div class="cadeia-seta">➜</div>

<div class="cadeia-box cadeia-impacto">

<div class="titulo-etapa">
IMPACTOS
</div>

🔥<br>

<b>${formatarNumero(areaQueimada)} ha</b><br>
Área Queimada

<hr style="margin:8px 0;border:none;border-top:1px solid rgba(0,0,0,.12)">

🌳<br>

<b>${formatarNumero(areaDesmatada)} ha</b><br>
Área Desmatada

</div>

<div class="cadeia-seta">➜</div>

<div class="cadeia-box cadeia-beneficio">

<div class="titulo-etapa">
BENEFÍCIOS
</div>

🌎<br>

<b>Proteção Ambiental</b><br>

Preservação da biodiversidade<br>
Melhoria da qualidade do ar<br>
Redução das emissões<br>
Maior segurança da população

</div>

</div>

<div class="fontePainel">
<b>Fonte metodológica:</b>
Referencial Básico de Governança (TCU);
Cadeia de Valor para Políticas Públicas (Banco Mundial);
INTOSAI GOV 9130;
OECD Public Governance Framework.
</div>

</div>

`
}
}
/*=========================================================
005 QUEIMADAS FUNCTION RENDERGANTT
=========================================================*/
async function renderGantt(){
let box=document.getElementById('painelGantt')
if(!box)return
let{data=[],error}=await client
.from('queimadas_planejamento')
.select('*')
.order('inicio',{ascending:true})
if(error){
box.innerHTML='Erro ao carregar cronograma.'
return
}
let hoje=new Date()
let mesAtual=hoje.getMonth()+1
let meses=['JAN','FEV','MAR','ABR','MAI','JUN','JUL','AGO','SET','OUT','NOV','DEZ']
let html='<div class="gantt-header"><div>AÇÃO</div>'
meses.forEach(m=>html+=`<div>${m}</div>`)
html+='</div>'
;(data||[]).forEach(i=>{
let ini=i.inicio?new Date(i.inicio):null
let fim=i.fim?new Date(i.fim):null
let mi=ini&&!isNaN(ini.getTime())?ini.getMonth()+1:1
let mf=fim&&!isNaN(fim.getTime())?fim.getMonth()+1:12
let status=String(i.status||'').toUpperCase()
if(status==='CONTINUO'||status==='CONTÍNUO'){
mi=1
mf=12
}
if(status==='EXECUCAO'||status==='EXECUÇÃO'){
mi=Math.min(mi,mesAtual)
mf=Math.max(mf,mesAtual)
}
html+='<div class="gantt-linha">'
html+=`<div class="gantt-nome">${i.acao||'-'}<br><span class="gantt-responsavel">${i.responsavel||''}</span></div>`
for(let m=1;m<=12;m++){
if(m>=mi&&m<=mf){
html+=`<div class="gantt-barra" style="background:${i.cor||'#2563eb'}">${m===mf?(i.status||''):''}</div>`
}else{
html+='<div class="gantt-vazio"></div>'
}
}
html+='</div>'
})
html+='<div class="fonte-card">Fonte: Planejamento Estratégico • SEDAM • CBMRO • TCERO • MAPBIOMAS • PRODES</div>'
box.innerHTML=html
}
/*=========================================================
006 QUEIMADAS FUNCTION RENDERMATRIZRISCO5X5
=========================================================*/
async function renderMatrizRisco5x5(){
let box=document.getElementById('painelMatriz5x5')||document.getElementById('painelRiscos')
if(!box)return
let[{data:riscos=[]},{data:mapbiomas=[]},{data:prodes=[]}]=await Promise.all([
client.from('queimadas_riscos').select('*'),
client.from('queimadas_mapbiomas').select('*'),
client.from('queimadas_prodes').select('*')
])
let matriz={}
for(let i=1;i<=5;i++){
for(let j=1;j<=5;j++){
matriz[`${i}_${j}`]=[]
}
}
;(riscos||[]).forEach(r=>{
let p=Math.min(5,Math.max(1,Number(r.probabilidade||1)))
let imp=Math.min(5,Math.max(1,Number(r.impacto||1)))
matriz[`${p}_${imp}`].push(r)
})
let html='<div class="matriz5x5">'
for(let y=5;y>=1;y--){
for(let x=1;x<=5;x++){
let score=x*y
let classe='risco-baixo'
if(score>=20){
classe='risco-critico'
}else if(score>=12){
classe='risco-alto'
}else if(score>=6){
classe='risco-medio'
}
html+=`<div class="${classe}">`
html+=matriz[`${x}_${y}`].map(r=>`
<div class="risco-tag">
🔥 ${r.fonte_calor||r.municipio||''}
<br>
${r.risco||r.descricao||''}
</div>`).join('')
html+='</div>'
}
}
html+='</div>'
html+=`<div class="fonte-card">Fonte: Matriz de Riscos • MAPBIOMAS (${formatarNumero(mapbiomas.length)} registros) • PRODES (${formatarNumero(prodes.length)} registros)</div>`
box.innerHTML=html
}
/*=========================================================
007 QUEIMADAS FUNCTION RENDERTEORIAMUDANCA
=========================================================*/
async function renderTeoriaMudanca(){

let box=document.getElementById('painelTeoriaMudanca')
if(!box)return

let[
{data:monitoramento=[]},
{data:mapbiomas=[]},
{data:prodes=[]}
]=await Promise.all([
client.from('queimadas_monitoramento').select('*'),
client.from('queimadas_mapbiomas').select('*'),
client.from('queimadas_prodes').select('*')
])

let total=monitoramento.length

let executadas=monitoramento.filter(i=>
Number(i.percentual||0)>0
).length

let concluidos=monitoramento.filter(i=>
Number(i.percentual||0)>=100
).length

let areaQueimada=mapbiomas.reduce((s,i)=>
s+Number(i.area_queimada||i.area||0),0)

let areaDesmatada=prodes.reduce((s,i)=>
s+Number(i.area_desmatada||i.area||0),0)

box.innerHTML=`

<div class="cadeia-card">

<div class="cadeia-item">
TEORIA DA MUDANÇA — QUEIMADAS E DESMATAMENTO
</div>

<div class="cadeia-flow">

<div class="cadeia-box tdm-problema">

🚨<br>

<b>PROBLEMA</b><br>

Queimadas<br>

Desmatamento

</div>

<div class="cadeia-seta">➜</div>

<div class="cadeia-box tdm-causa">

🔎<br>

<b>CAUSAS</b><br>

Pressão Antrópica<br>

Uso Irregular do Solo<br>

Mudanças Climáticas

</div>

<div class="cadeia-seta">➜</div>

<div class="cadeia-box tdm-acao">

⚙️<br>

<b>${formatarNumero(total)}</b><br>

Ações Planejadas

</div>

<div class="cadeia-seta">➜</div>

<div class="cadeia-box tdm-produto">

📦<br>

<b>${formatarNumero(executadas)}</b><br>

Ações Executadas

</div>

<div class="cadeia-seta">➜</div>

<div class="cadeia-box tdm-resultado">

📈<br>

<b>${formatarNumero(concluidos)}</b><br>

Ações Concluídas

</div>

<div class="cadeia-seta">➜</div>

<div class="cadeia-box tdm-impacto">

🔥<br>

<b>${formatarNumero(areaQueimada)} ha</b><br>

Área Queimada

<hr style="margin:10px 0;border:none;border-top:1px solid rgba(0,0,0,.12)">

🌳<br>

<b>${formatarNumero(areaDesmatada)} ha</b><br>

Área Desmatada

</div>

<div class="cadeia-seta">➜</div>

<div class="cadeia-box tdm-beneficio">

🌎<br>

<b>BENEFÍCIOS</b><br><br>

✔ Proteção Ambiental<br>

✔ Conservação da Biodiversidade<br>

✔ Redução das Emissões Atmosféricas<br>

✔ Melhoria da Qualidade do Ar<br>

✔ Maior Segurança da População<br>

✔ Fortalecimento da Governança

</div>

</div>

<div class="fontePainel">

<b>Fonte metodológica:</b>

Theory of Change (UNDP); OECD Public Governance; Banco Mundial; Referencial de Avaliação de Políticas Públicas do TCU.

</div>

</div>

`

}
/*=========================================================
008 QUEIMADAS FUNCTION ANALISARCHAPIA
=========================================================*/
function analisarCHAPIA(registro){
let diagnostico=[]
let ods=[]
let riscos=[]
if(!registro.insumo)diagnostico.push('Conhecimento insuficiente.')
if(!registro.atividade)diagnostico.push('Habilidade operacional não demonstrada.')
if(!registro.produto)diagnostico.push('Produto estratégico não identificado.')
if(!registro.resultado)diagnostico.push('Resultado esperado não definido.')
if(!registro.impacto)diagnostico.push('Impacto social não definido.')
let texto=JSON.stringify(registro||{}).toLowerCase()
if(texto.includes('queimada')||texto.includes('incendio')){
ods.push('ODS 13')
ods.push('ODS 15')
riscos.push('Eventos climáticos extremos')
}
if(texto.includes('desmatamento')){
ods.push('ODS 15')
riscos.push('Perda de cobertura florestal')
}
if(texto.includes('fiscalizacao')||texto.includes('fiscalização')){
ods.push('ODS 16')
riscos.push('Baixa capacidade operacional')
}
if(texto.includes('brigada')||texto.includes('brigadista')){
ods.push('ODS 15')
riscos.push('Déficit de pessoal especializado')
}
return{
score:Math.max(0,100-(diagnostico.length*15)),
diagnostico:[...new Set(diagnostico)],
ods:[...new Set(ods)],
riscos:[...new Set(riscos)]
}
}
/*=========================================================
009 QUEIMADAS FUNCTION CARREGARKPISEXECUTIVOS
=========================================================*/
async function carregarKPIsExecutivos(){
let hoje=new Date()
let dataFinal=`${hoje.getFullYear()}-${String(hoje.getMonth()+1).padStart(2,'0')}-${String(hoje.getDate()).padStart(2,'0')}`
let dataFinalBR=hoje.toLocaleDateString('pt-BR')
let[{data:exec},{data:mapbiomas=[]},{data:prodes=[]},{count:totalFocosINPE,error:erroFocosINPE}]=await Promise.all([
client.from('vw_queimadas_executivo').select('*').single(),
client.from('queimadas_mapbiomas').select('*'),
client.from('queimadas_prodes').select('*'),
client.from('queimadas_focos_inpe').select('id',{count:'exact',head:true}).gte('data_foco','2026-01-01').lte('data_foco',dataFinal)
])
if(!exec)return
if(erroFocosINPE){
console.error('Erro ao calcular focos do INPE:',erroFocosINPE)
totalFocosINPE=0
}
let areaQueimada=mapbiomas.reduce((s,i)=>s+Number(i.area_queimada_hectares||i.area_queimada||i.area||0),0)
let areaDesmatada=prodes.reduce((s,i)=>s+Number(i.desmatamento_hectares||i.area_desmatada||i.area||0),0)
document.getElementById('painelKPIs').innerHTML=`
<div class="kpiGrid">
<div class="kpiCard">
<div class="kpiNumero">${Number(totalFocosINPE||0).toLocaleString('pt-BR')}</div>
<div class="kpiTitulo">🔥 FOCOS DE CALOR</div>
<div style="margin-top:6px;font-size:11px;font-weight:800;color:#64748b">01/01/2026 até ${dataFinalBR}</div>
</div>
<div class="kpiCard">
<div class="kpiNumero">${areaDesmatada.toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2})}</div>
<div class="kpiTitulo">🌳 DESMATAMENTO 2021-2025 (ha)</div>
</div>
<div class="kpiCard">
<div class="kpiNumero">${areaQueimada.toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2})}</div>
<div class="kpiTitulo">🔥 ÁREA QUEIMADA 2021-2025 (ha)</div>
</div>
<div class="kpiCard kpiCardPequeno">
<div class="kpiNumero">${exec.municipios_criticos||0}</div>
<div class="kpiTitulo">🚨 CRÍTICOS</div>
</div>
<div class="kpiCard kpiCardPequeno">
<div class="kpiNumero">${exec.municipios_prioritarios||0}</div>
<div class="kpiTitulo">⚠️ PRIORITÁRIOS</div>
</div>
<div class="kpiCard kpiCardPequeno">
<div class="kpiNumero">${Number(exec.iriq_estadual||0).toFixed(2)}</div>
<div class="kpiTitulo">🤖 IRIQ ESTADUAL</div>
</div>
</div>`
}
/*=========================================================
010 QUEIMADAS FUNCTION RENDERPLANOUNIFICADO
=========================================================*/
function renderPlanoUnificado(){
let box=document.getElementById('painelPlanoUnificado')
if(!box)return
box.innerHTML=`
<ul>
<li>Monitoramento de Áreas Queimadas - MAPBIOMAS</li>
<li>Monitoramento de Desmatamento - PRODES</li>
<li>Fiscalização Ambiental Integrada</li>
<li>Prevenção e Combate às Queimadas</li>
<li>Resposta Operacional CBMRO</li>
<li>Monitoramento de Focos de Calor INPE</li>
<li>Capacitação de Brigadistas</li>
<li>Monitoramento dos Municípios Prioritários</li>
<li>Acompanhamento da Execução Física e Financeira</li>
<li>Monitoramento CEPCIF</li>
<li>POTIF 2026</li>
<li>Plano Unificado TCE-RO 2026</li>
</ul>`
}
/*=========================================================
011 QUEIMADAS FUNCTION RENDERPLANOSEDAM
=========================================================*/
async function renderPlanoSedam(){
let box=document.getElementById('painelPlanoSedam')
if(!box)return

let[
{data:planejamento=[]},
{data:mapbiomas=[]},
{data:prodes=[]}
]=await Promise.all([
client.from('queimadas_planejamento').select('*').ilike('responsavel','%SEDAM%'),
client.from('queimadas_mapbiomas').select('*'),
client.from('queimadas_prodes').select('*')
])

let areaQueimada=mapbiomas.reduce((s,i)=>s+Number(i.area_queimada||i.area||0),0)
let areaDesmatada=prodes.reduce((s,i)=>s+Number(i.area_desmatada||i.area||0),0)

let etapas=[
{titulo:'🌳 PREVENÇÃO',dados:planejamento[0]},
{titulo:'🚔 FISCALIZAÇÃO',dados:planejamento[1]},
{titulo:'🛰 MONITORAMENTO',dados:planejamento[2]},
{titulo:'🌱 RECUPERAÇÃO AMBIENTAL',dados:planejamento[3]}
]

let html='<div class="cadeia-card">'
html+='<div class="cadeia-item">PLANO DE AÇÃO SEDAM 2026</div>'
html+='<div class="cadeia-flow">'

etapas.forEach(e=>{
html+=`
<div class="cadeia-box cadeia-insumo" style="border-top:5px solid ${e.dados?.cor||'#16a34a'}">
<b>${e.titulo}</b><br>
<span class="periodo-plano">${e.dados?formatarDataBR(e.dados.inicio)+' até '+formatarDataBR(e.dados.fim):'-'}</span><br>
<span class="responsavel-plano">${e.dados?.responsavel||'SEDAM'}</span><br>
<span class="status-plano">${e.dados?.status||''}</span>
</div>`
})

html+=`
<div class="cadeia-box cadeia-impacto">
🔥<br>
<b>${formatarNumero(areaQueimada)} ha</b><br>
Área Queimada<br>
<small>MAPBIOMAS</small>
</div>

<div class="cadeia-box cadeia-beneficio">
🌳<br>
<b>${formatarNumero(areaDesmatada)} ha</b><br>
Área Desmatada<br>
<small>PRODES</small>
</div>

</div>

<div class="fonte-card">
Fonte: Plano de Ação SEDAM • MAPBIOMAS • PRODES • TCERO
</div>

</div>`

box.innerHTML=html
}
/*=========================================================
012 QUEIMADAS FUNCTION RENDERPLANOCBM
=========================================================*/
async function renderPlanoCBM(){

let box=document.getElementById('painelPlanoCBM')
if(!box)return

let {data=[]}=await client
.from('queimadas_planejamento')
.select('*')
.ilike('responsavel','%CBMRO%')

let etapas=[
{titulo:'🚒 PREPARAÇÃO',dados:data[0]},
{titulo:'🛡 PREVENÇÃO',dados:data[1]},
{titulo:'🔥 COMBATE',dados:data[2]},
{titulo:'🚿 RESCALDO',dados:data[3]},
{titulo:'🌳 PRESERVAÇÃO',dados:data[4]},
{titulo:'👨‍🚒 PROTEÇÃO DA POPULAÇÃO',dados:data[5]}
]

let html='<div class="cadeia-card">'
html+='<div class="cadeia-item">POTIF 2026 - CBMRO</div>'
html+='<div class="cadeia-flow">'

etapas.forEach(e=>{
html+=`
<div class="cadeia-box cadeia-insumo" style="border-top:5px solid ${e.dados?.cor||'#dc2626'}">
<b>${e.titulo}</b><br>
<span class="periodo-plano">${e.dados?formatarDataBR(e.dados.inicio)+' até '+formatarDataBR(e.dados.fim):'-'}</span><br>
<span class="responsavel-plano">${e.dados?.responsavel||'CBMRO'}</span><br>
<span class="status-plano">${e.dados?.status||''}</span>
</div>`
})

html+=`
</div>

<div class="fonte-card">
Fonte: POTIF 2026 • Corpo de Bombeiros Militar de Rondônia • TCERO
</div>

</div>`

box.innerHTML=html
}
/*=========================================================
013 QUEIMADAS FUNCTION RENDERMARCOS
=========================================================*/
async function renderMarcos(){
let box=document.getElementById('painelMarcos')
if(!box)return
let{data=[]}=await client.from('queimadas_planejamento').select('*').order('inicio',{ascending:true})
/*=========================================================
LINHA DO TEMPO GLOBAL
=========================================================*/
const menorData=new Date(Math.min(...data.map(i=>new Date(i.inicio))))
const maiorData=new Date(Math.max(...data.map(i=>new Date(i.fim))))
const periodoTotal=maiorData-menorData
let html='<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(340px,1fr));gap:16px">'
data.forEach(i=>{

let corStatus='#64748b'

if((i.status||'').toUpperCase()==='CONTÍNUO')corStatus='#16a34a'
else if((i.status||'').toUpperCase()==='EM EXECUÇÃO')corStatus='#2563eb'
else if((i.status||'').toUpperCase()==='PLANEJADO')corStatus='#f97316'
else if((i.status||'').toUpperCase()==='ATRASADO')corStatus='#dc2626'

let responsavel=(i.responsavel||'').toUpperCase()
let inicio=new Date(i.inicio)
let fim=new Date(i.fim)
let inicioPerc=((inicio-menorData)/periodoTotal)*100
let fimPerc=((fim-menorData)/periodoTotal)*100
let largura=Math.max(2,fimPerc-inicioPerc)
let corCabecalho='#475569'
let tituloResponsavel='RESPONSÁVEL'

if(responsavel.includes('CBMRO')){
corCabecalho='#dc2626'
tituloResponsavel='CBMRO'
}else if(responsavel.includes('SEDAM')){
corCabecalho='#16a34a'
tituloResponsavel='SEDAM'
}

html+=`
<div style="background:#fff;border-radius:18px;overflow:hidden;box-shadow:0 6px 16px rgba(0,0,0,.10);border:1px solid #e5e7eb">

<div style="background:${corCabecalho};color:#fff;padding:10px 16px;font-size:14px;font-weight:900;text-align:center">
${tituloResponsavel}
</div>

<div style="padding:18px">

<div style="font-size:18px;font-weight:900;color:#0f172a">
${i.acao||'-'}
</div>

<div style="margin-top:10px;font-size:13px;font-weight:800;color:#475569">
📅 ${formatarDataBR(i.inicio)} até ${formatarDataBR(i.fim)}
</div>

<div style="margin-top:10px">
<b>Status:</b>
<span style="color:${corStatus};font-weight:900">
${i.status||'-'}
</span>
</div>

<div style="margin-top:8px">
<b>Responsável:</b>
${i.responsavel||'-'}
</div>

<div style="margin-top:18px">

<div style="
display:flex;
justify-content:space-between;
font-size:10px;
font-weight:800;
color:#64748b;
margin-bottom:6px">

<span>CRONOGRAMA</span>

<span>
${formatarDataBR(menorData)}
&nbsp;&nbsp;→&nbsp;&nbsp;
${formatarDataBR(maiorData)}
</span>

</div>

<div style="
position:relative;
height:12px;
background:#e5e7eb;
border-radius:30px;
overflow:hidden">

<div style="
position:absolute;
left:${inicioPerc}%;
width:${largura}%;
height:100%;
background:${corCabecalho};
border-radius:30px">
</div>

</div>

<div style="
display:flex;
justify-content:space-between;
font-size:10px;
color:#64748b;
margin-top:6px">

<span>${formatarDataBR(i.inicio)}</span>

<span>${formatarDataBR(i.fim)}</span>

</div>

</div>

</div>

</div>`
})
html+='</div>'
box.innerHTML=html
}
/*=========================================================
014 QUEIMADAS FUNCTION RENDEREXECUCAOFISICA
=========================================================*/
async function renderExecucaoFisica(){
let box=document.getElementById('painelExecucaoFisica')
if(!box)return
let{data=[]}=await client.from('queimadas_monitoramento').select('*')
let total=data.length
let soma=data.reduce((s,i)=>s+Number(i.percentual||0),0)
let media=total?Math.round(soma/total):0
let concluidos=data.filter(i=>Number(i.percentual||0)>=100).length
box.innerHTML=`
<div class="impacto-box">
<div class="impacto-score">${media}%</div>
<div class="impacto-label">EXECUÇÃO FÍSICA MÉDIA</div>
<div style="margin-top:10px">${formatarNumero(concluidos)} ações concluídas de ${formatarNumero(total)}</div>
</div>`
}
/*=========================================================
015 QUEIMADAS FUNCTION RENDEREXECUCAOFINANCEIRA
=========================================================*/
async function renderExecucaoFinanceira(){
let box=document.getElementById('painelExecucaoFinanceira')
if(!box)return
let{data=[]}=await client.from('queimadas_monitoramento').select('*')
let total=data.reduce((s,i)=>s+Number(i.valor_executado||i.valor||0),0)
let planejado=data.reduce((s,i)=>s+Number(i.valor_planejado||0),0)
let perc=planejado>0?((total/planejado)*100):0
box.innerHTML=`
<div class="impacto-box">
<div class="impacto-score">R$ ${total.toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2})}</div>
<div class="impacto-label">EXECUÇÃO FINANCEIRA</div>
<div style="margin-top:10px">${perc.toFixed(1)}% do valor planejado</div>
</div>`
}
/*=========================================================
016 QUEIMADAS FUNCTION RENDERMUNICIPIOSPRIORITARIOS
=========================================================*/
async function renderMunicipiosPrioritarios(){
let box=document.getElementById('painelMunicipiosPrioritarios')
if(!box)return
let[{data:ranking=[]},{data:mapbiomas=[]},{data:prodes=[]}]=await Promise.all([
client.from('vw_queimadas_ranking_estadual').select('*'),
client.from('queimadas_mapbiomas').select('*'),
client.from('queimadas_prodes').select('*')
])
let lista=[...(ranking||[])]
.sort((a,b)=>
Number(b.indice_final||b.iriq||0)-
Number(a.indice_final||a.iriq||0)
)
.slice(0,10)
let html='<div class="ranking-grid">'
lista.forEach((m,idx)=>{
let score=Number(m.indice_final||m.iriq||0)
let cor='#16a34a'
let classe='BAIXO'
if(score>=75){cor='#dc2626';classe='CRÍTICO'}
else if(score>=50){cor='#f97316';classe='ALTO'}
else if(score>=25){cor='#facc15';classe='MODERADO'}
html+=`
<div class="ranking-card">
<div class="ranking-posicao">${idx+1}º</div>
<div class="ranking-municipio">${m.municipio||'-'}</div>
<div class="ranking-info">Classificação: <span style="color:${cor};font-weight:900">${classe}</span></div>
<div class="ranking-info">🤖 IRIQ: ${Number(score).toFixed(2)}</div>
<div class="ranking-info">🔥 Área Queimada: ${formatarNumero(m.area_queimada_hectares||m.area_queimada_ha||m.area_queimada||0)} ha</div>
<div class="ranking-info">🌳 Desmatamento: ${formatarNumero(m.desmatamento_hectares||m.desmatamento_ha||m.area_desmatada||0)} ha</div>
</div>`
})
html+='</div>'
html+=`<div class="fonte-card">Fonte: MAPBIOMAS (Áreas Queimadas 2021-2025 • ${formatarNumero(mapbiomas.length)} registros) • PRODES (Desmatamento 2021-2025 • ${formatarNumero(prodes.length)} registros) • Ranking Ambiental Estadual</div>`
html+=`
<div class="fonte-card" style="font-size:10px;line-height:1.4">
<b>Metodologia IRIQ Estadual:</b><br>
IRIQ = (Risco × 30%) + (CHAP × 10%) + (Área Queimada Normalizada × 35%) + (Desmatamento Normalizado × 25%).<br>
A normalização utiliza o maior valor estadual observado no período 2021-2025, atribuindo 100 pontos ao município de maior impacto e calculando proporcionalmente os demais municípios.<br><br>
<b>Classificação HeatMap Estadual:</b><br>
🔴 Crítico: IRIQ ≥ 75<br>
🟠 Alto: IRIQ de 50 a 74,99<br>
🟡 Moderado: IRIQ de 25 a 49,99<br>
🟢 Baixo: IRIQ abaixo de 25<br><br>
<b>Fontes:</b> INPE (Focos de Calor), MAPBIOMAS (Áreas Queimadas 2021-2025), PRODES (Desmatamento 2021-2025), CHAP e Painéis de Monitoramento TCE-RO.
</div>`  
box.innerHTML=html
}
/*=========================================================
017 QUEIMADAS FUNCTION RENDERHEATMAPEXECUTIVO
=========================================================*/
async function renderHeatMapExecutivo(){
let box=document.getElementById('painelHeatMapExecutivo')
if(!box)return
let{data=[]}=await client.from('vw_queimadas_ranking_estadual').select('*')
let critico=data.filter(i=>Number(i.indice_final||i.iriq||0)>=75).length
let alto=data.filter(i=>Number(i.indice_final||i.iriq||0)>=50&&Number(i.indice_final||i.iriq||0)<75).length
let moderado=data.filter(i=>Number(i.indice_final||i.iriq||0)>=25&&Number(i.indice_final||i.iriq||0)<50).length
let baixo=data.filter(i=>Number(i.indice_final||i.iriq||0)<25).length
box.innerHTML=`
<div class="heatmap-grid-mini">
<div class="heat-vermelho"><div style="font-size:26px;font-weight:900">${critico}</div><div>CRÍTICO</div><div>75-100</div></div>
<div class="heat-laranja"><div style="font-size:26px;font-weight:900">${alto}</div><div>ALTO</div><div>50-74</div></div>
<div class="heat-amarelo"><div style="font-size:26px;font-weight:900">${moderado}</div><div>MODERADO</div><div>25-49</div></div>
<div class="heat-verde"><div style="font-size:26px;font-weight:900">${baixo}</div><div>BAIXO</div><div>0-24</div></div>
</div>
<div class="fonte-card">Fonte: IRIQ Ambiental • MAPBIOMAS • PRODES • CHAP</div>`
}
/*=========================================================
018 QUEIMADAS FUNCTION RENDERCEPCIFAVANCADO
=========================================================*/
async function renderCEPCIFAvancado(){
let box=document.getElementById('painelCEPCIF')
if(!box)return
let{data=[]}=await client.from('queimadas_monitoramento').select('*')
let total=data.length
let concluidos=data.filter(i=>Number(i.percentual||0)>=100).length
let andamento=data.filter(i=>Number(i.percentual||0)>0&&Number(i.percentual||0)<100).length
let pendentes=data.filter(i=>Number(i.percentual||0)<=0).length
let execucao=total?Math.round((concluidos/total)*100):0
box.innerHTML=`
<div class="chap-grid">
<div class="chap-card"><div class="chap-num">${total}</div><div class="chap-label">AÇÕES CEPCIF</div></div>
<div class="chap-card"><div class="chap-num">${concluidos}</div><div class="chap-label">CONCLUÍDAS</div></div>
<div class="chap-card"><div class="chap-num">${andamento}</div><div class="chap-label">EM ANDAMENTO</div></div>
<div class="chap-card"><div class="chap-num">${pendentes}</div><div class="chap-label">PENDENTES</div></div>
<div class="chap-card"><div class="chap-num">${execucao}%</div><div class="chap-label">EXECUÇÃO</div></div>
</div>`
}
/*=========================================================
019 QUEIMADAS FUNCTION RENDERMONITORAMENTO4D
=========================================================*/
async function renderMonitoramento4D(){
let box=document.getElementById('painelMonitoramento4D')
if(!box)return
let{data=[]}=await client.from('queimadas_monitoramento_4d').select('*')
let html=''
data.forEach(i=>{
html+=`
<div class="monitor4d-card">
<div><b>${i.municipio||i.orgao||'-'}</b></div>
<div class="monitor4d-grid">
<div class="monitor4d-kpi execucao">Execução<br>${Number(i.execucao||0).toFixed(0)}%</div>
<div class="monitor4d-kpi resultado">Resultado<br>${Number(i.resultado||0).toFixed(0)}%</div>
<div class="monitor4d-kpi impacto">Impacto<br>${Number(i.impacto||0).toFixed(0)}%</div>
<div class="monitor4d-kpi risco">Risco<br>${Number(i.risco||0).toFixed(0)}%</div>
</div>
</div>`
})
box.innerHTML=html
}
/*=========================================================
020 QUEIMADAS FUNCTION RENDERPOTIFAVANCADO
=========================================================*/
async function renderPOTIFAvancado(){
let box=document.getElementById('painelOVRPOTIF')
if(!box)return
let{data=[]}=await client.from('queimadas_acoes_cbm').select('*')
let total=data.length
let executadas=data.filter(i=>['CONCLUÍDO','CONCLUIDO','FINALIZADO'].includes(String(i.status||'').toUpperCase())).length
let andamento=data.filter(i=>['EM EXECUÇÃO','EM EXECUCAO','ANDAMENTO'].includes(String(i.status||'').toUpperCase())).length
let percentual=total?Math.round((executadas/total)*100):0
box.innerHTML=`
<div class="chap-grid">
<div class="chap-card"><div class="chap-num">${total}</div><div class="chap-label">AÇÕES POTIF</div></div>
<div class="chap-card"><div class="chap-num">${executadas}</div><div class="chap-label">EXECUTADAS</div></div>
<div class="chap-card"><div class="chap-num">${andamento}</div><div class="chap-label">EM EXECUÇÃO</div></div>
<div class="chap-card"><div class="chap-num">${percentual}%</div><div class="chap-label">EXECUÇÃO</div></div>
</div>`
}
/*=========================================================
021 QUEIMADAS FUNCTION RENDERODS
=========================================================*/
async function renderODS(){
let box=document.getElementById('painelODS')
if(!box)return
let{data=[],error}=await client
.from('queimadas_ods')
.select('*')
.eq('ativo',true)
.order('peso',{ascending:false})
if(error){
box.innerHTML='Erro ao carregar ODS.'
return
}
let html='<div class="cardExecutivo">'
html+='<h2>ODS - OBJETIVOS DE DESENVOLVIMENTO SUSTENTÁVEL</h2>'
html+='<div style="margin-bottom:12px"><select id="odsSelecionada" class="inputPadrao"><option value="">Selecione uma ODS</option>'
data.forEach(o=>{
html+=`<option value="${o.id}">${o.ods} - ${o.descricao||''}</option>`
})
html+='</select></div><div class="ods-grid">'
data.forEach((o,idx)=>{
html+=`
<div class="ods-card" style="border-left:8px solid ${o.cor||'#2563eb'}">
<div style="font-size:26px;font-weight:900">${idx+1}º</div>
<div style="font-size:16px;font-weight:900">${o.ods||''}</div>
<div style="margin-top:6px;font-size:13px">${o.descricao||''}</div>
<div style="margin-top:8px;font-size:12px"><b>Meta:</b> ${o.meta||'-'}</div>
<div style="margin-top:4px;font-size:12px"><b>Indicador:</b> ${o.indicador||'-'}</div>
<div style="margin-top:8px;font-size:14px;font-weight:900;color:${o.cor||'#2563eb'}">ADERÊNCIA IA: ${Number(o.peso||0).toFixed(0)}%</div>
<div style="margin-top:8px;font-size:11px;color:#475569">${o.justificativa||''}</div>
</div>`
})
html+='</div><div class="fonte-card">Fonte: Agenda 2030 • ONU • MAPBIOMAS • PRODES • IA-CHAP</div></div>'
box.innerHTML=html
}
/*=========================================================
022 QUEIMADAS FUNCTION RECALCULARODSIA
=========================================================*/
async function recalcularODSIA(){
let[{data:ranking=[]},{data:chap=[]},{data:monitoramento=[]},{data:mapbiomas=[]},{data:prodes=[]}]=await Promise.all([
client.from('vw_queimadas_ranking_estadual').select('*'),
client.from('queimadas_chap').select('*'),
client.from('queimadas_monitoramento').select('*'),
client.from('queimadas_mapbiomas').select('*'),
client.from('queimadas_prodes').select('*')
])
let mediaCriticidade=ranking.length?ranking.reduce((s,i)=>s+Number(i.indice_final||0),0)/ranking.length:0
let mediaChap=chap.length?chap.reduce((s,i)=>s+Number(i.resultado||0),0)/chap.length:0
let concluidos=monitoramento.filter(i=>Number(i.percentual||0)>=100).length
let desempenho=monitoramento.length?(concluidos/monitoramento.length)*100:0
let areaQueimada=mapbiomas.reduce((s,i)=>s+Number(i.area_queimada||i.area||0),0)
let areaDesmatada=prodes.reduce((s,i)=>s+Number(i.area_desmatada||i.area||0),0)
let pressao=Math.min(100,(areaQueimada*0.0001)+(areaDesmatada*0.0001)+mediaCriticidade)
let peso13=Math.min(100,(pressao*0.50)+(mediaChap*0.30)+(desempenho*0.20))
let peso15=Math.min(100,(pressao*0.40)+(mediaChap*0.40)+(desempenho*0.20))
let peso16=Math.min(100,(desempenho*0.70)+(mediaChap*0.30))
let peso11=Math.min(100,(mediaCriticidade*0.60)+(desempenho*0.40))
let peso17=Math.min(100,(desempenho*0.80)+(mediaChap*0.20))
await client.from('queimadas_ods').update({peso:peso13}).eq('ods','ODS 13')
await client.from('queimadas_ods').update({peso:peso15}).eq('ods','ODS 15')
await client.from('queimadas_ods').update({peso:peso16}).eq('ods','ODS 16')
await client.from('queimadas_ods').update({peso:peso11}).eq('ods','ODS 11')
await client.from('queimadas_ods').update({peso:peso17}).eq('ods','ODS 17')
}
/*=========================================================
023 QUEIMADAS FUNCTION RECALCULARODSIAAVANCADO
=========================================================*/
async function recalcularODSIAAvancado(){
let[{data:executivo},{data:ranking=[]},{data:chap=[]},{data:riscos=[]},{data:monitoramento=[]},{data:ucs=[]},{data:mapbiomas=[]},{data:prodes=[]}]=await Promise.all([
client.from('vw_queimadas_executivo').select('*').single(),
client.from('vw_queimadas_ranking_estadual').select('*'),
client.from('queimadas_chap').select('*'),
client.from('queimadas_riscos').select('*'),
client.from('queimadas_monitoramento').select('*'),
client.from('queimadas_ucs').select('*'),
client.from('queimadas_mapbiomas').select('*'),
client.from('queimadas_prodes').select('*')
])
let areaQueimada=mapbiomas.reduce((s,i)=>s+Number(i.area_queimada||i.area||0),0)
let areaDesmatada=prodes.reduce((s,i)=>s+Number(i.area_desmatada||i.area||0),0)
let mediaCriticidade=ranking.length?ranking.reduce((s,i)=>s+Number(i.indice_final||0),0)/ranking.length:0
let mediaRisco=riscos.length?riscos.reduce((s,i)=>s+Number(i.nivel_risco||0),0)/riscos.length:0
let mediaChap=chap.length?chap.reduce((s,i)=>s+Number(i.resultado||0),0)/chap.length:0
let concluidos=monitoramento.filter(i=>Number(i.percentual||0)>=100).length
let andamento=monitoramento.filter(i=>Number(i.percentual||0)>0&&Number(i.percentual||0)<100).length
let desempenho=monitoramento.length?(concluidos/monitoramento.length)*100:0
let execucao=monitoramento.length?((concluidos+(andamento*0.5))/monitoramento.length)*100:0
let pressaoAmbiental=Math.min(100,(mediaCriticidade*0.30)+(mediaRisco*0.20)+(areaQueimada*0.00005)+(areaDesmatada*0.00005)+(mediaChap*0.20))
let governanca=Math.min(100,(desempenho*0.50)+(execucao*0.30)+(mediaChap*0.20))
let conservacao=Math.min(100,(ucs.length>=49?100:ucs.length*2))
let parceria=Math.min(100,(governanca*0.60)+(execucao*0.40))
let peso13=Math.min(100,(pressaoAmbiental*0.60)+(governanca*0.20)+(execucao*0.20))
let peso15=Math.min(100,(conservacao*0.50)+(pressaoAmbiental*0.30)+(execucao*0.20))
let peso16=Math.min(100,(governanca*0.70)+(execucao*0.30))
let peso11=Math.min(100,(Number(executivo?.iriq_estadual||0)*0.70)+(execucao*0.30))
let peso17=Math.min(100,(parceria*0.60)+(governanca*0.40))
await client.from('queimadas_ods').update({peso:peso13,resultado:peso13,origem:'IA-CHAP AVANÇADO'}).eq('ods','ODS 13')
await client.from('queimadas_ods').update({peso:peso15,resultado:peso15,origem:'IA-CHAP AVANÇADO'}).eq('ods','ODS 15')
await client.from('queimadas_ods').update({peso:peso16,resultado:peso16,origem:'IA-CHAP AVANÇADO'}).eq('ods','ODS 16')
await client.from('queimadas_ods').update({peso:peso11,resultado:peso11,origem:'IA-CHAP AVANÇADO'}).eq('ods','ODS 11')
await client.from('queimadas_ods').update({peso:peso17,resultado:peso17,origem:'IA-CHAP AVANÇADO'}).eq('ods','ODS 17')
}
/*=========================================================
024 QUEIMADAS FUNCTION RENDERODSEVIDENCIAS
=========================================================*/
async function renderODSEvidencias(){
let box=document.getElementById('painelODSEvidencias')
if(!box)return
let{data=[]}=await client.from('queimadas_ods').select('*').order('peso',{ascending:false})
let html='<div class="cardExecutivo"><h2>ODS X EVIDÊNCIAS E ADERÊNCIA</h2><div class="ods-executivo-grid">'
data.forEach(o=>{
html+=`
<div class="ods-executivo-card" style="border-left-color:${o.cor||'#2563eb'}">
<div class="ods-score">${Number(o.peso||0).toFixed(0)}%</div>
<div class="ods-titulo">${o.ods}</div>
<div class="ods-meta">${o.descricao||''}</div>
<div class="ods-ia">${o.justificativa||''}</div>
<div class="fonte-card">Fonte: MAPBIOMAS • PRODES • IA-CHAP</div>
</div>`
})
html+='</div></div>'
box.innerHTML=html
}
/*=========================================================
025 QUEIMADAS FUNCTION RENDERGRAFICORADARODS
=========================================================*/
async function renderGraficoRadarODS(){
let canvas=document.getElementById('graficoRadarODS')
if(!canvas)return
let{data=[]}=await client.from('queimadas_ods').select('*').order('peso',{ascending:false})
let labels=data.map(i=>i.ods)
let valores=data.map(i=>Number(i.peso||0))
if(window.graficoRadarODSInstance)window.graficoRadarODSInstance.destroy()
window.graficoRadarODSInstance=new Chart(canvas,{
type:'radar',
data:{
labels,
datasets:[{
label:'Aderência Agenda 2030',
data:valores,
fill:true
}]
},
options:{
responsive:true,
maintainAspectRatio:false,
scales:{r:{beginAtZero:true,max:100}}
}
})
}
/*=========================================================
026 QUEIMADAS FUNCTION RENDERODSMATURIDADE
=========================================================*/
async function renderODSMaturidade(){
let box=document.getElementById('painelODSMaturidade')
if(!box)return
let{data=[]}=await client.from('queimadas_ods').select('*')
let media=data.length?data.reduce((s,i)=>s+Number(i.peso||0),0)/data.length:0
let nivel='INICIAL'
if(media>=80)nivel='OTIMIZADO'
else if(media>=60)nivel='GERENCIADO'
else if(media>=40)nivel='ESTRUTURADO'
box.innerHTML=`
<div class="cardExecutivo">
<h2>MATURIDADE ODS</h2>
<div class="chap-num">${media.toFixed(1)}%</div>
<div class="chap-label">${nivel}</div>
<div class="fonte-card">Fonte: MAPBIOMAS • PRODES • IA-CHAP • Agenda 2030</div>
</div>`
}
/*=========================================================
027 QUEIMADAS FUNCTION RENDERODSEXPLICACAOIA
=========================================================*/
async function renderODSExplicacaoIA(){
let box=document.getElementById('painelODSExplicacaoIA')
if(!box)return
let{data=[]}=await client.from('queimadas_ods').select('*').order('peso',{ascending:false}).limit(1)
let ods=data[0]
box.innerHTML=`
<div class="cardExecutivo">
<h2>ANÁLISE IA-CHAP</h2>
<p>A ODS mais aderente ao Projeto Queimadas é <b>${ods?.ods||'-'}</b>, com aderência de <b>${Number(ods?.peso||0).toFixed(1)}%</b>.</p>
<p>${ods?.justificativa||'Análise baseada em indicadores ambientais, governança, monitoramento, MAPBIOMAS, PRODES e IA-CHAP.'}</p>
<div class="fonte-card">Fonte: MAPBIOMAS • PRODES • IA-CHAP • Agenda 2030</div>
</div>`
}
/*=========================================================
028 QUEIMADAS FUNCTION RENDERUCSPRESIDENTE
=========================================================*/
async function renderUCsPresidente(){
let box=document.getElementById('painelUCsPresidente')
if(!box)return
let{data=[]}=await client.from('queimadas_ucs').select('*')
let estaduais=data.filter(i=>String(i.esfera||'').toUpperCase()==='ESTADUAL').length
let federais=data.filter(i=>String(i.esfera||'').toUpperCase()==='FEDERAL').length
let municipais=data.filter(i=>String(i.esfera||'').toUpperCase()==='MUNICIPAL').length
let total=data.length
box.innerHTML=`
<div class="chap-grid">
<div class="chap-card">
<div class="chap-num">${estaduais}</div>
<div class="chap-label">UC ESTADUAIS</div>
</div>
<div class="chap-card">
<div class="chap-num">${federais}</div>
<div class="chap-label">UC FEDERAIS</div>
</div>
<div class="chap-card">
<div class="chap-num">${municipais}</div>
<div class="chap-label">UC MUNICIPAIS</div>
</div>
<div class="chap-card">
<div class="chap-num">${total}</div>
<div class="chap-label">TOTAL UCs</div>
</div>
</div>`
}
/*=========================================================
029 QUEIMADAS FUNCTION RENDERSITUACAOESTRATEGICA
=========================================================*/
async function renderSituacaoEstrategica(){
let box=document.getElementById('painelSalaSituacaoEstadual')
if(!box)return
let{data=[]}=await client.from('vw_queimadas_ranking_estadual').select('*')
let criticos=data.filter(i=>Number(i.indice_final||i.iriq||0)>=75).length
let alto=data.filter(i=>Number(i.indice_final||i.iriq||0)>=50&&Number(i.indice_final||i.iriq||0)<75).length
let moderado=data.filter(i=>Number(i.indice_final||i.iriq||0)>=25&&Number(i.indice_final||i.iriq||0)<50).length
let baixo=data.filter(i=>Number(i.indice_final||i.iriq||0)<25).length
box.innerHTML=`
<div class="chap-grid">
<div class="chap-card"><div class="chap-num">${criticos}</div><div class="chap-label">CRÍTICOS</div></div>
<div class="chap-card"><div class="chap-num">${alto}</div><div class="chap-label">ALTO RISCO</div></div>
<div class="chap-card"><div class="chap-num">${moderado}</div><div class="chap-label">MODERADO</div></div>
<div class="chap-card"><div class="chap-num">${baixo}</div><div class="chap-label">BAIXO</div></div>
</div>`
}
/*=========================================================
030 QUEIMADAS FUNCTION MATRIZRISCO5X5AVANCADA
=========================================================*/
async function matrizRisco5x5Avancada(){
let box=document.getElementById('painelRiscoAvancado')
if(!box)return
let{data=[]}=await client.from('queimadas_riscos').select('*')
let criticos=data.filter(i=>Number(i.nivel_risco||0)>=20).sort((a,b)=>Number(b.nivel_risco||0)-Number(a.nivel_risco||0))
let html='<div class="heatmap-grid">'
criticos.forEach(i=>{
html+=`
<div class="heat-vermelho">
🔥 ${i.fonte_calor||i.municipio||'-'}<br>
${i.risco||i.descricao||'-'}<br>
Nível ${Number(i.nivel_risco||0).toFixed(0)}
</div>`
})
html+='</div>'
box.innerHTML=html
}
/*=========================================================
031 QUEIMADAS FUNCTION IACHAPANALISAR
=========================================================*/
async function iaChapAnalisar(){
let box=document.getElementById('painelIAChap')
if(!box)return
let{data=[]}=await client
.from('queimadas_chap')
.select('*')
.order('resultado',{ascending:false})
box.innerHTML=data.map(i=>{
let score=Math.round((
Number(i.criticidade||0)+
Number(i.historico||0)+
Number(i.abrangencia||0)+
Number(i.prioridade||0)
)/4*20)
return`
<div class="chap-card">
<div class="chap-num">${score}%</div>
<div class="chap-label">${i.municipio||i.orgao||'-'}</div>
</div>`
}).join('')
}
/*=========================================================
032 QUEIMADAS FUNCTION RENDERGOVERNANCA
=========================================================*/
async function renderGovernanca(){
let box=document.getElementById('painelGovernanca')
if(!box)return
let{data=[]}=await client.from('queimadas_monitoramento').select('*')
let total=data.length
let concluidos=data.filter(i=>Number(i.percentual||0)>=100).length
let andamento=data.filter(i=>Number(i.percentual||0)>0&&Number(i.percentual||0)<100).length
let pendentes=data.filter(i=>Number(i.percentual||0)<=0).length
let execucao=total?Math.round((concluidos/total)*100):0
box.innerHTML=`
<div class="chap-grid">
<div class="chap-card"><div class="chap-num">${formatarNumero(total)}</div><div class="chap-label">AÇÕES</div></div>
<div class="chap-card"><div class="chap-num">${concluidos}</div><div class="chap-label">CONCLUÍDAS</div></div>
<div class="chap-card"><div class="chap-num">${andamento}</div><div class="chap-label">EM ANDAMENTO</div></div>
<div class="chap-card"><div class="chap-num">${pendentes}</div><div class="chap-label">PENDENTES</div></div>
<div class="chap-card"><div class="chap-num">${execucao}%</div><div class="chap-label">GOVERNANÇA</div></div>
</div>`
}
/*=========================================================
033 QUEIMADAS FUNCTION RENDEREXECUCAOORCAMENTARIA
=========================================================*/
async function renderExecucaoOrcamentaria(){
let box=document.getElementById('painelOrcamento')
if(!box)return
let{data=[]}=await client.from('queimadas_monitoramento').select('*')
let planejado=data.reduce((s,i)=>s+Number(i.valor_planejado||0),0)
let executado=data.reduce((s,i)=>s+Number(i.valor_executado||i.valor||0),0)
let percentual=planejado>0?((executado/planejado)*100):0
box.innerHTML=`
<div class="impacto-box">
<div class="impacto-score">${percentual.toFixed(1)}%</div>
<div class="impacto-label">EXECUÇÃO ORÇAMENTÁRIA</div>
<div style="margin-top:8px">R$ ${executado.toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2})}</div>
</div>`
}
/*=========================================================
034 QUEIMADAS FUNCTION RENDERCEPCIF
=========================================================*/
async function renderCEPCIF(){
let box=document.getElementById('painelCEPCIF')
if(!box)return
let{data=[]}=await client.from('queimadas_monitoramento').select('*')
let total=data.length
let execucao=total?Math.round(data.reduce((s,i)=>s+Number(i.percentual||0),0)/total):0
box.innerHTML=`
<div class="card-executivo">
<b>CEPCIF</b><br>
Comitê Estadual de Prevenção e Combate aos Incêndios Florestais.<br>
Monitoramento integrado das ações de prevenção, fiscalização, mitigação e resposta.<br><br>
<b>Execução Média:</b> ${execucao}%<br>
<b>Ações Monitoradas:</b> ${total}
</div>`
}
/*=========================================================
035 QUEIMADAS FUNCTION RENDEROVRPOTIF
=========================================================*/
async function renderOVRPOTIF(){
let box=document.getElementById('painelOVRPOTIF')
if(!box)return
let{data=[]}=await client.from('queimadas_acoes_cbm').select('*')
let total=data.length
let executadas=data.filter(i=>['CONCLUÍDO','CONCLUIDO','FINALIZADO'].includes(String(i.status||'').toUpperCase())).length
let percentual=total?Math.round((executadas/total)*100):0
box.innerHTML=`
<div class="card-executivo">
<b>OVR 2026</b><br>
Operação Verde Rondônia.<br><br>
<b>POTIF 2026</b><br>
Plano Operacional de Temporada de Incêndios Florestais.<br><br>
<b>Ações:</b> ${total}<br>
<b>Executadas:</b> ${executadas}<br>
<b>Execução:</b> ${percentual}%
</div>`
}
/*=========================================================
036 QUEIMADAS FUNCTION RENDEREVIDENCIAS
=========================================================*/
async function renderEvidencias(){
let box=document.getElementById('painelEvidencias')
if(!box)return
let{data=[]}=await client.from('queimadas_evidencias').select('*').order('created_at',{ascending:false})
let html=''
data.forEach(i=>{
html+=`
<div class="monitor4d-card">
<b>${i.municipio||i.orgao||'-'}</b><br>
${i.descricao||'-'}<br>
Status: ${i.status||'-'}<br>
Data: ${formatarDataBR(i.created_at)}
</div>`
})
box.innerHTML=html
}
/*=========================================================
037 QUEIMADAS FUNCTION RENDERAUDITORIACONCOMITANTE
=========================================================*/
async function renderAuditoriaConcomitante(){
let box=document.getElementById('painelAuditoria')
if(!box)return
let[{data:evidencias=[]},{data:riscos=[]},{data:heat=[]}]=await Promise.all([
client.from('queimadas_evidencias').select('*'),
client.from('queimadas_riscos').select('*'),
client.from('vw_queimadas_ranking_estadual').select('*')
])
let semEvidencia=evidencias.filter(i=>!i.evidencia||String(i.evidencia).trim()==='').length
let riscosSemTratamento=riscos.filter(i=>!i.tratamento||String(i.tratamento).trim()==='').length
let municipiosCriticos=heat.filter(i=>Number(i.indice_final||i.iriq||0)>=75).length
let municipiosAlto=heat.filter(i=>Number(i.indice_final||i.iriq||0)>=50&&Number(i.indice_final||i.iriq||0)<75).length
let topRiscos=[...riscos].sort((a,b)=>Number(b.nivel_risco||0)-Number(a.nivel_risco||0)).slice(0,10)
box.innerHTML=`
<div class="chap-grid">
<div class="chap-card"><div class="chap-num">${semEvidencia}</div><div class="chap-label">SEM EVIDÊNCIAS</div></div>
<div class="chap-card"><div class="chap-num">${riscosSemTratamento}</div><div class="chap-label">SEM TRATAMENTO</div></div>
<div class="chap-card"><div class="chap-num">${municipiosCriticos}</div><div class="chap-label">CRÍTICOS</div></div>
<div class="chap-card"><div class="chap-num">${municipiosAlto}</div><div class="chap-label">ALTO RISCO</div></div>
</div>
<div class="cardExecutivo">
<h2>TOP 10 RISCOS</h2>
${topRiscos.map(i=>`
<div style="display:flex;justify-content:space-between;padding:8px;border-bottom:1px solid #ddd">
<span>${i.risco||i.descricao||'-'}</span>
<b>${i.nivel_risco||0}</b>
</div>
`).join('')}
</div>
<div class="cardExecutivo">
<h2>ACHADOS AUTOMÁTICOS</h2>
<div style="padding:10px">
${semEvidencia>0?'🚨 Existem evidências pendentes.<br>':'✅ Evidências apresentadas.<br>'}
${riscosSemTratamento>0?'🚨 Existem riscos sem tratamento definido.<br>':'✅ Riscos tratados.<br>'}
${municipiosCriticos>0?'🚨 Existem municípios críticos sob monitoramento.<br>':'✅ Nenhum município crítico.<br>'}
</div>
</div>`
}
/*=========================================================
038 QUEIMADAS FUNCTION RENDERMAPAMUNICIPIOS
=========================================================*/
async function renderMapaMunicipios(){
let div=document.getElementById('mapaRO')
if(!div)return
if(window.mapaExecutivoRO){
try{window.mapaExecutivoRO.remove()}catch(e){}
window.mapaExecutivoRO=null
}
if(div._leaflet_id)delete div._leaflet_id
window.overlayUCsExecutivoAdicionado=false
window.overlayTIsExecutivoAdicionado=false
let mapa=L.map(div,{preferCanvas:true}).setView([-10.9,-63.3],7)
window.mapaExecutivoRO=mapa
setTimeout(()=>{
mapa.invalidateSize()
mapa.setView([-10.9,-63.3],7)
},500)
window.camadasControleExecutivo=L.control.layers({},{},{collapsed:false}).addTo(mapa)
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{attribution:'OpenStreetMap'}).addTo(mapa)
let{data=[]}=await client.from('vw_queimadas_ranking_estadual').select('*')
let geo=await fetch('./assets/geojson/municipios-ro.geojson')
if(geo.ok){
let geojson=await geo.json()
let risco={}
data.forEach(m=>{
let chave=normalizarMunicipio(m.municipio)
let score=Number(m.indice_final||m.iriq||0)
if(score>=75)risco[chave]='CRITICO'
else if(score>=50)risco[chave]='ALTO'
else if(score>=25)risco[chave]='MODERADO'
else risco[chave]='BAIXO'
})
window.layerMunicipiosPoligonos=L.geoJSON(geojson,{
style:f=>{
let nome=normalizarMunicipio(f.properties.NM_MUN||f.properties.nome||f.properties.NOME||'')
let classe=risco[nome]||'SEM DADOS'
let cor='#94a3b8'
if(classe==='CRITICO')cor='#dc2626'
else if(classe==='ALTO')cor='#f97316'
else if(classe==='MODERADO')cor='#facc15'
else if(classe==='BAIXO')cor='#16a34a'
return{color:'#1e293b',weight:1,fillColor:cor,fillOpacity:.55}
},
onEachFeature:(f,l)=>{
let nome=f.properties.NM_MUN||f.properties.nome||f.properties.NOME||'Município'
let chave=normalizarMunicipio(nome)
let registro=data.find(m=>normalizarMunicipio(m.municipio)===chave)
l.bindPopup(`
<b>${nome}</b><br>
🤖 IRIQ: ${Number(registro?.indice_final||registro?.iriq||0).toFixed(2)}<br>
🔥 Área Queimada: ${formatarNumero(registro?.area_queimada_ha||registro?.area_queimada||0)} ha<br>
🌳 Desmatamento: ${formatarNumero(registro?.desmatamento_ha||registro?.area_desmatada||0)} ha<br>
🏷 Classificação: ${risco[chave]||'SEM DADOS'}
`)
}
}).addTo(mapa)
window.camadasControleExecutivo.addOverlay(window.layerMunicipiosPoligonos,'🔥 RISCO AMBIENTAL')
}
if(typeof carregarUCsRO==='function'){
await carregarUCsRO(mapa,'executivo')
if(window.layerUCsExecutivo&&mapa.hasLayer(window.layerUCsExecutivo))mapa.removeLayer(window.layerUCsExecutivo)
}
if(typeof carregarTIsRO==='function'){
await carregarTIsRO(mapa,'executivo')
if(window.layerTIsExecutivo&&mapa.hasLayer(window.layerTIsExecutivo))mapa.removeLayer(window.layerTIsExecutivo)
}
setTimeout(()=>{
mapa.invalidateSize()
mapa.fitBounds([
[-13.4,-65.8],
[-8.0,-60.0]
],{
padding:[5,5]
})
},500)
}
/*=========================================================
039 QUEIMADAS FUNCTION RENDERACOESSEDAM
=========================================================*/
async function renderAcoesSedam(){
let box=document.getElementById('painelAcoesSedam')
if(!box)return
let{data=[]}=await client.from('queimadas_monitoramento').select('*').eq('origem','Sedam')
let concluidas=data.filter(i=>Number(i.percentual||0)>=100).length
let execucao=data.length?Math.round(data.reduce((s,i)=>s+Number(i.percentual||0),0)/data.length):0
box.innerHTML=`
<div class="impacto-box">
<div class="impacto-score">${data.length}</div>
<div class="impacto-label">AÇÕES SEDAM</div>
<div>${concluidas} concluídas • ${execucao}% execução</div>
</div>`
}
/*=========================================================
040 QUEIMADAS FUNCTION RENDERACOESCBM
=========================================================*/
async function renderAcoesCBM(){
let box=document.getElementById('painelAcoesCBM')
if(!box)return
let{data=[]}=await client.from('queimadas_monitoramento').select('*').eq('origem','CBMRO')
let concluidas=data.filter(i=>Number(i.percentual||0)>=100).length
let execucao=data.length?Math.round(data.reduce((s,i)=>s+Number(i.percentual||0),0)/data.length):0
box.innerHTML=`
<div class="impacto-box">
<div class="impacto-score">${data.length}</div>
<div class="impacto-label">AÇÕES CBMRO</div>
<div>${concluidas} concluídas • ${execucao}% execução</div>
</div>`
}
/*=========================================================
041 QUEIMADAS FUNCTION RENDERACOESTCERO
=========================================================*/
async function renderAcoesTCERO(){
let box=document.getElementById('painelAcoesTCERO')
if(!box)return
let{data=[]}=await client.from('queimadas_monitoramento').select('*').eq('origem','TCERO')
let concluidas=data.filter(i=>Number(i.percentual||0)>=100).length
let execucao=data.length?Math.round(data.reduce((s,i)=>s+Number(i.percentual||0),0)/data.length):0
box.innerHTML=`
<div class="impacto-box">
<div class="impacto-score">${data.length}</div>
<div class="impacto-label">AÇÕES TCERO</div>
<div>${concluidas} concluídas • ${execucao}% execução</div>
</div>`
}
/*=========================================================
042 QUEIMADAS FUNCTION RENDERGRAFICOFOCOSCALOR
=========================================================*/
async function renderGraficoFocosCalor(){
let canvas=document.getElementById('graficoFocosCalor')
if(!canvas)return
let{data=[]}=await client.from('vw_queimadas_ranking_estadual').select('*')
let ranking=[...data].sort((a,b)=>Number(b.area_queimada_ha||b.area_queimada||0)-Number(a.area_queimada_ha||a.area_queimada||0)).slice(0,15)
let labels=ranking.map(i=>i.municipio||'-')
let valores=ranking.map(i=>Number(i.area_queimada_ha||i.area_queimada||0))
if(window.chartFocosCalor)window.chartFocosCalor.destroy()
window.chartFocosCalor=new Chart(canvas,{
type:'bar',
data:{labels,datasets:[{label:'Área Queimada (ha)',data:valores}]},
options:{responsive:true,maintainAspectRatio:false}
})
}
/*=========================================================
043 QUEIMADAS FUNCTION RENDERGRAFICOEVOLUCAOMENSAL
=========================================================*/
async function renderGraficoEvolucaoMensal(){
let canvas=document.getElementById('graficoEvolucaoMensal')
if(!canvas)return
let{data=[]}=await client.from('queimadas_monitoramento').select('*')
let execucao=data.filter(i=>String(i.status||'').toUpperCase().includes('EXECU')).length
let pendente=data.filter(i=>String(i.status||'').toUpperCase().includes('PEND')).length
let planejado=data.filter(i=>String(i.status||'').toUpperCase().includes('PLANE')).length
if(window.chartEvolucaoMensal)window.chartEvolucaoMensal.destroy()
window.chartEvolucaoMensal=new Chart(canvas,{
type:'bar',
data:{
labels:['EM EXECUÇÃO','PENDENTE','PLANEJADO'],
datasets:[{
label:'Quantidade',
data:[execucao,pendente,planejado]
}]
},
options:{
responsive:true,
maintainAspectRatio:false
}
})
}
/*=========================================================
044 QUEIMADAS FUNCTION RENDERDASHBOARDPRESIDENTE
=========================================================*/
async function renderDashboardPresidente(){
let box=document.getElementById('painelPresidente')
if(!box)return

let[
{data:heat=[]},
{data:sedam=[]},
{data:cbm=[]},
{data:monitoramento=[]},
{data:municipios=[]}
]=await Promise.all([
client.from('vw_queimadas_ranking_estadual').select('*'),
client.from('queimadas_acoes_sedam').select('*'),
client.from('queimadas_acoes_cbm').select('*'),
client.from('queimadas_monitoramento').select('*'),
client.from('vw_queimadas_municipios_resposta').select('*')
])

let areaQueimada=heat.reduce((s,i)=>s+Number(i.area_queimada_hectares||i.area_queimada_ha||i.area_queimada||0),0)

let desmatamento=heat.reduce((s,i)=>s+Number(i.desmatamento_hectares||i.desmatamento_ha||i.area_desmatada||0),0)

let criticos=heat.filter(i=>Number(i.indice_final||i.iriq||0)>=75).length

let alto=heat.filter(i=>{
let v=Number(i.indice_final||i.iriq||0)
return v>=50&&v<75
}).length

let execucao=monitoramento.length
?Math.round(
monitoramento.reduce((s,i)=>s+Number(i.percentual||0),0)
/monitoramento.length
)
:0

let comPlano=municipios.filter(i=>{
return i.ldatarecebimentodoc||i.lldatarecebimentodoc
}).length

let dilacao=municipios.filter(i=>{
let cor=String(i.classificacao_cor||'').toUpperCase().trim()
return cor==='AMARELO'
}).length

let semResposta=municipios.filter(i=>{
return !i.ldatarecebimentodoc&&!i.lldatarecebimentodoc
}).length

let totalMunicipios=municipios.length||52

let percPlano=((comPlano/totalMunicipios)*100).toFixed(1)
let percDilacao=((dilacao/totalMunicipios)*100).toFixed(1)
let percSemResposta=((semResposta/totalMunicipios)*100).toFixed(1)

box.innerHTML=`
<div class="chap-grid">

<div class="chap-card">
<div class="chap-num">${formatarNumero(areaQueimada)}</div>
<div class="chap-label">ÁREA QUEIMADA (ha)</div>
</div>

<div class="chap-card">
<div class="chap-num">${formatarNumero(desmatamento)}</div>
<div class="chap-label">DESMATAMENTO (ha)</div>
</div>

<div class="chap-card">
<div class="chap-num">${criticos}</div>
<div class="chap-label">MUNICÍPIOS CRÍTICOS</div>
</div>

<div class="chap-card">
<div class="chap-num">${alto}</div>
<div class="chap-label">ALTO RISCO</div>
</div>

<div class="chap-card">
<div class="chap-num">${execucao}%</div>
<div class="chap-label">EXECUÇÃO GERAL</div>
</div>

<div class="chap-card">
<div class="chap-num">${sedam.length+cbm.length}</div>
<div class="chap-label">AÇÕES MONITORADAS</div>
</div>

</div>

<div class="chap-grid" style="margin-top:15px">

<div class="chap-card">
<div class="chap-num" style="color:#16a34a">${comPlano}</div>
<div class="chap-label">COM PLANO</div>
<div style="font-size:22px;font-weight:900;color:#16a34a">${percPlano}%</div>
</div>

<div class="chap-card">
<div class="chap-num" style="color:#f59e0b">${dilacao}</div>
<div class="chap-label">DILAÇÃO DE PRAZO</div>
<div style="font-size:22px;font-weight:900;color:#f59e0b">${percDilacao}%</div>
</div>

<div class="chap-card">
<div class="chap-num" style="color:#dc2626">${semResposta}</div>
<div class="chap-label">SEM RESPOSTA</div>
<div style="font-size:22px;font-weight:900;color:#dc2626">${percSemResposta}%</div>
</div>

</div>

<div class="fonte-card">
Fonte: INPE • MAPBIOMAS 2021-2025 • PRODES 2021-2025 • Monitoramento TCE-RO • Municípios Respondentes
</div>
`
}
/*=========================================================
045 QUEIMADAS FUNCTION RENDERGRAFICOGOVERNANCA
=========================================================*/
async function renderGraficoGovernanca(){
let canvas=document.getElementById('graficoGovernanca')||document.getElementById('graficoGovernancaRelatorio')
if(!canvas)return
if(window.chartGovernanca)window.chartGovernanca.destroy()
let[{data:sedam=[]},{data:cbm=[]},{data:tce=[]}]=await Promise.all([
client.from('queimadas_acoes_sedam').select('*'),
client.from('queimadas_acoes_cbm').select('*'),
client.from('queimadas_monitoramento').select('*')
])
window.chartGovernanca=new Chart(canvas,{
type:'doughnut',
data:{
labels:['TCERO','SEDAM','CBMRO'],
datasets:[{
data:[tce.length,sedam.length,cbm.length]
}]
},
options:{
responsive:true,
maintainAspectRatio:false,
plugins:{
legend:{display:true,position:'top'},
tooltip:{enabled:true},
datalabels:{
color:'#ffffff',
font:{weight:'bold',size:18},
formatter:v=>v
}
}
}
})
}
/*=========================================================
047 QUEIMADAS FUNCTION RENDERSALASITUACAO
=========================================================*/
async function renderSalaSituacao(){
let {data:municipios=[]}=await client.from('vw_queimadas_municipios_resposta').select('*')
let total=52

let listaSemPlano=municipios.filter(i=>{
let cls=String(i.classificacao_ia||i.classificacao||'').toUpperCase().trim()
return cls.includes('SEM PLANO')
}).sort((a,b)=>(a.municipio||'').localeCompare(b.municipio||''))

let listaDilacao=municipios.filter(i=>{
let cls=String(i.classificacao_ia||i.classificacao||'').toUpperCase().trim()
return cls.includes('DILAÇÃO')||cls.includes('DILACAO')||cls.includes('AMARELO')
}).sort((a,b)=>(a.municipio||'').localeCompare(b.municipio||''))

let listaSemResposta=municipios.filter(i=>{
let cls=String(i.classificacao_ia||i.classificacao||'').toUpperCase().trim()
return cls.includes('SEM RESPOSTA')
}).sort((a,b)=>(a.municipio||'').localeCompare(b.municipio||''))

let painelIndicadores=document.getElementById('painelIndicadoresSituacao')
if(painelIndicadores){
let total=52
let totalComPlano=total-(listaDilacao.length+listaSemResposta.length)
painelIndicadores.innerHTML=`
<div class="ranking-grid">
<div class="cardPainel" style="text-align:center">
<div style="font-size:52px;font-weight:900;color:#16a34a;line-height:1">${total-(listaDilacao.length+listaSemResposta.length)}</div>
<div style="font-size:14px;font-weight:800;margin-top:8px">COM PLANO</div>
<div style="font-size:28px;font-weight:900;color:#16a34a;margin-top:10px">${(((total-(listaDilacao.length+listaSemResposta.length))/total)*100).toFixed(2)}%</div>
</div>
<div class="cardPainel" style="text-align:center">
<div style="font-size:52px;font-weight:900;color:#f59e0b;line-height:1">${listaDilacao.length}</div>
<div style="font-size:14px;font-weight:800;margin-top:8px">DILAÇÃO DE PRAZO</div>
<div style="font-size:28px;font-weight:900;color:#f59e0b;margin-top:10px">${((listaDilacao.length/total)*100).toFixed(2)}%</div>
</div>
<div class="cardPainel" style="text-align:center">
<div style="font-size:52px;font-weight:900;color:#dc2626;line-height:1">${listaSemResposta.length}</div>
<div style="font-size:14px;font-weight:800;margin-top:8px">SEM RESPOSTA</div>
<div style="font-size:28px;font-weight:900;color:#dc2626;margin-top:10px">${((listaSemResposta.length/total)*100).toFixed(2)}%</div>
</div>
</div>`
}

let painelDilacao=document.getElementById('painelMunicipiosDilacao')
if(painelDilacao){
painelDilacao.innerHTML=`
<div class="cardExecutivo">
<h2>⏳ MUNICÍPIOS COM DILAÇÃO DE PRAZO</h2>
${listaDilacao.length?listaDilacao.map(i=>`<div class="linha-ranking">${i.municipio||'-'}</div>`).join(''):'<div class="linha-ranking">Nenhum município</div>'}
<div class="fonte-card">Total: ${listaDilacao.length} município(s)</div>
</div>`
}

let painelSemResposta=document.getElementById('painelMunicipiosSemResposta')
if(painelSemResposta){
painelSemResposta.innerHTML=`
<div class="cardExecutivo">
<h2>📬 MUNICÍPIOS SEM RESPOSTA AO TCERO</h2>
${listaSemResposta.length?listaSemResposta.map(i=>`<div class="linha-ranking">${i.municipio||'-'}</div>`).join(''):'<div class="linha-ranking">Nenhum município</div>'}
<div class="fonte-card">Total: ${listaSemResposta.length} município(s)</div>
</div>`
}

if(typeof renderTopIAChap==='function')await renderTopIAChap()
if(typeof renderSalaSituacaoEstadual==='function')await renderSalaSituacaoEstadual()
if(typeof renderIndicadoresGovernanca==='function')await renderIndicadoresGovernanca()
}
/*=========================================================
048 QUEIMADAS FUNCTION IAPREVERRISCOS
=========================================================*/
async function iaPreverRiscos(){
let box=document.getElementById('painelIARiscos')
if(!box)return
let{data=[]}=await client.from('vw_queimadas_ranking_estadual').select('*')
let top=[...data].sort((a,b)=>Number(b.indice_final||b.iriq||0)-Number(a.indice_final||a.iriq||0)).slice(0,5)
box.innerHTML=`
<div class="monitor4d-card">
<b>PREVISÃO IA</b><br><br>
${top.map(i=>`${i.municipio} - IRIQ ${Number(i.indice_final||i.iriq||0).toFixed(1)}`).join('<br>')}
</div>`
}
/*=========================================================
049 QUEIMADAS FUNCTION IAPRIORIZARMUNICIPIOS
=========================================================*/
async function iaPriorizarMunicipios(){
let box=document.getElementById('painelIAPriorizacao')
if(!box)return
let{data=[]}=await client.from('vw_queimadas_ranking_estadual').select('*')
let top=[...data].sort((a,b)=>Number(b.indice_final||b.iriq||0)-Number(a.indice_final||a.iriq||0)).slice(0,3)
box.innerHTML=`
<div class="monitor4d-card">
${top.map((i,idx)=>`${idx+1}º ${i.municipio}<br>IRIQ: ${Number(i.indice_final||i.iriq||0).toFixed(2)}`).join('<br><br>')}
</div>`
}
/*=========================================================
050 QUEIMADAS FUNCTION IAGERARRELATORIO
=========================================================*/
async function iaGerarRelatorio(){
let box=document.getElementById('painelIARelatorio')
if(!box)return
let{data=[]}=await client.from('vw_queimadas_ranking_estadual').select('*')
let criticos=data.filter(i=>Number(i.indice_final||i.iriq||0)>=75).length
let alto=data.filter(i=>Number(i.indice_final||i.iriq||0)>=50&&Number(i.indice_final||i.iriq||0)<75).length
let areaQueimada=data.reduce((s,i)=>s+Number(i.area_queimada_ha||i.area_queimada||0),0)
let desmatamento=data.reduce((s,i)=>s+Number(i.desmatamento_ha||i.area_desmatada||0),0)
box.innerHTML=`
<div class="monitor4d-card">
<b>RELATÓRIO IA</b><br><br>
Área Queimada: ${formatarNumero(areaQueimada)} ha<br>
Desmatamento: ${formatarNumero(desmatamento)} ha<br>
Municípios Críticos: ${criticos}<br>
Municípios Alto Risco: ${alto}<br><br>
Baseado em MAPBIOMAS, PRODES, CHAP, Plano SEDAM, POTIF e Plano Unificado TCE-RO.
</div>`
}
/*=========================================================
051 QUEIMADAS FUNCTION IASUGERIRACOES
=========================================================*/
async function iaSugerirAcoes(){
let box=document.getElementById('painelIASugestoes')
if(!box)return
let{data=[]}=await client.from('vw_queimadas_ranking_estadual').select('*')
let top=[...data].sort((a,b)=>Number(b.indice_final||b.iriq||0)-Number(a.indice_final||a.iriq||0)).slice(0,5)
box.innerHTML=`
<div class="monitor4d-card">
✓ Priorizar ${top[0]?.municipio||'-'}<br>
✓ Intensificar fiscalização nos municípios críticos<br>
✓ Reforçar brigadas nos maiores índices IRIQ<br>
✓ Monitorar áreas queimadas MAPBIOMAS<br>
✓ Monitorar desmatamento PRODES
</div>`
}
/*=========================================================
052 QUEIMADAS FUNCTION RENDERDASHBOARDCHAP
=========================================================*/
async function renderDashboardCHAP(){
let box=document.getElementById('painelCHAP')
if(!box)return
let{data=[]}=await client.from('queimadas_chap').select('*')
box.innerHTML=data.map(i=>{
let score=Math.round((
Number(i.criticidade||0)+
Number(i.historico||0)+
Number(i.abrangencia||0)+
Number(i.prioridade||0)
)/4*20)
return`
<div class="chap-card">
<div class="chap-num">${score}%</div>
<div class="chap-label">${i.municipio||i.orgao||'-'}</div>
</div>`
}).join('')
}

/*=========================================================
053 QUEIMADAS FUNCTION MOSTRARABAQUEIMADAS
=========================================================*/
async function mostrarAbaQueimadas(nome){
localStorage.setItem('abaQueimadas',nome)
document.querySelectorAll('.btnAbaQueimadas').forEach(x=>x.classList.remove('btnAbaAtiva'))
document.querySelectorAll('.abaQueimadas').forEach(x=>x.classList.add('hidden'))
let botoes={
executivo:'btnAbaExecutivo',
executivomunicipal:'btnAbaExecutivoMunicipal',
estado:'btnAbaEstado',
mapa:'btnAbaMapa',
planejamento:'btnAbaPlanejamento',
monitoramento:'btnAbaMonitoramento',
temporeal:'btnAbaTempoReal',
analise:'btnAbaAnalise',
situacao:'btnAbaSituacao',
presidente:'btnAbaPresidente',
auditor:'btnAbaAuditor',
relatorios:'btnAbaRelatorios'
}
document.getElementById(botoes[nome])?.classList.add('btnAbaAtiva')
if(nome==='executivo'){
document.getElementById('abaExecutivo')?.classList.remove('hidden')
if(typeof carregarKPIsExecutivos==='function')await carregarKPIsExecutivos()
if(typeof renderMunicipiosPrioritarios==='function')await renderMunicipiosPrioritarios()
if(typeof renderHeatMapExecutivo==='function')await renderHeatMapExecutivo()
if(typeof renderPainelFocosINPE==='function')await renderPainelFocosINPE()
if(typeof renderPainelUCs==='function')await renderPainelUCs()
if(typeof renderIRIQHeatmapUnificado==='function')await renderIRIQHeatmapUnificado()
if(typeof renderAlertas==='function')await renderAlertas()
if(typeof renderIndicadoresEstrategicos==='function')await renderIndicadoresEstrategicos()
}
if(nome==='estado'){
document.getElementById('abaEstado')?.classList.remove('hidden')
if(typeof renderKPIsEstado==='function')await renderKPIsEstado()
if(typeof renderCadastroEstado==='function')await renderCadastroEstado()
if(typeof renderIndicadoresEstado==='function')await renderIndicadoresEstado()
if(typeof renderFormularioEstado==='function')renderFormularioEstado()
}
if(nome==='executivomunicipal'){
document.getElementById('abaExecutivoMunicipal')?.classList.remove('hidden')
if(typeof renderMunicipiosOficio==='function'){
await renderMunicipiosOficio('RESUMO')
await renderMunicipiosOficio('CADASTRO')
}
setTimeout(async()=>{
if(typeof renderMapaPlanosMunicipais==='function'){
await renderMapaPlanosMunicipais('TODOS')
}
if(typeof renderDistribuicaoRespostas==='function'){
await renderDistribuicaoRespostas()
}
if(typeof renderEstatisticasMunicipais==='function'){
await renderEstatisticasMunicipais()
}
},200)
}
if(nome==='mapa'){
document.getElementById('abaMapa')?.classList.remove('hidden')
if(typeof renderMapaEstadual==='function')await renderMapaEstadual()
}
if(nome==='planejamento'){
document.getElementById('abaPlanejamento')?.classList.remove('hidden')
renderInfoPaineis()
await renderPlanoUnificado()
await renderPlanoSedam()
await renderPlanoCBM()
await renderCadeiaValor()
await renderTeoriaMudanca()
await renderODS()
await renderODSEvidencias()
await renderGraficoRadarODS()
await renderODSMaturidade()
await renderODSExplicacaoIA()
await renderGantt()
await renderMarcos()
}
if(nome==='monitoramento'){
document.getElementById('abaMonitoramento')?.classList.remove('hidden')
await renderAcoesSedam()
await renderAcoesCBM()
await renderAcoesTCERO()
await renderGovernanca()
await renderMonitoramento4D()
await renderExecucaoFisica()
await renderExecucaoFinanceira()
await renderCEPCIFAvancado()
await renderPOTIFAvancado()
await renderEvidencias()
}
if(nome==='temporeal'){
document.getElementById('abaTempoReal')?.classList.remove('hidden')
if(typeof renderTempoReal==='function')await renderTempoReal()
if(typeof renderGraficoTempoReal==='function')await renderGraficoTempoReal()
}
if(nome==='analise'){
document.getElementById('abaAnalise')?.classList.remove('hidden')
await renderDashboardCHAP()
await renderMatrizRisco5x5()
await matrizRisco5x5Avancada()
await iaChapAnalisar()
await iaPreverRiscos()
await iaPriorizarMunicipios()
await iaGerarRelatorio()
await iaSugerirAcoes()
}
if(nome==='relatorios'){
document.getElementById('abaRelatorios')?.classList.remove('hidden')
await renderGraficoEvolucaoMensal()
await renderGraficoGovernanca()
await renderGraficoFocosCalor()
}
if(nome==='situacao'){
document.getElementById('abaSituacao')?.classList.remove('hidden')
if(typeof renderSalaSituacao==='function')await renderSalaSituacao()
}
if(nome==='presidente'){
document.getElementById('abaPresidente')?.classList.remove('hidden')
await renderDashboardPresidente()
await renderUCsPresidente()
await renderSituacaoEstrategica()
}
if(nome==='auditor'){
document.getElementById('abaAuditor')?.classList.remove('hidden')
await renderAuditoriaConcomitante()
}
}
/*=========================================================
054 QUEIMADAS FUNCTION IMPRIMIRPAINEL
=========================================================*/
function imprimirPainel(idPainel){
let painel=typeof idPainel==='string'?document.getElementById(idPainel):idPainel
if(!painel){
alert('Painel não encontrado.')
return
}
let tela=window.open('','_blank')
tela.document.write(`
<html>
<head>
<title>Relatório Queimadas</title>
<style>
body{font-family:Arial,sans-serif;padding:20px}
table{width:100%;border-collapse:collapse}
table,th,td{border:1px solid #ccc}
th,td{padding:6px}
canvas,img{max-width:100%;height:auto}
.cardExecutivo,.cardMunicipal,.cardPainel,.cardRelatorio,.cardMapa,.cardAnalise{page-break-inside:avoid;break-inside:avoid;margin-bottom:20px}
h1,h2,h3,h4{page-break-after:avoid}
</style>
</head>
<body>
${painel.innerHTML}
</body>
</html>
`)
tela.document.close()
setTimeout(()=>{
tela.focus()
tela.print()
},800)
}
/*=========================================================
055 QUEIMADAS FUNCTION IMPRIMIRABAATUALQUEIMADAS
=========================================================*/
function imprimirAbaAtualQueimadas(){
let abas=[
'abaExecutivo',
'abaExecutivoMunicipal',
'abaEstado',
'abaPlanejamento',
'abaMonitoramento',
'abaAnalise',
'abaMapa',
'abaSituacao',
'abaPresidente',
'abaAuditor',
'abaRelatorios'
]
for(let id of abas){
let painel=document.getElementById(id)
if(painel&&!painel.classList.contains('hidden')){
imprimirPainel(painel)
return
}
}
window.print()
}
/*=========================================================
116 QUEIMADAS FUNCTION CARREGARFOCOSPERIODO
=========================================================*/
async function carregarFocosPeriodo(){

let periodo=document.getElementById('filtroPeriodoFocos')?.value||'7'
let boxPersonalizado=document.getElementById('boxPeriodoPersonalizado')

if(boxPersonalizado){
boxPersonalizado.style.display=
periodo==='custom'
?'flex'
:'none'
}

let hoje=new Date()
let inicio=new Date()
let fim=new Date()

fim.setHours(23,59,59,999)

if(periodo==='1'){
inicio.setHours(0,0,0,0)
}

else if(periodo==='7'){
inicio.setDate(hoje.getDate()-6)
inicio.setHours(0,0,0,0)
}

else if(periodo==='30'){
inicio.setDate(hoje.getDate()-29)
inicio.setHours(0,0,0,0)
}

else if(periodo==='365'){
inicio.setFullYear(hoje.getFullYear()-1)
inicio.setHours(0,0,0,0)
}

else if(periodo==='ano'){
inicio=new Date(hoje.getFullYear(),0,1)
inicio.setHours(0,0,0,0)
}

else if(periodo==='custom'){

let inicial=document.getElementById('dataInicialFocos')?.value
let final=document.getElementById('dataFinalFocos')?.value

if(!inicial||!final){
return
}

inicio=new Date(inicial+'T00:00:00')
fim=new Date(final+'T23:59:59')

}

let dataInicial=formatarDataISOFocos(inicio)
let dataFinal=formatarDataISOFocos(fim)

await buscarFocosINPERondonia(
dataInicial,
dataFinal,
periodo
)

}
/*=========================================================
057 QUEIMADAS FUNCTION RENDERKPISESTADO
=========================================================*/
async function renderKPIsEstado(){
let box=document.getElementById('painelKPIsEstado')
if(!box)return
let{data=[]}=await client.from('queimadas_estado_oficio').select('*')
let total=data.length
let respondidos=data.filter(x=>x.idatarecebimentodoc||x.iidatarecebimentodoc).length
let pendentes=total-respondidos
let percentual=total?((respondidos/total)*100).toFixed(1):0
box.innerHTML=`
<div class="chap-grid">
<div class="chap-card"><div class="chap-num">${total}</div><div class="chap-label">ÓRGÃOS</div></div>
<div class="chap-card"><div class="chap-num">${respondidos}</div><div class="chap-label">RESPONDERAM</div></div>
<div class="chap-card"><div class="chap-num">${pendentes}</div><div class="chap-label">PENDENTES</div></div>
<div class="chap-card"><div class="chap-num">${percentual}%</div><div class="chap-label">RESPOSTA</div></div>
</div>`
}
/*=========================================================
058 QUEIMADAS FUNCTION RENDERCADASTROESTADO
=========================================================*/
async function renderCadastroEstado(){
let box=document.getElementById('painelCadastroEstado')
if(!box)return
let{data=[]}=await client.from('queimadas_estado_oficio').select('*').order('estado')
let html=`
<table class="tabelaEstado">
<colgroup>
<col style="width:8%">
<col style="width:14%">
<col style="width:5%">
<col style="width:5%">
<col style="width:4%">
<col style="width:4%">
<col style="width:5%">
<col style="width:5%">
<col style="width:40%">
<col style="width:10%">
</colgroup>
<thead>
<tr>
<th>ÓRGÃO</th>
<th>OFÍCIO TCE</th>
<th>DATA ENVIO</th>
<th>PÁG ENVIO</th>
<th>DATA REC.1</th>
<th>DATA REC.2</th>
<th>DOC.1</th>
<th>DOC.2</th>
<th>OBSERVAÇÃO</th>
<th>AÇÃO</th>
</tr>
</thead>
<tbody>`
data.forEach(i=>{
html+=`
<tr>
<td>${i.estado||'-'}</td>
<td>${i.nroficioenviadotcero||'-'}</td>
<td>${formatarDataBR(i.dataenviodoc)}</td>
<td>${i.paginaenviodoc||'-'}</td>
<td>${formatarDataBR(i.idatarecebimentodoc)}</td>
<td>${formatarDataBR(i.iidatarecebimentodoc)}</td>
<td>${i.inumerodocenviado||'-'}</td>
<td>${i.iinumerodocenviado||'-'}</td>
<td style="padding-right:20px;word-break:break-word;white-space:normal">${i.observacao||'-'}</td>
<td style="min-width:90px;text-align:center">
<button class="btnEditarMunicipio" style="width:80px" onclick="editarEstado(${i.id})">✏ EDITAR</button>
</td>
</tr>`
})
html+='</tbody></table>'
box.innerHTML=html
}
/*=========================================================
059 QUEIMADAS FUNCTION RENDERINDICADORESESTADO
=========================================================*/
async function renderIndicadoresEstado(){
let box=document.getElementById('painelIndicadoresEstado')
if(!box)return
let{data=[]}=await client.from('queimadas_estado_oficio').select('*')
box.innerHTML=data.map(i=>{
let status=(i.idatarecebimentodoc||i.iidatarecebimentodoc)?'🟢 RESPONDIDO':'🔴 PENDENTE'
return`
<div style="padding:10px;border-bottom:1px solid #e5e7eb;display:flex;justify-content:space-between;align-items:center">
<b>${i.estado||'-'}</b>
<span>${status}</span>
</div>`
}).join('')
}
let estadoEditando=null
/*=========================================================
060 QUEIMADAS FUNCTION SALVARESTADO
=========================================================*/
async function salvarEstado(){
let registro={
estado:document.getElementById('estadoNome')?.value||'',
nroficioenviadotcero:document.getElementById('estadoOficio')?.value||'',
dataenviodoc:document.getElementById('estadoDataEnvio')?.value||null,
paginaenviodoc:document.getElementById('estadoPaginaEnvio')?.value||'',
idatarecebimentodoc:document.getElementById('estadoDataRec1')?.value||null,
iidatarecebimentodoc:document.getElementById('estadoDataRec2')?.value||null,
inumerodocenviado:document.getElementById('estadoDoc1')?.value||'',
iinumerodocenviado:document.getElementById('estadoDoc2')?.value||'',
observacao:document.getElementById('estadoObservacao')?.value||''
}
let retorno
if(estadoEditando){
retorno=await client.from('queimadas_estado_oficio').update(registro).eq('id',estadoEditando)
}else{
retorno=await client.from('queimadas_estado_oficio').insert([registro])
}
if(retorno.error){
alert(retorno.error.message)
return
}
await renderKPIsEstado()
await renderCadastroEstado()
await renderIndicadoresEstado()
;['estadoNome','estadoOficio','estadoDataEnvio','estadoPaginaEnvio','estadoDataRec1','estadoDataRec2','estadoDoc1','estadoDoc2','estadoObservacao'].forEach(id=>{
let el=document.getElementById(id)
if(el)el.value=''
})
estadoEditando=null
document.getElementById('btnSalvarEstado').innerHTML='💾 SALVAR'
document.getElementById('btnExcluirEstado').style.display='none'
alert('Registro salvo com sucesso.')
}
/*=========================================================
061 QUEIMADAS FUNCTION EDITARESTADO
=========================================================*/
async function editarEstado(id){
estadoEditando=id
let{data}=await client
.from('queimadas_estado_oficio')
.select('*')
.eq('id',id)
.single()
if(!data)return
document.getElementById('estadoNome').value=data.estado||''
document.getElementById('estadoOficio').value=data.nroficioenviadotcero||''
document.getElementById('estadoDataEnvio').value=data.dataenviodoc||''
document.getElementById('estadoPaginaEnvio').value=data.paginaenviodoc||''
document.getElementById('estadoDataRec1').value=data.idatarecebimentodoc||''
document.getElementById('estadoDataRec2').value=data.iidatarecebimentodoc||''
document.getElementById('estadoDoc1').value=data.inumerodocenviado||''
document.getElementById('estadoDoc2').value=data.iinumerodocenviado||''
document.getElementById('estadoObservacao').value=data.observacao||''
document.getElementById('btnSalvarEstado').innerHTML='💾 ATUALIZAR'
document.getElementById('btnExcluirEstado').style.display='block'
}
/*=========================================================
062 QUEIMADAS FUNCTION RENDERFORMULARIOESTADO
=========================================================*/
function renderFormularioEstado(){
let box=document.getElementById('painelFormularioEstado')
if(!box)return
box.innerHTML=`
<div class="gridCadastroEstado">
<input id="estadoNome" placeholder="Órgão Estadual">
<input id="estadoOficio" placeholder="Ofício TCE-RO">
<input id="estadoDataEnvio" type="date">
<input id="estadoPaginaEnvio" placeholder="Página Envio">
<input id="estadoDataRec1" type="date">
<input id="estadoDataRec2" type="date">
<input id="estadoDoc1" placeholder="Documento 1">
<input id="estadoDoc2" placeholder="Documento 2">
<textarea id="estadoObservacao" placeholder="Observação"></textarea>
<div style="display:flex;gap:10px">
<button id="btnSalvarEstado" onclick="salvarEstado()">💾 SALVAR</button>
<button id="btnExcluirEstado" onclick="excluirEstado()" style="display:none;background:#dc2626">🗑 EXCLUIR</button>
</div>
</div>`
}
/*=========================================================
063 QUEIMADAS FUNCTION EXCLUIRESTADO
=========================================================*/
async function excluirEstado(){
if(!estadoEditando)return
if(!confirm('Deseja excluir este órgão estadual?'))return
let{error}=await client
.from('queimadas_estado_oficio')
.delete()
.eq('id',estadoEditando)
if(error){
alert(error.message)
return
}
estadoEditando=null
;['estadoNome','estadoOficio','estadoDataEnvio','estadoPaginaEnvio','estadoDataRec1','estadoDataRec2','estadoDoc1','estadoDoc2','estadoObservacao'].forEach(id=>{
let el=document.getElementById(id)
if(el)el.value=''
})
document.getElementById('btnSalvarEstado').innerHTML='💾 SALVAR'
document.getElementById('btnExcluirEstado').style.display='none'
await renderKPIsEstado()
await renderCadastroEstado()
await renderIndicadoresEstado()
alert('Registro excluído com sucesso.')
}
/*=========================================================
064 QUEIMADAS FUNCTION RENDERRESUMOEXECUTIVOSITUACAO
=========================================================*/
async function renderResumoExecutivoSituacao(){
let box=document.getElementById('painelResumoExecutivoSituacao')
if(!box)return
let{data}=await client
.from('vw_queimadas_executivo')
.select('*')
.single()
if(!data)return
box.innerHTML=`
<div class="chap-grid">
<div class="chap-card">
<div class="chap-num">${Number(data.area_queimada_estado_ha||0).toLocaleString('pt-BR',{maximumFractionDigits:0})}</div>
<div class="chap-label">ÁREA QUEIMADA (ha)</div>
</div>
<div class="chap-card">
<div class="chap-num">${Number(data.desmatamento_estado_ha||0).toLocaleString('pt-BR',{maximumFractionDigits:0})}</div>
<div class="chap-label">DESMATAMENTO (ha)</div>
</div>
<div class="chap-card">
<div class="chap-num">${Number(data.municipios_criticos||0)}</div>
<div class="chap-label">CRÍTICOS</div>
</div>
<div class="chap-card">
<div class="chap-num">${Number(data.iriq_estadual||0).toFixed(2)}</div>
<div class="chap-label">IRIQ ESTADUAL</div>
</div>
</div>`
}
/*=========================================================
065 QUEIMADAS FUNCTION RENDERSITUACAOOPERACIONAL
=========================================================*/
async function renderSituacaoOperacional(){
let box=document.getElementById('painelSituacaoOperacional')
if(!box)return
let{data=[]}=await client
.from('vw_queimadas_ranking_estadual')
.select('*')
let critico=data.filter(i=>Number(i.indice_final||i.iriq||0)>=75).length
let alto=data.filter(i=>Number(i.indice_final||i.iriq||0)>=50&&Number(i.indice_final||i.iriq||0)<75).length
let moderado=data.filter(i=>Number(i.indice_final||i.iriq||0)>=25&&Number(i.indice_final||i.iriq||0)<50).length
let baixo=data.filter(i=>Number(i.indice_final||i.iriq||0)<25).length
box.innerHTML=`
<div class="cardExecutivo">
<h2>🚨 SITUAÇÃO OPERACIONAL DO ESTADO</h2>
<div>🔴 Crítico: ${critico}</div>
<div>🟠 Alto: ${alto}</div>
<div>🟡 Moderado: ${moderado}</div>
<div>🟢 Baixo: ${baixo}</div>
<div>⚪ Total Municípios: ${data.length}</div>
</div>`
}
/*=========================================================
066 QUEIMADAS FUNCTION RENDERTOPFOCOSSITUACAO
=========================================================*/
async function renderTopFocosSituacao(){
let box=document.getElementById('painelTopFocosSituacao')
if(!box)return
let{data=[]}=await client
.from('vw_queimadas_ranking_estadual')
.select('*')
.order('focos',{ascending:false})
box.innerHTML=`
<div class="cardExecutivo">
<h2>🔥 TOP 10 FOCOS DE CALOR</h2>
<div style="font-size:12px;margin-bottom:10px">
Fonte: INPE • Ranking Estadual
</div>
${data.slice(0,10).map((i,idx)=>`
<div style="display:flex;justify-content:space-between;padding:6px;border-bottom:1px solid #eee">
<span>${idx+1}º ${i.municipio}</span>
<b>${Number(i.focos||0).toLocaleString('pt-BR')}</b>
</div>
`).join('')}
</div>`
}
/*=========================================================
068 QUEIMADAS FUNCTION RENDERINDICADORESGOVERNANCA
=========================================================*/
async function renderIndicadoresGovernanca(){
let box=document.getElementById('painelIndicadoresGovernanca')
if(!box)return
let {data:ranking=[]}=await client.from('vw_queimadas_ranking_estadual').select('*')
let criticos=ranking.filter(i=>Number(i.indice_final||i.iriq||0)>=75).length
let altos=ranking.filter(i=>{
let v=Number(i.indice_final||i.iriq||0)
return v>=50&&v<75
}).length
let moderados=ranking.filter(i=>{
let v=Number(i.indice_final||i.iriq||0)
return v>=25&&v<50
}).length
box.innerHTML=`
<div class="linha-ranking"><span>🚨 Municípios Críticos</span><b>${criticos}</b></div>
<div class="linha-ranking"><span>⚠️ Alto Risco</span><b>${altos}</b></div>
<div class="linha-ranking"><span>🟡 Risco Moderado</span><b>${moderados}</b></div>
<div class="linha-ranking"><span>🤖 Metodologia</span><b>CHAP + M-RAIG</b></div>
`
}

/*=========================================================
070 QUEIMADAS FUNCTION LERCSVINPE
=========================================================*/
function lerCSVINPE(ev){
let arquivo=ev.target.files?.[0]
if(!arquivo)return
let reader=new FileReader()
reader.onload=async e=>{
await importarCSVINPE(e.target.result)
}
reader.readAsText(arquivo,'utf-8')
}
/*=========================================================
071 QUEIMADAS FUNCTION IMPORTARCSVINPE
=========================================================*/
async function importarCSVINPE(texto){
let linhas=texto.split('\n').filter(l=>l.trim())
for(let i=1;i<linhas.length;i++){
let c=linhas[i].replace(/\r/g,'').split(';')
if(c.length<5)continue
await client.from('queimadas_focos_historico').upsert([{
municipio:c[0],
ano:Number(c[1]),
mes:Number(c[2]),
data_referencia:c[3],
focos:Number(c[4]),
fonte:'INPE'
}],{onConflict:'municipio,ano,mes,data_referencia'})
}
await recalcularHeatmap()
alert('Importação concluída.')
}
/*=========================================================
072 QUEIMADAS FUNCTION RECALCULARHEATMAP
=========================================================*/
async function recalcularHeatmap(){
let{data=[]}=await client
.from('vw_queimadas_ranking_estadual')
.select('*')
for(let item of data){
let iriq=Number(item.indice_final||item.iriq||0)
let classificacao='BAIXO'
if(iriq>=75)classificacao='CRÍTICO'
else if(iriq>=50)classificacao='ALTO'
else if(iriq>=25)classificacao='MODERADO'
await client
.from('queimadas_heatmap')
.upsert([{
municipio:item.municipio,
focos:Number(item.focos||0),
area_queimada_ha:Number(item.area_queimada_ha||0),
desmatamento_ha:Number(item.desmatamento_ha||0),
criticidade:iriq,
indice_final:iriq,
classificacao:classificacao
}],{onConflict:'municipio'})
}
}
/*=========================================================
073 QUEIMADAS FUNCTION ATUALIZARHEATMAPMANUAL
=========================================================*/
async function atualizarHeatmapManual(){
await recalcularHeatmap()
if(typeof renderSalaSituacaoEstadual==='function')await renderSalaSituacaoEstadual()
if(typeof renderTopFocosSituacao==='function')await renderTopFocosSituacao()
if(typeof renderTopCriticos==='function')await renderTopCriticos()
if(typeof renderTopRiscos==='function')await renderTopRiscos()
if(typeof renderMapaMunicipios==='function')await renderMapaMunicipios()
alert('Heatmap atualizado com sucesso.')
}

/*=========================================================
074 GERAR SUMARIO EXECUTIVO
=========================================================*/
async function gerarPDFSumarioExecutivo0501(){
const{jsPDF}=window.jspdf
let doc=new jsPDF('p','mm','a4',true)
let hoje=new Date()
let ano=hoje.getFullYear()
let dataInicial=`${ano}-01-01`
let dataFinal=formatarDataISOFocos(hoje)
let imgLogo=await toDataURL('assets/geojson/logotcero.png').catch(()=>null)
let imgQueimadasOriginal=await toDataURL('assets/geojson/queimadas.png').catch(()=>null)
let[
{count:totalFocos,error:erroFocos},
{data:municipios=[],error:erroMunicipios},
{data:executivo,error:erroExecutivo},
{data:rankingIRIQ=[],error:erroIRIQ},
{data:mensal=[],error:erroMensal}
]=await Promise.all([
client.from('queimadas_focos_inpe').select('id',{count:'exact',head:true}).gte('data_foco',dataInicial).lte('data_foco',dataFinal),
client.from('vw_queimadas_municipios_resposta').select('*'),
client.from('vw_queimadas_executivo').select('*').maybeSingle(),
client.from('queimadas_heatmap').select('municipio,iriq,risco,classificacao,focos').order('iriq',{ascending:false}).limit(5),
client.from('vw_queimadas_focos_mensal').select('mes,focos').eq('ano',ano).order('mes',{ascending:true})
])
if(erroFocos)console.error('Sumário focos:',erroFocos)
if(erroMunicipios)console.error('Sumário municípios:',erroMunicipios)
if(erroExecutivo)console.error('Sumário executivo:',erroExecutivo)
if(erroIRIQ)console.error('Sumário IRIQ:',erroIRIQ)
if(erroMensal)console.error('Sumário mensal:',erroMensal)
executivo=executivo||{}
let totalMunicipios=municipios.length||52
let comPlano=municipios.filter(i=>String(i.classificacao_ia||'').toUpperCase().includes('PLANO')).length
let dilacao=municipios.filter(i=>String(i.classificacao_ia||'').toUpperCase().includes('DILA')).length
let semResposta=municipios.filter(i=>String(i.classificacao_ia||'').toUpperCase().includes('SEM RESPOSTA')).length
if(!semResposta)semResposta=Math.max(0,totalMunicipios-comPlano-dilacao)
let focos=Number(totalFocos||0)
let criticos=Number(executivo.municipios_criticos||0)
let prioritarios=Number(executivo.municipios_prioritarios||0)
let iriqEstadual=Number(executivo.iriq_estadual||0)
let areaQueimada=Number(executivo.area_queimada_estado_ha||0)
let desmatamento=Number(executivo.desmatamento_estado_ha||0)
let top5IRIQ=(rankingIRIQ||[]).filter(i=>Number.isFinite(Number(i.iriq))).slice(0,5)
let mediaTop5=top5IRIQ.length?top5IRIQ.reduce((s,i)=>s+Number(i.iriq||0),0)/top5IRIQ.length:0
let maiorIRIQ=top5IRIQ.length?Number(top5IRIQ[0].iriq||0):0
function faixaIRIQ(v){
v=Number(v||0)
if(v>=75)return'CRÍTICO'
if(v>=50)return'ALTO'
if(v>=25)return'MODERADO'
return'BAIXO'
}
function corIRIQ(v){
v=Number(v||0)
if(v>=75)return[220,38,38]
if(v>=50)return[234,88,12]
if(v>=25)return[245,158,11]
return[22,163,74]
}
async function recortarImagem(dataURL){
if(!dataURL)return null
return await new Promise(resolve=>{
let img=new Image()
img.onload=()=>{
let proporcaoDestino=105/50
let proporcaoOrigem=img.naturalWidth/img.naturalHeight
let sx=0
let sy=0
let sw=img.naturalWidth
let sh=img.naturalHeight
if(proporcaoOrigem>proporcaoDestino){
sw=img.naturalHeight*proporcaoDestino
sx=(img.naturalWidth-sw)/2
}else{
sh=img.naturalWidth/proporcaoDestino
sy=(img.naturalHeight-sh)/2
}
let canvas=document.createElement('canvas')
canvas.width=1600
canvas.height=Math.round(1600/proporcaoDestino)
let ctx=canvas.getContext('2d')
ctx.drawImage(img,sx,sy,sw,sh,0,0,canvas.width,canvas.height)
resolve(canvas.toDataURL('image/jpeg',.96))
}
img.onerror=()=>resolve(null)
img.src=dataURL
})
}
let imgQueimadas=await recortarImagem(imgQueimadasOriginal)
function textoPreto(){
doc.setTextColor(17,24,39)
}
function faixaTitulo(texto,x,y,w){
doc.setFillColor(13,61,140)
doc.roundedRect(x,y,w,6,1.5,1.5,'F')
doc.setFont('helvetica','bold')
doc.setFontSize(5.6)
doc.setTextColor(255,255,255)
doc.text(texto,x+w/2,y+4.1,{align:'center'})
}
function kpi(x,y,w,titulo,valor,cor,icone='',sub=''){
doc.setFillColor(255,255,255)
doc.setDrawColor(219,226,234)
doc.roundedRect(x,y,w,25,2.5,2.5,'FD')
doc.setFont('helvetica','bold')
doc.setFontSize(5.2)
doc.setTextColor(17,24,39)
let tituloLinhas=doc.splitTextToSize(titulo,w-6)
doc.text(tituloLinhas,x+w/2,y+6,{align:'center'})
doc.setFontSize(12.5)
doc.setTextColor(...cor)
doc.text(String(valor),x+w/2,y+17,{align:'center'})
if(sub){
doc.setFont('helvetica','bold')
doc.setFontSize(4.6)
doc.setTextColor(17,24,39)
doc.text(sub,x+w/2,y+22,{align:'center'})
}
}
function graficoMensal(x,y,w,h){
faixaTitulo(`EVOLUÇÃO MENSAL DOS FOCOS (${ano})`,x,y,w)
doc.setFillColor(255,255,255)
doc.setDrawColor(219,226,234)
doc.roundedRect(x,y+6,w,h-6,2,2,'FD')
let valores=Array(12).fill(0)
;(mensal||[]).forEach(i=>{
let m=Number(i.mes)
if(m>=1&&m<=12)valores[m-1]=Number(i.focos||0)
})
let max=Math.max(...valores,1)
let meses=['JAN','FEV','MAR','ABR','MAI','JUN','JUL','AGO','SET','OUT','NOV','DEZ']
let base=y+h-7
let top=y+12
let area=base-top
let bw=(w-13)/12
doc.setDrawColor(229,231,235)
for(let i=0;i<=3;i++){
let yy=top+(area/3)*i
doc.line(x+7,yy,x+w-4,yy)
}
valores.forEach((v,i)=>{
let bh=v?Math.max(1,(v/max)*(area-5)):0
doc.setFillColor(220,38,38)
if(bh)doc.roundedRect(x+7+i*bw,base-bh,bw-1.3,bh,.7,.7,'F')
doc.setFont('helvetica','bold')
doc.setFontSize(3.8)
textoPreto()
if(v>0)doc.text(Number(v).toLocaleString('pt-BR'),x+7+i*bw+(bw-1.3)/2,base-bh-1.3,{align:'center'})
doc.setFontSize(3.8)
doc.text(meses[i],x+7+i*bw+(bw-1.3)/2,base+4,{align:'center'})
})
}
function graficoEscalaIRIQ(x,y,w,h){
faixaTitulo('GRÁFICO DO IRIQ',x,y,w)
doc.setFillColor(255,255,255)
doc.setDrawColor(219,226,234)
doc.roundedRect(x,y+6,w,h-6,2,2,'FD')
let gx=x+8
let gy=y+20
let gw=w-16
let seg=gw/4
doc.setFillColor(22,163,74)
doc.rect(gx,gy,seg,6,'F')
doc.setFillColor(245,158,11)
doc.rect(gx+seg,gy,seg,6,'F')
doc.setFillColor(234,88,12)
doc.rect(gx+seg*2,gy,seg,6,'F')
doc.setFillColor(220,38,38)
doc.rect(gx+seg*3,gy,seg,6,'F')
doc.setFont('helvetica','bold')
doc.setFontSize(3.8)
textoPreto()
doc.text('0',gx,gy-2)
doc.text('25',gx+seg,gy-2,{align:'center'})
doc.text('50',gx+seg*2,gy-2,{align:'center'})
doc.text('75',gx+seg*3,gy-2,{align:'center'})
doc.text('100',gx+gw,gy-2,{align:'right'})
doc.text('BAIXO',gx+seg/2,gy+11,{align:'center'})
doc.text('MODERADO',gx+seg*1.5,gy+11,{align:'center'})
doc.text('ALTO',gx+seg*2.5,gy+11,{align:'center'})
doc.text('CRÍTICO',gx+seg*3.5,gy+11,{align:'center'})
let marcador=gx+Math.min(100,Math.max(0,iriqEstadual))/100*gw
doc.setFillColor(15,23,42)
doc.triangle(marcador-2,gy-5,marcador+2,gy-5,marcador,gy-1,'F')
doc.setFontSize(5)
doc.text('IRIQ ESTADUAL',x+w/2,y+h-16,{align:'center'})
doc.setFontSize(15)
doc.setTextColor(...corIRIQ(iriqEstadual))
doc.text(iriqEstadual.toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2}),x+w/2,y+h-8,{align:'center'})
doc.setFontSize(5.2)
doc.text(faixaIRIQ(iriqEstadual),x+w/2,y+h-3,{align:'center'})
}
function concentracaoIRIQ(x,y,w,h){
faixaTitulo('CONCENTRAÇÃO DO IRIQ MUNICIPAL',x,y,w)
doc.setFillColor(255,255,255)
doc.setDrawColor(219,226,234)
doc.roundedRect(x,y+6,w,h-6,2,2,'FD')
let cx=x+w/2
let cy=y+27
let raio=13
let canvas=document.createElement('canvas')
canvas.width=500
canvas.height=500
let ctx=canvas.getContext('2d')
ctx.clearRect(0,0,500,500)
let centro=250
let r=180
let ri=105
let partes=[
{valor:25,cor:'#16a34a'},
{valor:25,cor:'#f59e0b'},
{valor:25,cor:'#ea580c'},
{valor:25,cor:'#dc2626'}
]
let inicio=-Math.PI/2
partes.forEach(p=>{
let fim=inicio+(p.valor/100)*Math.PI*2
ctx.beginPath()
ctx.arc(centro,centro,r,inicio,fim)
ctx.arc(centro,centro,ri,fim,inicio,true)
ctx.closePath()
ctx.fillStyle=p.cor
ctx.fill()
ctx.strokeStyle='#ffffff'
ctx.lineWidth=5
ctx.stroke()
inicio=fim
})
let donut=canvas.toDataURL('image/png')
doc.addImage(donut,'PNG',cx-raio,cy-raio,raio*2,raio*2)
doc.setFont('helvetica','bold')
doc.setFontSize(4.2)
textoPreto()
doc.text('MÉDIA DOS',cx,cy-3,{align:'center'})
doc.text('5 MAIORES',cx,cy+1.5,{align:'center'})
doc.setFontSize(9.5)
doc.setTextColor(...corIRIQ(mediaTop5))
doc.text(mediaTop5.toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2}),cx,cy+8,{align:'center'})
doc.setFontSize(4.6)
doc.text(faixaIRIQ(mediaTop5),cx,cy+13,{align:'center'})
let legenda=[
['BAIXO',[22,163,74]],
['MOD.',[245,158,11]],
['ALTO',[234,88,12]],
['CRÍT.',[220,38,38]]
]
let inicioX=x+4
let yLegenda=y+h-7
let espaco=(w-8)/4
legenda.forEach((l,i)=>{
let lx=inicioX+i*espaco
doc.setFillColor(...l[1])
doc.roundedRect(lx,yLegenda,3,3,.5,.5,'F')
doc.setFont('helvetica','bold')
doc.setFontSize(3.2)
textoPreto()
doc.text(l[0],lx+4,yLegenda+2.4)
})
}
function situacaoMunicipios(x,y,w){
faixaTitulo('SITUAÇÃO DOS 52 MUNICÍPIOS',x,y,w)
let h=27
doc.setFillColor(255,255,255)
doc.setDrawColor(219,226,234)
doc.roundedRect(x,y+6,w,h,2,2,'FD')
let itens=[
['COM PLANO',comPlano,[22,163,74]],
['EM DILAÇÃO',dilacao,[234,88,12]],
['SEM RESPOSTA',semResposta,[220,38,38]]
]
let cw=w/3
itens.forEach((i,idx)=>{
let xx=x+idx*cw
if(idx>0){
doc.setDrawColor(226,232,240)
doc.line(xx,y+10,xx,y+29)
}
doc.setFont('helvetica','bold')
doc.setFontSize(5.3)
doc.setTextColor(...i[2])
doc.text(i[0],xx+cw/2,y+13,{align:'center'})
doc.setFontSize(14)
doc.text(String(i[1]),xx+cw/2,y+22,{align:'center'})
doc.setFontSize(4.8)
textoPreto()
doc.text(`${((i[1]/totalMunicipios)*100).toFixed(1).replace('.',',')}% do total`,xx+cw/2,y+28,{align:'center'})
})
}
function listaCompacta(x,y,w,h,titulo,itens){
doc.setFillColor(255,255,255)
doc.setDrawColor(30,64,175)
doc.roundedRect(x,y,w,h,2,2,'FD')
doc.setFont('helvetica','bold')
doc.setFontSize(5.8)
doc.setTextColor(13,61,140)
doc.text(titulo,x+w/2,y+6,{align:'center'})
let yy=y+12
itens.forEach((t,idx)=>{
doc.setFillColor(13,61,140)
doc.roundedRect(x+4,yy-3.5,5,5,1,1,'F')
doc.setFont('helvetica','bold')
doc.setFontSize(4.3)
doc.setTextColor(255,255,255)
doc.text(String(idx+1),x+6.5,yy,{align:'center'})
doc.setFont('helvetica','normal')
doc.setFontSize(4.9)
textoPreto()
let linhas=doc.splitTextToSize(t,w-16)
doc.text(linhas,x+12,yy)
yy+=Math.max(7,linhas.length*3.1+2)
})
}
/*=========================================================
CABEÇALHO
=========================================================*/
if(imgQueimadas)doc.addImage(imgQueimadas,'JPEG',0,0,105,50,undefined,'FAST')
else{
doc.setFillColor(15,23,42)
doc.rect(0,0,105,50,'F')
}
if(imgLogo){
doc.addImage(imgLogo,'PNG',9,5,43,15)
}
doc.setFillColor(8,32,71)
doc.rect(105,0,105,50,'F')
doc.setFont('helvetica','bold')
doc.setTextColor(255,255,255)
doc.setFontSize(17)
doc.text('SUMÁRIO',115,13)
doc.text('EXECUTIVO',115,22)
doc.setFontSize(8.2)
doc.setTextColor(163,230,53)
doc.text('GUIA EXECUTIVO PARA',115,30)
doc.text('PREVENÇÃO E COMBATE',115,36)
doc.text('ÀS QUEIMADAS',115,42)
doc.setFont('helvetica','bold')
doc.setFontSize(5.8)
doc.setTextColor(255,255,255)
doc.text('Governança • Gestão de Riscos • Resiliência Municipal • Rondônia',115,46)
doc.setFillColor(13,61,140)
doc.rect(0,50,210,2,'F')
/*=========================================================
APRESENTAÇÃO
=========================================================*/
doc.setFillColor(248,250,252)
doc.setDrawColor(203,213,225)
doc.roundedRect(5,54,200,13,2,2,'FD')
doc.setFont('helvetica','bold')
doc.setFontSize(6.2)
textoPreto()
let apresentacao='Tribunal de Contas do Estado de Rondônia — documento executivo de apoio à leitura estratégica, ao monitoramento das políticas públicas e à orientação das ações de prevenção e combate às queimadas e aos incêndios florestais.'
doc.text(doc.splitTextToSize(apresentacao,185),105,59,{align:'center'})
/*=========================================================
KPIs
=========================================================*/
let ky=70
let gap=1
let kw=(200-gap*5)/6
kpi(5,ky,kw,'FOCOS DE CALOR '+ano,focos.toLocaleString('pt-BR'),[220,38,38],'',`01/01 a ${hoje.toLocaleDateString('pt-BR')}`)
kpi(5+(kw+gap),ky,kw,'MUNICÍPIOS COM PLANO DE AÇÃO',comPlano,[22,128,61],'',`${((comPlano/totalMunicipios)*100).toFixed(1).replace('.',',')}% do total`)
kpi(5+(kw+gap)*2,ky,kw,'MUNICÍPIOS EM DILAÇÃO',dilacao,[234,88,12],'',`${((dilacao/totalMunicipios)*100).toFixed(1).replace('.',',')}% do total`)
kpi(5+(kw+gap)*3,ky,kw,'MUNICÍPIOS SEM RESPOSTA',semResposta,[220,38,38],'',`${((semResposta/totalMunicipios)*100).toFixed(1).replace('.',',')}% do total`)
kpi(5+(kw+gap)*4,ky,kw,'MUNICÍPIOS CRÍTICOS',criticos,[220,38,38],'','')
kpi(5+(kw+gap)*5,ky,kw,'MUNICÍPIOS PRIORITÁRIOS',prioritarios,[234,88,12],'','')
/*=========================================================
GRÁFICOS
=========================================================*/
let gy=98
graficoMensal(5,gy,74,43)
graficoEscalaIRIQ(81,gy,61,43)
concentracaoIRIQ(144,gy,61,43)
/*=========================================================
SÍNTESE + AMBIENTAL
=========================================================*/
let sy=144
doc.setFillColor(248,250,252)
doc.setDrawColor(203,213,225)
doc.roundedRect(5,sy,129,32,2,2,'FD')
doc.setFont('helvetica','bold')
doc.setFontSize(5.8)
doc.setTextColor(13,61,140)
doc.text('SÍNTESE DO RISCO',18,sy+7)
doc.setFont('helvetica','normal')
doc.setFontSize(6.1)
textoPreto()
let sintese=`Embora o IRIQ estadual esteja classificado como ${faixaIRIQ(iriqEstadual)} (${iriqEstadual.toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2})}), a média dos cinco municípios de maior IRIQ alcança ${mediaTop5.toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2})} (faixa ${faixaIRIQ(mediaTop5)}). O maior índice municipal é ${maiorIRIQ.toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2})}, registrado em ${top5IRIQ[0]?.municipio||'-'}. A diferença evidencia concentração territorial do risco, recomendando priorização municipal, sem que o indicador estadual agregado seja analisado isoladamente.`
doc.text(doc.splitTextToSize(sintese,112),18,sy+12)
faixaTitulo('INDICADORES AMBIENTAIS',137,sy,68)
doc.setFillColor(255,255,255)
doc.setDrawColor(219,226,234)
doc.roundedRect(137,sy+6,68,23,2,2,'FD')
doc.setFont('helvetica','bold')
doc.setFontSize(4.4)
textoPreto()
doc.text('DESMATAMENTO',154,sy+12,{align:'center'})
doc.text('ÁREA QUEIMADA',188,sy+12,{align:'center'})
doc.setTextColor(15,23,42)
doc.setFontSize(10.5)
doc.text(desmatamento.toLocaleString('pt-BR',{maximumFractionDigits:0}),154,sy+21,{align:'center'})
doc.text(areaQueimada.toLocaleString('pt-BR',{maximumFractionDigits:0}),188,sy+21,{align:'center'})
doc.setFontSize(4.2)
doc.text('ha',164,sy+21)
doc.text('ha',198,sy+21)
/*=========================================================
SITUAÇÃO MUNICIPAL
=========================================================*/
situacaoMunicipios(5,177,147)
faixaTitulo('LEGENDA DAS CLASSIFICAÇÕES',155,177,50)
doc.setFillColor(255,255,255)
doc.setDrawColor(30,64,175)
doc.roundedRect(155,183,50,27,2,2,'FD')
let classes=[
['BAIXO: 0 a 25',[22,163,74]],
['MODERADO: 25 a 50',[245,158,11]],
['ALTO: 50 a 75',[234,88,12]],
['CRÍTICO: 75 a 100',[220,38,38]]
]
classes.forEach((i,idx)=>{
doc.setFillColor(...i[1])
doc.roundedRect(159,187+idx*5.5,3,3,.5,.5,'F')
doc.setFont('helvetica','bold')
doc.setFontSize(4.5)
textoPreto()
doc.text(i[0],165,189.5+idx*5.5)
})
/*=========================================================
ACHADOS + PRIORIDADES
=========================================================*/
let achados=[
`${semResposta} município(s) permanecem classificados como sem resposta ao TCE-RO.`,
`${dilacao} município(s) encontram-se em dilação de prazo.`,
`O IRIQ estadual é ${iriqEstadual.toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2})}, enquanto a média dos cinco maiores municípios alcança ${mediaTop5.toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2})}.`,
`O maior IRIQ municipal é ${maiorIRIQ.toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2})}, em ${top5IRIQ[0]?.municipio||'-'}.`,
`Foram registrados ${focos.toLocaleString('pt-BR')} focos de calor no período analisado.`
]
let prioridades=[
'Priorizar municípios com maiores IRIQ e concentração recente de focos.',
'Acompanhar a execução efetiva dos Planos de Ação apresentados.',
'Manter atuação específica sobre municípios sem resposta e em dilação.',
'Integrar TCE-RO, SEDAM, CBMRO, Defesa Civil e municípios no monitoramento.',
'Utilizar IRIQ, Heatmap, CHAP, IA-CHAP e Monitoramento 4D como instrumentos de decisão.'
]
listaCompacta(5,214,98,43,'ACHADOS EXECUTIVOS',achados)
listaCompacta(107,214,98,43,'PRIORIDADES PARA ACOMPANHAMENTO',prioridades)
/*=========================================================
CONCLUSÃO EXECUTIVA
=========================================================*/
doc.setFillColor(13,61,140)
doc.roundedRect(18,259,174,27,2.5,2.5,'F')
doc.setFont('helvetica','bold')
doc.setFontSize(7)
doc.setTextColor(255,255,255)
doc.text('CONCLUSÃO EXECUTIVA',24,266)
doc.setFont('helvetica','normal')
doc.setFontSize(5.8)
let conclusao='O cenário exige leitura territorializada. O baixo IRIQ estadual não representa ausência de risco relevante. A concentração dos maiores índices municipais, dos focos de calor e das fragilidades de resposta em determinados territórios justifica acompanhamento concomitante, atuação preventiva e integração permanente entre os órgãos responsáveis.'
doc.text(doc.splitTextToSize(conclusao,160),24,273)
doc.setFont('helvetica','italic')
doc.setFontSize(5)
doc.setTextColor(17,24,39)
doc.text('Fontes: INPE • PRODES • MapBiomas • SEDAM • CBMRO • Municípios de Rondônia • IRIQ • TCE-RO',5,292)
doc.setFont('helvetica','bold')
doc.setFontSize(5.2)
doc.text('PÁGINA 1 DE 1',205,292,{align:'right'})
doc.save('Sumario_Executivo_Queimadas_2026_MFN.pdf')
}

/*=========================================================
075 to data url
=========================================================*/

async function toDataURL(url){
const blob=await fetch(url).then(r=>r.blob())
return await new Promise(resolve=>{
const reader=new FileReader()
reader.onload=()=>resolve(reader.result)
reader.readAsDataURL(blob)
})
}


/*=========================================================
UTF8 CORRIGIR TEXTO
=========================================================*/
function corrigirUTF8(txt){
if(!txt)return''
return String(txt)
.replace(/Ã/g,'Á')
.replace(/Ã‰/g,'É')
.replace(/Ã/g,'Í')
.replace(/Ã“/g,'Ó')
.replace(/Ãš/g,'Ú')
.replace(/Ã /g,'à')
.replace(/Ã¡/g,'á')
.replace(/Ã¢/g,'â')
.replace(/Ã£/g,'ã')
.replace(/Ã¤/g,'ä')
.replace(/Ã§/g,'ç')
.replace(/Ã©/g,'é')
.replace(/Ãª/g,'ê')
.replace(/Ã­/g,'í')
.replace(/Ã³/g,'ó')
.replace(/Ã´/g,'ô')
.replace(/Ãµ/g,'õ')
.replace(/Ãº/g,'ú')
.replace(/Ã‡/g,'Ç')
.replace(/Ãƒ/g,'Ã')
.replace(/Â/g,'')
}


function formatarDataISOFocos(data){
let ano=data.getFullYear()
let mes=String(data.getMonth()+1).padStart(2,'0')
let dia=String(data.getDate()).padStart(2,'0')
return`${ano}-${mes}-${dia}`
}

async function buscarFocosINPERondonia(
dataInicial,
dataFinal,
periodo
){
let box=document.getElementById('painelFocosCalor')
if(!box)return
box.innerHTML=`
<div style="padding:30px;text-align:center;font-weight:900">
🔥 Consultando focos de calor do INPE...
</div>
`
try{
let {data,error}=await client.functions.invoke(
'focos-inpe-ro',
{
body:{
dataInicial,
dataFinal
}
}
)
if(error){
throw error
}
if(data?.error){
throw new Error(data.error)
}
renderPainelFocosINPE({
total:Number(data.total||0),
ranking:data.ranking||[],
periodo,
dataInicial,
dataFinal,
atualizadoEm:data.atualizadoEm
})
}catch(error){
console.error('Erro ao buscar focos do INPE:',error)
box.innerHTML=`
<div class="alerta-vermelho">
<strong>Não foi possível consultar o INPE.</strong><br>
${error.message||'Erro desconhecido.'}
</div>
`
}
}

/*=========================================================
EXPORTAR ABA ATUAL PNG ALTA RESOLUÇÃO
=========================================================*/
async function exportarAbaPNG(){
let aba=document.querySelector('.abaQueimadas:not(.hidden)')
if(!aba){
alert('Nenhuma aba ativa encontrada.')
return
}
if(typeof html2canvas==='undefined'){
alert('Biblioteca html2canvas não foi carregada.')
return
}
let botao=document.getElementById('btnExportarPNG')
let textoOriginal=botao?botao.innerHTML:'📸 PNG SLIDE'
if(botao){
botao.disabled=true
botao.innerHTML='⏳ GERANDO...'
}
try{
await new Promise(resolve=>setTimeout(resolve,500))
let largura=aba.scrollWidth
let altura=aba.scrollHeight
let canvas=await html2canvas(aba,{
scale:3,
useCORS:true,
allowTaint:false,
backgroundColor:'#f4f7fb',
logging:false,
width:largura,
height:altura,
windowWidth:largura,
windowHeight:altura,
scrollX:0,
scrollY:0,
imageTimeout:15000
})
let nomeAba=(aba.id||'painel').replace(/^aba/,'').replace(/([A-Z])/g,'-$1').toLowerCase()
let link=document.createElement('a')
link.download=`queimadas-${nomeAba}-alta-resolucao.png`
link.href=canvas.toDataURL('image/png',1)
document.body.appendChild(link)
link.click()
link.remove()
}catch(error){
console.error('Erro ao exportar painel:',error)
alert('Erro ao gerar a imagem do painel.')
}finally{
if(botao){
botao.disabled=false
botao.innerHTML=textoOriginal
}
}
}
window.exportarAbaPNG=exportarAbaPNG
