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
004 QUEIMADAS FUNCTION RENDERCADEIAVALOR
=========================================================*/
async function renderCadeiaValor(){
let box=document.getElementById('painelCadeiaValor')
if(!box)return
let[{data:monitoramento=[]},{data:mapbiomas=[]},{data:prodes=[]}]=await Promise.all([
client.from('queimadas_monitoramento').select('*'),
client.from('queimadas_mapbiomas').select('*'),
client.from('queimadas_prodes').select('*')
])
let total=(monitoramento||[]).length
let andamento=(monitoramento||[]).filter(i=>Number(i.percentual||0)>0).length
let concluidos=(monitoramento||[]).filter(i=>Number(i.percentual||0)>=100).length
let areaQueimada=(mapbiomas||[]).reduce((s,i)=>s+Number(i.area_queimada||i.area||0),0)
let areaDesmatada=(prodes||[]).reduce((s,i)=>s+Number(i.area_desmatada||i.area||0),0)
box.innerHTML=`
<div class="cadeia-card">
<div class="cadeia-item">CADEIA DE VALOR DO ENFRENTAMENTO ÀS QUEIMADAS E AO DESMATAMENTO</div>
<div class="cadeia-flow">
<div class="cadeia-box cadeia-insumo">📥<br>Recursos<br>Equipes<br>Sistemas</div>
<div class="cadeia-seta">➜</div>
<div class="cadeia-box cadeia-atividade">⚙️<br>${formatarNumero(total)}<br>Ações Planejadas</div>
<div class="cadeia-seta">➜</div>
<div class="cadeia-box cadeia-produto">📦<br>${formatarNumero(andamento)}<br>Ações Executadas</div>
<div class="cadeia-seta">➜</div>
<div class="cadeia-box cadeia-resultado">📈<br>${formatarNumero(concluidos)}<br>Ações Concluídas</div>
<div class="cadeia-seta">➜</div>
<div class="cadeia-box cadeia-impacto">🔥<br>${formatarNumero(areaQueimada)} ha<br>Área Queimada</div>
<div class="cadeia-seta">➜</div>
<div class="cadeia-box cadeia-beneficio">🌳<br>${formatarNumero(areaDesmatada)} ha<br>Área Desmatada</div>
</div>
</div>`
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
let[{data:monitoramento=[]},{data:mapbiomas=[]},{data:prodes=[]}]=await Promise.all([
client.from('queimadas_monitoramento').select('*'),
client.from('queimadas_mapbiomas').select('*'),
client.from('queimadas_prodes').select('*')
])
let total=monitoramento.length
let concluidos=monitoramento.filter(i=>Number(i.percentual||0)>=100).length
let areaQueimada=mapbiomas.reduce((s,i)=>s+Number(i.area_queimada||i.area||0),0)
let areaDesmatada=prodes.reduce((s,i)=>s+Number(i.area_desmatada||i.area||0),0)
box.innerHTML=`
<div class="tdm-card">
<div class="tdm-titulo">TEORIA DA MUDANÇA - QUEIMADAS E DESMATAMENTO</div>
<div class="tdm-flow">
<div class="tdm-box tdm-problema">🚨<br>Queimadas<br>Desmatamento</div>
<div class="tdm-seta">↓</div>
<div class="tdm-box tdm-causa">🔍<br>Pressão Antrópica<br>Uso Irregular do Solo</div>
<div class="tdm-seta">↓</div>
<div class="tdm-box tdm-acao">⚙️<br>${formatarNumero(total)}<br>Ações Planejadas</div>
<div class="tdm-seta">↓</div>
<div class="tdm-box tdm-resultado">📈<br>${formatarNumero(concluidos)}<br>Ações Concluídas</div>
<div class="tdm-seta">↓</div>
<div class="tdm-box tdm-impacto">🔥<br>${formatarNumero(areaQueimada)} ha<br>Área Queimada</div>
<div class="tdm-seta">↓</div>
<div class="tdm-box tdm-beneficio">🌳<br>${formatarNumero(areaDesmatada)} ha<br>Área Desmatada</div>
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
let[{data:exec},{data:mapbiomas=[]},{data:prodes=[]}]=await Promise.all([
client.from('vw_queimadas_executivo').select('*').single(),
client.from('queimadas_mapbiomas').select('*'),
client.from('queimadas_prodes').select('*')
])
if(!exec)return
let areaQueimada=mapbiomas.reduce((s,i)=>s+Number(i.area_queimada||i.area||0),0)
let areaDesmatada=prodes.reduce((s,i)=>s+Number(i.area_desmatada||i.area||0),0)
document.getElementById('painelKPIs').innerHTML=`
<div class="kpiGrid">
<div class="kpiCard">
<div class="kpiNumero">${Number(exec.focos_estado||0).toLocaleString('pt-BR')}</div>
<div class="kpiTitulo">🔥 FOCOS DE CALOR</div>
</div>
<div class="kpiCard">
<div class="kpiNumero">${areaDesmatada.toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2})}</div>
<div class="kpiTitulo">🌳 DESMATAMENTO (ha)</div>
</div>
<div class="kpiCard">
<div class="kpiNumero">${areaQueimada.toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2})}</div>
<div class="kpiTitulo">🔥 ÁREA QUEIMADA (ha)</div>
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
async function renderPlanoSEDAM(){
let box=document.getElementById('painelPlanoSEDAM')
if(!box)return
let[{data:planejamento=[]},{data:mapbiomas=[]},{data:prodes=[]}]=await Promise.all([
client.from('queimadas_planejamento').select('*').eq('origem','SEDAM'),
client.from('queimadas_mapbiomas').select('*'),
client.from('queimadas_prodes').select('*')
])
let mapa={}
planejamento.forEach(i=>{mapa[String(i.acao||'').toUpperCase()]=i})
let areaQueimada=mapbiomas.reduce((s,i)=>s+Number(i.area_queimada||i.area||0),0)
let areaDesmatada=prodes.reduce((s,i)=>s+Number(i.area_desmatada||i.area||0),0)
box.innerHTML=`
<div class="cadeia-card">
<div class="cadeia-item">PLANO DE AÇÃO SEDAM 2026</div>
<div class="cadeia-flow">
<div class="cadeia-box cadeia-insumo" style="border-top:5px solid ${mapa['PREVENÇÃO']?.cor||'#16a34a'}">🌳 PREVENÇÃO<br><span class="periodo-plano">${mapa['PREVENÇÃO']?formatarDataBR(mapa['PREVENÇÃO'].inicio)+' a '+formatarDataBR(mapa['PREVENÇÃO'].fim):'-'}</span><span class="responsavel-plano">${mapa['PREVENÇÃO']?.responsavel||''}</span><span class="status-plano">${mapa['PREVENÇÃO']?.status||''}</span></div>
<div class="cadeia-box cadeia-atividade" style="border-top:5px solid ${mapa['FISCALIZAÇÃO']?.cor||'#2563eb'}">🚔 FISCALIZAÇÃO<br><span class="periodo-plano">${mapa['FISCALIZAÇÃO']?formatarDataBR(mapa['FISCALIZAÇÃO'].inicio)+' a '+formatarDataBR(mapa['FISCALIZAÇÃO'].fim):'-'}</span><span class="responsavel-plano">${mapa['FISCALIZAÇÃO']?.responsavel||''}</span><span class="status-plano">${mapa['FISCALIZAÇÃO']?.status||''}</span></div>
<div class="cadeia-box cadeia-produto" style="border-top:5px solid ${mapa['COMBATE']?.cor||'#dc2626'}">🔥 COMBATE<br><span class="periodo-plano">${mapa['COMBATE']?formatarDataBR(mapa['COMBATE'].inicio)+' a '+formatarDataBR(mapa['COMBATE'].fim):'-'}</span><span class="responsavel-plano">${mapa['COMBATE']?.responsavel||''}</span><span class="status-plano">${mapa['COMBATE']?.status||''}</span></div>
<div class="cadeia-box cadeia-resultado" style="border-top:5px solid ${mapa['REDUÇÃO']?.cor||'#f97316'}">📉 REDUÇÃO<br><span class="periodo-plano">${mapa['REDUÇÃO']?formatarDataBR(mapa['REDUÇÃO'].inicio)+' a '+formatarDataBR(mapa['REDUÇÃO'].fim):'-'}</span><span class="responsavel-plano">${mapa['REDUÇÃO']?.responsavel||''}</span><span class="status-plano">${mapa['REDUÇÃO']?.status||''}</span></div>
<div class="cadeia-box cadeia-impacto">🔥 ${formatarNumero(areaQueimada)} ha<br>MAPBIOMAS</div>
<div class="cadeia-box cadeia-beneficio">🌳 ${formatarNumero(areaDesmatada)} ha<br>PRODES</div>
</div>
<div class="fonte-card">Fonte: Plano SEDAM • MAPBIOMAS • PRODES • TCERO</div>
</div>`
}
/*=========================================================
012 QUEIMADAS FUNCTION RENDERPLANOCBM
=========================================================*/
async function renderPlanoCBM(){
let box=document.getElementById('painelPlanoCBM')
if(!box)return
let{data=[]}=await client.from('queimadas_planejamento').select('*').eq('origem','CBMRO')
let mapa={}
data.forEach(i=>{mapa[String(i.acao||'').toUpperCase()]=i})
box.innerHTML=`
<div class="cadeia-card">
<div class="cadeia-item">POTIF 2026 - CBMRO</div>
<div class="cadeia-flow">
<div class="cadeia-box cadeia-insumo" style="border-top:5px solid ${mapa['BRIGADAS']?.cor||'#16a34a'}">🚒 BRIGADAS<br><span class="periodo-plano">${mapa['BRIGADAS']?formatarDataBR(mapa['BRIGADAS'].inicio)+' a '+formatarDataBR(mapa['BRIGADAS'].fim):'-'}</span><span class="responsavel-plano">${mapa['BRIGADAS']?.responsavel||''}</span></div>
<div class="cadeia-box cadeia-atividade" style="border-top:5px solid ${mapa['COMBATE']?.cor||'#dc2626'}">🧯 COMBATE<br><span class="periodo-plano">${mapa['COMBATE']?formatarDataBR(mapa['COMBATE'].inicio)+' a '+formatarDataBR(mapa['COMBATE'].fim):'-'}</span><span class="responsavel-plano">${mapa['COMBATE']?.responsavel||''}</span></div>
<div class="cadeia-box cadeia-produto" style="border-top:5px solid ${mapa['CONTROLE']?.cor||'#2563eb'}">🔥 CONTROLE<br><span class="periodo-plano">${mapa['CONTROLE']?formatarDataBR(mapa['CONTROLE'].inicio)+' a '+formatarDataBR(mapa['CONTROLE'].fim):'-'}</span><span class="responsavel-plano">${mapa['CONTROLE']?.responsavel||''}</span></div>
<div class="cadeia-box cadeia-resultado" style="border-top:5px solid ${mapa['REDUÇÃO']?.cor||'#f97316'}">📉 REDUÇÃO<br><span class="periodo-plano">${mapa['REDUÇÃO']?formatarDataBR(mapa['REDUÇÃO'].inicio)+' a '+formatarDataBR(mapa['REDUÇÃO'].fim):'-'}</span><span class="responsavel-plano">${mapa['REDUÇÃO']?.responsavel||''}</span></div>
<div class="cadeia-box cadeia-impacto" style="border-top:5px solid ${mapa['PRESERVAÇÃO']?.cor||'#22c55e'}">🌳 PRESERVAÇÃO<br><span class="periodo-plano">${mapa['PRESERVAÇÃO']?formatarDataBR(mapa['PRESERVAÇÃO'].inicio)+' a '+formatarDataBR(mapa['PRESERVAÇÃO'].fim):'-'}</span></div>
<div class="cadeia-box cadeia-beneficio" style="border-top:5px solid ${mapa['SEGURANÇA']?.cor||'#14b8a6'}">👨‍👩‍👧‍👦 SEGURANÇA<br><span class="periodo-plano">${mapa['SEGURANÇA']?formatarDataBR(mapa['SEGURANÇA'].inicio)+' a '+formatarDataBR(mapa['SEGURANÇA'].fim):'-'}</span></div>
</div>
<div class="fonte-card">Fonte: POTIF 2026 • CBMRO • TCERO</div>
</div>`
}
/*=========================================================
013 QUEIMADAS FUNCTION RENDERMARCOS
=========================================================*/
async function renderMarcos(){
let box=document.getElementById('painelMarcos')
if(!box)return
let{data=[]}=await client.from('queimadas_planejamento').select('*').order('inicio',{ascending:true})
let html=''
data.forEach(i=>{
html+=`
<div class="monitor4d-card">
<b>${formatarDataBR(i.inicio)} até ${formatarDataBR(i.fim)}</b><br>
${i.acao||'-'}<br>
Status: ${i.status||'-'}<br>
Responsável: ${i.responsavel||'-'}
</div>`
})
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
let lista=[...(ranking||[])].sort((a,b)=>{
let bq=Number(b.area_queimada_ha||b.area_queimada||0)
let aq=Number(a.area_queimada_ha||a.area_queimada||0)
let bd=Number(b.desmatamento_ha||b.area_desmatada||0)
let ad=Number(a.desmatamento_ha||a.area_desmatada||0)
let bi=Number(b.indice_final||b.iriq||0)
let ai=Number(a.indice_final||a.iriq||0)
return(bi+bd+bq)-(ai+ad+aq)
}).slice(0,10)
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
<div class="ranking-info">🔥 Área Queimada: ${formatarNumero(m.area_queimada_ha||m.area_queimada||0)} ha</div>
<div class="ranking-info">🌳 Desmatamento: ${formatarNumero(m.desmatamento_ha||m.area_desmatada||0)} ha</div>
</div>`
})
html+='</div>'
html+=`<div class="fonte-card">Fonte: MAPBIOMAS (${formatarNumero(mapbiomas.length)} registros) • PRODES (${formatarNumero(prodes.length)} registros) • Ranking Ambiental Estadual</div>`
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
try{mapa.fitBounds(window.layerMunicipiosPoligonos.getBounds())}catch(e){}
setTimeout(()=>mapa.invalidateSize(),500)
}
/*=========================================================
039 QUEIMADAS FUNCTION RENDERACOESSEDAM
=========================================================*/
async function renderAcoesSedam(){
let box=document.getElementById('painelAcoesSedam')
if(!box)return
let{data=[]}=await client.from('queimadas_monitoramento').select('*').eq('origem','SEDAM')
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
let box=document.getElementById('painelGeral')
if(!box)return
let[{data:heat=[]},{data:sedam=[]},{data:cbm=[]},{data:monitoramento=[]}]=await Promise.all([
client.from('vw_queimadas_ranking_estadual').select('*'),
client.from('queimadas_acoes_sedam').select('*'),
client.from('queimadas_acoes_cbm').select('*'),
client.from('queimadas_monitoramento').select('*')
])
let areaQueimada=heat.reduce((s,i)=>s+Number(i.area_queimada_ha||i.area_queimada||0),0)
let desmatamento=heat.reduce((s,i)=>s+Number(i.desmatamento_ha||i.area_desmatada||0),0)
let criticos=heat.filter(i=>Number(i.indice_final||i.iriq||0)>=75).length
let alto=heat.filter(i=>Number(i.indice_final||i.iriq||0)>=50&&Number(i.indice_final||i.iriq||0)<75).length
let execucao=monitoramento.length?Math.round(monitoramento.reduce((s,i)=>s+Number(i.percentual||0),0)/monitoramento.length):0
box.innerHTML=`
<div class="chap-grid">
<div class="chap-card"><div class="chap-num">${formatarNumero(areaQueimada)}</div><div class="chap-label">ÁREA QUEIMADA (ha)</div></div>
<div class="chap-card"><div class="chap-num">${formatarNumero(desmatamento)}</div><div class="chap-label">DESMATAMENTO (ha)</div></div>
<div class="chap-card"><div class="chap-num">${criticos}</div><div class="chap-label">MUNICÍPIOS CRÍTICOS</div></div>
<div class="chap-card"><div class="chap-num">${alto}</div><div class="chap-label">ALTO RISCO</div></div>
<div class="chap-card"><div class="chap-num">${execucao}%</div><div class="chap-label">EXECUÇÃO GERAL</div></div>
<div class="chap-card"><div class="chap-num">${sedam.length+cbm.length}</div><div class="chap-label">AÇÕES MONITORADAS</div></div>
</div>`
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
let {data=[]}=await client
.from('queimadas_sala_situacao')
.select('*')
.order('criticidade',{ascending:false})

let criticos=data.filter(i=>(i.criticidade||0)>=75)
let riscos=data.slice(0,10)

let topCriticos=document.getElementById('painelTopCriticos')
if(topCriticos){
topCriticos.innerHTML=criticos.slice(0,10).map(i=>`
<div class="linha-ranking">
<b>${i.municipio||'-'}</b>
<span>${i.criticidade||0}</span>
</div>
`).join('')
}

let topRiscos=document.getElementById('painelTopRiscos')
if(topRiscos){
topRiscos.innerHTML=riscos.slice(0,10).map(i=>`
<div class="linha-ranking">
<b>${i.municipio||'-'}</b>
<span>${i.classificacao||'-'}</span>
</div>
`).join('')
}

let alertas=document.getElementById('painelAlertas')
if(alertas){
alertas.innerHTML=criticos.slice(0,5).map(i=>`
<div class="linha-ranking">
🚨 ${i.municipio}
</div>
`).join('')
}

let situacao=document.getElementById('painelSalaSituacaoEstadual')
if(situacao){
situacao.innerHTML=`
<div class="chap-grid">
<div class="chap-card">
<div class="chap-num">${data.length}</div>
<div class="chap-label">MUNICÍPIOS</div>
</div>
<div class="chap-card">
<div class="chap-num">${criticos.length}</div>
<div class="chap-label">CRÍTICOS</div>
</div>
</div>
`
}

if(typeof renderTopIAChap==='function'){
await renderTopIAChap()
}

if(typeof renderAlertas==='function'){
await renderAlertas()
}
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
}
if(nome==='executivomunicipal'){
document.getElementById('abaExecutivoMunicipal')?.classList.remove('hidden')
if(typeof renderMunicipiosOficio==='function'){
await renderMunicipiosOficio('RESUMO')
await renderMunicipiosOficio('CADASTRO')
}
if(typeof renderMapaMunicipalPlanos==='function')await renderMapaMunicipalPlanos('TODOS')
}
if(nome==='mapa'){
document.getElementById('abaMapa')?.classList.remove('hidden')
if(typeof renderMapaEstadual==='function')await renderMapaEstadual()
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
056 QUEIMADAS FUNCTION CARREGARFOCOSPERIODO
=========================================================*/
function carregarFocosPeriodo(){
let periodo=document.getElementById('filtroPeriodoFocos')?.value||'7'
let box=document.getElementById('boxPeriodoPersonalizado')
if(box)box.style.display=periodo==='custom'?'flex':'none'
if(typeof carregarPainelFocosCalor==='function'){
carregarPainelFocosCalor(periodo)
}
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
<td>${i.observacao||'-'}</td>
<td><button class="btnEditarMunicipio" onclick="editarEstado(${i.id})">✏ EDITAR</button></td>
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
067 QUEIMADAS FUNCTION RENDERSEMPLANO
=========================================================*/
async function renderSemPlano(){
let box=document.getElementById('painelSemPlano')
if(!box)return
let{data=[]}=await client.from('queimadas_municipios_oficio').select('*')
let lista=data.filter(i=>{
let cor=String(i.classificacao_cor||'').toUpperCase()
return cor==='VERMELHO'||(!i.ldatarecebimentodoc&&!i.lldatarecebimentodoc)
})
box.innerHTML=`
<div class="cardExecutivo">
<h2>📄 MUNICÍPIOS SEM PLANO</h2>
${lista.map(i=>`<div>${i.municipio}</div>`).join('')}
</div>`
}
/*=========================================================
068 QUEIMADAS FUNCTION RENDERSEMRESPOSTA
=========================================================*/
async function renderSemResposta(){
let box=document.getElementById('painelSemResposta')
if(!box)return
let{data=[]}=await client.from('queimadas_municipios_oficio').select('*')
let lista=data.filter(i=>!i.ldatarecebimentodoc&&!i.lldatarecebimentodoc)
box.innerHTML=`
<div class="cardExecutivo">
<h2>📭 MUNICÍPIOS SEM RESPOSTA</h2>
${lista.map(i=>`<div>${i.municipio}</div>`).join('')}
</div>`
}
/*=========================================================
069 QUEIMADAS FUNCTION RENDERQUADROMUNICIPIOSSITUACAO
=========================================================*/
async function renderQuadroMunicipiosSituacao(){
let box=document.getElementById('painelQuadroMunicipiosSituacao')
if(!box)return
let{data=[]}=await client.from('vw_queimadas_ranking_estadual').select('*').order('indice_final',{ascending:false})
box.innerHTML=`
<div class="cardExecutivo">
<h2>📍 SITUAÇÃO DOS 52 MUNICÍPIOS</h2>
<table class="tabelaMunicipios">
<thead>
<tr>
<th>Município</th>
<th>Focos</th>
<th>Área Queimada (ha)</th>
<th>Desmatamento (ha)</th>
<th>IRIQ</th>
<th>Classificação</th>
</tr>
</thead>
<tbody>
${data.map(i=>`
<tr>
<td>${i.municipio||'-'}</td>
<td>${Number(i.focos||0).toLocaleString('pt-BR')}</td>
<td>${Number(i.area_queimada_ha||0).toLocaleString('pt-BR')}</td>
<td>${Number(i.desmatamento_ha||0).toLocaleString('pt-BR')}</td>
<td>${Number(i.indice_final||i.iriq||0).toFixed(2)}</td>
<td>${i.classificacao||'-'}</td>
</tr>
`).join('')}
</tbody>
</table>
</div>`
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

