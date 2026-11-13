Warning: truncated output (original token count: 44161)
Total output lines: 5138

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
let txt=String(data).trim()
if(/^\d{4}-\d{2}-\d{2}$/.test(txt)){
let[a,m,d]=txt.split('-')
return`${d}-${m}-${String(a).slice(-2)}`
}
if(/^\d{4}-\d{2}-\d{2}T/.test(txt)){
let[a,m,d]=txt.slice(0,10).split('-')
return`${d}-${m}-${String(a).slice(-2)}`
}
if(/^\d{2}\/\d{2}\/\d{4}$/.test(txt)){
let[p,m,a]=txt.split('/')
return`${p}-${m}-${String(a).slice(-2)}`
}
let d=new Date(data)
if(isNaN(d.getTime()))return txt
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

let ano=new Date().getFullYear()
let dataInicial=`${ano}-01-01`

/*---------------------------------------------------------
BUSCAR A ÚLTIMA DATA REAL DISPONÍVEL NO INPE
---------------------------------------------------------*/
let{data:ultimoFoco,error:erroUltimoFoco}=await client
.from('queimadas_focos_inpe')
.select('data_foco').in('satelite',focosSateliteVariantes())
.eq('uf','RO')
.gte('data_foco',dataInicial)
.order('data_foco',{ascending:false})
.limit(1)
.maybeSingle()

if(erroUltimoFoco){
console.error('Erro ao buscar última data do INPE:',erroUltimoFoco)
}

let dataFinal=ultimoFoco?.data_foco
?String(ultimoFoco.data_foco).slice(0,10)
:dataInicial

let dataFinalBR=formatarDataTempoRealBR(dataFinal)

/*---------------------------------------------------------
CARREGAR INDICADORES
---------------------------------------------------------*/
let[
{data:exec},
{data:mapbiomas=[]},
{data:prodes=[]},
{count:totalFocosINPE,error:erroFocosINPE}
]=await Promise.all([

client
.from('vw_queimadas_executivo')
.select('*')
.single(),

client
.from('queimadas_mapbiomas')
.select('*'),

client
.from('queimadas_prodes')
.select('*'),

client
.from('queimadas_focos_inpe')
.select('id',{count:'exact',head:true}).in('satelite',focosSateliteVariantes())
.eq('uf','RO')
.gte('data_foco',dataInicial)
.lte('data_foco',dataFinal)

])

if(!exec)return

if(erroFocosINPE){
console.error('Erro ao calcular focos do INPE:',erroFocosINPE)
totalFocosINPE=0
}

/*---------------------------------------------------------
ÁREA QUEIMADA E DESMATAMENTO
---------------------------------------------------------*/
let areaQueimada=mapbiomas.reduce(
(s,i)=>s+Number(
i.area_queimada_hectares||
i.area_queimada||
i.area||
0
),0
)

let areaDesmatada=prodes.reduce(
(s,i)=>s+Number(
i.desmatamento_hectares||
i.area_desmatada||
i.area||
0
),0
)

