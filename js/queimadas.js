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
<div class="chap-num">
${semEvidencia}
</div>
<div class="chap-label">
SEM EVIDÊNCIAS
</div>
</div>
<div class="chap-card">
<div class="chap-num">
${riscosSemTratamento}
</div>
<div class="chap-label">
SEM TRATAMENTO
</div>
</div>
<div class="chap-card">
<div class="chap-num">
${municipiosCriticos}
</div>
<div class="chap-label">
CRÍTICOS
</div>
</div>
<div class="chap-card">
<div class="chap-num">
${municipiosAlto}
</div>
<div class="chap-label">
ALTO RISCO
</div>
</div>
</div>
<div class="card-executivo">
<h2>
TOP 10 RISCOS
</h2>
${topRiscos.map(i=>`
<div style="
display:flex;
justify-content:space-between;
padding:8px;
border-bottom:1px solid #ddd;
">
<span>
${i.risco}
</span>
<b>
${i.nivel_risco}
</b>
</div>
`).join('')}
</div>
<div class="card-executivo">
<h2>
ACHADOS AUTOMÁTICOS
</h2>
<div style="padding:10px">
${semEvidencia>0
?'🚨 Existem evidências pendentes.<br>'
:'✅ Evidências apresentadas.<br>'}
${riscosSemTratamento>0
?'🚨 Existem riscos sem tratamento definido.<br>'
:'✅ Riscos tratados.<br>'}
${municipiosCriticos>0
?'🚨 Existem municípios críticos sob monitoramento.<br>'
:'✅ Nenhum município crítico.<br>'}
</div>
</div>
`
}
/*=========================================================
043 QUEIMADAS FUNCTION GERARPDFEXECUTIVOTCERO
=========================================================*/
async function gerarPDFExecutivoTCERO(){
const {jsPDF}=window.jspdf
let doc=new jsPDF('l','mm','a4')
let largura=doc.internal.pageSize.getWidth()
let pagina=1
doc.setFont('helvetica','bold')
doc.setFontSize(18)
doc.text('MONITORAMENTO INTELIGENTE DE QUEIMADAS 2026',largura/2,15,{align:'center'})
doc.setFontSize(11)
doc.text('Tribunal de Contas do Estado de Rondônia',largura/2,22,{align:'center'})
doc.setDrawColor(0)
doc.line(10,26,287,26)
let y=35
doc.setFontSize(14)
doc.text('DASHBOARD EXECUTIVO',10,y)
y+=8
doc.setFont('helvetica','normal')
doc.setFontSize(10)
doc.text('Plano Unificado TCE-RO + SEDAM + Corpo de Bombeiros',10,y)
y+=10
doc.setFont('helvetica','bold')
doc.text('Objetivos Estratégicos',10,y)
y+=6
doc.setFont('helvetica','normal')
doc.text('- Prevenção',15,y)
y+=5
doc.text('- Fiscalização',15,y)
y+=5
doc.text('- Mitigação',15,y)
y+=5
doc.text('- Resposta Operacional',15,y)
y+=5
doc.text('- Recuperação Ambiental',15,y)
y+=15
doc.setFont('helvetica','bold')
doc.text('Metodologias Aplicadas',10,y)
y+=6
doc.setFont('helvetica','normal')
doc.text('CHAP | Cadeia de Valor | Teoria da Mudança | ODS | HeatMap | Matriz 5x5',15,y)
y+=15
doc.setFontSize(8)
doc.text('Página '+pagina,280,200,{align:'right'})
doc.save('relatorio-executivo-queimadas.pdf')
}
/*=========================================================
044 QUEIMADAS FUNCTION GERARWORDEXECUTIVOTCERO
=========================================================*/
function gerarWordExecutivoTCERO(){
let html=`
<h1>MONITORAMENTO INTELIGENTE DE QUEIMADAS 2026</h1>
<h2>Tribunal de Contas do Estado de Rondônia</h2>
<h3>Plano Unificado TCE-RO</h3>
<p>Este relatório consolida as ações do Plano Unificado de Enfrentamento às Queimadas e Incêndios Florestais.</p>
<h3>Eixos Estratégicos</h3>
<ul>
<li>Prevenção</li>
<li>Fiscalização</li>
<li>Mitigação</li>
<li>Resposta Operacional</li>
<li>Recuperação Ambiental</li>
</ul>
<h3>Metodologias</h3>
<ul>
<li>CHAP</li>
<li>Cadeia de Valor</li>
<li>Teoria da Mudança</li>
<li>Matriz de Risco 5x5</li>
<li>ODS</li>
<li>HeatMap</li>
<li>Monitoramento 4D</li>
</ul>
`
baixarWordQueimadas('relatorio_executivo_tcero',html)
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
if(typeof renderKPIsMunicipais==='function')await renderKPIsMunicipais()
if(typeof renderMapaMunicipalPlanos==='function')await renderMapaMunicipalPlanos('TODOS')
if(typeof renderSituacaoGeralMunicipios==='function')await renderSituacaoGeralMunicipios()
if(typeof renderCadastroMunicipiosResumo==='function')await renderCadastroMunicipiosResumo()
if(typeof renderPlanosApresentados==='function')await renderPlanosApresentados()
if(typeof renderDilacoesPrazo==='function')await renderDilacoesPrazo()
if(typeof renderSemResposta==='function')await renderSemResposta()
if(typeof renderGraficoMunicipios==='function')await renderGraficoMunicipios()
if(typeof renderEstatisticasMunicipais==='function')await renderEstatisticasMunicipais()
if(typeof renderTabelaMunicipios==='function')await renderTabelaMunicipios()
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
await renderAuditoriaConcomitante()
await renderMunicipiosSemEvidencias()
await renderTopRiscos()
}
}
/*=========================================================
065 QUEIMADAS FUNCTION RENDERTOPCRITICOS
=========================================================*/
async function renderTopCriticos(){
let box=document.getElementById('painelTopCriticos')
if(!box)return
let {data,error}=await client
.from('queimadas_municipios')
.select('*')
.order('focos_calor',{ascending:false})
.limit(10)
if(error){
console.log(error)
return
}
box.innerHTML=(data||[]).map(i=>`
<div class="linha-queimadas">
🔥 <b>${i.municipio||'-'}</b>
 | Focos: ${i.focos_calor||0}
 | Risco: ${i.risco||'-'}
</div>
`).join('')
}
/*=========================================================
066 QUEIMADAS FUNCTION RENDERTOPRISCOS
=========================================================*/
async function renderTopRiscos(){

let box=document.getElementById('painelTopRiscos')
if(!box)return

let {data}=await client
.from('queimadas_riscos')
.select('*')
.order('nivel_risco',{ascending:false})
.limit(10)

box.innerHTML=data.map(i=>`
<div>
${i.risco}
-
Nível ${i.nivel_risco}
</div>
`).join('')

}
/*=========================================================
067 QUEIMADAS FUNCTION RENDERTOPIACHAP
=========================================================*/
async function renderTopIAChap(){

let box=document.getElementById('painelTopIAChap')
if(!box)return

let {data}=await client
.from('queimadas_ia_chap')
.select('*')
.limit(10)

box.innerHTML=(data||[])
.map(i=>`
<div class="linha-queimadas">
🤖 ID CHAP ${i.chap_id||'-'}
 | ${i.risco_previsto||'-'}
 | ${i.prioridade||'-'}
