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
fonte:"Agenda 2030 • ONU • Indicadores Ambientais • IPT/TCE-RO."
},
MaturidadeODS:{
titulo:"📊 O que representa a Maturidade dos ODS?",
objetivo:"Avaliar o estágio de evolução institucional na implementação da Agenda 2030.",
interpretacao:"Os níveis representam a capacidade da organização em incorporar os ODS ao planejamento, execução, monitoramento e avaliação.",
decisao:"Direcionar investimentos para fortalecer a governança climática e institucional.",
fonte:"Agenda 2030 • Governança Pública • OECD • TCU • Indicadores de Monitoramento TCE-RO."
},
IA:{
titulo:"🤖 Como funciona a Análise Inteligente?",
objetivo:"Utilizar análise automatizada e inteligência analítica para apoiar a interpretação integrada dos indicadores ambientais, territoriais, operacionais e de governança monitorados.",
interpretacao:"O sistema cruza indicadores como IRIQ, IPT, risco municipal, focos de calor, áreas queimadas, desmatamento, execução das ações e demais evidências disponíveis para identificar padrões, tendências, criticidades e prioridades de acompanhamento.",
decisao:"Os resultados constituem instrumento de apoio ao planejamento, à priorização e ao acompanhamento pelo TCE-RO, não substituindo a análise técnica, a validação das evidências nem o exercício profissional do auditor.",
fonte:"TCE-RO • IRIQ • IPT • MAPBIOMAS • PRODES • INPE • Inteligência Analítica."
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
IRIQ = (Risco Municipal × 30%) + (IPT × 10%) + (Área Queimada Normalizada × 35%) + (Desmatamento Normalizado × 25%).<br>
A normalização utiliza o maior valor estadual observado no período 2021-2025, atribuindo 100 pontos ao município de maior impacto e calculando proporcionalmente os demais municípios.<br><br>
<b>Classificação HeatMap Estadual:</b><br>
🔴 Crítico: IRIQ ≥ 75<br>
🟠 Alto: IRIQ de 50 a 74,99<br>
🟡 Moderado: IRIQ de 25 a 49,99<br>
🟢 Baixo: IRIQ abaixo de 25<br><br>
<b>Fontes:</b> INPE (Focos de Calor), MAPBIOMAS (Áreas Queimadas 2021-2025), PRODES (Desmatamento 2021-2025), IPT e Painéis de Monitoramento TCE-RO.
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
<div class="fonte-card">Fonte: IRIQ Ambiental • MAPBIOMAS • PRODES • IPT/TCE-RO</div>`
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
html+='</div><div class="fonte-card">Fonte: Agenda 2030 • ONU • MAPBIOMAS • PRODES • IPT/TCE-RO • Inteligência Analítica</div></div>'
box.innerHTML=html
}
/*=========================================================
022 QUEIMADAS FUNCTION RECALCULARODSIA
=========================================================*/
async function recalcularODSIA(){

let[
{data:ranking=[]},
{data:ipt=[]},
{data:monitoramento=[]},
{data:mapbiomas=[]},
{data:prodes=[]}
]=await Promise.all([
client.from('vw_queimadas_ranking_estadual').select('*'),
client.from('queimadas_ipt').select('*'),
client.from('queimadas_monitoramento').select('*'),
client.from('queimadas_mapbiomas').select('*'),
client.from('queimadas_prodes').select('*')
])

let mediaCriticidade=ranking.length
?ranking.reduce((s,i)=>s+Number(i.indice_final||0),0)/ranking.length
:0

let mediaIPT=ipt.length
?ipt.reduce((s,i)=>s+Number(i.indice_ipt||0),0)/ipt.length
:0

let concluidos=monitoramento.filter(i=>Number(i.percentual||0)>=100).length

let desempenho=monitoramento.length
?(concluidos/monitoramento.length)*100
:0

let areaQueimada=mapbiomas.reduce(
(s,i)=>s+Number(i.area_queimada||i.area||0),0
)

let areaDesmatada=prodes.reduce(
(s,i)=>s+Number(i.area_desmatada||i.area||0),0
)

let pressao=Math.min(
100,
(areaQueimada*0.0001)+
(areaDesmatada*0.0001)+
mediaCriticidade
)

let peso13=Math.min(
100,
(pressao*0.50)+(mediaIPT*0.30)+(desempenho*0.20)
)

let peso15=Math.min(
100,
(pressao*0.40)+(mediaIPT*0.40)+(desempenho*0.20)
)

let peso16=Math.min(
100,
(desempenho*0.70)+(mediaIPT*0.30)
)

let peso11=Math.min(
100,
(mediaCriticidade*0.60)+(desempenho*0.40)
)

let peso17=Math.min(
100,
(desempenho*0.80)+(mediaIPT*0.20)
)

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

let[
{data:executivo},
{data:ranking=[]},
{data:ipt=[]},
{data:riscos=[]},
{data:monitoramento=[]},
{data:ucs=[]},
{data:mapbiomas=[]},
{data:prodes=[]}
]=await Promise.all([
client.from('vw_queimadas_executivo').select('*').single(),
client.from('vw_queimadas_ranking_estadual').select('*'),
client.from('queimadas_ipt').select('*'),
client.from('queimadas_riscos').select('*'),
client.from('queimadas_monitoramento').select('*'),
client.from('queimadas_ucs').select('*'),
client.from('queimadas_mapbiomas').select('*'),
client.from('queimadas_prodes').select('*')
])

let areaQueimada=mapbiomas.reduce(
(s,i)=>s+Number(i.area_queimada||i.area||0),0
)

let areaDesmatada=prodes.reduce(
(s,i)=>s+Number(i.area_desmatada||i.area||0),0
)

let mediaCriticidade=ranking.length
?ranking.reduce((s,i)=>s+Number(i.indice_final||0),0)/ranking.length
:0

let mediaRisco=riscos.length
?riscos.reduce((s,i)=>s+Number(i.nivel_risco||0),0)/riscos.length
:0

let mediaIPT=ipt.length
?ipt.reduce((s,i)=>s+Number(i.indice_ipt||0),0)/ipt.length
:0

let concluidos=monitoramento.filter(
i=>Number(i.percentual||0)>=100
).length

let andamento=monitoramento.filter(
i=>Number(i.percentual||0)>0&&Number(i.percentual||0)<100
).length

let desempenho=monitoramento.length
?(concluidos/monitoramento.length)*100
:0

let execucao=monitoramento.length
?((concluidos+(andamento*0.5))/monitoramento.length)*100
:0

let pressaoAmbiental=Math.min(
100,
(mediaCriticidade*0.30)+
(mediaRisco*0.20)+
(areaQueimada*0.00005)+
(areaDesmatada*0.00005)+
(mediaIPT*0.20)
)

let governanca=Math.min(
100,
(desempenho*0.50)+
(execucao*0.30)+
(mediaIPT*0.20)
)

let conservacao=Math.min(
100,
ucs.length>=49?100:ucs.length*2
)

let parceria=Math.min(
100,
(governanca*0.60)+(execucao*0.40)
)

let peso13=Math.min(
100,
(pressaoAmbiental*0.60)+(governanca*0.20)+(execucao*0.20)
)

let peso15=Math.min(
100,
(conservacao*0.50)+(pressaoAmbiental*0.30)+(execucao*0.20)
)

let peso16=Math.min(
100,
(governanca*0.70)+(execucao*0.30)
)

let peso11=Math.min(
100,
(Number(executivo?.iriq_estadual||0)*0.70)+(execucao*0.30)
)

let peso17=Math.min(
100,
(parceria*0.60)+(governanca*0.40)
)

await client.from('queimadas_ods')
.update({
peso:peso13,
resultado:peso13,
origem:'IPT AVANÇADO'
})
.eq('ods','ODS 13')

await client.from('queimadas_ods')
.update({
peso:peso15,
resultado:peso15,
origem:'IPT AVANÇADO'
})
.eq('ods','ODS 15')

await client.from('queimadas_ods')
.update({
peso:peso16,
resultado:peso16,
origem:'IPT AVANÇADO'
})
.eq('ods','ODS 16')

await client.from('queimadas_ods')
.update({
peso:peso11,
resultado:peso11,
origem:'IPT AVANÇADO'
})
.eq('ods','ODS 11')

await client.from('queimadas_ods')
.update({
peso:peso17,
resultado:peso17,
origem:'IPT AVANÇADO'
})
.eq('ods','ODS 17')

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
<div class="fonte-card">Fonte: MAPBIOMAS • PRODES • IPT/TCE-RO • Inteligência Analítica</div>
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
<div class="fonte-card">Fonte: MAPBIOMAS • PRODES • IPT/TCE-RO • Agenda 2030 • Inteligência Analítica</div>
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
<h2>ANÁLISE INTELIGENTE DE ADERÊNCIA AOS ODS</h2>
<p>A ODS com maior aderência ao Projeto Queimadas é <b>${ods?.ods||'-'}</b>, com índice calculado de <b>${Number(ods?.peso||0).toFixed(1)}%</b>.</p>
<p>${ods?.justificativa||'Análise automatizada baseada na integração de indicadores ambientais, territoriais, de governança e monitoramento, considerando MAPBIOMAS, PRODES, IRIQ, IPT e demais dados disponíveis no Projeto Queimadas.'}</p>
<div class="fonte-card">Fonte: Agenda 2030 • MAPBIOMAS • PRODES • IRIQ • IPT/TCE-RO • Inteligência Analítica</div>
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

if(typeof renderTopIAIPT==='function')await renderTopIAIPT()
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
let top=[...data]
.sort((a,b)=>Number(b.indice_final||b.iriq||0)-Number(a.indice_final||a.iriq||0))
.slice(0,5)
function classificar(v){
if(v>=75)return{
nivel:'CRÍTICO',
cor:'#dc2626',
fundo:'#fef2f2',
acao:'INTERVENÇÃO PRIORITÁRIA'
}
if(v>=50)return{
nivel:'ALTO',
cor:'#f97316',
fundo:'#fff7ed',
acao:'MONITORAMENTO INTENSIFICADO'
}
if(v>=25)return{
nivel:'MODERADO',
cor:'#eab308',
fundo:'#fefce8',
acao:'ACOMPANHAMENTO PREVENTIVO'
}
return{
nivel:'BAIXO',
cor:'#16a34a',
fundo:'#f0fdf4',
acao:'MONITORAMENTO DE ROTINA'
}
}
box.innerHTML=`
<div style="display:grid;grid-template-columns:repeat(5,minmax(190px,1fr));gap:12px">
${top.map((i,idx)=>{
let iriq=Number(i.indice_final||i.iriq||0)
let c=classificar(iriq)
return`
<div style="
background:${c.fundo};
border:1px solid #dbe3ec;
border-left:6px solid ${c.cor};
border-radius:10px;
padding:15px;
min-height:135px;
display:flex;
flex-direction:column;
justify-content:space-between;
font-weight:700">
<div>
<div style="
display:flex;
justify-content:space-between;
align-items:flex-start;
gap:10px">
<div>
<div style="
font-size:12px;
font-weight:900;
color:#475569">
${idx+1}ª PRIORIDADE
</div>
<div style="
font-size:17px;
font-weight:900;
color:#0f172a;
margin-top:5px;
line-height:1.2">
${i.municipio||'-'}
</div>
</div>
<div style="text-align:right">
<div style="
font-size:25px;
font-weight:900;
line-height:1;
color:${c.cor}">
${iriq.toFixed(2).replace('.',',')}
</div>
<div style="
font-size:11px;
font-weight:900;
margin-top:5px;
color:${c.cor}">
${c.nivel}
</div>
</div>
</div>
</div>
<div style="
margin-top:15px;
padding:8px 9px;
background:#fff;
border:1px solid #e2e8f0;
border-radius:6px;
font-size:11px;
font-weight:900;
line-height:1.3;
color:${c.cor}">
AÇÃO: ${c.acao}
</div>
</div>`
}).join('')}
</div>
<div style="
margin-top:14px;
padding:14px 16px;
background:#fff;
border:1px solid #d6dee8;
border-left:5px solid #0d3d8c;
border-radius:8px;
font-size:12px;
font-weight:700;
line-height:1.7;
color:#1e293b">
<div style="
font-size:13px;
font-weight:900;
color:#0d3d8c;
margin-bottom:8px">
LEGENDA E INTERPRETAÇÃO
</div>
<div style="margin-bottom:7px">
<strong style="font-weight:900">IRIQ — Índice de Risco Integrado de Queimadas:</strong>
indicador utilizado para comparar a criticidade relativa dos municípios e apoiar a definição das prioridades de acompanhamento, fiscalização e atuação preventiva.
</div>
<div style="
display:flex;
flex-wrap:wrap;
align-items:center;
gap:18px;
margin:8px 0;
font-size:12px;
font-weight:900">
<span style="color:#dc2626">● CRÍTICO: ≥ 75</span>
<span style="color:#f97316">● ALTO: 50 a 74,99</span>
<span style="color:#eab308">● MODERADO: 25 a 49,99</span>
<span style="color:#16a34a">● BAIXO: &lt; 25</span>
</div>
<div>
<strong style="font-weight:900">Como interpretar:</strong>
quanto maior o IRIQ, maior a criticidade relativa identificada e, consequentemente, maior deve ser a prioridade atribuída ao acompanhamento preventivo, à análise territorial e à verificação da capacidade de resposta do município.
</div>
</div>
<div style="
margin-top:11px;
padding:13px 15px;
background:#f8fafc;
border:1px solid #e2e8f0;
border-left:5px solid #0d3d8c;
font-size:11.5px;
font-weight:700;
line-height:1.65;
color:#334155">
<strong style="
font-size:12px;
font-weight:900;
color:#0f172a">
Nota metodológica:
</strong>
a predição apresentada constitui instrumento de priorização e inteligência analítica. Não representa previsão determinística da ocorrência de incêndio ou queimada. Os resultados devem ser interpretados conjuntamente com os registros de focos de calor, condições ambientais, histórico territorial, exposição, vulnerabilidade, capacidade de resposta municipal e demais evidências disponíveis no sistema de monitoramento.
</div>`
}
/*=========================================================
049 QUEIMADAS FUNCTION RENDERMATRIZRESPOSTARECOMENDADA
=========================================================*/
function renderMatrizRespostaRecomendada(){
let box=document.getElementById('painelIAPriorizacao')
if(!box)return
let niveis=[
{
nivel:'CRÍTICO',
faixa:'≥ 75',
cor:'#dc2626',
fundo:'#fef2f2',
resposta:'INTERVENÇÃO PRIORITÁRIA',
acompanhamento:'IMEDIATO',
descricao:'Prioridade máxima para análise, verificação da capacidade de resposta e acompanhamento das medidas preventivas e operacionais.'
},
{
nivel:'ALTO',
faixa:'50 a 74,99',
cor:'#f97316',
fundo:'#fff7ed',
resposta:'MONITORAMENTO INTENSIFICADO',
acompanhamento:'FREQUENTE',
descricao:'Requer acompanhamento reforçado dos focos, tendência territorial, medidas municipais e condições capazes de elevar a criticidade.'
},
{
nivel:'MODERADO',
faixa:'25 a 49,99',
cor:'#eab308',
fundo:'#fefce8',
resposta:'ACOMPANHAMENTO PREVENTIVO',
acompanhamento:'PERIÓDICO',
descricao:'Demanda vigilância preventiva e reavaliação sempre que houver crescimento dos focos, FRP elevado ou deterioração das condições locais.'
},
{
nivel:'BAIXO',
faixa:'< 25',
cor:'#16a34a',
fundo:'#f0fdf4',
resposta:'VIGILÂNCIA DE ROTINA',
acompanhamento:'REGULAR',
descricao:'Manutenção do monitoramento ordinário, sem afastar reclassificação quando surgirem novas evidências ou alterações relevantes.'
}
]
box.innerHTML=`
<div style="
display:grid;
grid-template-columns:repeat(4,1fr);
gap:12px">
${niveis.map(i=>`
<div style="
background:${i.fundo};
border:1px solid #dbe3ec;
border-top:6px solid ${i.cor};
border-radius:10px;
padding:15px;
min-height:175px">
<div style="
display:flex;
justify-content:space-between;
align-items:center;
gap:10px;
margin-bottom:10px">
<div style="
font-size:16px;
font-weight:900;
color:${i.cor}">
${i.nivel}
</div>
<div style="
font-size:17px;
font-weight:900;
color:${i.cor}">
${i.faixa}
</div>
</div>
<div style="
font-size:11px;
font-weight:900;
color:#64748b;
margin-bottom:3px">
RESPOSTA RECOMENDADA
</div>
<div style="
font-size:13px;
font-weight:900;
color:#0f172a;
margin-bottom:10px">
${i.resposta}
</div>
<div style="
font-size:11px;
font-weight:900;
color:#64748b;
margin-bottom:3px">
ACOMPANHAMENTO
</div>
<div style="
font-size:13px;
font-weight:900;
color:${i.cor};
margin-bottom:10px">
${i.acompanhamento}
</div>
<div style="
border-top:1px solid #dbe3ec;
padding-top:9px;
font-size:11.5px;
font-weight:700;
line-height:1.55;
color:#334155">
${i.descricao}
</div>
</div>
`).join('')}
</div>
<div style="
margin-top:12px;
padding:14px 16px;
background:#f8fafc;
border:1px solid #dbe3ec;
border-left:5px solid #0d3d8c;
border-radius:8px;
font-size:12px;
font-weight:700;
line-height:1.65;
color:#334155">
<strong style="
font-size:13px;
font-weight:900;
color:#0d3d8c">
ORIENTAÇÃO PARA O CONTROLE EXTERNO:
</strong>
o nível de resposta não deve ser definido exclusivamente pelo IRIQ. A decisão deve considerar conjuntamente o risco municipal, os focos recentes, a tendência temporal, o FRP, a localização territorial, a situação do Plano de Ação, a capacidade de resposta e as demais evidências de monitoramento. Municípios que apresentem agravamento recente devem ter sua prioridade reavaliada, mesmo quando enquadrados originalmente em faixas inferiores.
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
Baseado em MAPBIOMAS, PRODES, IRIQ, IPT, Plano SEDAM, POTIF e Plano Unificado TCE-RO.
</div>`
}
/*=========================================================
051 QUEIMADAS FUNCTION IASUGERIRACOES
=========================================================*/
async function iaSugerirAcoes(){

let box=document.getElementById('painelIASugestoes')
if(!box)return

let{data=[]}=await client
.from('vw_queimadas_ranking_estadual')
.select('*')

let top=[...data]
.sort((a,b)=>
Number(b.indice_final||b.iriq||0)-
Number(a.indice_final||a.iriq||0)
)
.slice(0,5)

/*=========================================================
051.1 DIAGNÓSTICO POR FAIXA DE IRIQ
=========================================================*/
function diagnostico(iriq){

if(iriq>=75)return{
nivel:'CRÍTICO',
cor:'#dc2626',
prioridade:'IMEDIATA',
tecnico:'Criticidade integrada elevada. Recomenda-se tratamento prioritário no acompanhamento concomitante, com intensificação da vigilância territorial, validação das estruturas de prevenção e avaliação da capacidade municipal de resposta.',
simples:'O município está entre os que exigem maior atenção. É necessário conferir se equipes, equipamentos, planejamento e mecanismos de resposta estão preparados antes do agravamento da situação.',
providencias:[
{
texto:'Intensificar o monitoramento dos focos de calor, avaliando distribuição espacial, frequência, recorrência e evolução temporal.',
tipo:'vermelho'
},
{
texto:'Verificar a execução efetiva do Plano de Ação Municipal, confrontando as ações previstas com as evidências documentais e operacionais apresentadas.',
tipo:'vermelho'
},
{
texto:'Avaliar a disponibilidade operacional de brigadistas, equipes, veículos, equipamentos, insumos e logística para resposta a incêndios.',
tipo:'vermelho'
},
{
texto:'Verificar eventual incidência ou proximidade de focos em Unidades de Conservação, Terras Indígenas, APPs e demais áreas ambientalmente sensíveis.',
tipo:'laranja'
},
{
texto:'Promover articulação preventiva entre Município, SEDAM, CBMRO, Defesa Civil e demais instituições responsáveis.',
tipo:'laranja'
},
{
texto:'Registrar evidências, alterações relevantes e providências adotadas para subsidiar o acompanhamento concomitante do TCE-RO.',
tipo:'verde'
}
]
}

if(iriq>=50)return{
nivel:'ALTO',
cor:'#f97316',
prioridade:'ELEVADA',
tecnico:'O índice demonstra pressão territorial relevante e recomenda monitoramento intensificado, com atenção à evolução dos fatores que compõem a criticidade municipal e à capacidade operacional de prevenção e resposta.',
simples:'O município ainda não está na faixa mais grave, mas apresenta sinais suficientes para justificar acompanhamento próximo e ações preventivas reforçadas.',
providencias:[
{
texto:'Acompanhar de forma intensificada a evolução dos focos de calor e a tendência dos indicadores municipais.',
tipo:'laranja'
},
{
texto:'Verificar o cumprimento das ações preventivas previstas no planejamento municipal.',
tipo:'laranja'
},
{
texto:'Confirmar a capacidade de mobilização das equipes e estruturas de resposta.',
tipo:'laranja'
},
{
texto:'Analisar áreas historicamente afetadas por queimadas, incêndios florestais e desmatamento.',
tipo:'laranja'
},
{
texto:'Manter registro atualizado das evidências e das providências municipais para acompanhamento do TCE-RO.',
tipo:'verde'
}
]
}

if(iriq>=25)return{
nivel:'MODERADO',
cor:'#eab308',
prioridade:'PREVENTIVA',
tecnico:'O município apresenta criticidade intermediária. A situação recomenda acompanhamento preventivo e observação sistemática da tendência dos indicadores para identificação precoce de eventual agravamento.',
simples:'A situação merece atenção, mas ainda permite atuação predominantemente preventiva. O objetivo é evitar que o crescimento dos focos ou outras vulnerabilidades façam o município avançar para níveis mais graves.',
providencias:[
{
texto:'Manter monitoramento periódico dos indicadores de risco e dos focos de calor registrados no território municipal.',
tipo:'laranja'
},
{
texto:'Confirmar a atualização do planejamento municipal e a execução das medidas preventivas previstas.',
tipo:'laranja'
},
{
texto:'Orientar ações preventivas nas áreas historicamente vulneráveis ou com recorrência de focos.',
tipo:'laranja'
},
{
texto:'Acompanhar eventual crescimento dos focos de calor e alterações relevantes na distribuição territorial.',
tipo:'verde'
},
{
texto:'Reavaliar a prioridade municipal caso os indicadores apresentem tendência consistente de aumento.',
tipo:'verde'
}
]
}

return{
nivel:'BAIXO',
cor:'#16a34a',
prioridade:'ROTINA',
tecnico:'Os indicadores disponíveis apontam menor criticidade relativa no cenário estadual, sem afastar a necessidade de vigilância permanente e manutenção das medidas preventivas.',
simples:'O cenário atual permite acompanhamento de rotina. Isso não significa ausência de risco. Qualquer crescimento relevante dos focos ou mudança dos indicadores deve provocar nova avaliação.',
providencias:[
{
texto:'Manter acompanhamento regular dos focos de calor e dos indicadores territoriais.',
tipo:'verde'
},
{
texto:'Verificar periodicamente a manutenção das ações preventivas previstas pelo município.',
tipo:'verde'
},
{
texto:'Preservar canais de comunicação com os órgãos responsáveis pela prevenção e resposta.',
tipo:'verde'
},
{
texto:'Reavaliar a classificação diante de aumento relevante dos focos ou alteração dos fatores de risco.',
tipo:'laranja'
}
]
}

}

/*=========================================================
051.2 CORES DAS PROVIDÊNCIAS
=========================================================*/
function corProvidencia(tipo){

if(tipo==='vermelho')return{
cor:'#dc2626',
fundo:'#fef2f2',
borda:'#fecaca'
}

if(tipo==='laranja')return{
cor:'#f97316',
fundo:'#fff7ed',
borda:'#fed7aa'
}

return{
cor:'#16a34a',
fundo:'#f0fdf4',
borda:'#bbf7d0'
}

}

/*=========================================================
051.3 RENDERIZAÇÃO
=========================================================*/
box.innerHTML=`

<div style="
margin-bottom:18px;
padding:16px 18px;
background:#eff6ff;
border-left:6px solid #0d3d8c;
border-radius:8px;
font-size:15px;
font-weight:800;
line-height:1.6;
color:#334155">

<b style="
font-size:16px;
font-weight:900;
color:#0d3d8c">
ORIENTAÇÃO PARA LEITURA
</b>

<br>

As recomendações abaixo são produzidas automaticamente a partir da posição relativa dos municípios no IRIQ. Elas funcionam como apoio à priorização do acompanhamento e não substituem avaliação técnica, inspeção, fiscalização ou decisão administrativa.

</div>

${top.map((i,idx)=>{

let iriq=Number(i.indice_final||i.iriq||0)
let d=diagnostico(iriq)

return`

<div style="
margin-bottom:18px;
background:#fff;
border:1px solid #e2e8f0;
border-left:7px solid ${d.cor};
border-radius:10px;
overflow:hidden">

<div style="
padding:15px 18px;
background:#f8fafc;
display:flex;
justify-content:space-between;
align-items:center;
gap:15px">

<div>

<span style="
font-size:14px;
font-weight:900;
color:#64748b">
${idx+1}ª PRIORIDADE
</span>

<div style="
font-size:22px;
font-weight:900;
color:#0f172a;
margin-top:3px">
${i.municipio||'-'}
</div>

</div>

<div style="text-align:right">

<div style="
font-size:25px;
font-weight:900;
color:${d.cor}">
IRIQ ${iriq.toFixed(2).replace('.',',')}
</div>

<div style="
font-size:14px;
font-weight:900;
color:${d.cor}">
${d.nivel} • PRIORIDADE ${d.prioridade}
</div>

</div>

</div>

<div style="padding:17px 19px">

<div style="
font-size:15px;
font-weight:900;
line-height:1.6;
color:#0f172a">

🔬 FUNDAMENTO TÉCNICO

</div>

<div style="
font-size:15px;
font-weight:800;
line-height:1.6;
color:#334155;
margin-top:4px;
margin-bottom:14px">

${d.tecnico}

</div>

<div style="
padding:12px 14px;
background:#f8fafc;
border-radius:7px;
font-size:15px;
font-weight:800;
line-height:1.6;
color:#334155">

<b style="
font-size:15px;
font-weight:900;
color:#0f172a">

💬 EM LINGUAGEM SIMPLES

</b>

<br>

${d.simples}

</div>

<div style="
margin-top:15px;
margin-bottom:9px;
font-size:16px;
font-weight:900;
color:#0f172a">

📋 PROVIDÊNCIAS SUGERIDAS

</div>

<div style="
display:grid;
gap:7px">

${d.providencias.map((p,n)=>{

let cp=corProvidencia(p.tipo)

return`

<div style="
display:flex;
gap:10px;
align-items:flex-start;
padding:9px 11px;
background:${cp.fundo};
border:1px solid ${cp.borda};
border-radius:7px">

<span style="
min-width:38px;
height:29px;
border-radius:15px;
background:${cp.cor};
color:#fff;
display:flex;
align-items:center;
justify-content:center;
font-size:14px;
font-weight:900">

${idx+1}.${n+1}

</span>

<span style="
font-size:15px;
font-weight:900;
line-height:1.5;
color:#334155">

${p.texto}

</span>

</div>

`

}).join('')}

</div>

</div>

</div>

`

}).join('')}

<div style="
margin-top:22px;
border:1px solid #cbd5e1;
border-radius:10px;
overflow:hidden;
background:#fff">

<div style="
background:#0d3d8c;
padding:13px 18px;
font-size:18px;
font-weight:900;
color:#fff">

LEGENDA GERAL DAS PROVIDÊNCIAS SUGERIDAS

</div>

<div style="
display:grid;
grid-template-columns:repeat(3,1fr)">

<div style="
padding:18px;
background:#fef2f2;
border-right:1px solid #e2e8f0">

<div style="
font-size:17px;
font-weight:900;
color:#dc2626;
margin-bottom:7px">

🔴 PROVIDÊNCIA IMEDIATA

</div>

<div style="
font-size:15px;
font-weight:800;
line-height:1.6">

Medida de maior urgência. Indica necessidade de verificação ou atuação prioritária diante de situação que possa exigir resposta rápida ou intervenção preventiva.

</div>

</div>

<div style="
padding:18px;
background:#fff7ed;
border-right:1px solid #e2e8f0">

<div style="
font-size:17px;
font-weight:900;
color:#f97316;
margin-bottom:7px">

🟠 PROVIDÊNCIA PREVENTIVA

</div>

<div style="
font-size:15px;
font-weight:800;
line-height:1.6">

Medida destinada a evitar agravamento do cenário. Indica necessidade de acompanhamento reforçado, verificação preventiva e atenção à evolução dos indicadores.

</div>

</div>

<div style="
padding:18px;
background:#f0fdf4">

<div style="
font-size:17px;
font-weight:900;
color:#16a34a;
margin-bottom:7px">

🟢 ROTINA E MANUTENÇÃO

</div>

<div style="
font-size:15px;
font-weight:800;
line-height:1.6">

Medida de acompanhamento contínuo, registro e manutenção. Não representa ausência de risco, mas situação compatível com tratamento ordinário enquanto não houver agravamento.

</div>

</div>

</div>

<div style="
padding:15px 18px;
background:#f8fafc;
border-top:1px solid #e2e8f0;
font-size:15px;
font-weight:800;
line-height:1.6;
color:#334155">

<b style="
font-weight:900;
color:#0f172a">

REGRA DE LEITURA:

</b>

a cor da providência representa sua urgência operacional e não substitui a classificação do IRIQ do município.

</div>

</div>

<div style="
margin-top:14px;
padding:13px 15px;
background:#f8fafc;
border-left:5px solid #64748b;
font-size:14px;
font-weight:800;
line-height:1.6;
color:#64748b">

<b style="
font-weight:900;
color:#334155">

USO TÉCNICO:

</b>

as sugestões constituem apoio automatizado à auditoria e ao monitoramento concomitante. A priorização deve ser confrontada com dados atualizados do INPE, MAPBIOMAS, PRODES, informações municipais, evidências documentais e avaliação das equipes técnicas.

</div>

`

}
/*=========================================================
052 QUEIMADAS FUNCTION RENDERDASHBOARDIPT
=========================================================*/
async function renderDashboardIPT(){

let box=document.getElementById('painelCHAP')
if(!box)return

let{data=[],error}=await client
.from('queimadas_ipt')
.select('municipio,indice_ipt')
.order('indice_ipt',{ascending:false})

if(error){
console.error('Erro ao carregar IPT:',error)
box.innerHTML=`
<div style="
padding:14px;
background:#fef2f2;
border-left:5px solid #dc2626;
border-radius:8px;
font-size:12px;
font-weight:800;
color:#991b1b">
Não foi possível carregar o Índice de Pressão Territorial — IPT.
</div>`
return
}

let lista=(data||[]).map(i=>{

let score=Number(i.indice_ipt||0)

let classificacao='BAIXO'
let cor='#16a34a'

if(score>=75){
classificacao='CRÍTICO'
cor='#dc2626'
}else if(score>=50){
classificacao='ALTO'
cor='#f97316'
}else if(score>=25){
classificacao='MODERADO'
cor='#eab308'
}

return{
...i,
score,
classificacao,
cor
}

})

box.innerHTML=`

<div style="overflow-x:auto">

<table style="
width:100%;
border-collapse:collapse;
background:#fff;
font-size:12px">

<thead>

<tr style="
background:#0d3d8c;
color:#fff">

<th style="
padding:10px;
text-align:center;
width:70px">
POSIÇÃO
</th>

<th style="
padding:10px;
text-align:left">
MUNICÍPIO
</th>

<th style="
padding:10px;
text-align:center;
width:120px">
IPT
</th>

<th style="
padding:10px;
text-align:center;
width:150px">
CLASSIFICAÇÃO
</th>

</tr>

</thead>

<tbody>

${lista.map((i,idx)=>`

<tr style="border-bottom:1px solid #e2e8f0">

<td style="
padding:9px;
text-align:center;
font-weight:900">
${idx+1}º
</td>

<td style="
padding:9px;
font-weight:800;
color:#0f172a">
${i.municipio||'-'}
</td>

<td style="
padding:9px;
text-align:center;
font-size:16px;
font-weight:900;
color:${i.cor}">
${i.score.toFixed(2).replace('.',',')}
</td>

<td style="padding:9px;text-align:center">

<span style="
display:inline-block;
min-width:90px;
padding:4px 10px;
border-radius:20px;
background:${i.cor};
color:#fff;
font-size:10px;
font-weight:900">
${i.classificacao}
</span>

</td>

</tr>

`).join('')}

</tbody>

</table>

</div>

<div style="
margin-top:10px;
padding:12px 14px;
background:#f8fafc;
border-left:5px solid #0d3d8c;
border-radius:7px;
font-size:11.5px;
font-weight:700;
color:#475569;
line-height:1.65">

<b style="
font-size:12px;
font-weight:900;
color:#0d3d8c">
LEITURA TÉCNICA DO IPT
</b><br>

O <b>IPT — Índice de Pressão Territorial</b> representa, em escala
padronizada, a intensidade relativa das pressões ambientais observadas
sobre o território municipal no contexto das queimadas e dos incêndios
florestais.

O índice funciona como instrumento de apoio à análise territorial,
permitindo comparar os municípios e identificar aqueles que apresentam
maior pressão e, consequentemente, demandam maior atenção no
monitoramento preventivo.

<br><br>

<b>Interpretação:</b>
quanto maior o IPT, maior é a pressão territorial identificada.
O indicador deve ser analisado conjuntamente com o IRIQ, focos de calor,
áreas queimadas, desmatamento, localização das ocorrências, unidades de
conservação, terras indígenas, capacidade municipal de resposta e demais
evidências disponíveis.

<br><br>

<b>Faixas utilizadas no painel:</b><br>
<span style="color:#dc2626;font-weight:900">● CRÍTICO:</span> IPT ≥ 75<br>
<span style="color:#f97316;font-weight:900">● ALTO:</span> IPT de 50 a 74,99<br>
<span style="color:#eab308;font-weight:900">● MODERADO:</span> IPT de 25 a 49,99<br>
<span style="color:#16a34a;font-weight:900">● BAIXO:</span> IPT abaixo de 25

<br><br>

<b>Uso no Controle Externo:</b>
o IPT não deve ser utilizado isoladamente para determinar a prioridade
de fiscalização. Sua função é complementar a análise integrada dos riscos,
subsidiando a seleção territorial, o acompanhamento concomitante e a
definição das providências preventivas pelo TCE-RO.

</div>

<div style="
margin-top:7px;
font-size:9.5px;
font-weight:700;
color:#64748b">
Fonte: Índice de Pressão Territorial — IPT • Monitoramento Integrado TCE-RO
</div>
`
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
temporealmunicipio:'btnAbaTempoRealMunicipio',
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
if(nome==='temporealmunicipio'){
document.getElementById('abaTempoRealMunicipio')?.classList.remove('hidden')
if(typeof carregarMunicipiosTempoReal==='function'){
await carregarMunicipiosTempoReal()
}
let select=document.getElementById('selectMunicipioTempoReal')
if(select&&select.value&&typeof renderTempoRealMunicipio==='function'){
await renderTempoRealMunicipio(select.value)
}
}
if(nome==='analise'){
document.getElementById('abaAnalise')?.classList.remove('hidden')

await renderDashboardIPT()
await renderMatrizRisco5x5()
await matrizRisco5x5Avancada()
await iaPreverRiscos()
renderMatrizRespostaRecomendada()
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
if(typeof carregarMunicipiosSumarioAuditoria==='function'){
await carregarMunicipiosSumarioAuditoria()
}
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
<div class="linha-ranking"><span>📊 Índice Territorial</span><b>IPT</b></div>
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
074 GERAR SUMÁRIO EXECUTIVO — PCe 0501/2026
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
/*---------------------------------------------------------
074.1 CONSULTAR DADOS COMPLETOS
---------------------------------------------------------*/
async function buscarTodosFocosEstado(dataInicial,dataFinal){
let todos=[]
let inicio=0
let tamanho=1000
while(true){
let{data=[],error}=await client
.from('queimadas_focos_inpe')
.select('*')
.gte('data_foco',dataInicial)
.lte('data_foco',dataFinal)
.order('data_foco',{ascending:true})
.range(inicio,inicio+tamanho-1)
if(error)throw error
todos.push(...data)
if(data.length<tamanho)break
inicio+=tamanho
}
return{data:todos,error:null}
}
let[
{data:focosINPE=[],error:erroFocos},
{data:municipios=[],error:erroMunicipios},
{data:heatmap=[],error:erroHeatmap},
{data:mapbiomas=[],error:erroMapbiomas},
{data:prodes=[],error:erroProdes}
]=await Promise.all([
buscarTodosFocosEstado(dataInicial,dataFinal),
client.from('vw_queimadas_municipios_resposta').select('*'),
client.from('vw_queimadas_ranking_estadual').select('*'),
client.from('queimadas_mapbiomas').select('*'),
client.from('queimadas_prodes').select('*')
])
if(erroFocos)console.error('Sumário focos:',erroFocos)
if(erroMunicipios)console.error('Sumário municípios:',erroMunicipios)
if(erroHeatmap)console.error('Sumário Ranking Estadual:',erroHeatmap)
if(erroMapbiomas)console.error('Sumário MapBiomas:',erroMapbiomas)
if(erroProdes)console.error('Sumário PRODES:',erroProdes)
focosINPE=focosINPE||[]
municipios=municipios||[]
heatmap=heatmap||[]
mapbiomas=mapbiomas||[]
prodes=prodes||[]
/*---------------------------------------------------------
074.2 NORMALIZAR TEXTO PARA CLASSIFICAÇÃO
---------------------------------------------------------*/
function normalizarTextoSumario(valor){
return String(valor||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim().toUpperCase()
}
/*---------------------------------------------------------
074.3 CONSOLIDAR MUNICÍPIOS SEM DUPLICIDADE
---------------------------------------------------------*/
let mapaMunicipios=new Map()
municipios.forEach(i=>{
let nome=String(i.municipio||'').trim()
if(!nome)return
let chave=normalizarTextoSumario(nome)
if(!mapaMunicipios.has(chave))mapaMunicipios.set(chave,i)
})
let municipiosUnicos=[...mapaMunicipios.values()]
let totalMunicipios=municipiosUnicos.length||52
/*---------------------------------------------------------
074.4 CLASSIFICAR SITUAÇÃO DOS MUNICÍPIOS
---------------------------------------------------------*/
function obterSituacaoMunicipio(i){
return normalizarTextoSumario(
i.classificacao_ia||
i.classificacao||
i.situacao||
i.status||
''
)
}
let comPlano=municipiosUnicos.filter(i=>{
let s=obterSituacaoMunicipio(i)
return s.includes('PLANO')||s.includes('ATENDIDO')
}).length
let dilacao=municipiosUnicos.filter(i=>{
let s=obterSituacaoMunicipio(i)
return s.includes('DILA')
}).length
let semResposta=municipiosUnicos.filter(i=>{
let s=obterSituacaoMunicipio(i)
return s.includes('SEM RESPOSTA')||s.includes('NAO RESPONDEU')||s.includes('SEM RETORNO')
}).length
let classificados=comPlano+dilacao+semResposta
if(classificados<totalMunicipios)semResposta+=totalMunicipios-classificados
/*---------------------------------------------------------
074.5 CONSOLIDAR FOCOS DE CALOR
---------------------------------------------------------*/
let focos=focosINPE.length
let focosMensais=Array(12).fill(0)
focosINPE.forEach(i=>{
let data=String(i.data_foco||'')
let mes=Number(data.slice(5,7))
if(mes>=1&&mes<=12)focosMensais[mes-1]++
})
/*---------------------------------------------------------
074.6 CONSOLIDAR IRIQ DOS 52 MUNICÍPIOS
---------------------------------------------------------*/
let mapaIRIQ=new Map()

;(heatmap||[]).forEach(i=>{
let municipio=String(i.municipio||'').trim()
if(!municipio)return

let chave=normalizarTextoSumario(municipio)
let iriq=Number(i.indice_final??i.iriq??0)
let risco=Number(i.risco??i.nivel_risco??0)

let registro={
...i,
municipio,
iriq:Number.isFinite(iriq)?iriq:0,
risco:Number.isFinite(risco)?risco:0
}

if(!mapaIRIQ.has(chave)){
mapaIRIQ.set(chave,registro)
}else{
let atual=mapaIRIQ.get(chave)
if(registro.iriq>atual.iriq)mapaIRIQ.set(chave,registro)
}
})

let rankingIRIQ=[...mapaIRIQ.values()]
.sort((a,b)=>b.iriq-a.iriq)

let top5IRIQ=rankingIRIQ.slice(0,5)

let mediaTop5=top5IRIQ.length
?top5IRIQ.reduce((s,i)=>s+Number(i.iriq||0),0)/top5IRIQ.length
:0

let maiorIRIQ=top5IRIQ.length
?Number(top5IRIQ[0].iriq||0)
:0
/*---------------------------------------------------------
074.7 CALCULAR IRIQ ESTADUAL
---------------------------------------------------------*/
let valoresIRIQ=rankingIRIQ.map(i=>i.iriq).filter(v=>Number.isFinite(v))
let iriqEstadual=valoresIRIQ.length?valoresIRIQ.reduce((s,v)=>s+v,0)/valoresIRIQ.length:0
/*---------------------------------------------------------
074.8 CLASSIFICAR MUNICÍPIOS POR IRIQ
---------------------------------------------------------*/
let baixos=rankingIRIQ.filter(i=>i.iriq<25).length
let moderados=rankingIRIQ.filter(i=>i.iriq>=25&&i.iriq<50).length
let altos=rankingIRIQ.filter(i=>i.iriq>=50&&i.iriq<75).length
let criticos=rankingIRIQ.filter(i=>i.iriq>=75).length
let prioritarios=rankingIRIQ.filter(i=>i.iriq>=25).length
/*---------------------------------------------------------
074.9 CONSOLIDAR INDICADORES AMBIENTAIS
---------------------------------------------------------*/
function numeroSeguro(valor){
let n=Number(valor)
return Number.isFinite(n)?n:0
}
let areaQueimada=mapbiomas.reduce((s,i)=>s+numeroSeguro(i.area_queimada_hectares),0)
let desmatamento=prodes.reduce((s,i)=>s+numeroSeguro(i.desmatamento_hectares),0)
/*---------------------------------------------------------
074.10 FAIXA DO IRIQ
---------------------------------------------------------*/
function faixaIRIQ(v){
v=Number(v||0)
if(v>=75)return'CRÍTICO'
if(v>=50)return'ALTO'
if(v>=25)return'MODERADO'
return'BAIXO'
}
/*---------------------------------------------------------
074.11 COR DO IRIQ
---------------------------------------------------------*/
function corIRIQ(v){
v=Number(v||0)
if(v>=75)return[220,38,38]
if(v>=50)return[234,88,12]
if(v>=25)return[245,158,11]
return[22,163,74]
}
/*---------------------------------------------------------
074.12 RECORTAR IMAGEM DO CABEÇALHO
---------------------------------------------------------*/
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
/*---------------------------------------------------------
074.13 DEFINIR TEXTO ESCURO
---------------------------------------------------------*/
function textoPreto(){
doc.setTextColor(17,24,39)
}
/*---------------------------------------------------------
074.14 CRIAR FAIXA DE TÍTULO
---------------------------------------------------------*/
function faixaTitulo(texto,x,y,w){
doc.setFillColor(13,61,140)
doc.roundedRect(x,y,w,6,1.5,1.5,'F')
doc.setFont('helvetica','bold')
doc.setFontSize(7)
doc.setTextColor(255,255,255)
doc.text(texto,x+w/2,y+4.2,{align:'center'})
}
/*---------------------------------------------------------
074.15 CRIAR CARD KPI
---------------------------------------------------------*/
function kpi(x,y,w,titulo,valor,cor,sub=''){
doc.setFillColor(255,255,255)
doc.setDrawColor(219,226,234)
doc.roundedRect(x,y,w,25,2.5,2.5,'FD')
doc.setFont('helvetica','bold')
doc.setFontSize(6.3)
doc.setTextColor(17,24,39)
let tituloLinhas=doc.splitTextToSize(titulo,w-5)
doc.text(tituloLinhas,x+w/2,y+5.5,{align:'center'})
doc.setFont('helvetica','bold')
doc.setFontSize(13)
doc.setTextColor(...cor)
doc.text(String(valor),x+w/2,y+17,{align:'center'})
if(sub){
doc.setFont('helvetica','normal')
doc.setFontSize(5.8)
doc.setTextColor(17,24,39)
doc.text(sub,x+w/2,y+22,{align:'center'})
}
}
/*---------------------------------------------------------
074.16 CRIAR GRÁFICO MENSAL
---------------------------------------------------------*/
function graficoMensal(x,y,w,h){
faixaTitulo(`EVOLUÇÃO MENSAL DOS FOCOS EM RONDÔNIA (${ano})`,x,y,w)
doc.setFillColor(255,255,255)
doc.setDrawColor(219,226,234)
doc.roundedRect(x,y+6,w,h-6,2,2,'FD')
let valores=focosMensais
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
doc.setFontSize(5)
textoPreto()
if(v>0)doc.text(v.toLocaleString('pt-BR'),x+7+i*bw+(bw-1.3)/2,base-bh-1.3,{align:'center'})
doc.text(meses[i],x+7+i*bw+(bw-1.3)/2,base+4,{align:'center'})
})
}
/*---------------------------------------------------------
074.17 CRIAR GRÁFICO DA ESCALA IRIQ
---------------------------------------------------------*/
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
doc.setFontSize(5.2)
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
doc.setFontSize(6.5)
doc.text('IRIQ ESTADUAL',x+w/2,y+h-16,{align:'center'})
doc.setFontSize(15)
doc.setTextColor(...corIRIQ(iriqEstadual))
doc.text(iriqEstadual.toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2}),x+w/2,y+h-8,{align:'center'})
doc.setFontSize(6.5)
doc.text(faixaIRIQ(iriqEstadual),x+w/2,y+h-3,{align:'center'})
}
/*---------------------------------------------------------
074.18 CRIAR DISTRIBUIÇÃO REAL DO IRIQ MUNICIPAL
---------------------------------------------------------*/
function concentracaoIRIQ(x,y,w,h){
faixaTitulo('DISTRIBUIÇÃO DO IRIQ MUNICIPAL',x,y,w)
doc.setFillColor(255,255,255)
doc.setDrawColor(219,226,234)
doc.roundedRect(x,y+6,w,h-6,2,2,'FD')
let totalClassificados=baixos+moderados+altos+criticos
let valores=[
{valor:baixos,cor:'#16a34a'},
{valor:moderados,cor:'#f59e0b'},
{valor:altos,cor:'#ea580c'},
{valor:criticos,cor:'#dc2626'}
]
let canvas=document.createElement('canvas')
canvas.width=600
canvas.height=600
let ctx=canvas.getContext('2d')
let centro=300
let r=230
let ri=135
let inicio=-Math.PI/2
if(totalClassificados>0){
valores.forEach(p=>{
if(!p.valor)return
let fim=inicio+(p.valor/totalClassificados)*Math.PI*2
ctx.beginPath()
ctx.arc(centro,centro,r,inicio,fim)
ctx.arc(centro,centro,ri,fim,inicio,true)
ctx.closePath()
ctx.fillStyle=p.cor
ctx.fill()
ctx.strokeStyle='#ffffff'
ctx.lineWidth=8
ctx.stroke()
inicio=fim
})
}
let cx=x+w/2
let cy=y+25
let raio=15
doc.addImage(canvas.toDataURL('image/png'),'PNG',cx-raio,cy-raio,raio*2,raio*2)
doc.setTextColor(0,0,0)
doc.setFontSize(5.5)
doc.text('MÉDIA DOS',cx,cy-2.5,{align:'center'})
doc.text('5 MAIORES',cx,cy+2,{align:'center'})
doc.setFontSize(10)
doc.text(mediaTop5.toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2}),cx,cy+22,{align:'center'})
doc.setFontSize(5.5)
doc.setTextColor(...corIRIQ(mediaTop5))
doc.text(faixaIRIQ(mediaTop5),cx,cy+29,{align:'center'})
let legenda=[
[`B ${baixos}`,[22,163,74]],
[`M ${moderados}`,[245,158,11]],
[`A ${altos}`,[234,88,12]],
[`C ${criticos}`,[220,38,38]]
]
let inicioX=x+3
let yLegenda=y+h-7
let larguraItem=(w-6)/4
legenda.forEach((l,i)=>{
let lx=inicioX+i*larguraItem
doc.setFillColor(...l[1])
doc.roundedRect(lx,yLegenda,3.2,3.2,.5,.5,'F')
doc.setFontSize(4.8)
doc.setTextColor(0,0,0)
doc.text(l[0],lx+4.5,yLegenda+2.5)
})
}
/*---------------------------------------------------------
074.19 CRIAR SITUAÇÃO DOS MUNICÍPIOS
---------------------------------------------------------*/
function situacaoMunicipios(x,y,w){
faixaTitulo(`SITUAÇÃO DOS ${totalMunicipios} MUNICÍPIOS`,x,y,w)
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
doc.setFontSize(6.5)
doc.setTextColor(...i[2])
doc.text(i[0],xx+cw/2,y+13,{align:'center'})
doc.setFontSize(14)
doc.text(String(i[1]),xx+cw/2,y+22,{align:'center'})
doc.setFontSize(5.8)
textoPreto()
doc.text(`${totalMunicipios?((i[1]/totalMunicipios)*100).toFixed(1).replace('.',','):'0,0'}% do total`,xx+cw/2,y+28,{align:'center'})
})
}
/*---------------------------------------------------------
074.20 CRIAR LISTA COMPACTA
---------------------------------------------------------*/
function listaCompacta(x,y,w,h,titulo,itens){
doc.setFillColor(255,255,255)
doc.setDrawColor(30,64,175)
doc.roundedRect(x,y,w,h,2,2,'FD')
doc.setFont('helvetica','bold')
doc.setFontSize(7)
doc.setTextColor(13,61,140)
doc.text(titulo,x+w/2,y+6,{align:'center'})
let yy=y+12
itens.forEach((t,idx)=>{
doc.setFillColor(13,61,140)
doc.roundedRect(x+4,yy-3.5,5,5,1,1,'F')
doc.setFont('helvetica','bold')
doc.setFontSize(5.2)
doc.setTextColor(255,255,255)
doc.text(String(idx+1),x+6.5,yy,{align:'center'})
doc.setFont('helvetica','normal')
doc.setFontSize(5.8)
textoPreto()
let linhas=doc.splitTextToSize(t,w-17)
doc.text(linhas,x+12,yy)
yy+=Math.max(7,linhas.length*3.1+2)
})
}
/*---------------------------------------------------------
074.21 CABEÇALHO
---------------------------------------------------------*/
if(imgQueimadas)doc.addImage(imgQueimadas,'JPEG',0,0,105,50,undefined,'FAST')
else{
doc.setFillColor(15,23,42)
doc.rect(0,0,105,50,'F')
}
if(imgLogo)doc.addImage(imgLogo,'PNG',9,5,43,15)
doc.setFillColor(8,32,71)
doc.rect(105,0,105,50,'F')
doc.setTextColor(255,255,255)
doc.setFontSize(17)
doc.text('SUMÁRIO',115,13)
doc.text('EXECUTIVO',115,22)
doc.setFontSize(8.2)
doc.setTextColor(163,230,53)
doc.text('GUIA EXECUTIVO PARA',115,30)
doc.text('PREVENÇÃO E COMBATE',115,36)
doc.text('ÀS QUEIMADAS',115,42)
doc.setFontSize(5.8)
doc.setTextColor(255,255,255)
doc.text('Governança • Gestão de Riscos • Resiliência Municipal • Rondônia',115,46)
doc.setFillColor(13,61,140)
doc.rect(0,50,210,2,'F')
/*---------------------------------------------------------
074.22 APRESENTAÇÃO
---------------------------------------------------------*/
doc.setFillColor(248,250,252)
doc.setDrawColor(203,213,225)
doc.roundedRect(5,54,200,13,2,2,'FD')
doc.setFontSize(7.2)
textoPreto()
let apresentacao='Tribunal de Contas do Estado de Rondônia — documento executivo de apoio à leitura estratégica, ao monitoramento das políticas públicas e à orientação das ações de prevenção e combate às queimadas e aos incêndios florestais.'
doc.text(doc.splitTextToSize(apresentacao,185),105,59,{align:'center'})
/*---------------------------------------------------------
074.23 INDICADORES EXECUTIVOS
---------------------------------------------------------*/
let ky=70
let gap=1
let kw=(200-gap*5)/6
kpi(5,ky,kw,'FOCOS DE CALOR EM RONDÔNIA '+ano,focos.toLocaleString('pt-BR'),[220,38,38],`01/01 a ${hoje.toLocaleDateString('pt-BR')}`)
kpi(5+(kw+gap),ky,kw,'MUNICÍPIOS COM PLANO DE AÇÃO',comPlano,[22,128,61],`${((comPlano/totalMunicipios)*100).toFixed(1).replace('.',',')}% do total`)
kpi(5+(kw+gap)*2,ky,kw,'MUNICÍPIOS EM DILAÇÃO',dilacao,[234,88,12],`${((dilacao/totalMunicipios)*100).toFixed(1).replace('.',',')}% do total`)
kpi(5+(kw+gap)*3,ky,kw,'MUNICÍPIOS SEM RESPOSTA',semResposta,[220,38,38],`${((semResposta/totalMunicipios)*100).toFixed(1).replace('.',',')}% do total`)
kpi(5+(kw+gap)*4,ky,kw,'MUNICÍPIOS CRÍTICOS',criticos,[220,38,38],'IRIQ ≥ 75')
kpi(5+(kw+gap)*5,ky,kw,'MUNICÍPIOS PRIORITÁRIOS',prioritarios,[234,88,12],'IRIQ ≥ 25')
/*---------------------------------------------------------
074.24 GRÁFICOS
---------------------------------------------------------*/
let gy=98
graficoMensal(5,gy,74,43)
graficoEscalaIRIQ(81,gy,61,43)
concentracaoIRIQ(144,gy,61,43)
/*---------------------------------------------------------
074.25 CONCEITO, FÓRMULA E FINALIDADE DO IRIQ
---------------------------------------------------------*/
doc.setFillColor(241,245,249)
doc.setDrawColor(148,163,184)
doc.roundedRect(5,143,200,12,2,2,'FD')
doc.setFontSize(5.8)
doc.setTextColor(17,24,39)
let conceitoIRIQ='IRIQ — Índice de Risco Integrado de Queimadas: indicador sintético utilizado para comparar e priorizar territorialmente os municípios conforme a criticidade relacionada às queimadas e aos incêndios florestais.'
doc.text(doc.splitTextToSize(conceitoIRIQ,190),10,147)
doc.setFontSize(5.5)
doc.setTextColor(13,61,140)
doc.text('FÓRMULA: IRIQ = (Risco × 60%) + (IPT × 40%)',10,153)
doc.setTextColor(17,24,39)
doc.text('FINALIDADE: orientar priorização, monitoramento, fiscalização e tomada de decisão do TCE-RO.',83,153)
/*---------------------------------------------------------
074.26 SÍNTESE DO RISCO
---------------------------------------------------------*/
let sy=158
doc.setFillColor(248,250,252)
doc.setDrawColor(203,213,225)
doc.roundedRect(5,sy,129,32,2,2,'FD')
doc.setFontSize(7)
doc.setTextColor(13,61,140)
doc.text('SÍNTESE DO RISCO',18,sy+7)
doc.setFontSize(7)
textoPreto()
let sintese=`O IRIQ estadual calculado a partir dos ${rankingIRIQ.length} municípios com dados disponíveis é ${iriqEstadual.toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2})}, classificado como ${faixaIRIQ(iriqEstadual)}. A média dos cinco maiores IRIQ é ${mediaTop5.toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2})}, e o maior índice municipal é ${maiorIRIQ.toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2})}, registrado em ${top5IRIQ[0]?.municipio||'-'}. A distribuição apresenta ${baixos} município(s) em nível baixo, ${moderados} moderado(s), ${altos} alto(s) e ${criticos} crítico(s).`
doc.text(doc.splitTextToSize(sintese,112),18,sy+12)
/*---------------------------------------------------------
074.27 INDICADORES AMBIENTAIS
---------------------------------------------------------*/
faixaTitulo('INDICADORES AMBIENTAIS',137,sy,68)
doc.setFillColor(255,255,255)
doc.setDrawColor(219,226,234)
doc.roundedRect(137,sy+6,68,23,2,2,'FD')
doc.setFontSize(6)
textoPreto()
doc.text('DESMATAMENTO',154,sy+12,{align:'center'})
doc.text('ÁREA QUEIMADA',188,sy+12,{align:'center'})
doc.setFontSize(11)
doc.text(desmatamento.toLocaleString('pt-BR',{maximumFractionDigits:0}),154,sy+21,{align:'center'})
doc.text(areaQueimada.toLocaleString('pt-BR',{maximumFractionDigits:0}),188,sy+21,{align:'center'})
doc.setFontSize(5.5)
doc.text('ha',164,sy+21)
doc.text('ha',198,sy+21)
/*---------------------------------------------------------
074.28 SITUAÇÃO MUNICIPAL E LEGENDA
---------------------------------------------------------*/
situacaoMunicipios(5,191,147)
faixaTitulo('LEGENDA DAS CLASSIFICAÇÕES',155,191,50)
doc.setFillColor(255,255,255)
doc.setDrawColor(30,64,175)
doc.roundedRect(155,197,50,27,2,2,'FD')
let classes=[
['BAIXO: 0 a <25',[22,163,74]],
['MODERADO: 25 a <50',[245,158,11]],
['ALTO: 50 a <75',[234,88,12]],
['CRÍTICO: 75 a 100',[220,38,38]]
]
classes.forEach((i,idx)=>{
doc.setFillColor(...i[1])
doc.roundedRect(159,201+idx*5.5,3,3,.5,.5,'F')
doc.setFontSize(5.5)
textoPreto()
doc.text(i[0],165,203.5+idx*5.5)
})
/*---------------------------------------------------------
074.29 ACHADOS E PRIORIDADES
---------------------------------------------------------*/
let achados=[
`${semResposta} município(s) permanecem classificados como sem resposta ao TCE-RO.`,
`${dilacao} município(s) encontram-se em dilação de prazo.`,
`${comPlano} município(s) possuem Plano de Ação ou atendimento correspondente.`,
`O maior IRIQ municipal é ${maiorIRIQ.toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2})}, em ${top5IRIQ[0]?.municipio||'-'}.`,
`Foram registrados ${focos.toLocaleString('pt-BR')} focos de calor entre 01/01/${ano} e ${hoje.toLocaleDateString('pt-BR')}.`
]
let prioridades=[
'Priorizar municípios com maiores IRIQ e concentração recente de focos.',
'Acompanhar a execução efetiva dos Planos de Ação apresentados.',
'Manter atuação específica sobre municípios sem resposta e em dilação.',
'Integrar TCE-RO, SEDAM, CBMRO, Defesa Civil e municípios no monitoramento.',
'Utilizar IRIQ, IPT, Heatmap e Monitoramento 4D como instrumentos integrados de apoio à decisão.'
]
listaCompacta(5,228,98,43,'ACHADOS EXECUTIVOS',achados)
listaCompacta(107,228,98,43,'PRIORIDADES PARA ACOMPANHAMENTO',prioridades)
/*---------------------------------------------------------
074.30 CONCLUSÃO EXECUTIVA
---------------------------------------------------------*/
doc.setFillColor(13,61,140)
doc.roundedRect(18,273,174,14,2.5,2.5,'F')
doc.setFontSize(7)
doc.setTextColor(255,255,255)
doc.text('CONCLUSÃO EXECUTIVA',24,278)
doc.setFontSize(5.8)
let conclusao=`O cenário exige leitura territorializada. Foram identificados ${focos.toLocaleString('pt-BR')} focos de calor no período, ${criticos} município(s) em classificação crítica e ${prioritarios} município(s) com IRIQ igual ou superior a 25. A concentração territorial dos riscos orienta a priorização da atuação preventiva e do acompanhamento pelo TCE-RO.`
doc.text(doc.splitTextToSize(conclusao,160),24,282)
/*---------------------------------------------------------
074.31 RODAPÉ E SALVAMENTO
---------------------------------------------------------*/
doc.setFontSize(5.8)
doc.setTextColor(17,24,39)
doc.text('Fontes: INPE • PRODES • MapBiomas • SEDAM • CBMRO • Municípios de Rondônia • IRIQ • TCE-RO',5,292)
doc.setFontSize(5.8)
doc.text('PÁGINA 1 DE 1',205,292,{align:'right'})
doc.save('Sumario_Executivo_Queimadas_2026_MFN.pdf')
}
/*=========================================================
075 GERAR SUMÁRIO EXECUTIVO MUNICIPAL — PCe 0501/2026
=========================================================*/
async function gerarPDFSumarioExecutivoMunicipal(municipio){
const{jsPDF}=window.jspdf
let doc=new jsPDF('p','mm','a4',true)
let hoje=new Date(),ano=hoje.getFullYear(),dataInicial=`${ano}-01-01`,dataFinal=`${ano}-12-31`,municipioNormalizado=normalizarMunicipio(municipio)
let imgLogo=await toDataURL('assets/geojson/logotcero.png').catch(()=>null)
let imgQueimadasOriginal=await toDataURL('assets/geojson/queimadas.png').catch(()=>null)
let resultadoFocos=await buscarFocosTempoReal(dataInicial,dataFinal)
if(resultadoFocos.error){console.error('Erro ao carregar focos para o PDF municipal:',resultadoFocos.error);return}
let focosRO=resultadoFocos.data||[]
let[{data:cadastros=[],error:erroCadastro},{data:heatmaps=[],error:erroHeatmap}]=await Promise.all([
client.from('vw_queimadas_municipios_resposta').select('*'),
client.from('queimadas_heatmap').select('*')
])
if(erroCadastro)console.error('Sumário municipal cadastro:',erroCadastro)
if(erroHeatmap)console.error('Sumário municipal IRIQ:',erroHeatmap)
cadastros=cadastros||[]
console.log('CADASTRO MUNICIPAL PDF:',cadastros.find(i=>normalizarMunicipio(i.municipio)===municipioNormalizado))
heatmaps=heatmaps||[]
let focos=focosRO.filter(i=>normalizarMunicipio(i.municipio)===municipioNormalizado)
let cadastroMunicipio=cadastros.find(i=>normalizarMunicipio(i.municipio)===municipioNormalizado)||{}
let heatmapMunicipio=heatmaps.find(i=>normalizarMunicipio(i.municipio)===municipioNormalizado)||{}
let totalFocos=focos.length,totalFocosRO=focosRO.length
let ordenarDataHora=(a,b)=>{
let da=String(a.data_foco||''),db=String(b.data_foco||''),ha=String(a.data_hora||a.hora||'00:00:00'),hb=String(b.data_hora||b.hora||'00:00:00')
return(`${db} ${hb}`).localeCompare(`${da} ${ha}`)
}
let focosOrdenados=[...focos].sort(ordenarDataHora)
let ultimoFoco=focosOrdenados[0]||null,ultimaData=ultimoFoco?.data_foco||null,ultimoSatelite=ultimoFoco?.satelite||'-'
let iriq=Number(heatmapMunicipio?.iriq||heatmapMunicipio?.indice_final||0)
let risco=Number(heatmapMunicipio?.risco||heatmapMunicipio?.nivel_risco||0)
let classificacao=String(heatmapMunicipio?.classificacao||(iriq>=75?'CRÍTICO':iriq>=50?'ALTO':iriq>=25?'MODERADO':'BAIXO')).toUpperCase()
let participacao=totalFocosRO>0?(totalFocos/totalFocosRO)*100:0
let observacao=String(cadastroMunicipio?.observacao||cadastroMunicipio?.observacoes||'').trim()
let situacaoOriginal=String(cadastroMunicipio?.classificacao_ia||cadastroMunicipio?.situacao||cadastroMunicipio?.status||'-').toUpperCase()
let documentoOriginal=String(cadastroMunicipio?.lnumerodocenviado||cadastroMunicipio?.llnumerodocenviado||cadastroMunicipio?.numero_documento||'-').trim()
let dataOriginal=cadastroMunicipio?.ldatarecebimentodoc||null
let textoCadastro=`${situacaoOriginal} ${documentoOriginal} ${observacao}`
let possuiPlano=/PLACOM|PLANO\s+DE\s+CONTING[ÊE]NCIA|PLANO\s+DE\s+A[CÇ][ÃA]O/i.test(textoCadastro)
let situacao=possuiPlano?'PLANO DE AÇÃO':situacaoOriginal
let matchDocumentoPlano=observacao.match(/DOCUMENTO\s*(?:N[º°.]?\s*)?(\d{1,6}\/\d{2,4})[^.;\n]*(?:PLACOM|PLANO\s+DE\s+CONTING[ÊE]NCIA|PLANO\s+DE\s+A[CÇ][ÃA]O)/i)
let documento=matchDocumentoPlano?.[1]||documentoOriginal
let matchDataPlano=observacao.match(/(?:PLACOM|PLANO\s+DE\s+CONTING[ÊE]NCIA|PLANO\s+DE\s+A[CÇ][ÃA]O)[^.;\n]{0,100}?(?:RECEBIDO|RECEBIMENTO|DATA)?\s*(?:EM|:)?\s*(\d{1,2}[\/.-]\d{1,2}[\/.-]\d{2,4})/i)
let dataPlano=matchDataPlano?.[1]||null
let recebimento=dataPlano?dataPlano.replace(/\./g,'/').replace(/-/g,'/'):possuiPlano?'-':dataOriginal?formatarDataBR(dataOriginal):'-'
let ranking=[...heatmaps].sort((a,b)=>Number(b.iriq||b.indice_final||0)-Number(a.iriq||a.indice_final||0))
let posicao=ranking.findIndex(i=>normalizarMunicipio(i.municipio)===municipioNormalizado)
posicao=posicao>=0?posicao+1:'-'
let maiores=[...focos].filter(i=>i.frp!==null&&i.frp!==undefined&&Number.isFinite(Number(i.frp))).sort((a,b)=>Number(b.frp||0)-Number(a.frp||0)).slice(0,5)
let recentes=[...focos].sort(ordenarDataHora).slice(0,5)
function faixaTituloMunicipal(texto,x,y,w){
doc.setFillColor(5,56,139);doc.roundedRect(x,y,w,5,1,1,'F');doc.setFont('helvetica','bold');doc.setFontSize(6.5);doc.setTextColor(255,255,255);doc.text(String(texto||''),x+w/2,y+3.5,{align:'center'})
}
async function recortarImagem(dataURL){
if(!dataURL)return null
return await new Promise(resolve=>{
let img=new Image()
img.onload=()=>{
let proporcaoDestino=105/28,proporcaoOrigem=img.naturalWidth/img.naturalHeight,sx=0,sy=0,sw=img.naturalWidth,sh=img.naturalHeight
if(proporcaoOrigem>proporcaoDestino){sw=img.naturalHeight*proporcaoDestino;sx=(img.naturalWidth-sw)/2}else{sh=img.naturalWidth/proporcaoDestino;sy=(img.naturalHeight-sh)/2}
let canvas=document.createElement('canvas');canvas.width=1400;canvas.height=Math.round(1400/proporcaoDestino)
canvas.getContext('2d').drawImage(img,sx,sy,sw,sh,0,0,canvas.width,canvas.height)
resolve(canvas.toDataURL('image/jpeg',.96))
}
img.onerror=()=>resolve(null);img.src=dataURL
})
}
let imgQueimadas=await recortarImagem(imgQueimadasOriginal)
function textoPreto(){doc.setTextColor(10,25,55)}
function faixaMunicipal(v){v=Number(v||0);if(v>=75)return'CRÍTICO';if(v>=50)return'ALTO';if(v>=25)return'MODERADO';return'BAIXO'}
function corMunicipal(v){v=Number(v||0);if(v>=75)return[185,28,28];if(v>=50)return[234,88,12];if(v>=25)return[202,138,4];return[21,128,61]}
function corSituacao(texto){
let s=String(texto||'').toUpperCase()
if(s.includes('SEM RESPOSTA'))return[220,38,38]
if(s.includes('DILAÇÃO')||s.includes('DILACAO'))return[202,138,4]
if(s.includes('PLANO')||s.includes('ATENDIDO'))return[21,128,61]
return[15,23,42]
}
function kpiMunicipal(x,y,w,titulo,valor,cor,sub=''){
doc.setFillColor(255,255,255);doc.setDrawColor(202,213,226);doc.roundedRect(x,y,w,21,2,2,'FD')
doc.setFont('helvetica','bold');doc.setFontSize(5.2);textoPreto();doc.text(doc.splitTextToSize(String(titulo),w-4),x+w/2,y+4.5,{align:'center'})
doc.setFontSize(String(valor).length>10?7.5:11);doc.setTextColor(...cor);doc.text(String(valor),x+w/2,y+12.5,{align:'center'})
if(sub){doc.setFontSize(4.6);doc.setFont('helvetica','bold');textoPreto();doc.text(doc.splitTextToSize(String(sub),w-4),x+w/2,y+18,{align:'center'})}
}
/*---------------------------------------------------------
075.17 CABEÇALHO
---------------------------------------------------------*/
if(imgQueimadas)doc.addImage(imgQueimadas,'JPEG',5,5,96,27)
doc.setFillColor(4,28,72);doc.rect(101,5,104,27,'F')
if(imgLogo)doc.addImage(imgLogo,'PNG',9,8,34,11)
doc.setFont('helvetica','bold');doc.setTextColor(255,255,255);doc.setFontSize(11);doc.text('SUMÁRIO EXECUTIVO',108,12)
doc.setFontSize(8);doc.text('MUNICIPAL',108,17)
doc.setFontSize(10);doc.setTextColor(163,230,53);doc.text(String(municipio).toUpperCase(),108,23)
doc.setFontSize(4.8);doc.setTextColor(255,255,255);doc.text(`PCe 0501/2026 • Atualização: ${hoje.toLocaleDateString('pt-BR')}`,108,29)
/*---------------------------------------------------------
075.18 TEXTO INSTITUCIONAL
---------------------------------------------------------*/
doc.setFillColor(248,250,252);doc.setDrawColor(202,213,226);doc.roundedRect(7,35,196,13,2,2,'FD')
doc.setFont('helvetica','bold');doc.setFontSize(6.5);textoPreto()
let textoApoio=`Tribunal de Contas do Estado de Rondônia — leitura executiva do Município de ${municipio} para acompanhamento das queimadas e incêndios florestais.`
doc.text(doc.splitTextToSize(textoApoio,184),105,40.5,{align:'center'})
/*---------------------------------------------------------
075.19 INDICADORES
---------------------------------------------------------*/
let yKpi=51
kpiMunicipal(7,yKpi,37,'FOCOS EM 2026',totalFocos.toLocaleString('pt-BR'),[239,25,25],`${participacao.toLocaleString('pt-BR',{minimumFractionDigits:1,maximumFractionDigits:1})}% de RO`)
kpiMunicipal(46,yKpi,37,'IRIQ MUNICIPAL',iriq.toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2}),corMunicipal(iriq),faixaMunicipal(iriq))
kpiMunicipal(85,yKpi,37,'POSIÇÃO IRIQ',posicao,[4,28,72],'ranking estadual')
kpiMunicipal(124,yKpi,39,'ÚLTIMO FOCO',ultimaData?formatarDataBR(ultimaData):'-',[4,28,72],ultimoSatelite)
kpiMunicipal(165,yKpi,38,'SITUAÇÃO',situacao,corSituacao(situacao),documento!=='-'?documento:recebimento)
/*---------------------------------------------------------
075.20 EVOLUÇÃO MENSAL
---------------------------------------------------------*/
faixaTituloMunicipal(`EVOLUÇÃO MENSAL DOS FOCOS (${ano})`,7,75,96)
doc.setFillColor(255,255,255);doc.setDrawColor(202,213,226);doc.roundedRect(7,80,96,36,2,2,'FD')
let focosPorMesMunicipal=Array(12).fill(0)
focos.forEach(i=>{let p=String(i.data_foco||'').slice(0,10).split('-'),m=p.length>=2?Number(p[1]):0;if(m>=1&&m<=12)focosPorMesMunicipal[m-1]++})
let maxFocosMensais=Math.max(...focosPorMesMunicipal,1),mesesGrafico=['JAN','FEV','MAR','ABR','MAI','JUN','JUL','AGO','SET','OUT','NOV','DEZ']
let baseGrafico=110,topoGrafico=84,areaGrafico=baseGrafico-topoGrafico,inicioXGrafico=11,passoGrafico=7.4,larguraBarraGrafico=4.5
focosPorMesMunicipal.forEach((v,i)=>{
let altura=v?Math.max(1,(v/maxFocosMensais)*(areaGrafico-5)):0
doc.setFillColor(239,25,25);if(altura)doc.rect(inicioXGrafico+i*passoGrafico,baseGrafico-altura,larguraBarraGrafico,altura,'F')
doc.setFont('helvetica','bold');doc.setFontSize(4.3);textoPreto()
if(v>0)doc.text(v.toLocaleString('pt-BR'),inicioXGrafico+i*passoGrafico+larguraBarraGrafico/2,baseGrafico-altura-1,{align:'center'})
doc.setFontSize(3.8);doc.text(mesesGrafico[i],inicioXGrafico+i*passoGrafico+larguraBarraGrafico/2,114,{align:'center'})
})
/*---------------------------------------------------------
075.21 IRIQ E RISCO
---------------------------------------------------------*/
faixaTituloMunicipal('IRIQ E RISCO MUNICIPAL',106,75,97)
doc.setFillColor(255,255,255);doc.setDrawColor(202,213,226);doc.roundedRect(106,80,97,36,2,2,'FD')
let centroIRIQ=130,centroRisco=179
doc.setFont('helvetica','bold');doc.setFontSize(6);textoPreto();doc.text('IRIQ',centroIRIQ,87,{align:'center'})
doc.setFontSize(14);doc.setTextColor(...corMunicipal(iriq));doc.text(iriq.toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2}),centroIRIQ,98,{align:'center'})
doc.setFontSize(6);doc.text(faixaMunicipal(iriq),centroIRIQ,104,{align:'center'})
doc.setDrawColor(210,218,228);doc.line(154.5,83,154.5,112)
doc.setFontSize(6);textoPreto();doc.text('RISCO',centroRisco,87,{align:'center'})
doc.setFontSize(14);doc.setTextColor(...corMunicipal(risco));doc.text(risco.toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2}),centroRisco,98,{align:'center'})
doc.setFontSize(6);doc.text(classificacao,centroRisco,104,{align:'center'})
doc.setFontSize(4.8);textoPreto();doc.text(`Posição estadual: ${posicao}${posicao!=='-'?'º':''}`,centroRisco,111,{align:'center'})
/*---------------------------------------------------------
075.22 SITUAÇÃO DO MUNICÍPIO
---------------------------------------------------------*/
faixaTituloMunicipal('SITUAÇÃO DO MUNICÍPIO NO ACOMPANHAMENTO',7,119,196)
doc.setFillColor(255,255,255);doc.setDrawColor(202,213,226);doc.roundedRect(7,124,196,24,2,2,'FD')
doc.setFont('helvetica','bold');doc.setFontSize(5.7);textoPreto();doc.text('Situação:',13,130)
doc.setTextColor(...corSituacao(situacao));doc.text(situacao,31,130)
textoPreto();doc.text(`Recebimento: ${recebimento}`,111,130)
doc.text(`Documento: ${documento}`,13,136)
doc.setFont('helvetica','normal');doc.setFontSize(5)
doc.text(doc.splitTextToSize(`Observação: ${observacao}`,180),13,142)
/*---------------------------------------------------------
075.23 5 MAIORES FOCOS
---------------------------------------------------------*/
faixaTituloMunicipal('5 MAIORES FOCOS DE 2026 — FRP',7,151,96)
doc.autoTable({
startY:156,margin:{left:7},tableWidth:96,
head:[['POS','DATA','SATÉLITE','FRP']],
body:maiores.map((i,idx)=>[idx+1,formatarDataBR(i.data_foco),i.satelite||'-',Number(i.frp||0).toLocaleString('pt-BR',{minimumFractionDigits:1,maximumFractionDigits:1})]),
styles:{fontSize:5.1,cellPadding:1,textColor:[17,24,39],fontStyle:'bold',halign:'center',valign:'middle'},
headStyles:{fillColor:[5,56,139],textColor:[255,255,255],fontStyle:'bold',fontSize:5},
alternateRowStyles:{fillColor:[248,250,252]},
columnStyles:{0:{cellWidth:12},1:{cellWidth:26},2:{cellWidth:37},3:{cellWidth:21}}
})
let finalTabelaMaiores=doc.lastAutoTable?.finalY||181
/*---------------------------------------------------------
075.24 5 FOCOS MAIS RECENTES
---------------------------------------------------------*/
faixaTituloMunicipal('5 FOCOS MAIS RECENTES',106,151,97)
doc.autoTable({
startY:156,margin:{left:106},tableWidth:97,
head:[['DATA','HORA','SATÉLITE','FRP']],
body:recentes.map(i=>[formatarDataBR(i.data_foco),String(i.data_hora||i.hora||'-').slice(0,8),i.satelite||'-',i.frp!==null&&i.frp!==undefined?Number(i.frp).toLocaleString('pt-BR',{minimumFractionDigits:1,maximumFractionDigits:1}):'-']),
styles:{fontSize:5.1,cellPadding:1,textColor:[17,24,39],fontStyle:'bold',halign:'center',valign:'middle'},
headStyles:{fillColor:[5,56,139],textColor:[255,255,255],fontStyle:'bold',fontSize:5},
alternateRowStyles:{fillColor:[248,250,252]},
columnStyles:{0:{cellWidth:27},1:{cellWidth:22},2:{cellWidth:30},3:{cellWidth:18}}
})
let finalTabelaRecentes=doc.lastAutoTable?.finalY||181
/*---------------------------------------------------------
075.25 CONCLUSÃO EXECUTIVA
---------------------------------------------------------*/
let yConclusao=Math.max(finalTabelaMaiores,finalTabelaRecentes)+5
let faixaIRIQ=faixaMunicipal(iriq),corIRIQ=corMunicipal(iriq),corRisco=corMunicipal(risco)
let alturaConclusao=63
if(yConclusao+alturaConclusao>281)yConclusao=218
doc.setFillColor(5,56,139);doc.roundedRect(7,yConclusao,196,alturaConclusao,2.5,2.5,'F')
doc.setFont('helvetica','bold');doc.setFontSize(8);doc.setTextColor(255,255,255);doc.text('CONCLUSÃO EXECUTIVA',13,yConclusao+7)
let yIndicadores=yConclusao+11
let indicadores=[
{titulo:'IRIQ',valor:iriq.toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2}),cor:corIRIQ,x:13,w:28},
{titulo:'FAIXA',valor:faixaIRIQ,cor:corIRIQ,x:43,w:30},
{titulo:'POSIÇÃO',valor:posicao==='-'?'-':`${posicao}ª`,cor:[37,99,235],x:75,w:27},
{titulo:'RISCO',valor:risco.toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2}),cor:corRisco,x:104,w:28},
{titulo:'CLASSIF.',valor:classificacao,cor:corRisco,x:134,w:34},
{titulo:'FOCOS',valor:totalFocos.toLocaleString('pt-BR'),cor:[220,38,38],x:170,w:27}
]
indicadores.forEach(item=>{
doc.setFillColor(255,255,255);doc.roundedRect(item.x,yIndicadores,item.w,11,1.5,1.5,'F')
doc.setFont('helvetica','bold');doc.setFontSize(4.2);doc.setTextColor(71,85,105);doc.text(item.titulo,item.x+item.w/2,yIndicadores+3.5,{align:'center'})
doc.setFontSize(6.5);doc.setTextColor(...item.cor);doc.text(String(item.valor),item.x+item.w/2,yIndicadores+8,{align:'center'})
})
let conclusao=`O Município de ${municipio} apresenta IRIQ de ${iriq.toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2})}, enquadrado na faixa ${faixaIRIQ}, ocupando a ${posicao}ª posição no ranking estadual. O IRIQ sintetiza os fatores considerados no modelo de avaliação e permite comparar a pressão relativa entre os municípios, apoiando a definição de prioridades de acompanhamento, prevenção e resposta. O Risco Municipal alcança ${risco.toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2})}, com classificação ${classificacao}, refletindo a criticidade específica do território. IRIQ e Risco Municipal são indicadores complementares: o primeiro proporciona leitura comparativa da posição municipal no Estado, enquanto o segundo evidencia a intensidade dos fatores de risco locais. Em ${ano}, foram registrados ${totalFocos.toLocaleString('pt-BR')} focos de calor, correspondentes a ${participacao.toLocaleString('pt-BR',{minimumFractionDigits:1,maximumFractionDigits:1})}% dos registros estaduais. A avaliação técnica deve considerar conjuntamente IRIQ, Risco Municipal, ranking estadual, quantidade e evolução temporal dos focos e capacidade de resposta local, orientando a priorização e a atuação preventiva e concomitante do TCE-RO e dos demais órgãos responsáveis.`
doc.setFont('helvetica','normal');doc.setFontSize(5.8);doc.setTextColor(255,255,255)
doc.text(doc.splitTextToSize(conclusao,182),13,yIndicadores+17,{lineHeightFactor:1.22})
/*---------------------------------------------------------
075.26 RODAPÉ E SALVAMENTO
---------------------------------------------------------*/
doc.setDrawColor(203,213,225);doc.setLineWidth(.3);doc.line(7,288,203,288)
doc.setFont('helvetica','normal');doc.setFontSize(5.3);textoPreto()
doc.text('Fontes: INPE • IRIQ • Heatmap Estadual • Municípios de Rondônia • TCE-RO',7,292)
doc.setFont('helvetica','bold');doc.text('PÁGINA 1 DE 1',203,292,{align:'right'})
doc.save(`Sumario_Executivo_Municipal_${municipio.replace(/\s+/g,'_')}_${ano}.pdf`)
}
/*=========================================================
076 SUMÁRIO EXECUTIVO MUNICIPAL — AUDITORIA
=========================================================*/
async function gerarPDFSumarioExecutivoMunicipalAuditoria(){
/*---------------------------------------------------------
076.1 IDENTIFICAÇÃO DO MUNICÍPIO
---------------------------------------------------------*/
const select=document.getElementById('selectMunicipioSumarioAuditoria')
const municipio=select?.value
/*---------------------------------------------------------
076.2 VALIDAÇÃO DA SELEÇÃO
---------------------------------------------------------*/
if(!municipio){
alert('Selecione um município.')
return
}
/*---------------------------------------------------------
076.3 GERAÇÃO DO SUMÁRIO MUNICIPAL
---------------------------------------------------------*/
await gerarPDFSumarioExecutivoMunicipal(municipio)
}
/*=========================================================
077 CONVERTER ARQUIVO PARA DATA URL
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
078 CORRIGIR CODIFICAÇÃO UTF-8 DO TEXTO
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
/*=========================================================
079 FORMATAR DATA ISO DOS FOCOS DE CALOR
=========================================================*/
function formatarDataISOFocos(data){
let ano=data.getFullYear()
let mes=String(data.getMonth()+1).padStart(2,'0')
let dia=String(data.getDate()).padStart(2,'0')
return`${ano}-${mes}-${dia}`
}
/*=========================================================
080 BUSCAR FOCOS DE CALOR DO INPE EM RONDÔNIA
=========================================================*/
async function buscarFocosINPERondonia(dataInicial,dataFinal,periodo){
/*---------------------------------------------------------
080.1 IDENTIFICAR PAINEL DE FOCOS DE CALOR
---------------------------------------------------------*/
let box=document.getElementById('painelFocosCalor')
if(!box)return
/*---------------------------------------------------------
080.2 EXIBIR MENSAGEM DE CONSULTA AO INPE
---------------------------------------------------------*/
box.innerHTML=`
<div style="padding:30px;text-align:center;font-weight:900">
🔥 Consultando focos de calor do INPE...
</div>
`
/*---------------------------------------------------------
080.3 CONSULTAR FUNÇÃO DE FOCOS DO INPE
---------------------------------------------------------*/
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
/*---------------------------------------------------------
080.4 VALIDAR ERROS DA CONSULTA
---------------------------------------------------------*/
if(error){
throw error
}
if(data?.error){
throw new Error(data.error)
}
/*---------------------------------------------------------
080.5 RENDERIZAR PAINEL COM OS RESULTADOS
---------------------------------------------------------*/
renderPainelFocosINPE({
total:Number(data.total||0),
ranking:data.ranking||[],
periodo,
dataInicial,
dataFinal,
atualizadoEm:data.atualizadoEm
})
/*---------------------------------------------------------
080.6 TRATAR FALHA NA CONSULTA AO INPE
---------------------------------------------------------*/
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
081 EXPORTAR ABA ATUAL EM PNG DE ALTA RESOLUÇÃO
=========================================================*/
async function exportarAbaPNG(){
/*---------------------------------------------------------
081.1 IDENTIFICAR ABA ATIVA
---------------------------------------------------------*/
let aba=document.querySelector('.abaQueimadas:not(.hidden)')
if(!aba){
alert('Nenhuma aba ativa encontrada.')
return
}
/*---------------------------------------------------------
081.2 VALIDAR BIBLIOTECA HTML2CANVAS
---------------------------------------------------------*/
if(typeof html2canvas==='undefined'){
alert('Biblioteca html2canvas não foi carregada.')
return
}
/*---------------------------------------------------------
081.3 PREPARAR BOTÃO DE EXPORTAÇÃO
---------------------------------------------------------*/
let botao=document.getElementById('btnExportarPNG')
let textoOriginal=botao?botao.innerHTML:'📸 PNG SLIDE'
if(botao){
botao.disabled=true
botao.innerHTML='⏳ GERANDO...'
}
/*---------------------------------------------------------
081.4 PREPARAR DIMENSÕES DA ABA
---------------------------------------------------------*/
try{
await new Promise(resolve=>setTimeout(resolve,500))
let largura=aba.scrollWidth
let altura=aba.scrollHeight
/*---------------------------------------------------------
081.5 CAPTURAR ABA EM ALTA RESOLUÇÃO
---------------------------------------------------------*/
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
/*---------------------------------------------------------
081.6 DEFINIR NOME DO ARQUIVO PNG
---------------------------------------------------------*/
let nomeAba=(aba.id||'painel').replace(/^aba/,'').replace(/([A-Z])/g,'-$1').toLowerCase()
/*---------------------------------------------------------
081.7 GERAR E BAIXAR ARQUIVO PNG
---------------------------------------------------------*/
let link=document.createElement('a')
link.download=`queimadas-${nomeAba}-alta-resolucao.png`
link.href=canvas.toDataURL('image/png',1)
document.body.appendChild(link)
link.click()
link.remove()
/*---------------------------------------------------------
081.8 TRATAR ERRO DE EXPORTAÇÃO
---------------------------------------------------------*/
}catch(error){
console.error('Erro ao exportar painel:',error)
alert('Erro ao gerar a imagem do painel.')
/*---------------------------------------------------------
081.9 RESTAURAR BOTÃO DE EXPORTAÇÃO
---------------------------------------------------------*/
}finally{
if(botao){
botao.disabled=false
botao.innerHTML=textoOriginal
}
}
}
/*=========================================================
082 DISPONIBILIZAR EXPORTAÇÃO PNG GLOBALMENTE
=========================================================*/
window.exportarAbaPNG=exportarAbaPNG
/*=========================================================
083 CARREGAR MUNICÍPIOS DO SUMÁRIO DE AUDITORIA
=========================================================*/
async function carregarMunicipiosSumarioAuditoria(){
/*---------------------------------------------------------
083.1 IDENTIFICAR SELETOR DE MUNICÍPIOS
---------------------------------------------------------*/
let select=document.getElementById('selectMunicipioSumarioAuditoria')
if(!select)return
/*---------------------------------------------------------
083.2 CONSULTAR MUNICÍPIOS CADASTRADOS
---------------------------------------------------------*/
const{data,error}=await client.from('vw_queimadas_municipios_resposta').select('municipio').order('municipio',{ascending:true})
/*---------------------------------------------------------
083.3 TRATAR ERRO NA CONSULTA
---------------------------------------------------------*/
if(error){
console.error('Erro ao carregar municípios:',error)
return
}
/*---------------------------------------------------------
083.4 ELIMINAR MUNICÍPIOS DUPLICADOS
---------------------------------------------------------*/
let municipios=[...new Set((data||[]).map(i=>i.municipio).filter(Boolean))]
/*---------------------------------------------------------
083.5 PREENCHER SELETOR DE MUNICÍPIOS
---------------------------------------------------------*/
select.innerHTML=`
<option value="">Selecione o município...</option>
${municipios.map(m=>`<option value="${m}">${m}</option>`).join('')}
`
}


function toggleMetodologiaCHAP(){
let conteudo=document.getElementById('chapMetodologiaConteudo')
let toggle=document.getElementById('chapToggle')
let acao=document.getElementById('chapAcao')
if(!conteudo)return
let oculto=conteudo.style.display==='none'
if(oculto){
conteudo.style.display='block'
if(toggle)toggle.textContent='−'
if(acao)acao.textContent='OCULTAR'
}else{
conteudo.style.display='none'
if(toggle)toggle.textContent='+'
if(acao)acao.textContent='EXIBIR'
}
}