/*---------------------------------------------------------
RENDERIZAÇÃO
---------------------------------------------------------*/
document.getElementById('painelKPIs').innerHTML=`
<div class="kpiGrid">

<div class="kpiCard">
<div class="kpiNumero">
${Number(totalFocosINPE||0).toLocaleString('pt-BR')}
</div>

<div class="kpiTitulo">
🔥 FOCOS DE CALOR · ${focosSateliteRotulo()}
</div>

<div style="margin-top:6px;font-size:11px;font-weight:800;color:#64748b">
01/01/${ano} até ${dataFinalBR}
</div>
</div>

<div class="kpiCard">
<div class="kpiNumero">
${areaDesmatada.toLocaleString('pt-BR',{
minimumFractionDigits:2,
maximumFractionDigits:2
})}
</div>
<div class="kpiTitulo">
🌳 DESMATAMENTO 2021-2025 (ha)
</div>
</div>

<div class="kpiCard">
<div class="kpiNumero">
${areaQueimada.toLocaleString('pt-BR',{
minimumFractionDigits:2,
maximumFractionDigits:2
})}
</div>
<div class="kpiTitulo">
🔥 ÁREA QUEIMADA 2021-2025 (ha)
</div>
</div>

<div class="kpiCard kpiCardPequeno">
<div class="kpiNumero">
${exec.municipios_criticos||0}
</div>
<div class="kpiTitulo">
🚨 CRÍTICOS
</div>
</div>

<div class="kpiCard kpiCardPequeno">
<div class="kpiNumero">
${exec.municipios_prioritarios||0}
</div>
<div class="kpiTitulo">
⚠️ PRIORITÁRIOS
</div>
</div>

<div class="kpiCard kpiCardPequeno">
<div class="kpiNumero">
${Number(exec.iriq_estadual||0).toFixed(2)}
</div>
<div class="kpiTitulo">
🤖 IRIQ ESTADUAL
</div>
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
<div class="monitor4d-kpi risco">Risco<br>${…24161 tokens truncated…doc.text('MODERADO',gx+seg*1.5,gy+11,{align:'center'})
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
kpi(5,ky,kw,'FOCOS DE CALOR EM RONDÔNIA '+ano,focos.toLocaleString('pt-BR'),[220,38,38],`01/01/${ano} até ${hoje.toLocaleDateString('pt-BR')}`)
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
let hoje=new Date()
let ano=hoje.getFullYear()
let dataInicial=`${ano}-01-01`
let dataFinal=formatarDataISOFocos(hoje)
let municipioNormalizado=normalizarMunicipio(municipio)
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
cadastros=window.aplicarDocumentosOficiaisMunicipios?.(cadastros||[])||cadastros||[]
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
let documento1=String(cadastroMunicipio?.lnumerodocenviado||cadastroMunicipio?.numero_documento||'').trim()
let documento2=String(cadastroMunicipio?.llnumerodocenviado||'').trim()
let dataRecebimento1=cadastroMunicipio?.ldatarecebimentodoc||''
let dataRecebimento2=cadastroMunicipio?.lldatarecebimentodoc||''
let dataRecebimento=''
let documento='-'
if(dataRecebimento1&&dataRecebimento2){
let t1=new Date(String(dataRecebimento1).slice(0,10)+'T00:00:00').getTime()
let t2=new Date(String(dataRecebimento2).slice(0,10)+'T00:00:00').getTime()
if(t2>=t1){dataRecebimento=dataRecebimento2;documento=documento2||documento1||'-'}
else{dataRecebimento=dataRecebimento1;documento=documento1||documento2||'-'}
}else if(dataRecebimento2){
dataRecebimento=dataRecebimento2
documento=documento2||documento1||'-'
}else if(dataRecebimento1){
dataRecebimento=dataRecebimento1
documento=documento1||documento2||'-'
}else{
documento=documento2||documento1||'-'
}
let recebimento=dataRecebimento?formatarDataBR(dataRecebimento):'-'
let textoCadastro=`${situacaoOriginal} ${documento1} ${documento2} ${observacao}`.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toUpperCase()
let possuiPlano=Boolean(cadastroMunicipio?.plano_acao)||/PLACOM|PLANO DE CONTINGENCIA|PLANO DE ACAO|PLANO MUNICIPAL|PLANO ANUAL|PIMF/.test(textoCadastro)
let possuiDilacao=Boolean(cadastroMunicipio?.dilacao_prazo)
let semResposta=Boolean(cadastroMunicipio?.sem_resposta)
let situacao=possuiPlano?'PLANO DE AÇÃO':possuiDilacao?'DILAÇÃO DE PRAZO':semResposta?'SEM RESPOSTA':situacaoOriginal
console.log('DADOS MUNICIPAIS PDF:',{municipio,dataRecebimento1,documento1,dataRecebimento2,documento2,dataRecebimento,documento,recebimento,possuiPlano,situacao})
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
const resultado=await buscarFocosTempoReal(dataInicial,dataFinal)
if(resultado.error)throw resultado.error
const focos=resultado.data||[]
const ranking=focosRanking(focos)
const data={total:focos.length,ranking,atualizadoEm:new Date().toISOString()}
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