</div>
`)
.join('')

}
/*=========================================================
068 QUEIMADAS FUNCTION RENDERALERTAS
=========================================================*/
async function renderAlertas(){
let box=document.getElementById('painelAlertas')
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
.slice(0,5)
box.innerHTML=lista.map((i,idx)=>`
<div class="alerta-ranking">
<div class="alerta-numero">${idx+1}</div>
<div class="alerta-texto">
<b>${i.municipio}</b><br>
Classificação: ${i.classificacao} |
Criticidade: ${i.criticidade} |
Focos: ${i.focos} |
IRIQ: ${i.risco}
</div>
</div>
`).join('')+`
<div class="fonte-card">
Fonte: Heatmap Estadual • IRIQ • Focos de Calor
</div>`
}

/*=========================================================
069 QUEIMADAS FUNCTION RENDERTOPMUNICIPIOS
=========================================================*/
async function renderTopMunicipios(){
let box=document.getElementById(
'painelTopMunicipios'
)
if(!box)return
let {data}=await client
.from('queimadas_indice_municipal')
.select('*')
.order('indice_final',{ascending:false})
.limit(10)

box.innerHTML=(data||[])
.map(i=>`
<div class="linha-ranking">
<b>${i.municipio}</b>
-
IMC ${Number(i.indice_final||0).toFixed(1)}
-
${i.classificacao}
</div>
`)
.join('')
}
/*=========================================================
070 QUEIMADAS FUNCTION CALCULARIMC
=========================================================*/
async function calcularIMC(){
let {data:municipios}=await client
.from('queimadas_municipios')
.select('*')
let {data:riscos}=await client
.from('queimadas_riscos')
.select('*')
let {data:chap}=await client
.from('queimadas_chap')
.select('*')
let {data:impactos}=await client
.from('queimadas_impacto')
.select('*')
for(let m of (municipios||[])){
let focos=Number(m.focos_calor||0)
let riscoMunicipio=(riscos||[])
.filter(r=>r.municipio===m.municipio)
let riscoScore=Math.max(
...(riscoMunicipio.map(r=>
Number(r.nivel_risco||0)
)),
0
)
let chapMunicipio=(chap||[])
.find(c=>c.municipio===m.municipio)
let chapScore=
Number(chapMunicipio?.resultado||0)
let impactoMunicipio=(impactos||[])
.find(i=>i.municipio===m.municipio)
let impactoScore=
Number(impactoMunicipio?.indice_impacto||0)
let indice=
(focos*0.40)+
(riscoScore*0.20)+
(chapScore*0.25)+
(impactoScore*0.15)
let classe='BAIXO'
let semaforo='🟢'
if(indice>=80){
classe='CRÍTICO'
semaforo='🔴'
}else
if(indice>=60){
classe='ALTO'
semaforo='🟡'
}else
if(indice>=40){
classe='MODERADO'
semaforo='🟡'
}
await client
.from('queimadas_indice_municipal')
.upsert({
municipio:m.municipio,
focos_score:focos,
risco_score:riscoScore,
chap_score:chapScore,
impacto_score:impactoScore,
indice_final:Number(indice.toFixed(2)),
classificacao:classe,
semaforo:semaforo
},{
onConflict:'municipio'
})
}
}
/*=========================================================
071 QUEIMADAS FUNCTION RENDERMUNICIPIOSSEMEVIDENCIAS
=========================================================*/
async function renderMunicipiosSemEvidencias(){
let box=document.getElementById('painelSemEvidencias')
if(!box)return
let {data:municipios}=await client
.from('queimadas_municipios')
.select('municipio')
let {data:evidencias}=await client
.from('queimadas_evidencias')
.select('municipio')
let lista=(municipios||[])
.filter(m=>
!(evidencias||[])
.some(e=>e.municipio===m.municipio)
)
.slice(0,10)
box.innerHTML=lista.map(i=>`
<div class="alerta-vermelho">
⚠ ${i.municipio}
</div>
`).join('')
}
/*=========================================================
072 QUEIMADAS FUNCTION RENDERPRESIDENTE
=========================================================*/
async function renderPresidente(){
let box=document.getElementById('painelPresidente')
if(!box)return
let iriq=await calcularIRIQ()
box.innerHTML=`
<div class="chap-grid">
<div class="chap-card">
<div class="chap-num">${iriq}</div>
<div class="chap-label">
IRIQ ESTADUAL
</div>
</div>
</div>
`
}
/*=========================================================
073 QUEIMADAS FUNCTION RENDERRANKINGIMC
=========================================================*/
async function renderRankingIMC(){
let box=document.getElementById('painelTopMunicipios')
if(!box)return
let {data,error}=await client
.from('queimadas_indice_municipal')
.select('*')
.order('indice_final',{ascending:false})
.limit(10)
if(error){
console.log(error)
return
}
box.innerHTML=(data||[])
.map(i=>`
<div class="linha-ranking">
${i.semaforo||'🟢'}
<b>${i.municipio}</b>
-
IMC ${Number(i.indice_final||0).toFixed(1)}
-
${i.classificacao||'BAIXO'}
</div>
`)
.join('')
}
/*=========================================================
074 CALCULAR POPULAÇÃO EXPOSTA
=========================================================*/
async function calcularPopulacaoExposta(){
let {data,error}=await client
.from('queimadas_municipios')
.select('*')
if(error)return 0
let total=0
data.forEach(m=>{
let risco=String(m.risco||'').toUpperCase()
let peso=0
if(risco==='CRÍTICO')peso=1
else if(risco==='ALTO')peso=0.75
else if(risco==='MODERADO')peso=0.50
else peso=0.25
total+=Number(m.populacao||0)*peso
})
return Math.round(total)
}
/*=========================================================
075 CALCULAR ÁREA SOB RISCO
=========================================================*/
async function calcularAreaRisco(){
let {data,error}=await client
.from('queimadas_municipios')
.select('*')
if(error)return 0
let total=0
data.forEach(m=>{
let risco=String(m.risco||'').toUpperCase()
let peso=0
if(risco==='CRÍTICO')peso=1
else if(risco==='ALTO')peso=0.75
else if(risco==='MODERADO')peso=0.50
else peso=0.25
total+=Number(m.area_km2||0)*peso
})
return total.toFixed(0)
}
/*=========================================================
076 CALCULAR IRIQ
=========================================================*/
async function calcularIRIQ(){
let {data:riscos}=await client
.from('queimadas_riscos')
.select('*')
let {data:chap}=await client
.from('queimadas_chap')
.select('*')
let totalRisco=0
let totalChap=0
;(riscos||[]).forEach(r=>{
totalRisco+=Number(r.nivel_risco||0)
})
;(chap||[]).forEach(c=>{
totalChap+=Number(c.resultado||0)
})
let mediaRisco=
(riscos||[]).length
?totalRisco/(riscos||[]).length
:0
let mediaChap=
(chap||[]).length
?totalChap/(chap||[]).length
:0
let iriq=
(mediaRisco*0.60)+
(mediaChap*0.40)
if(iriq>100)iriq=100
if(iriq<0)iriq=0
return iriq.toFixed(1)
}
/*=========================================================
077 QUEIMADAS FUNCTION RENDERPLANOSMUNICIPAIS
=========================================================*/
async function renderPlanosMunicipais(){
let box=document.getElementById('painelPlanosMunicipais')
if(!box)return
let comPlano=[
'Ariquemes',
'Cacoal',
'Candeias do Jamari',
'Castanheiras',
'Colorado do Oeste',
'Corumbiara',
'Cujubim',
'Governador Jorge Teixeira',
'Guajará-Mirim',
'Ji-Paraná',
'Machadinho D\'Oeste',
'Nova Mamoré',
'Nova União',
'Novo Horizonte do Oeste',
'Ouro Preto do Oeste',
'Presidente Médici',
'Rolim de Moura',
'Seringueiras',
'Teixeirópolis',
'Theobroma',
'Vale do Anari',
'Vilhena'
]

let semPlano=[
'Alto Paraíso',
'Alvorada D\'Oeste',
'Buritis',
'Cabixi',
'Chupinguaia',
'Costa Marques',
'Itapuã do Oeste',
'Ministro Andreazza',
'Mirante da Serra',
'Monte Negro',
'Nova Brasilândia D\'Oeste',
'Parecis',
'Pimenteiras do Oeste',
'São Felipe do Oeste',
'São Francisco do Guaporé',
'São Miguel do Guaporé',
'Vale do Paraíso'
]
box.innerHTML=`
<div class="chap-grid">
<div class="chap-card">
<div class="chap-num">${comPlano.length}</div>
<div class="chap-label">COM PLANO</div>
</div>
<div class="chap-card">
<div class="chap-num">${semPlano.length}</div>
<div class="chap-label">SEM EVIDÊNCIA</div>
</div>
</div>
<div style="margin-top:15px">
<h3 style="color:#15803d">
✅ MUNICÍPIOS COM PLANO
</h3>
${comPlano.join(' • ')}
<hr style="margin:15px 0">
<h3 style="color:#dc2626">
🚨 MUNICÍPIOS SEM EVIDÊNCIA DE PLANO
</h3>
${semPlano.join(' • ')}
</div>
`
}
/*=========================================================
078 QUEIMADAS FUNCTION RENDERGEOJSONRO
=========================================================*/
async function renderGeoJSONRO(){
if(!window.mapaQueimadasRO)return
let resp=await fetch('/tags/queimadas/assets/geojson/municipios-ro.geojson')
if(!resp.ok){
console.log('Erro ao carregar UCs')
return
}
let geojson=await resp.json()
console.log(
'UCs carregadas:',
geojson.features?.length||0
)
let {data:heat}=await client
.from('queimadas_heatmap')
.select('*')
function normalizar(txt){
return String(txt||'')
.normalize('NFD')
.replace(/[\u0300-\u036f]/g,'')
.replace(/'/g,'')
.toUpperCase()
.trim()
}
function obterMunicipio(nome){
return (heat||[])
.find(m=>
normalizar(m.municipio)===
normalizar(nome)
)
}
function obterCor(nome){
let m=obterMunicipio(nome)
if(!m)return '#94a3b8'
if(m.classificacao==='CRÍTICO')return '#dc2626'
if(m.classificacao==='ALTO')return '#f97316'
if(m.classificacao==='MODERADO')return '#facc15'
return '#16a34a'
}
window.layerMunicipios=L.geoJSON(geojson,{
style:function(feature){
let nome=
feature.properties.NM_MUN||
feature.properties.nome||
feature.properties.name||
''
return{
fillColor:obterCor(nome),
weight:1,
opacity:1,
color:'#ffffff',
fillOpacity:0.75
}
},
onEachFeature:function(feature,layer){
let nome=
feature.properties.NM_MUN||
feature.properties.nome||
feature.properties.name||
''
let m=obterMunicipio(nome)
layer.bindPopup(`
<b>${nome}</b><br>
Criticidade: ${m?.criticidade||0}<br>
Focos: ${m?.focos||0}<br>
Risco: ${m?.risco||0}<br>
Classificação: ${m?.classificacao||'BAIXO'}
`)
}
})
window.layerMunicipios.addTo(
window.mapaQueimadasRO
)
window.camadasControle.addOverlay(
window.layerMunicipios,
'Municípios'
)
}
/*=========================================================
079 QUEIMADAS FUNCTION RENDERUCS
=========================================================*/
async function renderUCs(){
if(!window.mapaQueimadasRO)return
try{
let resp=await fetch(
'assets/geojson/ucs-ro.geojson'
)
if(!resp.ok){
console.log(
'GeoJSON UCs não encontrado'
)
return
}
let geojson=await resp.json()
window.layerUC=L.geoJSON(
geojson,
{
style:function(){
return{
color:'#006400',
weight:2,
fillColor:'#22c55e',
fillOpacity:0.25
}
},
onEachFeature:function(feature,layer){
let nome=
feature.properties.nome||
feature.properties.NOME||
feature.properties.name||
'UC'
layer.bindPopup(`
<b>UNIDADE DE CONSERVAÇÃO</b><br>
${nome}
`)
}
}
)
window.layerUC.addTo(
window.mapaQueimadasRO
)
window.camadasControle.addOverlay(
window.layerUC,
'Unidades de Conservação'
)
}catch(e){
console.log(
'UCs não carregadas',
e
)
}
}
/*=========================================================
080 QUEIMADAS FUNCTION RENDERPAINELUCS
=========================================================*/
async function renderPainelUCs(){
let box=document.getElementById('painelUCs')
if(!box)return
box.innerHTML=`
<div class="chap-grid">
<div class="chap-card">
<div class="chap-num">
49
</div>
<div class="chap-label">
UNIDADES DE CONSERVAÇÃO
</div>
</div>
<div class="chap-card">
<div class="chap-num">
100%
</div>
<div class="chap-label">
MONITORADAS
</div>
</div>
<div class="chap-card">
<div class="chap-num">
SEDAM
</div>
<div class="chap-label">
ÓRGÃO GESTOR
</div>
</div>
<div class="chap-card">
<div class="chap-num">
TCE-RO
</div>
<div class="chap-label">
MONITORAMENTO
</div>
</div>
</div>
<div class="fonte-card">
Fonte: Cadastro Estadual de Unidades de Conservação • Sedam
</div>
`
}
/*=========================================================
081 QUEIMADAS FUNCTION RENDERPAINELFOCOSINPE
=========================================================*/
async function renderPainelFocosINPE(){

let box=
document.getElementById(
'painelFocosCalor'
)
||
document.getElementById(
'painelFocosINPE'
)
if(!box)return

let {data}=await client
.from('queimadas_focos')
.select('*')

let total=(data||[])
.reduce((s,i)=>s+Number(i.focos||0),0)

let mapa={}
;(data||[]).forEach(i=>{
let mun=i.municipio||'SEM MUNICÍPIO'
if(!mapa[mun])mapa[mun]=0
mapa[mun]+=Number(i.focos||0)
})
let top10=Object.entries(mapa)
.map(([municipio,focos])=>({municipio,focos}))
.sort((a,b)=>b.focos-a.focos)
.slice(0,10)

box.innerHTML=`

