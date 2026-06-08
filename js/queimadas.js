/*=========================================================
001 FORMATAR DATA BR
=========================================================*/
function formatarDataBR(data){
if(!data)return '-'
let d=new Date(data)
if(isNaN(d))return String(data)
let dia=String(d.getDate()).padStart(2,'0')
let mes=String(d.getMonth()+1).padStart(2,'0')
let ano=String(d.getFullYear()).slice(-2)
return `${dia}-${mes}-${ano}`
}
/*=========================================================
002 CHART DATALABELS
=========================================================*/
if(typeof ChartDataLabels!=='undefined'){
Chart.register(ChartDataLabels)
}
/*=========================================================
003 FORMATADORES GERAIS
=========================================================*/
function formatarNumero(v){
let n=Number(v||0)
return n.toLocaleString('pt-BR')
}
/*=========================================================
004 QUEIMADAS FUNCTION RENDERCADEIAVALOR
=========================================================*/
async function renderCadeiaValor(){
let box=document.getElementById('painelCadeiaValor')
if(!box)return
let {data,error}=await client
.from('queimadas_monitoramento')
.select('*')
if(error){
console.log(error)
box.innerHTML='Erro ao carregar.'
return
}
let total=(data||[]).length
let andamento=(data||[]).filter(i=>Number(i.percentual||0)>0).length
let concluidos=(data||[]).filter(i=>Number(i.percentual||0)>=100).length
box.innerHTML=`
<div class="cadeia-card">
<div class="cadeia-item">CADEIA DE VALOR DO PLANO DE AÇÃO</div>
<div class="cadeia-flow">
<div class="cadeia-box cadeia-insumo">📥<br>Recursos Humanos<br>Equipamentos<br>Sistemas</div>
<div class="cadeia-seta">➜</div>
<div class="cadeia-box cadeia-atividade">⚙️<br>${total}<br>Ações Planejadas</div>
<div class="cadeia-seta">➜</div>
<div class="cadeia-box cadeia-produto">📦<br>${andamento}<br>Ações Executadas</div>
<div class="cadeia-seta">➜</div>
<div class="cadeia-box cadeia-resultado">📈<br>${concluidos}<br>Resultados Entregues</div>
<div class="cadeia-seta">➜</div>
<div class="cadeia-box cadeia-impacto">🎯<br>Redução das Queimadas</div>
<div class="cadeia-seta">➜</div>
<div class="cadeia-box cadeia-beneficio">👨‍👩‍👧‍👦<br>Proteção Ambiental</div>
</div>
</div>`
}
/*=========================================================
005 QUEIMADAS FUNCTION RENDERGANTT
=========================================================*/
async function renderGantt(){
let box=document.getElementById('painelGantt')
if(!box)return
let {data,error}=await client
.from('queimadas_planejamento')
.select('*')
.order('inicio',{ascending:true})
if(error){
console.log(error)
box.innerHTML='Erro ao carregar cronograma.'
return
}
let mesAtual=new Date().getMonth()+1
let meses=['JAN','FEV','MAR','ABR','MAI','JUN','JUL','AGO','SET','OUT','NOV','DEZ']
let html=''
html+='<div class="gantt-header">'
html+='<div>AÇÃO</div>'
meses.forEach(m=>html+=`<div>${m}</div>`)
html+='</div>'
;(data||[]).forEach(i=>{
let ini=i.inicio?new Date(i.inicio):null
let fim=i.fim?new Date(i.fim):null
let mi=ini?(ini.getMonth()+1):1
let mf=fim?(fim.getMonth()+1):12
let status=String(i.status||'').toUpperCase()
if(status==='CONTÍNUO'){
mi=1
mf=12
}
if(status==='EXECUÇÃO'){
mi=mesAtual
mf=12
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
html+='<div class="fonte-card">Fonte: Tabela queimadas_planejamento • SEDAM • CBMRO • TCERO • Municípios</div>'
box.innerHTML=html
}
/*=========================================================
006 QUEIMADAS FUNCTION RENDERMATRIZRISCO5X5
=========================================================*/
async function renderMatrizRisco5x5(){
let box=
document.getElementById('painelMatriz5x5')
||
document.getElementById('painelRiscos')
if(!box)return
let {data,error}=await client
.from('queimadas_riscos')
.select('*')
if(error){
console.log(error)
return
}
let matriz={}
for(let i=1;i<=5;i++){
for(let j=1;j<=5;j++){
matriz[`${i}_${j}`]=[]
}
}
data.forEach(r=>{
let p=Number(r.probabilidade||1)
let imp=Number(r.impacto||1)
matriz[`${p}_${imp}`].push(r)
})
let html=''
html+='<div class="matriz5x5">'
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
html+=`
<div class="${classe}">
${matriz[`${x}_${y}`].map(r=>`
<div class="risco-tag">
🔥 ${r.fonte_calor||''}
<br>
${r.risco||''}
</div>`).join('')}
</div>`
}
}
html+='</div>'
box.innerHTML=html
}
/*=========================================================
007 QUEIMADAS FUNCTION RENDERTEORIAMUDANCA
=========================================================*/
async function renderTeoriaMudanca(){
let box=document.getElementById('painelTeoriaMudanca')
if(!box)return
let {data=[]}=await client
.from('queimadas_monitoramento')
.select('*')
let total=data.length
let concluidos=data.filter(i=>Number(i.percentual||0)>=100).length
box.innerHTML=`
<div class="tdm-card">
<div class="tdm-titulo">TEORIA DA MUDANÇA - QUEIMADAS 2026</div>
<div class="tdm-flow">
<div class="tdm-box tdm-problema">🚨<br>Queimadas e Incêndios Florestais</div>
<div class="tdm-seta">↓</div>
<div class="tdm-box tdm-causa">🔍<br>Pressão Antrópica<br>Estiagem</div>
<div class="tdm-seta">↓</div>
<div class="tdm-box tdm-acao">⚙️<br>${total}<br>Ações Planejadas</div>
<div class="tdm-seta">↓</div>
<div class="tdm-box tdm-resultado">📈<br>${concluidos}<br>Entregas Concluídas</div>
<div class="tdm-seta">↓</div>
<div class="tdm-box tdm-impacto">🎯<br>Redução de Riscos</div>
<div class="tdm-seta">↓</div>
<div class="tdm-box tdm-beneficio">👨‍👩‍👧‍👦<br>Proteção da População e das UCs</div>
</div>
</div>`
}
/*=========================================================
008 QUEIMADAS FUNCTION ANALISARCHAPIA
=========================================================*/
function analisarCHAPIA(registro){
let diagnostico=[]
let ods=[]
let riscos=[]
if(!registro.insumo){
diagnostico.push('Conhecimento insuficiente.')
}
if(!registro.atividade){
diagnostico.push('Habilidade operacional não demonstrada.')
}
if(!registro.produto){
diagnostico.push('Produto estratégico não identificado.')
}
if(!registro.resultado){
diagnostico.push('Resultado esperado não definido.')
}
if(!registro.impacto){
diagnostico.push('Impacto social não definido.')
}
let texto=JSON.stringify(registro).toLowerCase()
if(texto.includes('queimada')){
ods.push('ODS 13')
ods.push('ODS 15')
riscos.push('Eventos climáticos extremos')
}
if(texto.includes('fiscalização')){
ods.push('ODS 16')
riscos.push('Baixa capacidade operacional')
}
if(texto.includes('brigada')){
ods.push('ODS 15')
riscos.push('Déficit de pessoal especializado')
}
return{
score:Math.max(0,100-(diagnostico.length*15)),
diagnostico:diagnostico,
ods:[...new Set(ods)],
riscos:[...new Set(riscos)]
}
}
/*=========================================================
009 QUEIMADAS FUNCTION CARREGARKPISEXECUTIVOS
=========================================================*/
async function carregarKPIsExecutivos(){
let {data,error}=await client
.from('queimadas_monitoramento')
.select('*')
if(error){
console.log(error)
return
}
let municipios=new Set()
let focos=0
let riscos=0
let soma=0
data.forEach(i=>{
if(i.municipio)municipios.add(i.municipio)
soma+=Number(i.percentual||0)
if(Number(i.percentual||0)<50)riscos++
if(Number(i.percentual||0)>0)focos++
})
let media=data.length?Math.round(soma/data.length):0
let el1=document.getElementById('kpiMunicipios')
let el2=document.getElementById('kpiFocos')
let el3=document.getElementById('kpiRiscos')
let el4=document.getElementById('kpiExecucao')
if(el1)el1.innerText=municipios.size
if(el2)el2.innerText=focos
if(el3)el3.innerText=riscos
if(el4)el4.innerText=media+'%'
let pop=await calcularPopulacaoExposta()
let area=await calcularAreaRisco()
let areaKm2=(Number(area||0)/1000000).toFixed(2)
let iriq=await calcularIRIQ()
let k1=document.getElementById('kpiPopulacaoExposta')
if(k1)k1.innerText=
pop.toLocaleString('pt-BR')
let k2=document.getElementById('kpiAreaRisco')
if(k2)k2.innerText=
area+' km²'
let k3=document.getElementById('kpiIRIQ')
if(k3)k3.innerText=iriq
}
/*=========================================================
010 QUEIMADAS FUNCTION RENDERPLANOUNIFICADO
=========================================================*/
function renderPlanoUnificado(){
let box=document.getElementById('painelPlanoUnificado')
if(!box)return
box.innerHTML=`
<ul>
<li>Fiscalização Ambiental</li>
<li>Prevenção às Queimadas</li>
<li>Resposta Operacional</li>
<li>Monitoramento de Focos de Calor</li>
<li>Capacitação de Brigadistas</li>
<li>Monitoramento de Municípios Prioritários</li>
<li>Acompanhamento Orçamentário</li>
<li>Monitoramento CEPCIF</li>
<li>OVR 2026</li>
<li>POTIF 2026</li>
</ul>`
}
/*=========================================================
011 QUEIMADAS FUNCTION RENDERPLANOSEDAM
=========================================================*/
async function renderPlanoSEDAM(){
let box=document.getElementById('painelPlanoSEDAM')
if(!box)return
let {data}=await client.from('queimadas_planejamento').select('*').eq('origem','SEDAM')
let mapa={}
;(data||[]).forEach(i=>{mapa[(i.acao||'').toUpperCase()]=i})
box.innerHTML=`
<div class="cadeia-card">
<div class="cadeia-item">PLANO DE AÇÃO SEDAM 2026</div>
<div class="cadeia-flow">
<div class="cadeia-box cadeia-insumo" style="border-top:5px solid ${mapa['PREVENÇÃO']?.cor||'#16a34a'}">🌳 PREVENÇÃO<br><span class="periodo-plano">${mapa['PREVENÇÃO']?formatarDataBR(mapa['PREVENÇÃO'].inicio)+' a '+formatarDataBR(mapa['PREVENÇÃO'].fim):'Período não informado'}</span><span class="responsavel-plano">${mapa['PREVENÇÃO']?.responsavel||''}</span><span class="status-plano">${mapa['PREVENÇÃO']?.status||''}</span></div>
<div class="cadeia-box cadeia-atividade" style="border-top:5px solid ${mapa['FISCALIZAÇÃO']?.cor||'#2563eb'}">🚔 FISCALIZAÇÃO<br><span class="periodo-plano">${mapa['FISCALIZAÇÃO']?formatarDataBR(mapa['FISCALIZAÇÃO'].inicio)+' a '+formatarDataBR(mapa['FISCALIZAÇÃO'].fim):'Período não informado'}</span><span class="responsavel-plano">${mapa['FISCALIZAÇÃO']?.responsavel||''}</span><span class="status-plano">${mapa['FISCALIZAÇÃO']?.status||''}</span></div>
<div class="cadeia-box cadeia-produto" style="border-top:5px solid ${mapa['COMBATE']?.cor||'#dc2626'}">🔥 COMBATE<br><span class="periodo-plano">${mapa['COMBATE']?formatarDataBR(mapa['COMBATE'].inicio)+' a '+formatarDataBR(mapa['COMBATE'].fim):'Período não informado'}</span><span class="responsavel-plano">${mapa['COMBATE']?.responsavel||''}</span><span class="status-plano">${mapa['COMBATE']?.status||''}</span></div>
<div class="cadeia-box cadeia-resultado" style="border-top:5px solid ${mapa['REDUÇÃO']?.cor||'#f97316'}">📈 REDUÇÃO<br><span class="periodo-plano">${mapa['REDUÇÃO']?formatarDataBR(mapa['REDUÇÃO'].inicio)+' a '+formatarDataBR(mapa['REDUÇÃO'].fim):'Período não informado'}</span><span class="responsavel-plano">${mapa['REDUÇÃO']?.responsavel||''}</span><span class="status-plano">${mapa['REDUÇÃO']?.status||''}</span></div>
<div class="cadeia-box cadeia-impacto" style="border-top:5px solid ${mapa['IMPACTO']?.cor||'#7c3aed'}">🌎 IMPACTO<br><span class="periodo-plano">${mapa['IMPACTO']?formatarDataBR(mapa['IMPACTO'].inicio)+' a '+formatarDataBR(mapa['IMPACTO'].fim):'Período não informado'}</span><span class="responsavel-plano">${mapa['IMPACTO']?.responsavel||''}</span><span class="status-plano">${mapa['IMPACTO']?.status||''}</span></div>
<div class="cadeia-box cadeia-beneficio" style="border-top:5px solid ${mapa['CIDADÃO']?.cor||'#10b981'}">👨‍👩‍👧‍👦 CIDADÃO<br><span class="periodo-plano">${mapa['CIDADÃO']?formatarDataBR(mapa['CIDADÃO'].inicio)+' a '+formatarDataBR(mapa['CIDADÃO'].fim):'Período não informado'}</span><span class="responsavel-plano">${mapa['CIDADÃO']?.responsavel||''}</span><span class="status-plano">${mapa['CIDADÃO']?.status||''}</span></div>
</div>
<div class="fonte-card">Fonte: Plano de Ação SEDAM 2026 • Tabela queimadas_planejamento</div>
</div>`
}
/*=========================================================
012 QUEIMADAS FUNCTION RENDERPLANOCBM
=========================================================*/
async function renderPlanoCBM(){
let box=document.getElementById('painelPlanoCBM')
if(!box)return
let {data}=await client.from('queimadas_planejamento').select('*').eq('origem','CBMRO')
let mapa={}
;(data||[]).forEach(i=>{mapa[(i.acao||'').toUpperCase()]=i})
box.innerHTML=`
<div class="cadeia-card">
<div class="cadeia-item">POTIF 2026 - CORPO DE BOMBEIROS</div>
<div class="cadeia-flow">
<div class="cadeia-box cadeia-insumo" style="border-top:5px solid ${mapa['BRIGADAS']?.cor||'#16a34a'}">🚒 BRIGADAS<br><span class="periodo-plano">${mapa['BRIGADAS']?formatarDataBR(mapa['BRIGADAS'].inicio)+' a '+formatarDataBR(mapa['BRIGADAS'].fim):'Período não informado'}</span><span class="responsavel-plano">${mapa['BRIGADAS']?.responsavel||''}</span><span class="status-plano">${mapa['BRIGADAS']?.status||''}</span></div>
<div class="cadeia-box cadeia-atividade" style="border-top:5px solid ${mapa['COMBATE']?.cor||'#dc2626'}">🧯 COMBATE<br><span class="periodo-plano">${mapa['COMBATE']?formatarDataBR(mapa['COMBATE'].inicio)+' a '+formatarDataBR(mapa['COMBATE'].fim):'Período não informado'}</span><span class="responsavel-plano">${mapa['COMBATE']?.responsavel||''}</span><span class="status-plano">${mapa['COMBATE']?.status||''}</span></div>
<div class="cadeia-box cadeia-produto" style="border-top:5px solid ${mapa['CONTROLE']?.cor||'#2563eb'}">🔥 CONTROLE<br><span class="periodo-plano">${mapa['CONTROLE']?formatarDataBR(mapa['CONTROLE'].inicio)+' a '+formatarDataBR(mapa['CONTROLE'].fim):'Período não informado'}</span><span class="responsavel-plano">${mapa['CONTROLE']?.responsavel||''}</span><span class="status-plano">${mapa['CONTROLE']?.status||''}</span></div>
<div class="cadeia-box cadeia-resultado" style="border-top:5px solid ${mapa['REDUÇÃO']?.cor||'#f97316'}">📉 REDUÇÃO<br><span class="periodo-plano">${mapa['REDUÇÃO']?formatarDataBR(mapa['REDUÇÃO'].inicio)+' a '+formatarDataBR(mapa['REDUÇÃO'].fim):'Período não informado'}</span><span class="responsavel-plano">${mapa['REDUÇÃO']?.responsavel||''}</span><span class="status-plano">${mapa['REDUÇÃO']?.status||''}</span></div>
<div class="cadeia-box cadeia-impacto" style="border-top:5px solid ${mapa['PRESERVAÇÃO']?.cor||'#22c55e'}">🌳 PRESERVAÇÃO<br><span class="periodo-plano">${mapa['PRESERVAÇÃO']?formatarDataBR(mapa['PRESERVAÇÃO'].inicio)+' a '+formatarDataBR(mapa['PRESERVAÇÃO'].fim):'Período não informado'}</span><span class="responsavel-plano">${mapa['PRESERVAÇÃO']?.responsavel||''}</span><span class="status-plano">${mapa['PRESERVAÇÃO']?.status||''}</span></div>
<div class="cadeia-box cadeia-beneficio" style="border-top:5px solid ${mapa['SEGURANÇA']?.cor||'#14b8a6'}">👨‍👩‍👧‍👦 SEGURANÇA<br><span class="periodo-plano">${mapa['SEGURANÇA']?formatarDataBR(mapa['SEGURANÇA'].inicio)+' a '+formatarDataBR(mapa['SEGURANÇA'].fim):'Período não informado'}</span><span class="responsavel-plano">${mapa['SEGURANÇA']?.responsavel||''}</span><span class="status-plano">${mapa['SEGURANÇA']?.status||''}</span></div>
</div>
<div class="fonte-card">Fonte: POTIF 2026 • CBMRO • Tabela queimadas_planejamento</div>
</div>`
}
/*=========================================================
013 QUEIMADAS FUNCTION RENDERMARCOS
=========================================================*/
async function renderMarcos(){
let box=document.getElementById('painelMarcos')
if(!box)return
box.innerHTML=`
<div class="monitor4d-card">
<b>JANEIRO A MARÇO</b><br>
Planejamento Estratégico<br>
Status: Concluído
</div>
<div class="monitor4d-card">
<b>ABRIL A JUNHO</b><br>
Prevenção e Fiscalização<br>
Status: Em Execução
</div>
<div class="monitor4d-card">
<b>JULHO A OUTUBRO</b><br>
Período Crítico de Estiagem<br>
Status: Planejado
</div>
<div class="monitor4d-card">
<b>NOVEMBRO A DEZEMBRO</b><br>
Avaliação Final e Relatório<br>
Status: Planejado
</div>`
}
/*=========================================================
014 QUEIMADAS FUNCTION RENDEREXECUCAOFISICA
=========================================================*/
async function renderExecucaoFisica(){
let box=document.getElementById('painelExecucaoFisica')
if(!box)return
let {data,error}=await client.from('queimadas_monitoramento').select('*')
if(error){
console.log(error)
return
}
let total=(data||[]).length
let soma=0
;(data||[]).forEach(i=>{
soma+=Number(i.percentual||0)
})
let media=total?Math.round(soma/total):0
box.innerHTML=`
<div class="impacto-box">
<div class="impacto-score">${media}%</div>
<div class="impacto-label">EXECUÇÃO FÍSICA MÉDIA</div>
</div>`
}
/*=========================================================
015 QUEIMADAS FUNCTION RENDEREXECUCAOFINANCEIRA
=========================================================*/
async function renderExecucaoFinanceira(){
let box=document.getElementById('painelExecucaoFinanceira')
if(!box)return
let {data,error}=await client.from('queimadas_monitoramento').select('*')
if(error){
console.log(error)
return
}
let total=0
;(data||[]).forEach(i=>{
total+=Number(i.valor_executado||i.valor||0)
})
box.innerHTML=`
<div class="impacto-box">
<div class="impacto-score">R$ ${formatarNumero(total)}</div>
<div class="impacto-label">EXECUÇÃO FINANCEIRA</div>
</div>`
}
/*=========================================================
016 QUEIMADAS FUNCTION RENDERKPISEXECUTIVOS
=========================================================*/
async function renderKPIsExecutivos(){
let box=document.getElementById('painelKPIs')
if(!box)return
let pop=await calcularPopulacaoExposta()
let area=await calcularAreaRisco()
let iriq=await calcularIRIQ()
let cor='#16a34a'
let faixa='BAIXO'
if(iriq>=30){
cor='#dc2626'
faixa='CRÍTICO'
}else if(iriq>=20){
cor='#f97316'
faixa='ALTO'
}else if(iriq>=10){
cor='#facc15'
faixa='MODERADO'
}
box.innerHTML=`
<div class="chap-grid">
<div class="chap-card">
<div class="chap-num">${formatarNumero(pop)}</div>
<div class="chap-label">
POPULAÇÃO EXPOSTA
</div>
<div class="fonte-card">
Fonte: IBGE 2022 • Municípios de Rondônia
</div>
</div>

<div class="chap-card">
<div class="chap-num">${(Number(area||0)/1000000).toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2})}</div>
<div class="chap-label">KM² SOB RISCO</div>
<div style="font-size:11px;color:#64748b">
${formatarNumero(area)} m²
</div>
<div class="fonte-card">
Fonte: Heatmap Estadual • Sedam • INPE
</div>
</div>

<div class="chap-card">
<div class="chap-num">${iriq}</div>
<div class="chap-label">
IRIQ ESTADUAL
</div>
<div class="fonte-card">
Fonte: IRIQ = 60% Risco + 40% CHAP
</div>
</div>
</div>
`
}
/*=========================================================
017 QUEIMADAS FUNCTION RENDERMUNICIPIOSPRIORITARIOS
=========================================================*/
async function renderMunicipiosPrioritarios(){
let box=document.getElementById('painelMunicipiosPrioritarios')
if(!box)return
let {data,error}=await client
.from('queimadas_heatmap')
.select('*')
if(error){
console.log(error)
return
}
let lista=[...(data||[])]
.sort((a,b)=>{
let c1=Number(b.criticidade||0)-Number(a.criticidade||0)
if(c1!==0)return c1
let c2=Number(b.focos||0)-Number(a.focos||0)
if(c2!==0)return c2
return Number(b.risco||0)-Number(a.risco||0)
})
.slice(0,10)
let html='<div class="ranking-grid">'
lista.forEach((m,idx)=>{
let cor='#f97316'
if((m.classificacao||'').toUpperCase().includes('CRÍTICO'))cor='#dc2626'
html+=`
<div class="ranking-card">
<div class="ranking-posicao">${idx+1}</div>
<div class="ranking-municipio">${m.municipio||'-'}</div>
<div class="ranking-info">
Classificação:
<span style="color:${cor};font-weight:900">
${m.classificacao||'-'}
</span>
</div>
<div class="ranking-info">Focos: ${m.focos||0}</div>
<div class="ranking-info">Risco: ${m.risco||0}</div>
</div>`
})
html+=`
</div>
<div class="fonte-card">
Fonte: Heatmap Estadual • IRIQ • Focos de Calor-Tabela queimadas_heatmap • Classificação Municipal de Risco
</div>`
box.innerHTML=html
}
/*=========================================================
018 QUEIMADAS FUNCTION RENDERHEATMAPEXECUTIVO
=========================================================*/
async function renderHeatMapExecutivo(){
let box=document.getElementById('painelHeatMapExecutivo')
if(!box)return
let {data,error}=await client
.from('queimadas_heatmap')
.select('*')
if(error){
console.log(error)
return
}
let critico=(data||[]).filter(i=>(i.classificacao||'').toUpperCase().includes('CRÍTICO')).length
let alto=(data||[]).filter(i=>(i.classificacao||'').toUpperCase().includes('ALTO')).length
let moderado=(data||[]).filter(i=>(i.classificacao||'').toUpperCase().includes('MODERADO')).length
let baixo=(data||[]).filter(i=>(i.classificacao||'').toUpperCase().includes('BAIXO')).length
box.innerHTML=`
<div class="heatmap-grid-mini">
<div class="heat-vermelho">
<div style="font-size:26px;font-weight:900">${critico}</div>
<div>CRÍTICO</div>
<div>75-100</div>
</div>
<div class="heat-laranja">
<div style="font-size:26px;font-weight:900">${alto}</div>
<div>ALTO</div>
<div>50-74</div>
</div>
<div class="heat-amarelo">
<div style="font-size:26px;font-weight:900">${moderado}</div>
<div>MODERADO</div>
<div>25-49</div>
</div>
<div class="heat-verde">
<div style="font-size:26px;font-weight:900">${baixo}</div>
<div>BAIXO</div>
<div>0-24</div>
</div>
</div>
<div class="fonte-card">
Fonte: Tabela queimadas_heatmap • Classificação Municipal de Risco
</div>`
}
/*=========================================================
019 QUEIMADAS FUNCTION RENDERCEPCIFAVANCADO
=========================================================*/
async function renderCEPCIFAvancado(){
let box=document.getElementById('painelCEPCIF')
if(!box)return
let {data=[]}=await client.from('queimadas_monitoramento').select('*')
let total=data.length
let concluidos=data.filter(i=>Number(i.percentual||0)>=100).length
let andamento=data.filter(i=>Number(i.percentual||0)>0&&Number(i.percentual||0)<100).length
let pendentes=data.filter(i=>Number(i.percentual||0)<=0).length
box.innerHTML=`
<div class="chap-grid">
<div class="chap-card">
<div class="chap-num">${total}</div>
<div class="chap-label">AÇÕES CEPCIF</div>
</div>
<div class="chap-card">
<div class="chap-num">${concluidos}</div>
<div class="chap-label">CONCLUÍDAS</div>
</div>
<div class="chap-card">
<div class="chap-num">${andamento}</div>
<div class="chap-label">EM ANDAMENTO</div>
</div>
<div class="chap-card">
<div class="chap-num">${pendentes}</div>
<div class="chap-label">PENDENTES</div>
</div>
</div>`
}
/*=========================================================
020 QUEIMADAS FUNCTION RENDERMONITORAMENTO4D
=========================================================*/
async function renderMonitoramento4D(){
let box=document.getElementById('painelMonitoramento4D')
if(!box)return
let {data,error}=await client
.from('queimadas_monitoramento_4d')
.select('*')
if(error){
console.log(error)
return
}
let html=''
data.forEach(i=>{
html+=`
<div class="monitor4d-card">
<div><b>${i.municipio||'-'}</b></div>
<div class="monitor4d-grid">
<div class="monitor4d-kpi execucao">Execução<br>${i.execucao||0}%</div>
<div class="monitor4d-kpi resultado">Resultado<br>${i.resultado||0}%</div>
<div class="monitor4d-kpi impacto">Impacto<br>${i.impacto||0}%</div>
<div class="monitor4d-kpi risco">Risco<br>${i.risco||0}%</div>
</div>
</div>`
})
box.innerHTML=html
}
/*=========================================================
021 QUEIMADAS FUNCTION RENDERPOTIFAVANCADO
=========================================================*/
async function renderPOTIFAvancado(){
let box=document.getElementById('painelOVRPOTIF')
if(!box)return
let {data=[]}=await client.from('queimadas_acoes_cbm').select('*')
let total=data.length
let executadas=data.filter(i=>String(i.status||'').toUpperCase()==='CONCLUÍDO').length
let percentual=total?Math.round((executadas/total)*100):0
box.innerHTML=`
<div class="chap-grid">
<div class="chap-card">
<div class="chap-num">${total}</div>
<div class="chap-label">AÇÕES POTIF</div>
</div>
<div class="chap-card">
<div class="chap-num">${executadas}</div>
<div class="chap-label">EXECUTADAS</div>
</div>
<div class="chap-card">
<div class="chap-num">${percentual}%</div>
<div class="chap-label">EXECUÇÃO</div>
</div>
</div>`
}
/*=========================================================
022 QUEIMADAS FUNCTION RENDERODS
=========================================================*/
async function renderODS(){
let box=document.getElementById('painelODS')
if(!box)return
let {data,error}=await client
.from('queimadas_ods')
.select('*')
.eq('ativo',true)
.order('peso',{ascending:false})
if(error){
console.log(error)
box.innerHTML='Erro ao carregar ODS.'
return
}
let html=''
html+='<div class="cardExecutivo">'
html+='<h2>ODS - OBJETIVOS DE DESENVOLVIMENTO SUSTENTÁVEL</h2>'
html+='<div style="margin-bottom:12px">'
html+='<select id="odsSelecionada" class="inputPadrao">'
html+='<option value="">Selecione uma ODS</option>'
;(data||[]).forEach(o=>{
html+=`<option value="${o.id}">${o.ods} - ${o.descricao||''}</option>`
})
html+='</select>'
html+='</div>'
html+='<div class="ods-grid">'
;(data||[]).forEach((o,idx)=>{
html+=`
<div class="ods-card" style="border-left:8px solid ${o.cor||'#2563eb'}">
<div style="font-size:26px;font-weight:900">
${idx+1}º
</div>
<div style="font-size:16px;font-weight:900">
${o.ods||''}
</div>
<div style="margin-top:6px;font-size:13px">
${o.descricao||''}
</div>
<div style="margin-top:8px;font-size:12px">
<b>Meta:</b> ${o.meta||'-'}
</div>
<div style="margin-top:4px;font-size:12px">
<b>Indicador:</b> ${o.indicador||'-'}
</div>
<div style="margin-top:8px;font-size:14px;font-weight:900;color:${o.cor||'#2563eb'}">
ADERÊNCIA IA: ${Number(o.peso||0).toFixed(0)}%
</div>
<div style="margin-top:8px;font-size:11px;color:#475569">
${o.justificativa||''}
</div>
</div>`
})
html+='</div>'
html+=`
<div class="fonte-card">
Fonte: Agenda 2030 • ONU • IA-CHAP • Projeto QUEIMADAS 2026
</div>`
html+='</div>'
box.innerHTML=html
}
/*=========================================================
023 QUEIMADAS FUNCTION RECALCULARODSIA
=========================================================*/
async function recalcularODSIA(){
let {data:heat}=await client.from('queimadas_heatmap').select('*')
let {data:chap}=await client.from('queimadas_chap').select('*')
let {data:riscos}=await client.from('queimadas_riscos').select('*')
let {data:monitoramento}=await client.from('queimadas_monitoramento').select('*')
let focos=(heat||[]).reduce((s,i)=>s+Number(i.focos||0),0)
let criticidade=(heat||[]).reduce((s,i)=>s+Number(i.criticidade||0),0)
let mediaCriticidade=(heat||[]).length?criticidade/(heat||[]).length:0
let totalChap=(chap||[]).reduce((s,i)=>s+Number(i.resultado||0),0)
let mediaChap=(chap||[]).length?totalChap/(chap||[]).length:0
let totalMonitoramento=(monitoramento||[]).length
let concluidos=(monitoramento||[]).filter(i=>Number(i.percentual||0)>=100).length
let desempenho=totalMonitoramento?(concluidos/totalMonitoramento)*100:0
let peso13=Math.min(100,(mediaCriticidade*0.50)+(mediaChap*0.30)+(desempenho*0.20))
let peso15=Math.min(100,(mediaCriticidade*0.40)+(mediaChap*0.40)+(desempenho*0.20))
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
024 QUEIMADAS FUNCTION RECALCULARODSIAAVANCADO
=========================================================*/
async function recalcularODSIAAvancado(){
let {data:heat}=await client.from('queimadas_heatmap').select('*')
let {data:chap}=await client.from('queimadas_chap').select('*')
let {data:riscos}=await client.from('queimadas_riscos').select('*')
let {data:monitoramento}=await client.from('queimadas_monitoramento').select('*')
let {data:ucs}=await client.from('queimadas_ucs').select('*').limit(1000).then(r=>r).catch(()=>({data:[]}))
let totalFocos=(heat||[]).reduce((s,i)=>s+Number(i.focos||0),0)
let totalCriticidade=(heat||[]).reduce((s,i)=>s+Number(i.criticidade||0),0)
let mediaCriticidade=(heat||[]).length?totalCriticidade/(heat||[]).length:0
let totalRisco=(riscos||[]).reduce((s,i)=>s+Number(i.nivel_risco||0),0)
let mediaRisco=(riscos||[]).length?totalRisco/(riscos||[]).length:0
let totalChap=(chap||[]).reduce((s,i)=>s+Number(i.resultado||0),0)
let mediaChap=(chap||[]).length?totalChap/(chap||[]).length:0
let totalMonitoramento=(monitoramento||[]).length
let concluidos=(monitoramento||[]).filter(i=>Number(i.percentual||0)>=100).length
let andamento=(monitoramento||[]).filter(i=>Number(i.percentual||0)>0&&Number(i.percentual||0)<100).length
let desempenho=totalMonitoramento?(concluidos/totalMonitoramento)*100:0
let execucao=totalMonitoramento?((concluidos+(andamento*0.5))/totalMonitoramento)*100:0
let municipiosCriticos=(heat||[]).filter(i=>(i.classificacao||'').toUpperCase().includes('CRÍT')).length
let municipiosAlto=(heat||[]).filter(i=>(i.classificacao||'').toUpperCase().includes('ALTO')).length
let totalUCs=(ucs||[]).length||49
let pressaoAmbiental=Math.min(100,(mediaCriticidade*0.40)+(mediaRisco*0.30)+(mediaChap*0.30))
let governanca=Math.min(100,(desempenho*0.50)+(execucao*0.30)+(mediaChap*0.20))
let conservacao=Math.min(100,(totalUCs>=49?100:totalUCs*2))
let parceria=Math.min(100,(execucao*0.40)+(governanca*0.60))
let peso13=Math.min(100,(pressaoAmbiental*0.60)+(governanca*0.20)+(execucao*0.20))
let peso15=Math.min(100,(conservacao*0.50)+(pressaoAmbiental*0.30)+(execucao*0.20))
let peso16=Math.min(100,(governanca*0.70)+(execucao*0.30))
let peso11=Math.min(100,(municipiosCriticos*2)+(municipiosAlto*1)+(execucao*0.50))
let peso17=Math.min(100,(parceria*0.60)+(governanca*0.40))
await client.from('queimadas_ods').update({
peso:peso13,
resultado:peso13,
justificativa:`IA-CHAP: Criticidade média ${mediaCriticidade.toFixed(1)}, risco médio ${mediaRisco.toFixed(1)} e desempenho ${desempenho.toFixed(1)}%.`,
origem:'IA-CHAP AVANÇADO'
}).eq('ods','ODS 13')
await client.from('queimadas_ods').update({
peso:peso15,
resultado:peso15,
justificativa:`IA-CHAP: Conservação das UCs (${totalUCs}), pressão ambiental ${pressaoAmbiental.toFixed(1)} e execução ${execucao.toFixed(1)}%.`,
origem:'IA-CHAP AVANÇADO'
}).eq('ods','ODS 15')
await client.from('queimadas_ods').update({
peso:peso16,
resultado:peso16,
justificativa:`IA-CHAP: Governança ${governanca.toFixed(1)} e monitoramento das ações do plano.`,
origem:'IA-CHAP AVANÇADO'
}).eq('ods','ODS 16')
await client.from('queimadas_ods').update({
peso:peso11,
resultado:peso11,
justificativa:`IA-CHAP: ${municipiosCriticos} municípios críticos e ${municipiosAlto} municípios em alto risco.`,
origem:'IA-CHAP AVANÇADO'
}).eq('ods','ODS 11')
await client.from('queimadas_ods').update({
peso:peso17,
resultado:peso17,
justificativa:`IA-CHAP: Integração institucional, governança e execução conjunta dos planos.`,
origem:'IA-CHAP AVANÇADO'
}).eq('ods','ODS 17')
}
/*=========================================================
025 QUEIMADAS FUNCTION RENDERODSEVIDENCIAS
=========================================================*/
async function renderODSEvidencias(){
let box=document.getElementById('painelODSEvidencias')
if(!box)return
let {data}=await client.from('queimadas_ods').select('*').order('peso',{ascending:false})
let html='<div class="cardExecutivo"><h2>ODS X EVIDÊNCIAS E ADERÊNCIA</h2><div class="ods-executivo-grid">'
;(data||[]).forEach(o=>{
html+=`
<div class="ods-executivo-card" style="border-left-color:${o.cor||'#2563eb'}">
<div class="ods-score">${Number(o.peso||0).toFixed(0)}%</div>
<div class="ods-titulo">${o.ods}</div>
<div class="ods-meta">${o.descricao||''}</div>
<div class="ods-ia">${o.justificativa||''}</div>
<div class="fonte-card">Fonte: IA-CHAP • Agenda 2030</div>
</div>`
})
html+='</div></div>'
box.innerHTML=html
}
/*=========================================================
026 QUEIMADAS FUNCTION RENDERGRAFICORADARODS
=========================================================*/
async function renderGraficoRadarODS(){
let canvas=document.getElementById('graficoRadarODS')
if(!canvas)return
let {data}=await client.from('queimadas_ods').select('*').order('peso',{ascending:false})
let labels=(data||[]).map(i=>i.ods)
let valores=(data||[]).map(i=>Number(i.peso||0))
if(window.graficoRadarODSInstance){
window.graficoRadarODSInstance.destroy()
}
window.graficoRadarODSInstance=new Chart(canvas,{
type:'radar',
data:{
labels:labels,
datasets:[{
label:'Aderência Agenda 2030',
data:valores,
fill:true
}]
},
options:{
responsive:true,
maintainAspectRatio:false,
scales:{
r:{
beginAtZero:true,
max:100
}
}
}
})
}
/*=========================================================
027 QUEIMADAS FUNCTION RENDERODSMATURIDADE
=========================================================*/
async function renderODSMaturidade(){
let box=document.getElementById('painelODSMaturidade')
if(!box)return
let {data}=await client.from('queimadas_ods').select('*')
let media=(data||[]).reduce((s,i)=>s+Number(i.peso||0),0)/Math.max((data||[]).length,1)
let nivel='INICIAL'
if(media>=80)nivel='OTIMIZADO'
else if(media>=60)nivel='GERENCIADO'
else if(media>=40)nivel='ESTRUTURADO'
box.innerHTML=`
<div class="cardExecutivo">
<h2>MATURIDADE ODS</h2>
<div class="chap-num">${media.toFixed(1)}%</div>
<div class="chap-label">${nivel}</div>
<div class="fonte-card">Fonte: IA-CHAP • Agenda 2030</div>
</div>`
}
/*=========================================================
028 QUEIMADAS FUNCTION RENDERODSEXPLICACAOIA
=========================================================*/
async function renderODSExplicacaoIA(){
let box=document.getElementById('painelODSExplicacaoIA')
if(!box)return
let {data}=await client.from('queimadas_ods').select('*').order('peso',{ascending:false}).limit(1)
let ods=data?.[0]
box.innerHTML=`
<div class="cardExecutivo">
<h2>ANÁLISE IA-CHAP</h2>
<p>A ODS mais aderente ao Projeto QUEIMADAS 2026 é <b>${ods?.ods||'-'}</b>, com aderência de <b>${Number(ods?.peso||0).toFixed(0)}%</b>.</p>
<p>${ods?.justificativa||''}</p>
<div class="fonte-card">Fonte: IA-CHAP • Agenda 2030 • Monitoramento Integrado</div>
</div>`
}

/*=========================================================
029 QUEIMADAS FUNCTION RENDERUCSPRESIDENTE
=========================================================*/
async function renderUCsPresidente(){
let box=document.getElementById('painelUCsPresidente')
if(!box)return
box.innerHTML=`
<div class="chap-grid">
<div class="chap-card">
<div class="chap-num">27</div>
<div class="chap-label">UC ESTADUAIS</div>
</div>
<div class="chap-card">
<div class="chap-num">100%</div>
<div class="chap-label">MONITORADAS</div>
</div>
<div class="chap-card">
<div class="chap-num">SEDAM</div>
<div class="chap-label">RESPONSÁVEL</div>
</div>
</div>`
}
/*=========================================================
030 QUEIMADAS FUNCTION CALCULARIMPACTO
=========================================================*/
async function calcularImpacto(){
let box=document.getElementById('painelImpacto')
if(!box)return
let {data,error}=await client
.from('queimadas_monitoramento')
.select('*')
if(error){
console.log(error)
return
}
let soma=0
data.forEach(i=>{
soma+=Number(i.percentual||0)
})
let impacto=data.length?Math.round(soma/data.length):0
box.innerHTML=`
<div class="impacto-box">
<div class="impacto-score">${impacto}</div>
<div class="impacto-label">ÍNDICE DE IMPACTO AO CIDADÃO</div>
</div>`
}
/*=========================================================
031 QUEIMADAS FUNCTION RENDERIRIQESTADUAL
=========================================================*/
async function renderIRIQEstadual(){
let box=document.getElementById('painelIRIQEstadual')
if(!box)return
let iriq=await calcularIRIQ()
let cor='#16a34a'
let faixa='BAIXO'

if(Number(iriq)>=75){
cor='#dc2626'
faixa='CRÍTICO'
}else if(Number(iriq)>=50){
cor='#f97316'
faixa='ALTO'
}else if(Number(iriq)>=25){
cor='#facc15'
faixa='MODERADO'
}
box.innerHTML=`
<div class="impacto-box">
<div class="impacto-score" style="color:${cor}">
${iriq}
</div>
<div style="
font-size:18px;
font-weight:900;
color:${cor};
margin-top:10px;
">
${faixa}
</div>
<div class="impacto-label">
ÍNDICE DE RISCO INTEGRADO DE QUEIMADAS
</div>
<div style="margin-top:10px;font-size:12px;line-height:18px;color:#475569">
O IRIQ considera focos de calor, histórico de queimadas, cobertura vegetal, uso do solo, clima e vulnerabilidade ambiental.
</div>
<div style="margin-top:8px;font-size:11px">
🟢 0-24 Baixo
<br>
🟡 25-49 Moderado
<br>
🟠 50-74 Alto
<br>
🔴 75-100 Crítico
</div>
<div class="fonte-card">
Fonte: CHAP • IA-CHAP • Matriz de Risco 5x5
</div>
</div>`
}
/*=========================================================
032 QUEIMADAS FUNCTION RENDERLEGENDAHEATMAP
=========================================================*/
function renderLegendaHeatmap(){
let box=document.getElementById('painelLegendaHeatmap')
if(!box)return
box.innerHTML=`
<div class="cardExecutivo">
<h2>HEATMAP ESTADUAL - QUANTIDADE DE MUNICÍPIOS POR CLASSE DE RISCO</h2>
<div class="heat-vermelho">CRÍTICO (30-50)</div>
<div class="heat-laranja">ALTO (20-30)</div>
<div class="heat-amarelo">MODERADO (10-20)</div>
<div class="heat-verde">BAIXO (0-10)</div>
<p style="margin-top:10px;line-height:22px">
O Heatmap Estadual considera:
<br>• Focos de calor
<br>• Histórico de queimadas
<br>• Cobertura vegetal
<br>• Vulnerabilidade ambiental
<br>• Pressão antrópica
<br>• Índice IRIQ
</p>
</div>`
}
/*=========================================================
033 QUEIMADAS FUNCTION RENDERIRIQHEATMAPUNIFICADO
=========================================================*/
async function renderIRIQHeatmapUnificado(){
let box=document.getElementById('painelIRIQHeatmapUnificado')
if(!box)return
let iriq=17.4
let classe='BAIXO'
let critico=3
let alto=7
let moderado=0
let baixo=42
box.innerHTML=`
<div class="cardExecutivo">

<h2>IRIQ ESTADUAL</h2>

<div style="text-align:center">

<div style="
font-size:54px;
font-weight:900;
color:#16a34a;
line-height:60px;
">
${iriq}
</div>

<div style="
font-size:24px;
font-weight:900;
margin-top:4px;
">
${classe}
</div>

<div style="
font-size:18px;
margin-top:8px;
">
ÍNDICE DE RISCO INTEGRADO DE QUEIMADAS
</div>

</div>

<div style="
margin-top:20px;
font-size:14px;
line-height:24px;
">
<b>Legenda do IRIQ:</b><br>
O IRIQ considera:
• Focos de calor;
• Histórico de queimadas;
• Cobertura vegetal;
• Uso do solo;
• Clima; e
• Vulnerabilidade ambiental.
</div>

<div class="fonte-card">
Fonte: CHAP • IA-CHAP • Matriz de Risco 5x5
</div>

<hr style="margin:20px 0">

<h2>HEATMAP ESTADUAL - QUANTIDADE DE MUNICÍPIOS POR CLASSE DE RISCO</h2>

<div class="heatmap-grid-mini">

<div class="heat-vermelho">
<div style="font-size:34px;font-weight:900">${critico}</div>
<div>CRÍTICO</div>
<div>75-100</div>
</div>

<div class="heat-laranja">
<div style="font-size:34px;font-weight:900">${alto}</div>
<div>ALTO</div>
<div>50-74</div>
</div>

<div class="heat-amarelo">
<div style="font-size:34px;font-weight:900">${moderado}</div>
<div>MODERADO</div>
<div>25-49</div>
</div>

<div class="heat-verde">
<div style="font-size:34px;font-weight:900">${baixo}</div>
<div>BAIXO</div>
<div>0-24</div>
</div>

</div>

<div style="
margin-top:20px;
font-size:14px;
line-height:24px;
">

<b>Legenda do Heatmap:</b><br>

🔴 75 - 100 - Crítico<br>
🟠 50 - 74 - Alto<br>
🟡 25 - 49 - Moderado<br>
🟢 0 - 24 - Baixo<br><br>

O Heatmap Estadual considera:
• Focos de calor;
• Histórico de queimadas;
• Cobertura vegetal;
• Vulnerabilidade ambiental;
• Pressão antrópica; e
• Índice IRIQ.

</div>

<div class="fonte-card">
Fonte: Heatmap Estadual • CHAP • IA-CHAP
</div>

</div>
`
}

/*=========================================================
034 QUEIMADAS FUNCTION RENDERSITUACAOESTRATEGICA
=========================================================*/
async function renderSituacaoEstrategica(){
let box=document.getElementById('painelSalaSituacaoEstadual')
if(!box)return
let {data=[]}=await client.from('queimadas_heatmap').select('*')
let criticos=data.filter(i=>i.classificacao==='CRÍTICO').length
let alto=data.filter(i=>i.classificacao==='ALTO').length
let moderado=data.filter(i=>i.classificacao==='MODERADO').length
box.innerHTML=`
<div class="chap-grid">
<div class="chap-card">
<div class="chap-num">${criticos}</div>
<div class="chap-label">CRÍTICOS</div>
</div>
<div class="chap-card">
<div class="chap-num">${alto}</div>
<div class="chap-label">ALTO RISCO</div>
</div>
<div class="chap-card">
<div class="chap-num">${moderado}</div>
<div class="chap-label">MODERADO</div>
</div>
</div>`
}
/*=========================================================
035 QUEIMADAS FUNCTION MATRIZRISCO5X5AVANCADA
=========================================================*/
async function matrizRisco5x5Avancada(){
let box=document.getElementById('painelRiscoAvancado')
if(!box)return
let {data,error}=await client
.from('queimadas_riscos')
.select('*')
if(error){
console.log(error)
return
}
let criticos=data.filter(i=>(Number(i.nivel_risco||0)>=20))
let html='<div class="heatmap-grid">'
criticos.forEach(i=>{
html+=`
<div class="heat-vermelho">
🔥 ${i.fonte_calor||'-'}<br>
${i.risco||'-'}<br>
Nível ${i.nivel_risco||0}
</div>`
})
html+='</div>'
box.innerHTML=html
}
/*=========================================================
036 QUEIMADAS FUNCTION IACHAPANALISAR
=========================================================*/
async function iaChapAnalisar(){
let box=document.getElementById('painelIAChap')
if(!box)return
let {data,error}=await client
.from('queimadas_chap')
.select('*')
if(error){
console.log(error)
return
}
let html=''
data.forEach(i=>{
let score=Math.round(
(
Number(i.conhecimento||0)+
Number(i.habilidade||0)+
Number(i.atitude||0)+
Number(i.proposito||0)
)/4
)
html+=`
<div class="chap-card">
<div class="chap-num">${score}%</div>
<div class="chap-label">${i.municipio||'-'}</div>
</div>`
})
box.innerHTML=html
}
/*=========================================================
037 QUEIMADAS FUNCTION RENDERGOVERNANCA
=========================================================*/
async function renderGovernanca(){
let box=document.getElementById('painelGovernanca')
if(!box)return
let {data,error}=await client.from('queimadas_monitoramento').select('*')
if(error){
console.log(error)
return
}
let total=data.length||0
let concluidos=data.filter(i=>Number(i.percentual||0)>=100).length
let andamento=data.filter(i=>Number(i.percentual||0)>0&&Number(i.percentual||0)<100).length
let pendentes=data.filter(i=>Number(i.percentual||0)<=0).length
box.innerHTML=`
<div class="chap-grid">
<div class="chap-card"><div class="chap-num">${formatarNumero(total)}</div><div class="chap-label">AÇÕES</div></div>
<div class="chap-card"><div class="chap-num">${concluidos}</div><div class="chap-label">CONCLUÍDAS</div></div>
<div class="chap-card"><div class="chap-num">${andamento}</div><div class="chap-label">EM ANDAMENTO</div></div>
<div class="chap-card"><div class="chap-num">${pendentes}</div><div class="chap-label">PENDENTES</div></div>
</div>`
}
/*=========================================================
038 QUEIMADAS FUNCTION RENDEREXECUCAOORCAMENTARIA
=========================================================*/
async function renderExecucaoOrcamentaria(){
let box=document.getElementById('painelOrcamento')
if(!box)return
box.innerHTML=`
<div class="impacto-box">
<div class="impacto-score">EM IMPLANTAÇÃO</div>
<div class="impacto-label">EXECUÇÃO ORÇAMENTÁRIA</div>
</div>`
}
/*=========================================================
039 QUEIMADAS FUNCTION RENDERCEPCIF
=========================================================*/
function renderCEPCIF(){
let box=document.getElementById('painelCEPCIF')
if(!box)return
box.innerHTML=`
<div class="card-executivo">
<b>CEPCIF</b><br>
Comitê Estadual de Prevenção e Combate aos Incêndios Florestais.<br>
Monitoramento integrado das ações de prevenção, fiscalização, mitigação e resposta.
</div>`
}
/*=========================================================
040 QUEIMADAS FUNCTION RENDEROVRPOTIF
=========================================================*/
function renderOVRPOTIF(){
let box=document.getElementById('painelOVRPOTIF')
if(!box)return
box.innerHTML=`
<div class="card-executivo">
<b>OVR 2026</b><br>
Operação Verde Rondônia.<br><br>
<b>POTIF 2026</b><br>
Plano Operacional de Temporada de Incêndios Florestais.
</div>`
}
/*=========================================================
041 QUEIMADAS FUNCTION RENDEREVIDENCIAS
=========================================================*/
async function renderEvidencias(){
let box=document.getElementById('painelEvidencias')
if(!box)return
let {data,error}=await client.from('queimadas_evidencias').select('*').order('created_at',{ascending:false})
if(error){
console.log(error)
return
}
let html=''
data.forEach(i=>{
html+=`
<div class="monitor4d-card">
<b>${i.municipio||'-'}</b><br>
${i.descricao||'-'}<br>
Status: ${i.status||'-'}
</div>`
})
box.innerHTML=html
}
/*=========================================================
042 QUEIMADAS FUNCTION RENDERAUDITORIA
=========================================================*/
async function renderAuditoriaConcomitante(){
let box=document.getElementById('painelAuditoria')
if(!box)return
let {data:evidencias}=await client
.from('queimadas_evidencias')
.select('*')
let {data:riscos}=await client
.from('queimadas_riscos')
.select('*')
let {data:heat}=await client
.from('queimadas_heatmap')
.select('*')
let semEvidencia=(evidencias||[])
.filter(i=>
!i.evidencia||
String(i.evidencia).trim()===''
).length
let riscosSemTratamento=(riscos||[])
.filter(i=>
!i.tratamento||
String(i.tratamento).trim()===''
).length
let municipiosCriticos=(heat||[])
.filter(i=>
i.classificacao==='CRÍTICO'
).length
let municipiosAlto=(heat||[])
.filter(i=>
i.classificacao==='ALTO'
).length
let topRiscos=(riscos||[])
.sort((a,b)=>
Number(b.nivel_risco||0)-
Number(a.nivel_risco||0)
)
.slice(0,10)
box.innerHTML=`
<div class="chap-grid">
<div class="chap-card">
<div class="chap-num">${semEvidencia}</div>
<div class="chap-label">SEM EVIDÊNCIAS</div>
</div>
<div class="chap-card">
<div class="chap-num">${riscosSemTratamento}</div>
<div class="chap-label">SEM TRATAMENTO</div>
</div>
<div class="chap-card">
<div class="chap-num">${municipiosCriticos}</div>
<div class="chap-label">CRÍTICOS</div>
</div>
<div class="chap-card">
<div class="chap-num">${municipiosAlto}</div>
<div class="chap-label">ALTO RISCO</div>
</div>
</div>
<div class="cardExecutivo">
<h2>TOP 10 RISCOS</h2>
${topRiscos.map(i=>`
<div style="display:flex;justify-content:space-between;padding:8px;border-bottom:1px solid #ddd;">
<span>${i.risco}</span>
<b>${i.nivel_risco}</b>
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
</div>
`
}

/*=========================================================
045 QUEIMADAS FUNCTION RENDERMAPAMUNICIPIOS
=========================================================*/
async function renderMapaMunicipios(){
let div=document.getElementById('mapaRO')
if(!div)return
if(window.mapaExecutivoRO){
try{window.mapaExecutivoRO.remove()}catch(e){}
window.mapaExecutivoRO=null
}
if(div._leaflet_id){
delete div._leaflet_id
}
window.overlayUCsExecutivoAdicionado=false
window.overlayTIsExecutivoAdicionado=false
let mapa=L.map('mapaRO').setView([-10.9,-63.3],7)
window.mapaExecutivoRO=mapa
window.camadasControleExecutivo=L.control.layers({},{},{collapsed:false}).addTo(mapa)
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{attribution:'OpenStreetMap'}).addTo(mapa)
let {data,error}=await client.from('queimadas_heatmap').select('*')
if(error){
console.log(error)
return
}
let geo=await fetch('./assets/geojson/municipios-ro.geojson')
if(geo.ok){
let geojson=await geo.json()
let risco={}
;(data||[]).forEach(m=>{
let chave=String(m.municipio||'')
.normalize('NFD')
.replace(/[\u0300-\u036f]/g,'')
.replace(/'/g,'')
.replace(/´/g,'')
.replace(/`/g,'')
.toUpperCase()
.trim()
let classe=String(
m.classificacao||
m.classificacao_ia||
m.risco||
m.risco_iriq||
''
)
.normalize('NFD')
.replace(/[\u0300-\u036f]/g,'')
.toUpperCase()
.trim()
if(classe.includes('CRITICO')){
classe='CRITICO'
}else if(classe.includes('ALTO')){
classe='ALTO'
}else if(classe.includes('MODERADO')){
classe='MODERADO'
}else{
classe='BAIXO'
}
risco[chave]=classe
})
window.layerMunicipiosPoligonos=L.geoJSON(geojson,{
style:f=>{
let nome=String(
f.properties.NM_MUN||f.properties.nome||f.properties.NOME||'')
.normalize('NFD')
.replace(/[\u0300-\u036f]/g,'')
.replace(/'/g,'')
.replace(/´/g,'')
.replace(/`/g,'')
.toUpperCase()
.trim()
let classe=risco[nome]||'BAIXO'
let cor='#16a34a'
if(classe==='CRITICO'){
cor='#dc2626'
}else if(classe==='ALTO'){
cor='#f97316'
}else if(classe==='MODERADO'){
cor='#facc15'
}
return{
color:'#1e293b',
weight:1,
fillColor:cor,
fillOpacity:.55
}
},
onEachFeature:(f,l)=>{
let nome=
f.properties.NM_MUN||
f.properties.nome||
f.properties.NOME||
f.properties.municipio||
f.properties.MUNICIPIO||
f.properties.nm_mun||
f.properties.nome_mun||
'Município'
let chave=String(nome)
.normalize('NFD')
.replace(/[\u0300-\u036f]/g,'')
.replace(/'/g,'')
.replace(/´/g,'')
.replace(/`/g,'')
.toUpperCase()
.trim()
let classe=risco[chave]||'SEM DADOS'
let registro=(data||[]).find(m=>
String(m.municipio||'')
.normalize('NFD')
.replace(/[\u0300-\u036f]/g,'')
.replace(/'/g,'')
.replace(/´/g,'')
.replace(/`/g,'')
.toUpperCase()
.trim()===chave
)
l.bindPopup(`
<b>${nome}</b><br>
Classificação: ${classe}<br>
Criticidade: ${registro?.criticidade||'-'}<br>
Focos: ${registro?.focos||'-'}
`)
}
}).addTo(mapa)
window.camadasControleExecutivo.addOverlay(window.layerMunicipiosPoligonos,'🔥 RISCO DE QUEIMADAS')
}
if(typeof carregarUCsRO==='function'){
await carregarUCsRO(mapa,'executivo')
if(window.layerUCsExecutivo&&mapa.hasLayer(window.layerUCsExecutivo)){
mapa.removeLayer(window.layerUCsExecutivo)
}
}
if(typeof carregarTIsRO==='function'){
await carregarTIsRO(mapa,'executivo')
if(window.layerTIsExecutivo&&mapa.hasLayer(window.layerTIsExecutivo)){
mapa.removeLayer(window.layerTIsExecutivo)
}
}
try{
mapa.fitBounds(window.layerMunicipiosPoligonos.getBounds())
}catch(e){}
setTimeout(()=>{
mapa.invalidateSize()
},500)
}
/*=========================================================
046 QUEIMADAS FUNCTION RENDERACOESSEDAM
=========================================================*/
async function renderAcoesSedam(){
let box=document.getElementById('painelAcoesSedam')
if(!box)return
let {data,error}=await client.from('queimadas_monitoramento').select('*').eq('origem','SEDAM')
if(error){
console.log(error)
return
}
box.innerHTML=`<div class="impacto-box"><div class="impacto-score">${data.length}</div><div class="impacto-label">AÇÕES MONITORADAS</div></div>`
}

/*=========================================================
048 QUEIMADAS FUNCTION RENDERACOESCBM
=========================================================*/
async function renderAcoesCBM(){
let box=document.getElementById('painelAcoesCBM')
if(!box)return
let {data,error}=await client.from('queimadas_monitoramento').select('*').eq('origem','CBMRO')
if(error){
console.log(error)
return
}
box.innerHTML=`<div class="impacto-box"><div class="impacto-score">${data.length}</div><div class="impacto-label">AÇÕES MONITORADAS</div></div>`
}
/*=========================================================
049 QUEIMADAS FUNCTION RENDERACOESTCERO
=========================================================*/
async function renderAcoesTCERO(){
let box=document.getElementById('painelAcoesTCERO')
if(!box)return
let {data,error}=await client.from('queimadas_monitoramento').select('*').eq('origem','TCERO')
if(error){
console.log(error)
return
}
box.innerHTML=`<div class="impacto-box"><div class="impacto-score">${data.length}</div><div class="impacto-label">AÇÕES MONITORADAS</div></div>`
}

/*=========================================================
050 QUEIMADAS FUNCTION RENDERGRAFICOFOCOSCALOR
=========================================================*/
async function renderGraficoFocosCalor(){
let canvas=document.getElementById('graficoFocosCalor')
if(!canvas)return
let {data,error}=await client.from('queimadas_municipios').select('*')
if(error){
console.log(error)
return
}
let labels=[]
let valores=[]
data.forEach(i=>{
labels.push(i.municipio||'-')
valores.push(Number(i.focos_calor||0))
})
new Chart(canvas,{
type:'bar',
data:{
labels:labels,
datasets:[{
label:'Focos de Calor',
data:valores
}]
},
options:{
responsive:true,
maintainAspectRatio:false
}
})
}
/*=========================================================
051 QUEIMADAS FUNCTION RENDERGRAFICOEVOLUCAOMENSAL
=========================================================*/
async function renderGraficoEvolucaoMensal(){
let canvas=document.getElementById(
'graficoEvolucaoMensal'
)
if(!canvas)return
let {data,error}=await client
.from('queimadas_monitoramento')
.select('*')
if(error){
console.log(error)
return
}
let execucao=(data||[])
.filter(i=>
String(i.status||'')
.toUpperCase()
.includes('EXECU')
).length
let pendente=(data||[])
.filter(i=>
String(i.status||'')
.toUpperCase()
.includes('PEND')
).length
let planejado=(data||[])
.filter(i=>
String(i.status||'')
.toUpperCase()
.includes('PLANE')
).length
if(window.chartEvolucaoMensal){
window.chartEvolucaoMensal.destroy()
}
window.chartEvolucaoMensal=
new Chart(canvas,{
type:'bar',
data:{
labels:[
'EM EXECUÇÃO',
'PENDENTE',
'PLANEJADO'
],
datasets:[{
label:'Quantidade',
data:[
execucao,
pendente,
planejado
]
}]
},
options:{
responsive:true,
maintainAspectRatio:false
}
})
}
/*=========================================================
053 QUEIMADAS FUNCTION RENDERDASHBOARDPRESIDENTE
=========================================================*/
async function renderDashboardPresidente(){
let box=document.getElementById('painelGeral')
if(!box)return
let {data:heat=[]}=await client
.from('queimadas_heatmap')
.select('*')
let {data:sedam=[]}=await client
.from('queimadas_acoes_sedam')
.select('*')
let {data:cbm=[]}=await client
.from('queimadas_acoes_cbm')
.select('*')
let focos=heat.reduce(
(s,i)=>s+Number(i.focos||0),
0
)
let criticos=heat.filter(i=>
i.classificacao==='CRÍTICO'
).length
let alto=heat.filter(i=>
i.classificacao==='ALTO'
).length
box.innerHTML=`
<div class="chap-grid">
<div class="chap-card">
<div class="chap-num">${formatarNumero(focos)}</div>
<div class="chap-label">FOCOS DE CALOR</div>
</div>
<div class="chap-card">
<div class="chap-num">${formatarNumero(criticos)}</div>
<div class="chap-label">MUNICÍPIOS CRÍTICOS</div>
</div>
<div class="chap-card">
<div class="chap-num">${formatarNumero(alto)}</div>
<div class="chap-label">ALTO RISCO</div>
</div>
<div class="chap-card">
<div class="chap-num">EXECUÇÃO</div>
<div class="chap-label">TCE-RO</div>
</div>
<div class="chap-card">
<div class="chap-num">PENDENTE</div>
<div class="chap-label">SEDAM</div>
</div>
<div class="chap-card">
<div class="chap-num">PLANEJADO</div>
<div class="chap-label">CBMRO</div>
</div>
</div>
`
}
/*=========================================================
054 QUEIMADAS FUNCTION RENDERGRAFICOGOVERNANCA
=========================================================*/
async function renderGraficoGovernanca(){
let canvas=
document.getElementById('graficoGovernanca')
||
document.getElementById('graficoGovernancaRelatorio')
if(!canvas)return
if(window.chartGovernanca)window.chartGovernanca.destroy()
let {data:sedam=[]}=await client.from('queimadas_acoes_sedam').select('*')
let {data:cbm=[]}=await client.from('queimadas_acoes_cbm').select('*')
let {data:tce=[]}=await client.from('queimadas_monitoramento').select('*')
window.chartGovernanca=new Chart(canvas,{
type:'doughnut',
data:{
labels:['TCE-RO','SEDAM','CBMRO'],
datasets:[{
data:[
tce.length,
sedam.length,
cbm.length
]
}]
},
options:{
responsive:true,
maintainAspectRatio:false,
plugins:{
legend:{
display:true,
position:'top'
},
tooltip:{
enabled:true
},
datalabels:{
color:'#ffffff',
font:{
weight:'bold',
size:18
},
formatter:v=>v
}
}
}
})
}
/*=========================================================
055 QUEIMADAS FUNCTION RENDERDASHBOARDCONSELHEIRO
=========================================================*/
async function renderDashboardConselheiro(){

let box=document.getElementById('painelRelator')
if(!box)return

let {data:heat}=await client
.from('queimadas_heatmap')
.select('*')

let {data:riscos}=await client
.from('queimadas_riscos')
.select('*')

let {data:sedam}=await client
.from('queimadas_acoes_sedam')
.select('*')

let {data:cbm}=await client
.from('queimadas_acoes_cbm')
.select('*')

let criticos=(heat||[])
.filter(i=>i.classificacao==='CRÍTICO')
.length

let altos=(heat||[])
.filter(i=>i.classificacao==='ALTO')
.length

let riscosAltos=(riscos||[])
.filter(i=>Number(i.nivel_risco||0)>=20)
.length

let sedamPendentes=(sedam||[])
.filter(i=>
String(i.status||'')
.toUpperCase()!=='CONCLUÍDO'
).length

let cbmPendentes=(cbm||[])
.filter(i=>
String(i.status||'')
.toUpperCase()!=='CONCLUÍDO'
).length

let top10=(heat||[])
.sort((a,b)=>b.criticidade-a.criticidade)
.slice(0,10)

box.innerHTML=`

<div class="chap-grid">

<div class="chap-card">
<div class="chap-num">${criticos}</div>
<div class="chap-label">
MUNICÍPIOS CRÍTICOS
</div>
</div>

<div class="chap-card">
<div class="chap-num">${altos}</div>
<div class="chap-label">
ALTO RISCO
</div>
</div>

<div class="chap-card">
<div class="chap-num">${riscosAltos}</div>
<div class="chap-label">
RISCOS ELEVADOS
</div>
</div>

<div class="chap-card">
<div class="chap-num">${sedamPendentes}</div>
<div class="chap-label">
PENDÊNCIAS SEDAM
</div>
</div>

<div class="chap-card">
<div class="chap-num">${cbmPendentes}</div>
<div class="chap-label">
PENDÊNCIAS CBMRO
</div>
</div>

</div>

<div class="card-executivo">

<h2>
TOP 10 MUNICÍPIOS CRÍTICOS
</h2>

${top10.map(i=>`

<div style="
display:flex;
justify-content:space-between;
padding:8px;
border-bottom:1px solid #ddd;
">

<span>
${i.municipio}
</span>

<b>
${i.criticidade}
</b>

</div>

`).join('')}

</div>

`
}
/*=========================================================
056 SALA DE SITUACAO
=========================================================*/
async function renderSalaSituacao(){
let box=document.getElementById('painelSalaSituacao')
if(!box)return
let {data,error}=await client
.from('queimadas_sala_situacao')
.select('*')
.order('criticidade',{ascending:false})
if(error)return
box.innerHTML=(data||[]).map(i=>`
<div class="chap-card">
<div class="chap-num">${i.criticidade}</div>
<div class="chap-label">${i.municipio}</div>
<div style="font-size:11px;font-weight:700">${i.classificacao}</div>
</div>
`).join('')
}
/*=========================================================
057 QUEIMADAS FUNCTION IAPREVERRISCOS
=========================================================*/
async function iaPreverRiscos(){
let box=document.getElementById('painelIARiscos')
if(!box)return
box.innerHTML=`
<div class="monitor4d-card">
IA identificou tendência de aumento de risco em municípios com crescimento de focos de calor e baixa execução das ações preventivas.
</div>`
}
/*=========================================================
058 QUEIMADAS FUNCTION IAPRIORIZARMUNICIPIOS
=========================================================*/
async function iaPriorizarMunicipios(){
let box=document.getElementById('painelIAPriorizacao')
if(!box)return
box.innerHTML=`
<div class="monitor4d-card">
1º Município Crítico<br>
2º Município Crítico<br>
3º Município Crítico
</div>`
}
/*=========================================================
059 QUEIMADAS FUNCTION IAGERARRELATORIO
=========================================================*/
async function iaGerarRelatorio(){
let box=document.getElementById('painelIARelatorio')
if(!box)return
box.innerHTML=`
<div class="monitor4d-card">
Relatório automático gerado com base no Plano SEDAM, Plano Operacional do Corpo de Bombeiros e Plano Unificado TCE-RO.
</div>`
}
/*=========================================================
060 QUEIMADAS FUNCTION IASUGERIRACOES
=========================================================*/
async function iaSugerirAcoes(){
let box=document.getElementById('painelIASugestoes')
if(!box)return
box.innerHTML=`
<div class="monitor4d-card">
✓ Reforçar brigadistas<br>
✓ Intensificar fiscalização<br>
✓ Priorizar municípios críticos<br>
✓ Monitorar fontes de calor
</div>`
}
/*=========================================================
061 QUEIMADAS FUNCTION PDFCOMPLETO
=========================================================*/
async function pdfCompletoQueimadas(){
await gerarPDFExecutivoTCERO()
}
/*=========================================================
062 QUEIMADAS FUNCTION RENDERSTATUSGERAL
=========================================================*/
async function renderStatusGeral(){
let box=document.getElementById('painelStatusGeral')
if(!box)return
let {data}=await client
.from('queimadas_monitoramento')
.select('*')
let executado=0
let andamento=0
let critico=0
data.forEach(i=>{
if(Number(i.percentual||0)>=80){
executado++
}else
if(Number(i.percentual||0)>=20){
andamento++
}else{
critico++
}
})
box.innerHTML=`
<div class="chap-grid">
<div class="chap-card">
<div class="chap-num">${executado}</div>
<div class="chap-label">EXECUTADO</div>
</div>
<div class="chap-card">
<div class="chap-num">${andamento}</div>
<div class="chap-label">EM ANDAMENTO</div>
</div>
<div class="chap-card">
<div class="chap-num">${critico}</div>
<div class="chap-label">CRÍTICO</div>
</div>
</div>
`
}
/*=========================================================
063 QUEIMADAS FUNCTION RENDERDASHBOARDCHAP
=========================================================*/
async function renderDashboardCHAP(){
let box=document.getElementById('painelCHAP')
if(!box)return
let {data,error}=await client
.from('queimadas_chap')
.select('*')
if(error){
console.log(error)
return
}
box.innerHTML=(data||[]).map(i=>{
let score=Math.round(
(
Number(i.criticidade||0)+
Number(i.historico||0)+
Number(i.abrangencia||0)+
Number(i.prioridade||0)+
Number(i.resultado||0)
)/5
)
return `
<div class="chap-card">
<div class="chap-num">${score}</div>
<div class="chap-label">${i.municipio}</div>
</div>`
}).join('')
}

/*=========================================================
064 QUEIMADAS FUNCTION MOSTRAR ABA ATIVA E OCULTA
=========================================================*/
async function mostrarAbaQueimadas(nome){
localStorage.setItem('abaQueimadas',nome)
document.querySelectorAll('.btnAbaQueimadas').forEach(x=>x.classList.remove('btnAbaAtiva'))
if(nome==='executivo')document.getElementById('btnAbaExecutivo')?.classList.add('btnAbaAtiva')
if(nome==='executivomunicipal')document.getElementById('btnAbaExecutivoMunicipal')?.classList.add('btnAbaAtiva')
if(nome==='mapa')document.getElementById('btnAbaMapa')?.classList.add('btnAbaAtiva')
if(nome==='planejamento')document.getElementById('btnAbaPlanejamento')?.classList.add('btnAbaAtiva')
if(nome==='monitoramento')document.getElementById('btnAbaMonitoramento')?.classList.add('btnAbaAtiva')
if(nome==='analise')document.getElementById('btnAbaAnalise')?.classList.add('btnAbaAtiva')
if(nome==='situacao')document.getElementById('btnAbaSituacao')?.classList.add('btnAbaAtiva')
if(nome==='presidente')document.getElementById('btnAbaPresidente')?.classList.add('btnAbaAtiva')
if(nome==='conselheiro')document.getElementById('btnAbaConselheiro')?.classList.add('btnAbaAtiva')
if(nome==='auditor')document.getElementById('btnAbaAuditor')?.classList.add('btnAbaAtiva')
if(nome==='relatorios')document.getElementById('btnAbaRelatorios')?.classList.add('btnAbaAtiva')
document.querySelectorAll('.abaQueimadas').forEach(x=>x.classList.add('hidden'))

if(nome==='executivo'){
document.getElementById('abaExecutivo')?.classList.remove('hidden')
if(typeof carregarKPIsExecutivos==='function')await carregarKPIsExecutivos()
if(typeof renderKPIsExecutivos==='function')await renderKPIsExecutivos()
if(typeof renderIRIQHeatmapUnificado==='function')await renderIRIQHeatmapUnificado()
if(typeof renderMunicipiosPrioritarios==='function')await renderMunicipiosPrioritarios()
if(typeof renderHeatMapExecutivo==='function')await renderHeatMapExecutivo()
if(typeof renderTopRiscos==='function')await renderTopRiscos()
if(typeof renderTopIAChap==='function')await renderTopIAChap()
if(typeof renderAlertas==='function')await renderAlertas()
if(typeof renderIRIQEstadual==='function')await renderIRIQEstadual()
if(typeof renderPainelFocosINPE==='function')await renderPainelFocosINPE()
if(typeof renderSalaSituacaoEstadual==='function')await renderSalaSituacaoEstadual()
if(typeof renderIndicadoresEstrategicos==='function')await renderIndicadoresEstrategicos()
if(typeof renderPainelUCs==='function')await renderPainelUCs()
if(typeof renderLegendaHeatmap==='function')await renderLegendaHeatmap()
}

if(nome==='executivomunicipal'){
document.getElementById('abaExecutivoMunicipal')?.classList.remove('hidden')
if(typeof renderSituacaoGeralMunicipios==='function')await renderSituacaoGeralMunicipios()
if(typeof renderKPIsMunicipais==='function')await renderKPIsMunicipais()
if(typeof renderCadastroMunicipiosResumo==='function')await renderCadastroMunicipiosResumo()
if(typeof renderPlanosApresentados==='function')await renderPlanosApresentados()
if(typeof renderDilacoesPrazo==='function')await renderDilacoesPrazo()
if(typeof renderSemResposta==='function')await renderSemResposta()
if(typeof renderGraficoMunicipios==='function')await renderGraficoMunicipios()
if(typeof renderEstatisticasMunicipais==='function')await renderEstatisticasMunicipais()
if(typeof renderTabelaMunicipios==='function')await renderTabelaMunicipios()
setTimeout(async()=>{
let div=document.getElementById('mapaMunicipalPlanos')
if(div){
await renderMapaMunicipalPlanos('TODOS')
if(window.mapaMunicipalPlanos){
window.mapaMunicipalPlanos.invalidateSize(true)
}
}
},2000)
}
if(nome==='cadastroMunicipal'){
document.getElementById('abaCadastroMunicipal')?.classList.remove('hidden')
await renderCadastroMunicipios()
}
if(nome==='mapa'){
document.getElementById('abaMapa')?.classList.remove('hidden')
if(typeof renderMapaEstadual==='function'){
await renderMapaEstadual()
}
setTimeout(()=>{
if(!window.mapaEstadualRO)return
window.mapaEstadualRO.invalidateSize(true)
try{
let layers=[]
if(window.layerUCsEstadual)layers.push(window.layerUCsEstadual)
if(window.layerTIsEstadual)layers.push(window.layerTIsEstadual)
if(layers.length){
let grupo=L.featureGroup(layers)
if(grupo.getBounds().isValid()){
window.mapaEstadualRO.fitBounds(
grupo.getBounds(),
{
padding:[20,20],
maxZoom:9
}
)
}
}
}catch(e){
console.log(e)
}
},1000)
}
if(nome==='planejamento'){
document.getElementById('abaPlanejamento')?.classList.remove('hidden')
await renderPlanoUnificado()
await renderPlanoSEDAM()
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
await calcularImpacto()
}

if(nome==='relatorios'){
document.getElementById('abaRelatorios')?.classList.remove('hidden')
await renderGraficoTopFocos()
await renderGraficoFocosHistorico()
await renderGraficoEvolucaoMensal()
await renderGraficoGovernanca()
}

if(nome==='situacao'){
document.getElementById('abaSituacao')?.classList.remove('hidden')
await renderTopCriticos()
await renderTopRiscos()
await renderMunicipiosSemEvidencias()
await renderTopIAChap()
await renderAlertas()
await renderSalaSituacaoEstadual()
}

if(nome==='presidente'){
document.getElementById('abaPresidente')?.classList.remove('hidden')
await renderPresidente()
await renderDashboardPresidente()
await renderIRIQEstadual()
await renderPlanosMunicipais()
await renderIndicadoresPresidente()
await renderUCsPresidente()
await renderSituacaoEstrategica()
}

if(nome==='conselheiro'){
document.getElementById('abaConselheiro')?.classList.remove('hidden')
await renderDashboardConselheiro()
await renderTopMunicipios()
await renderTopRiscos()
}

if(nome==='auditor'){
document.getElementById('abaAuditor')?.classList.remove('hidden')
if(typeof renderAuditoriaConcomitante==='function')await renderAuditoriaConcomitante()
}
}