<div class="chap-grid">

<div class="chap-card">
<div class="chap-num">
${total}
</div>
<div class="chap-label">
FOCOS DE CALOR
</div>
</div>

<div class="chap-card">
<div class="chap-num">
${(data||[]).length}
</div>
<div class="chap-label">
REGISTROS INPE
</div>
</div>

</div>

<div class="card-executivo">

<h2>
TOP FOCOS DE CALOR
</h2>

${top10.map(i=>`

<div style="
display:flex;
justify-content:space-between;
padding:6px;
border-bottom:1px solid #ddd;
">

<span>${i.municipio}</span>

<b>${formatarNumero(i.focos)}</b>

</div>

`).join('')}

</div>

`
}
/*=========================================================
082 QUEIMADAS FUNCTION RENDERGRAFICOTOPFOCOS
=========================================================*/
async function renderGraficoTopFocos(){

let canvas=
document.getElementById('graficoTopFocosExecutivo')
||
document.getElementById('graficoTopFocosRelatorio')

if(!canvas)return

let {data=[]}=await client
.from('queimadas_focos')
.select('*')

let mapa={}

data.forEach(i=>{
let mun=i.municipio||'SEM MUNICÍPIO'
if(!mapa[mun])mapa[mun]=0
mapa[mun]+=Number(i.focos||0)
})

let top10=Object.entries(mapa)
.map(([municipio,focos])=>({municipio,focos}))
.sort((a,b)=>b.focos-a.focos)
.slice(0,10)

if(window.chartTopFocos){
window.chartTopFocos.destroy()
}

window.chartTopFocos=new Chart(canvas,{
type:'bar',
data:{
labels:top10.map(i=>i.municipio),
datasets:[{
label:'Focos de Calor',
data:top10.map(i=>i.focos)
}]
},
options:{
indexAxis:'y',
responsive:true,
maintainAspectRatio:false,
plugins:{
legend:{display:false}
}
}
})

}

/*=========================================================
083 QUEIMADAS FUNCTION RENDERGRAFICOFOCOSHISTORICO
=========================================================*/
async function renderGraficoFocosHistorico(){

let canvas=
document.getElementById('graficoFocosHistorico')
||
document.getElementById('graficoEvolucaoMensalRelatorio')
if(!canvas)return

let {data,error}=await client
.from('queimadas_focos')
.select('*')
.order('data_referencia',{ascending:true})

if(error){
console.log(error)
return
}

let mapa={}

;(data||[]).forEach(i=>{

let dataRef=new Date(i.data_referencia)

let chave=
String(dataRef.getMonth()+1)
.padStart(2,'0')
+'/'+
dataRef.getFullYear()

if(!mapa[chave]){
mapa[chave]=0
}

mapa[chave]+=Number(i.focos||0)

})

let labels=Object.keys(mapa)

let valores=Object.values(mapa)

if(window.chartFocosHistorico){
window.chartFocosHistorico.destroy()
}

window.chartFocosHistorico=
new Chart(canvas,{

type:'line',

data:{
labels:labels,
datasets:[
{
label:'Focos de Calor',
data:valores,
borderWidth:3,
tension:0.3,
fill:false
}
]
},

options:{
responsive:true,
maintainAspectRatio:false,
plugins:{
legend:{
display:true
}
},
scales:{
y:{
beginAtZero:true
}
}
}

})

}
/*=========================================================
084 QUEIMADAS FUNCTION RENDERINDICADORESESTRATEGICOS
=========================================================*/
async function renderIndicadoresEstrategicos(){
let box=document.getElementById('painelIndicadoresEstrategicos')
if(!box)return
let {data:focos}=await client
.from('queimadas_focos')
.select('*')
let {data:heat}=await client
.from('queimadas_heatmap')
.select('*')
let totalFocos=(focos||[])
.reduce((s,i)=>s+Number(i.focos||0),0)
let iriqMedio=await calcularIRIQ()
let faixaIRIQ='BAIXO'
let corIRIQ='#16a34a'

if(Number(iriqMedio)>=75){
faixaIRIQ='CRÍTICO'
corIRIQ='#dc2626'
}else if(Number(iriqMedio)>=50){
faixaIRIQ='ALTO'
corIRIQ='#f97316'
}else if(Number(iriqMedio)>=25){
faixaIRIQ='MODERADO'
corIRIQ='#facc15'
}
let municipiosCriticos=(heat||[])
.filter(i=>i.classificacao==='CRÍTICO')
.length
let municipiosAlto=(heat||[])
.filter(i=>i.classificacao==='ALTO')
.length
let hoje=new Date().toLocaleDateString('pt-BR')
box.innerHTML=`
<div class="chap-grid">
<div class="chap-card">
<div class="chap-num">${Number(totalFocos||0).toLocaleString('pt-BR')}</div>
<div class="chap-label">FOCOS ACUMULADOS</div>
<div style="font-size:11px;margin-top:6px;color:#64748b">
Período analisado
</div>
<div style="font-size:11px;font-weight:700">
01/01/2026 até ${hoje}
</div>
</div>
<div class="chap-card">
<div class="chap-num" style="color:${corIRIQ}">
${iriqMedio}
</div>
<div class="chap-label">
IRIQ MÉDIO ESTADUAL
</div>
<div style="
font-size:13px;
font-weight:900;
color:${corIRIQ};
margin-top:6px;
">
${faixaIRIQ}
</div>
<div style="
font-size:11px;
margin-top:6px;
color:#64748b;
">
60% Risco + 40% CHAP
</div>
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
<div class="fonte-card">
Fonte: TCE-RO • Sedam • CBMRO • INPE
</div>`
}
/*=========================================================
085 QUEIMADAS FUNCTION RENDERINDICADORESPRESIDENTE
=========================================================*/
async function renderIndicadoresPresidente(){
let box=document.getElementById('painelIndicadoresPresidente')
if(!box)return
let {data:heat=[]}=await client.from('queimadas_heatmap').select('*')
let {data:focos=[]}=await client.from('queimadas_focos').select('*')
let totalFocos=focos.reduce((s,i)=>s+Number(i.focos||0),0)
let criticos=heat.filter(i=>i.classificacao==='CRÍTICO').length
let alto=heat.filter(i=>i.classificacao==='ALTO').length
box.innerHTML=`
<div class="chap-grid">
<div class="chap-card">
<div class="chap-num">${formatarNumero(totalFocos)}</div>
<div class="chap-label">FOCOS ACUMULADOS</div>
</div>
<div class="chap-card">
<div class="chap-num">${criticos}</div>
<div class="chap-label">CRÍTICOS</div>
</div>
<div class="chap-card">
<div class="chap-num">${alto}</div>
<div class="chap-label">ALTO RISCO</div>
</div>
</div>`
}

/*=========================================================
086 QUEIMADAS FUNCTION RENDERSALASITUACAOESTADUAL
=========================================================*/
async function renderSalaSituacaoEstadual(){

let box=document.getElementById('painelSalaSituacaoEstadual')
if(!box)return

let {data:heat}=await client
.from('queimadas_heatmap')
.select('*')

let {data:focos}=await client
.from('queimadas_focos')
.select('*')

let criticos=(heat||[])
.filter(i=>i.classificacao==='CRÍTICO')
.length

let altos=(heat||[])
.filter(i=>i.classificacao==='ALTO')
.length

let focosTotal=(focos||[])
.reduce(
(s,i)=>s+Number(i.focos||0),
0
)

let top10=[...(heat||[])]
.sort((a,b)=>b.criticidade-a.criticidade)
.slice(0,10)

box.innerHTML=`

<div class="chap-grid">

<div class="chap-card">
<div class="chap-num">${focosTotal}</div>
<div class="chap-label">
FOCOS ACUMULADOS
</div>
</div>

<div class="chap-card">
<div class="chap-num">${criticos}</div>
<div class="chap-label">
CRÍTICOS
</div>
</div>

<div class="chap-card">
<div class="chap-num">${altos}</div>
<div class="chap-label">
ALTO RISCO
</div>
</div>

</div>

<div class="card-executivo">

<h2>
TOP 10 MUNICÍPIOS
</h2>

${top10.map(i=>`

<div style="
display:flex;
justify-content:space-between;
padding:6px;
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

<div class="card-executivo">

<h2>
ALERTAS AUTOMÁTICOS
</h2>

<div style="padding:10px">

${criticos>0
?'🚨 Existem municípios críticos.<br>'
:'✅ Sem municípios críticos.<br>'}

${focosTotal>500
?'🔥 Quantidade elevada de focos detectados.<br>'
:'✅ Focos sob controle.<br>'}

${altos>5
?'⚠ Diversos municípios em alto risco.<br>'
:'✅ Risco controlado.<br>'}

</div>

</div>

`
}
/*=========================================================
087 QUEIMADAS FUNCTION ABRIR ABA CARD
=========================================================*/
function abrirCardQueimadas(aba){
mostrarAbaQueimadas(aba)
window.scrollTo({
top:0,
behavior:'smooth'
})
}
async function recalcularIMC(){
await calcularIMC()
await renderRankingIMC()
}

function formatarArea(v){
return Number(v||0)
.toLocaleString('pt-BR',{
minimumFractionDigits:2,
maximumFractionDigits:2
})
+' km²'
}
/*=========================================================
088 QUEIMADAS FUNCTION RENDERMUNICIPIOSOFICIO
=========================================================*/
async function renderMunicipiosOficio(){
let box=document.getElementById('painelMunicipiosOficio')
if(!box)return
let {data:kpi}=await client
.from('vw_queimadas_kpis_resposta')
.select('*')
.limit(1)
let k=kpi&&kpi.length?kpi[0]:{}
box.innerHTML=`
<div class="chap-grid">

<div class="chap-card">
<div class="chap-num">${k.total_municipios||52}</div>
<div class="chap-label">MUNICÍPIOS OFICIADOS</div>
<div class="fonte-card">Fonte: Ofício Circular n.16/2026/GABPRES/TCERO</div>
</div>

<div class="chap-card">
<div class="chap-num" style="color:#16a34a">${k.planos_apresentados||0}</div>
<div class="chap-label">PLANO APRESENTADO</div>
<div class="fonte-card">Classificação Verde</div>
</div>

<div class="chap-card">
<div class="chap-num" style="color:#facc15">${k.dilacao_prazo||0}</div>
<div class="chap-label">DILAÇÃO DE PRAZO</div>
<div class="fonte-card">Classificação Amarela</div>
</div>

<div class="chap-card">
<div class="chap-num" style="color:#dc2626">${k.sem_resposta||0}</div>
<div class="chap-label">SEM RESPOSTA</div>
<div class="fonte-card">Classificação Vermelha</div>
</div>

</div>
`
}
/*=========================================================
089 QUEIMADAS FUNCTION RENDERMUNICIPIOSSEMRESPOSTA
=========================================================*/
async function renderMunicipiosSemResposta(){
let box=document.getElementById('painelMunicipiosSemResposta')
if(!box)return
let {data,error}=await client
.from('queimadas_municipios_oficio')
.select('*')
.eq('classificacao_cor','VERMELHO')
.order('municipio')
if(error){
console.log(error)
return
}
let html='<div class="heatmap-grid">'
;(data||[]).forEach(i=>{
html+=`
<div class="heat-vermelho">
<div class="heat-municipio">${i.municipio||'-'}</div>
<div class="heat-info">
Situação: SEM RESPOSTA<br>
Ofício: ${i.nroficioenviadotcero||'-'}<br>
Envio: ${i.dataenviodoc||'-'}
</div>
<div class="fonte-card">
Fonte: Ofício Circular n.16/2026/GABPRES/TCERO
</div>
</div>`
})
html+='</div>'
box.innerHTML=html
}
/*=========================================================
090 QUEIMADAS FUNCTION RENDERKPISMUNICIPAIS
=========================================================*/
async function renderKPIsMunicipais(){
let box=document.getElementById('painelKPIsMunicipais')
if(!box)return
let {data,error}=await client
.from('vw_queimadas_kpis_resposta')
.select('*')
.limit(1)
if(error){
console.log(error)
return
}
let k=(data&&data.length)?data[0]:{}
box.innerHTML=`
<div class="chap-grid">
<div class="chap-card">
<div class="chap-num">
${k.total_municipios||52}
</div>
<div class="chap-label">
MUNICÍPIOS OFICIADOS
</div>
<div class="fonte-card">
Fonte: Ofício Circular n.16/2026/GABPRES/TCERO
</div>
</div>
<div class="chap-card">
<div class="chap-num" style="color:#16a34a">
${k.planos_apresentados||0}
</div>
<div class="chap-label">
PLANO APRESENTADO
</div>
<div class="fonte-card">
Classificação Verde
</div>
</div>

<div class="chap-card">
<div class="chap-num" style="color:#facc15">
${k.dilacao_prazo||0}
</div>
<div class="chap-label">
DILAÇÃO DE PRAZO
</div>
<div class="fonte-card">
Classificação Amarela
</div>
</div>

<div class="chap-card">
<div class="chap-num" style="color:#dc2626">
${k.sem_resposta||0}
</div>
<div class="chap-label">
SEM RESPOSTA
</div>
<div class="fonte-card">
Classificação Vermelha
</div>
</div>

</div>
`
}
/*=========================================================
091 QUEIMADAS FUNCTION RENDERPLANOSAPRESENTADOS
=========================================================*/
async function renderPlanosApresentados(){
let box=document.getElementById('painelPlanosApresentados')
if(!box)return
let {data,error}=await client.from('queimadas_municipios_oficio').select('*').eq('classificacao_cor','VERDE').order('municipio')
if(error){
console.log(error)
return
}
let html='<table class="tabelaMiniMunicipios"><tr><th>Município</th><th>Recebimento</th></tr>'
;(data||[]).forEach(i=>{
html+=`<tr><td>${i.municipio||'-'}</td><td>${formatarDataBR(i.ldatarecebimentodoc)}</td></tr>`
})
html+='</table>'
box.innerHTML=html
}
/*=========================================================
092 QUEIMADAS FUNCTION RENDERDILACOESPRAZO
=========================================================*/
async function renderDilacoesPrazo(){
let box=document.getElementById('painelDilacoesPrazo')
if(!box)return
let {data,error}=await client.from('queimadas_municipios_oficio').select('*').eq('classificacao_cor','AMARELO').order('municipio')
if(error){
console.log(error)
return
}
let html='<table class="tabelaMiniMunicipios"><tr><th>Município</th><th>Recebimento</th></tr>'
;(data||[]).forEach(i=>{
html+=`<tr><td>${i.municipio||'-'}</td><td>${formatarDataBR(i.ldatarecebimentodoc)}</td></tr>`
})
html+='</table>'
box.innerHTML=html
}
/*=========================================================
093 QUEIMADAS FUNCTION RENDERSEMRESPOSTA
=========================================================*/
async function renderSemResposta(){
let box=document.getElementById('painelSemResposta')
if(!box)return
let {data,error}=await client.from('queimadas_municipios_oficio').select('*').eq('classificacao_cor','VERMELHO').order('municipio')
if(error){
console.log(error)
return
}
let html='<table class="tabelaMiniMunicipios"><tr><th>Município</th><th>Recebimento</th></tr>'
;(data||[]).forEach(i=>{
html+=`<tr><td>${i.municipio||'-'}</td><td>${formatarDataBR(i.ldatarecebimentodoc)}</td></tr>`
})
html+='</table>'
box.innerHTML=html
}
/*=========================================================
094 QUEIMADAS FUNCTION RENDERGRAFICOMUNICIPIOS
=========================================================*/
async function renderGraficoMunicipios(){

let canvas=document.getElementById('graficoMunicipiosResposta')

if(!canvas)return

let {data,error}=await client
.from('vw_queimadas_kpis_resposta')
.select('*')
.limit(1)

if(error){
console.log(error)
return
}

let k=(data&&data.length)?data[0]:{}

if(window.chartMunicipiosResposta){
window.chartMunicipiosResposta.destroy()
}

window.chartMunicipiosResposta=new Chart(
canvas,
{
type:'doughnut',
data:{
labels:[
'Plano Apresentado',
'Dilação de Prazo',
'Sem Resposta'
],
datasets:[
{
data:[
Number(k.planos_apresentados||0),
Number(k.dilacao_prazo||0),
Number(k.sem_resposta||0)
],
backgroundColor:[
'#16a34a',
'#facc15',
'#dc2626'
],
borderWidth:2
}
]
},
options:{
responsive:true,
maintainAspectRatio:false,
plugins:{
legend:{
position:'bottom'
},
title:{
display:true,
text:'Situação dos Municípios Oficiados'
},
datalabels:{
color:'#000',
font:{
weight:'bold'
},
formatter:(v)=>v
}
}
}
}
)

}
/*=========================================================
095 QUEIMADAS FUNCTION RENDERTABELAMUNICIPIOS
=========================================================*/
async function renderTabelaMunicipios(){
let box=document.getElementById('painelTabelaMunicipios')
if(!box)return
let filtro=document.getElementById('filtroMunicipioSituacao')?.value||''
let busca=(document.getElementById('buscaMunicipio')?.value||'').toUpperCase()
let query=client
.from('queimadas_municipios_oficio')
.select('*')
.order('municipio')
if(filtro){
query=query.eq('classificacao_cor',filtro)
}
let {data,error}=await query
if(error){
console.log(error)
return
}
let lista=(data||[])
if(busca){
lista=lista.filter(i=>
String(i.municipio||'')
.toUpperCase()
.includes(busca)
)
}
let html=''
html+=`
<table class="tabelaMunicipios">
<thead>
<tr>
<th>MUNICÍPIO</th>
<th>SITUAÇÃO</th>
<th>DOCUMENTO</th>
<th>RECEBIMENTO</th>
<th>OBSERVAÇÃO</th>
</tr>
</thead>
<tbody>
`
lista.forEach(i=>{
let cor='#64748b'
if(i.classificacao_cor==='VERDE')cor='#16a34a'
if(i.classificacao_cor==='AMARELO')cor='#facc15'
if(i.classificacao_cor==='VERMELHO')cor='#dc2626'
html+=`
<tr>
<td><b>${i.municipio||'-'}</b></td>
<td style="color:${cor};font-weight:900">
${i.classificacao_ia||'-'}
</td>
<td>
${i.lnumerodocenviado||i.llnumerodocenviado||'-'}
</td>
<td>
${formatarDataBR(i.ldatarecebimentodoc)}
</td>
<td>
${i.observacao||'-'}
</td>
</tr>
`
})
html+=`
</tbody>
</table>
<div class="fonte-card">
Fonte: Ofício Circular n.16/2026/GABPRES/TCERO
</div>
`
box.innerHTML=html
}
/*=========================================================
096 QUEIMADAS FUNCTION RENDERMAPAMUNICIPAL
=========================================================*/
async function renderMapaMunicipal(){
let box=document.getElementById('mapaMunicipalRO')
if(!box)return
if(!document.body.contains(box))return
if(box.offsetWidth===0)return
if(box.offsetHeight===0)return
if(window.mapaMunicipalRO){
window.mapaMunicipalRO.remove()
window.mapaMunicipalRO=null
}
window.mapaMunicipalRO=L.map(box).setView([-10.9,-63.3],7)
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{
attribution:'OpenStreetMap'
}).addTo(window.mapaMunicipalRO)

let {data,error}=await client
.from('queimadas_municipios_oficio')
.select('*')

if(error){
console.log(error)
return
}

let situacao={}
;(data||[]).forEach(i=>{
situacao[(i.municipio||'').trim().toUpperCase()]=i
})

let geo=await fetch('/tags/queimadas/assets/geojson/municipios-ro.geojson')
console.log('GeoJSON status:',geo.status)
let geojson=await geo.json()
console.log('Features:',geojson.features?.length)
console.log('Criando layer municipal')
window.layerMunicipios=L.geoJSON(geojson,{
style:f=>{
let nome=
String(
f.properties.nome||
f.properties.NOME||
f.properties.municipio||
''
)
.trim()
.toUpperCase()

let m=situacao[nome]

let cor='#94a3b8'

if(m){
if(m.classificacao_cor==='VERDE')cor='#16a34a'
if(m.classificacao_cor==='AMARELO')cor='#facc15'
if(m.classificacao_cor==='VERMELHO')cor='#dc2626'
}

return{
color:'#ffffff',
weight:1,
fillColor:cor,
fillOpacity:.85
}
},
onEachFeature:(f,l)=>{

let nome=
String(
f.properties.nome||
f.properties.NOME||
f.properties.municipio||
''
)

let m=situacao[nome.trim().toUpperCase()]
l.dadosMunicipio=m
if(!m){
l.bindPopup(`
<b>${nome}</b><br>
Sem classificação
`)
return
}

l.bindPopup(`
<b>${m.municipio||nome}</b><br>
Situação: ${m.classificacao_ia||'-'}<br>
Documento: ${m.lnumerodocenviado||m.llnumerodocenviado||'-'}<br>
Recebimento: ${m.ldatarecebimentodoc||'-'}<br>
${m.observacao||'-'}
`)
}
}).addTo(window.mapaMunicipalRO)

window.mapaMunicipalRO.fitBounds(
window.layerMunicipios.getBounds()
)
}
/*=========================================================
097 QUEIMADAS FUNCTION FILTRARMAPAMUNICIPAL
=========================================================*/
function filtrarMapaMunicipal(tipo){
let layer=window.layerMunicipiosPlanos||window.layerMunicipios
if(!layer)return
layer.eachLayer(l=>{
let m=l.dadosMunicipio
if(!m){
l.setStyle({fillOpacity:.15,weight:1})
return
}
if(tipo==='TODOS'){
l.setStyle({fillOpacity:.85,weight:1})
return
}
if(m.classificacao_cor===tipo){
l.setStyle({fillOpacity:.95,weight:3})
}else{
l.setStyle({fillOpacity:.10,weight:1})
}
})
}
/*=========================================================
098 QUEIMADAS FUNCTION RENDERESTATISTICASMUNICIPAIS
=========================================================*/
async function renderEstatisticasMunicipais(){
let box=document.getElementById('painelEstatisticasMunicipais')
if(!box)return
let {data,error}=await client
.from('vw_queimadas_kpis_resposta')
.select('*')
.limit(1)
if(error){
console.log(error)
return
}
let k=(data&&data.length)?data[0]:{}
let total=Number(k.total_municipios||0)
let planos=Number(k.planos_apresentados||0)
let dilacoes=Number(k.dilacao_prazo||0)
let semResposta=Number(k.sem_resposta||0)
let pPlanos=total?((planos/total)*100).toFixed(1):0
let pDilacoes=total?((dilacoes/total)*100).toFixed(1):0
let pSemResposta=total?((semResposta/total)*100).toFixed(1):0
box.innerHTML=`
<div class="chap-grid">
<div class="chap-card">
<div class="chap-num" style="color:#16a34a">${pPlanos}%</div>
<div class="chap-label">PLANO APRESENTADO</div>
<div class="fonte-card">26 de 52 municípios</div>
</div>
<div class="chap-card">
<div class="chap-num" style="color:#ca8a04">${pDilacoes}%</div>
<div class="chap-label">DILAÇÃO DE PRAZO</div>
<div class="fonte-card">6 de 52 municípios</div>
</div>
<div class="chap-card">
<div class="chap-num" style="color:#dc2626">${pSemResposta}%</div>
<div class="chap-label">SEM RESPOSTA</div>
<div class="fonte-card">20 de 52 municípios</div>
</div>
</div>
<div class="fonte-card">
Fonte: Ofício Circular n.16/2026/GABPRES/TCERO • Respostas dos Municípios
</div>
`
}
/*=========================================================
099 QUEIMADAS FUNCTION RENDERCADASTROMUNICIPIOS
=========================================================*/
async function renderCadastroMunicipios(){
let box=document.getElementById('painelCadastroMunicipios')
if(!box)return
let busca=(document.getElementById('pesquisaCadastroMunicipio')?.value||'').toUpperCase()
let {data,error}=await client
.from('queimadas_municipios_oficio')
.select('*')
.order('municipio')
if(error){
console.log(error)
return
}
let lista=(data||[])
if(busca){
lista=lista.filter(i=>
String(i.municipio||'')
.toUpperCase()
.includes(busca)
)
}
let html=''
html+=`
<table class="tabelaMunicipios">
<thead>
<tr>
<th>MUNICÍPIO</th>
<th>OFÍCIO TCE</th>
<th>DATA ENVIO</th>
<th>PÁG ENVIO</th>
<th>DATA REC 1</th>
<th>DATA REC 2</th>
<th>DOC 1</th>
<th>DOC 2</th>
<th>OBSERVAÇÃO</th>
<th>AÇÃO</th>
</tr>
</thead>
<tbody>
`
lista.forEach(i=>{
html+=`
<tr>
<td>${i.municipio||'-'}</td>
<td>${i.nroficioenviadotcero||'-'}</td>
<td>${formatarDataBR(i.dataenviodoc)}</td>
<td>${i.paginaenviodoc||'-'}</td>
<td>${formatarDataBR(i.ldatarecebimentodoc)}</td>
<td>${i.lldatarecebimentodoc||'-'}</td>
<td>${i.lnumerodocenviado||'-'}</td>
<td>${i.llnumerodocenviado||'-'}</td>
<td>${i.observacao||'-'}</td>
<td><button class="btnEditarMunicipio" onclick="editarMunicipio(${i.id})">✏ EDITAR</button></td>
</tr>
`
})
html+=`
</tbody>
</table>
`
box.innerHTML=html
}
/*=========================================================
100 QUEIMADAS FUNCTION EDITARMUNICIPIO
=========================================================*/
async function editarMunicipio(id){
let {data,error}=await client
.from('queimadas_municipios_oficio')
.select('*')
.eq('id',id)
.single()
if(error||!data)return

let situacao=prompt(
'Situação:\nVERDE\nAMARELO\nVERMELHO',
data.classificacao_cor||''
)

if(!situacao)return

let documento=prompt(
'Documento recebido:',
data.lnumerodocenviado||''
)

let observacao=prompt(
'Observação:',
data.observacao||''
)

await client
.from('queimadas_municipios_oficio')
.update({
classificacao_cor:situacao.toUpperCase(),
observacao:observacao,
lnumerodocenviado:documento,
plano_acao:situacao.toUpperCase()==='VERDE',
dilacao_prazo:situacao.toUpperCase()==='AMARELO',
sem_resposta:situacao.toUpperCase()==='VERMELHO'
})
.eq('id',id)

await renderCadastroMunicipios()
}

/*=========================================================
101 QUEIMADAS INIT
=========================================================*/
document.addEventListener('DOMContentLoaded',async()=>{
let abaSalva=localStorage.getItem('abaQueimadas')||'executivo'
mostrarAbaQueimadas(abaSalva)
if(typeof renderMapaMunicipios==='function'){
await renderMapaMunicipios()
await renderMapaEstadual()
}

if(typeof renderGeoJSONRO==='function'){
await renderGeoJSONRO()
}
if(typeof renderUCs==='function'){
await renderUCs()
}
})
/*=========================================================
102 TOGGLE MAPA RO
=========================================================*/
function toggleMapaRO(){
let box=document.getElementById('boxMapaRO')
if(!box)return
box.style.display=
box.style.display==='none'
?'block'
:'none'
}
/*=========================================================
103 EXECUTIVO MUNICIPAL TABELA GERAL
=========================================================*/
async function renderSituacaoGeralMunicipios(){
let box=document.getElementById('painelSituacaoGeralMunicipios')
if(!box)return
let {data,error}=await client.from('queimadas_municipios_oficio').select('*').order('municipio')
if(error){
console.log(error)
box.innerHTML='Erro ao carregar.'
return
}
let html=''
html+='<div style="overflow:auto">'
html+='<table class="tabelaMunicipalExecutiva">'
html+='<thead>'
html+='<tr>'
html+='<th>Nº</th>'
html+='<th>Município</th>'
html+='<th>Situação</th>'
html+='<th>Data</th>'
html+='<th>Documento</th>'
html+='<th>Observação</th>'
html+='</tr>'
html+='</thead>'
html+='<tbody>'
;(data||[]).forEach((i,idx)=>{
let situacao='🔴 Sem Plano de Ação'
if(i.classificacao_cor==='VERDE')situacao='🟢 Com Plano de Ação'
if(i.classificacao_cor==='AMARELO')situacao='🟡 Dilação de Prazo'
html+=`
<tr>
<td>${idx+1}</td>
<td>${i.municipio||'-'}</td>
<td>${situacao}</td>
<td>${formatarDataBR(i.ldatarecebimentodoc)}</td>
<td>${i.lnumerodocenviado||i.llnumerodocenviado||'-'}</td>
<td>${i.observacao||'-'}</td>
</tr>`
})
html+='</tbody>'
html+='</table>'
html+='</div>'
box.innerHTML=html
}
/*=========================================================
104 QUEIMADAS FUNCTION RESUMO CADASTRO MUNICIPAL
=========================================================*/
async function renderCadastroMunicipiosResumo(){
let box=document.getElementById('painelCadastroMunicipiosResumo')
if(!box)return
let {data,error}=await client.from('queimadas_municipios_oficio').select('*').order('municipio')
if(error){
console.log(error)
return
}
let html='<div style="overflow:auto">'
html+='<table class="tabelaMunicipios">'
html+='<thead>'
html+='<tr>'
html+='<th>Município</th>'
html+='<th>Ofício TCE-RO</th>'
html+='<th>Data Envio</th>'
html+='<th>Página Envio</th>'
html+='<th>Data Rec. 1</th>'
html+='<th>Data Rec. 2</th>'
html+='<th>Doc. 1</th>'
html+='<th>Doc. 2</th>'
html+='<th>Observação</th>'
html+='<th>Ação</th>'
html+='</tr>'
html+='</thead>'
html+='<tbody>'
;(data||[]).forEach(i=>{
html+=`
<tr>
<td>${i.municipio||'-'}</td>
<td>${i.nroficioenviadotcero||'-'}</td>
<td>${formatarDataBR(i.dataenviodoc)}</td>
<td>${i.paginaenviodoc||'-'}</td>
<td>${formatarDataBR(i.ldatarecebimentodoc)}</td>
<td>${i.lldatarecebimentodoc||'-'}</td>
<td>${i.lnumerodocenviado||'-'}</td>
<td>${i.llnumerodocenviado||'-'}</td>
<td>${i.observacao||'-'}</td>
<td><button class="btnEditarMunicipio" onclick="editarMunicipio(${i.id})">✏ EDITAR</button></td>
</tr>`
})
html+='</tbody>'
html+='</table>'
html+='</div>'
box.innerHTML=html
}
/*=========================================================
105 QUEIMADAS FUNCTION EDITARMUNICIPIO
=========================================================*/
async function editarMunicipio(id){

let {data,error}=await client
.from('queimadas_municipios_oficio')
.select('*')
.eq('id',id)
.single()

if(error){
console.log(error)
alert('Registro não encontrado.')
return
}

let html=''

html+=`
<div id="modalMunicipio" class="modalMunicipioOverlay">

<div class="modalMunicipioBox">

<h2>🏛️ Cadastro Municipal</h2>

<label>Município</label>
<input id="mMunicipio" value="${data.municipio||''}">

<label>Ofício TCE-RO</label>
<input id="mOficio" value="${data.nroficioenviadotcero||''}">

<label>Data Envio</label>
<input id="mDataEnvio" type="date" value="${data.dataenviodoc||''}">

<label>Página Envio</label>
<input id="mPaginaEnvio" value="${data.paginaenviodoc||''}">

<label>Data Recebimento 1</label>
<input id="mDataRec1" type="date" value="${data.ldatarecebimentodoc||''}">

<label>Data Recebimento 2</label>
<input id="mDataRec2" value="${data.lldatarecebimentodoc||''}">

<label>Página Recebimento 1</label>
<input id="mPagRec1" value="${data.lpaginarecebimentodoc||''}">

<label>Página Recebimento 2</label>
<input id="mPagRec2" value="${data.llpaginarecebimentodoc||''}">

<label>Documento Recebido 1</label>
<input id="mDoc1" value="${data.lnumerodocenviado||''}">

<label>Documento Recebido 2</label>
<input id="mDoc2" value="${data.llnumerodocenviado||''}">

<label>Observação</label>
<textarea id="mObs">${data.observacao||''}</textarea>

<div class="modalMunicipioBotoes">

<button class="btnSalvarMunicipio" onclick="salvarMunicipio(${id})">
💾 SALVAR
</button>

<button class="btnCancelarMunicipio" onclick="fecharModalMunicipio()">
❌ CANCELAR
</button>

</div>

</div>

</div>
`

document.body.insertAdjacentHTML('beforeend',html)

}
/*=========================================================
106 QUEIMADAS FUNCTION FECHARMODALMUNICIPIO
=========================================================*/
function fecharModalMunicipio(){
let modal=document.getElementById('modalMunicipio')
if(modal)modal.remove()
}
/*=========================================================
107 QUEIMADAS FUNCTION SALVARMUNICIPIO
=========================================================*/
async function salvarMunicipio(id){
let payload={
municipio:document.getElementById('mMunicipio').value,
nroficioenviadotcero:document.getElementById('mOficio').value,
dataenviodoc:document.getElementById('mDataEnvio').value,
paginaenviodoc:document.getElementById('mPaginaEnvio').value,
ldatarecebimentodoc:document.getElementById('mDataRec1').value,
lldatarecebimentodoc:document.getElementById('mDataRec2').value,
lpaginarecebimentodoc:document.getElementById('mPagRec1').value,
llpaginarecebimentodoc:document.getElementById('mPagRec2').value,
lnumerodocenviado:document.getElementById('mDoc1').value,
llnumerodocenviado:document.getElementById('mDoc2').value,
observacao:document.getElementById('mObs').value
}
let {error}=await client
.from('queimadas_municipios_oficio')
.update(payload)
.eq('id',id)
if(error){
console.log(error)
alert('Erro ao salvar.')
return
}
fecharModalMunicipio()
await renderCadastroMunicipios()
if(typeof renderTabelaMunicipios==='function')
await renderTabelaMunicipios()
if(typeof renderSituacaoGeralMunicipios==='function')
await renderSituacaoGeralMunicipios()
alert('Registro atualizado com sucesso.')
}

/*=========================================================
108 QUEIMADAS FUNCTION CARREGARUCSRO
=========================================================*/
async function carregarUCsRO(mapa,tipo='executivo'){
try{
let resp=await fetch('./assets/geojson/ucs-ro.geojson')
if(!resp.ok){
throw new Error('Erro ao localizar assets/geojson/ucs-ro.geojson')
}
let geo=await resp.json()
let layerUC=L.geoJSON(geo,{
style:f=>{
let p=(f&&f.properties)?f.properties:{}
return{
color:'#006400',
weight:1,
fillColor:'#00aa55',
fillOpacity:.45
}
},
onEachFeature:(f,l)=>{
let p=(f&&f.properties)?f.properties:{}
let nome=p.nome_uc||p.nome||p.NOME_UC||p.NOME||p.uc||p.UC||'Unidade de Conservação'
let categoria=p.categoria||p.CATEGORIA||'-'
let grupo=p.grupo||p.GRUPO||'-'
let situacao=p.situacao||p.SITUACAO||'-'
let municipio=p.municipio||p.MUNICIPIO||'-'
l.bindPopup(`
<b>${nome}</b><br>
Categoria: ${categoria}<br>
Grupo: ${grupo}<br>
Situação: ${situacao}<br>
Município: ${municipio}
`)
}
})
layerUC.addTo(mapa)
if(tipo==='executivo'){
window.layerUCsExecutivo=layerUC
if(window.camadasControleExecutivo){
window.camadasControleExecutivo.addOverlay(layerUC,'🌳 UCs de Rondônia')
window.overlayUCsExecutivoAdicionado=true
}
}
if(tipo==='estadual'){
window.layerUCsEstadual=layerUC
layerUC.addTo(mapa)
if(window.camadasControleEstadual){
window.camadasControleEstadual.addOverlay(
layerUC,
'🌳 UCs de Rondônia'
)
}
}
let painel=document.getElementById('painelUCsMapa')
if(painel){
painel.innerHTML=`
<b>49 Unidades de Conservação</b><br>
Fonte:
<a href="https://app.tcgeo.tc.br/" target="_blank">
TCGeo / TCE-RO
</a>
`
}
}catch(e){
console.error('Erro ao carregar UCs:',e)
let painel=document.getElementById('painelUCsMapa')
if(painel){
painel.innerHTML='Erro ao carregar UCs.'
}
}
}
/*=========================================================
109 RENDER MAPA MUNICIPAL PLANOS
=========================================================*/
async function renderMapaMunicipalPlanos(filtro='TODOS'){
let div=document.getElementById('mapaMunicipalPlanos')
if(!div)return
if(window.mapaMunicipalPlanos){
try{
window.mapaMunicipalPlanos.remove()
}catch(e){}
window.mapaMunicipalPlanos=null
}
if(div._leaflet_id){
delete div._leaflet_id
}
let mapa=L.map(div).setView([-10.9,-63.3],7)
window.mapaMunicipalPlanos=mapa
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{attribution:'OpenStreetMap'}).addTo(mapa)
let geo=await fetch('/tags/queimadas/assets/geojson/municipios-ro.geojson')
if(!geo.ok){
console.log('Erro GeoJSON',geo.status)
return
}
let geojson=await geo.json()
let {data,error}=await client.from('queimadas_municipios_oficio').select('*')
if(error){
console.log(error)
return
}
let situacao={}
;(data||[]).forEach(i=>{
situacao[String(i.municipio||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/'/g,'').toUpperCase().trim()]=i
})
window.layerMunicipiosPlanos=L.geoJSON(geojson,{
style:f=>{
let nome=String(f.properties.nome||
f.properties.NOME||
f.properties.municipio||
f.properties.MUNICIPIO||
f.properties.nm_mun||
f.properties.NM_MUN||
f.properties.nome_mun||
f.properties.NOME_MUN||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/'/g,'').toUpperCase().trim()
let m=situacao[nome]
let cor='#94a3b8'
if(m){
if(filtro!=='TODOS'&&m.classificacao_cor!==filtro){
cor='#e5e7eb'
}else{
if(m.classificacao_cor==='VERDE')cor='#16a34a'
if(m.classificacao_cor==='AMARELO')cor='#facc15'
if(m.classificacao_cor==='VERMELHO')cor='#dc2626'
}
}
return{
color:'#ffffff',
weight:1,
fillColor:cor,
fillOpacity:.85
}
},
onEachFeature:(f,l)=>{
let nome=String(f.properties.nome||f.properties.NOME||'')
let chave=nome.normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/'/g,'').toUpperCase().trim()
let m=situacao[chave]
l.dadosMunicipio=m
l.bindPopup(`
<b>${nome}</b><br>
Situação: ${m?.classificacao_ia||'Sem classificação'}<br>
Documento: ${m?.lnumerodocenviado||m?.llnumerodocenviado||'-'}<br>
Recebimento: ${m?.ldatarecebimentodoc||'-'}
`)
}
}).addTo(mapa)
if(window.layerUCs){
try{
window.layerUCs.bringToBack()
}catch(e){}
}
try{
mapa.fitBounds(
window.layerMunicipiosPlanos.getBounds(),
{
padding:[20,20]
}
)
}catch(e){}
setTimeout(()=>{
mapa.invalidateSize(true)
},100)
setTimeout(()=>{
mapa.invalidateSize(true)
},500)
setTimeout(()=>{
mapa.invalidateSize(true)
},1000)
}
/*=========================================================
110 QUEIMADAS FUNCTION RENDERMAPAESTADUAL
=========================================================*/
async function renderMapaEstadual(){
let div=document.getElementById('mapaROEstadual')
if(!div)return
if(window.mapaEstadualRO){
try{window.mapaEstadualRO.remove()}catch(e){}
}
window.mapaEstadualRO=null
window.layerUCsEstadual=null
window.layerTIsEstadual=null
window.camadasControleEstadual=null
if(div._leaflet_id){
delete div._leaflet_id
}
let mapa=L.map('mapaROEstadual').setView([-10.9,-63.3],7)
window.mapaEstadualRO=mapa
L.tileLayer(
'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
{
attribution:'OpenStreetMap'
}
).addTo(mapa)
window.camadasControleEstadual=
L.control.layers(
{},
{},
{
collapsed:false
}
).addTo(mapa)
if(typeof carregarUCsRO==='function'){
await carregarUCsRO(mapa,'estadual')
}
if(typeof carregarTIsRO==='function'){
await carregarTIsRO(mapa,'estadual')
}
setTimeout(()=>{
try{
mapa.invalidateSize(true)
let layers=[]
if(window.layerUCsEstadual)layers.push(window.layerUCsEstadual)
if(window.layerTIsEstadual)layers.push(window.layerTIsEstadual)
if(layers.length){
let grupo=L.featureGroup(layers)
if(grupo.getBounds().isValid()){
mapa.fitBounds(
grupo.getBounds(),
{
padding:[30,30],
maxZoom:8
}
)
}
}
}catch(e){
console.log(e)
}
},1200)
}
/*=========================================================
111 QUEIMADAS FUNCTION CARREGARTISRO
=========================================================*/
async function carregarTIsRO(mapa,tipo='estadual'){
try{
let resp=await fetch('./assets/geojson/terras-indigenas-ro.geojson')
if(!resp.ok){
throw new Error('Erro ao localizar assets/geojson/terras-indigenas-ro.geojson')
}
let geo=await resp.json()
let layerTI=L.geoJSON(
geo,
{
style:{
color:'#7c3aed',
weight:2,
fillColor:'#a855f7',
fillOpacity:.35
},
onEachFeature:(f,l)=>{
let p=f.properties||{}
let nome=
p.terrai_nom||
p.nome||
p.NOME||
p.terra_indigena||
p.TERRA_INDIGENA||
'Terra Indígena'
let etnia=
p.etnia_nom||
p.etnia||
'-'
let fase=
p.fase_ti||
p.fase||
'-'
let area=
p.superficie||
p.area_ha||
p.area||
'-'
l.bindPopup(`
<b>${nome}</b><br>
Etnia: ${etnia}<br>
Fase: ${fase}<br>
Área: ${area}
`)
}
}
)
if(tipo==='executivo'){
window.layerTIsExecutivo=layerTI
layerTI.addTo(mapa)
if(window.camadasControleExecutivo){
window.camadasControleExecutivo.addOverlay(
layerTI,
'🛖 Terras Indígenas'
)
}
}
if(tipo==='estadual'){
window.layerTIsEstadual=layerTI
layerTI.addTo(mapa)
if(window.camadasControleEstadual){
window.camadasControleEstadual.addOverlay(
layerTI,
'🛖 Terras Indígenas'
)
}
}
let painel=document.getElementById('painelTIMapa')
if(painel){
let totalTI=(geo.features||[]).length
painel.innerHTML=`
<b>${totalTI} Terras Indígenas de Rondônia</b><br>
Fonte:
<a href="https://www.gov.br/funai" target="_blank">
FUNAI
</a>
`
}
}catch(e){
console.error(e)
}
}
