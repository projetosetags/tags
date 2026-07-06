/*=========================================================
004 BOTÕES ITEM/SUBITEM MONITORAMENTO
=========================================================*/
window.modoResumo='subitem'
window.modoTabela='subitem'

document.getElementById('btnModoItemMensal')?.addEventListener('click',()=>{
window.modoTabela='item'
renderTable()
})

document.getElementById('btnModoSubitemMensal')?.addEventListener('click',()=>{
window.modoTabela='subitem'
renderTable()
})
/*=========================================================
001 MONITORAMENTO FUNCTION RENDERRESUMO
=========================================================*/
function renderResumo(){
let dados=window.allData||[]
if(!window.modoResumo){
window.modoResumo='subitem'
}
if(!dados||!dados.length){
let el=document.getElementById('cards-container')
if(el)el.innerHTML=''
return
}
let mapa={}
let base=[...dados]
let ocultar=!!window.ocultarResumo100
if(filtroDataInicio||filtroDataFim){
base=base.filter(i=>{
let d=parseDataLocal(i.data_inicio)||parseDataLocal(i.prazo_texto)
if(!d)return false
if(filtroDataInicio&&d<parseDataLocal(filtroDataInicio))return false
if(filtroDataFim&&d>parseDataLocal(filtroDataFim))return false
return true
})
}
if(ocultar){
base=base.filter(i=>Number(getTotal(i)||0)<100)
}
if(ocultar&&base.length===0){
let el=document.getElementById('cards-container')
if(el){
el.innerHTML='<div style="grid-column:1/-1;text-align:center;font-size:20px;font-weight:900;padding:40px;color:#64748b;">Nenhum item com percentual inferior a 100%.</div>'
}
return
}
base.forEach(i=>{
let key=(window.modoResumo==='item')?String(i.item||''):String(i.subitem||'')
if(!key)return
if(!mapa[key])mapa[key]=[]
mapa[key].push(i)
})
let keys=Object.keys(mapa).filter(k=>k).sort((a,b)=>{
let ra=(base||[]).find(x=>String((window.modoResumo==='item')?x.item:x.subitem)===String(a))||{subitem:a,item:a}
let rb=(base||[]).find(x=>String((window.modoResumo==='item')?x.item:x.subitem)===String(b))||{subitem:b,item:b}
return compareSubitem(ra,rb)
})
let html=''
let container=document.getElementById('cards-container')
if(container)container.innerHTML=''
keys.forEach(k=>{
let lista=mapa[k]||[]
if(!lista.length)return
if(window.modoResumo==='item'){
lista=window.allData.filter(x=>String(x.item||'')===String(k))
}
let media=Math.round(lista.reduce((acc,c)=>acc+getTotal(c),0)/(lista.length||1))
if(ocultar&&media>=100)return
let cor=media<=30?'bg-status-red':media>=100?'bg-status-green':'bg-status-yellow'
let itemBase=lista[0]||{}
let descricao=''
if(window.modoResumo==='item'){
let registroDescricao=(window.allData||[]).find(x=>String(x.item||'')===String(k)&&x.descricaoitem&&x.descricaoitem.trim())
descricao=registroDescricao?.descricaoitem||''
}else{
descricao=lista.find(x=>x.descricao&&x.descricao.trim())?.descricao||''
}
let itemClick=k
let itemNumero=String(itemBase.item||'-')
let subitemNumero=String(itemBase.subitem||'-')

let tituloPrincipal=
window.modoResumo==='item'
?`ITEM ${itemNumero}`
:`ITEM ${itemNumero}`

let subtitulo=
window.modoResumo==='item'
?''
:`SUBITEM ${subitemNumero}`
html+=`<div class="flex flex-col"><div class="card-micro ${cor}" onclick="abrirDetalhesResumo('${itemClick}')" style="padding:12px;min-height:120px;display:flex;flex-direction:column;align-items:center;justify-content:center;">
<div style="font-size:22px;font-weight:900;color:#000000;line-height:1;">
${tituloPrincipal}
</div>

${subtitulo?`
<div style="font-size:12px;font-weight:900;color:#0f172a;line-height:1;margin-top:4px;">
${subtitulo}
</div>
`:''}${descricao?`<div style="font-size:11px;font-weight:700;color:#000000;margin-top:8px;text-align:center;line-height:1.3;max-width:100%;">${descricao}</div>`:''}<div class="percent-big" style="margin-top:10px;">${media}%</div></div></div>`
})
let el=document.getElementById('cards-container')
if(el)el.innerHTML=html
}

/*=========================================================
002 MONITORAMENTO FUNCTION ABRIRITEM
=========================================================*/
function abrirItem(item){

filtroItemAtivo=item

switchTab('mensal')

renderTable()

document.getElementById('btn-voltar').style.display='block'

}

/*=========================================================
003 MONITORAMENTO FUNCTION RENDERTABLE
=========================================================*/
function renderTable(){
const mesesOrdem=['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez']
const hoje=new Date()
const mesAtual=hoje.getMonth()
const mesesLiberados=mesesOrdem.slice(0,mesAtual+1)
const nomesMeses=['JAN','FEV','MAR','ABR','MAI','JUN','JUL','AGO','SET','OUT','NOV','DEZ']
const indiceMesAtual=mesesLiberados.length-1
const mesEdicao=mesesLiberados[indiceMesAtual]
const thead=document.getElementById('theadMonitoramento')

thead.innerHTML=`
<tr class="text-[8px] text-slate-500 uppercase border-b border-white/10">
<th id="thNumero" onclick="toggleColunaMonitoramento(0)" style="cursor:pointer">${window.modoTabela==='item'?'ITEM':'SUBITEM'}</th>
<th id="thDescricao" onclick="toggleColunaMonitoramento(1)" style="cursor:pointer">${window.modoTabela==='item'?'DESCRIÇÃO ITEM':'DESCRIÇÃO'}</th>
<th id="thProduto" onclick="toggleColunaMonitoramento(2)" style="cursor:pointer">${window.modoTabela==='item'?'AÇÃO':'PRODUTOS'}</th>
<th onclick="toggleColunaMonitoramento(3)" style="cursor:pointer">RESPONSÁVEL(IS)</th>
<th onclick="toggleColunaMonitoramento(4)" style="cursor:pointer">SETOR</th>
<th onclick="toggleColunaMonitoramento(5)" style="cursor:pointer">DATA INÍCIO</th>
${mesesLiberados.map((m,i)=>`
<th
class="${m===mesEdicao?'mes-atual':''}"
onclick="toggleColunaMonitoramento(${6+i})"
style="cursor:pointer;text-align:center;">
${nomesMeses[i]}
</th>
`).join('')}
<th onclick="toggleColunaMonitoramento(${6+mesesLiberados.length})" style="cursor:pointer;text-align:center">TOTAL</th>
</tr>`
let lista=[...(window.allData||[])].sort(compareSubitem)
lista=lista.filter(i=>{
if(filtroItemAtivo&&getItemKey(i)!==filtroItemAtivo)return false
let dataBase=parseDataLocal(i.data_inicio)||parseDataLocal(i.prazo_texto)
if(filtroDataInicio||filtroDataFim){
if(!dataBase)return false
if(filtroDataInicio&&dataBase<parseDataLocal(filtroDataInicio))return false
if(filtroDataFim&&dataBase>parseDataLocal(filtroDataFim))return false
}
if(ocultarConcluidos&&getTotal(i)>=100)return false
return true
})
let tbody=document.getElementById('table-body')
if(!tbody)return
let thNumero=document.getElementById('thNumero')
let thDescricao=document.getElementById('thDescricao')
let thProduto=document.getElementById('thProduto')
if(thNumero)thNumero.innerHTML=window.modoTabela==='item'?'ITEM (Nr.)':'SUBITEM'
if(thDescricao)thDescricao.innerHTML=window.modoTabela==='item'?'DESCRIÇÃO ITEM':'DESCRIÇÃO'
if(thProduto)thProduto.innerHTML=window.modoTabela==='item'?'AÇÃO':'PRODUTOS'
tbody.innerHTML=lista.map(i=>{
let dataFormatada=i.data_inicio?formatarDataBR(i.data_inicio):(i.prazo_texto||'-')
let total=getTotal(i)
let bg=total<=30?'bg-red-900/20':total>=100?'bg-emerald-900/20':'bg-yellow-900/20'
let nivel=Number(userP?.nivel_acesso||0)
let usernameAtual=String(userP?.username||'').toLowerCase()
let origemUsuario=String(userP?.origem||'').toUpperCase()
  
// let mesEdicao=mesesLiberados[mesesLiberados.length-1]
  
let isNivel1=nivel===1
let isHueriqui=usernameAtual==='hueriqui'
let isResponsavel=String(i.responsavel_id||'')===String(userP?.id||'')
let responsavelTexto=i.responsavel||'-'
let listaPerfis=[...(window.perfis||[]),...(window.perfisSedam||[])]
if(Number(userP?.nivel_acesso||0)!==1){listaPerfis=listaPerfis.filter(p=>String(p.id||'')===String(userP?.id||''))}
let perfilResponsavel=listaPerfis.find(p=>String(p.id)===String(i.responsavel_id))
if(perfilResponsavel){responsavelTexto=perfilResponsavel.nome_completo}else{responsavelTexto=i.responsavel||i.responsavel_manual||'Não informado'}
return `<tr class="border-b border-white/5 tr-hover ${bg}"><td class="p-2 font-black text-blue-400">${window.modoTabela==='item'?(i.item||'-'):(i.subitem||'-')}</td><td class="p-2 td-desc">${window.modoTabela==='item'?(i.descricaoitem||i.item_descricao||'-'):(i.descricao||'-')}</td><td class="p-2 td-desc text-[10px] text-slate-700">${window.modoTabela==='item'?(i.acao||i.produto||'-'):(i.produto||'-')}</td><td class="text-xs p-1">${userP&&Number(userP.nivel_acesso)===1?`<select onchange="salvarResponsavel('${i.id}',this.value)" class="bg-slate-100 text-slate-900 font-semibold text-xs p-1 rounded w-full"><option value="">${responsavelTexto||'-'}</option>${listaPerfis.map(p=>`<option title="${p.nome_completo}" value="${p.id}" ${String(p.id)===String(i.responsavel_id)?'selected':''}>${p.nome_completo}</option>`).join('')}</select>`:`<span class="text-slate-800 font-semibold">${responsavelTexto}</span>`}</td><td class="text-xs">${i.setor||'-'}</td><td class="td-data">${dataFormatada}</td>${mesesLiberados.map(m=>{
let valor=Number(i[m]||0)
let bloqueado=valor>0
let liberarMes=m===mesEdicao
let editar=false
if(isNivel1&&!isHueriqui){editar=true}else if(origemUsuario==='SEDAM'&&(nivel===2||nivel===3||nivel===4)&&isResponsavel&&liberarMes&&!bloqueado){editar=true}
return `<td class="td-mes-strong text-center ${m===mesEdicao?'mes-atual':''}">${editar?`<input type="number" min="0" max="100" step="1" class="input-mes" value="${valor}" onchange="if(this.disabled)return;salvar(this.value,'${i.id}','${m}')">`:`<span>${valor}%</span>`}</td>`
}).join('')}<td class="td-total text-emerald-400">${total.toFixed(2)}%</td></tr>`
}).join('')
if(window.colunasMonitoramentoOcultas){
Object.keys(window.colunasMonitoramentoOcultas||{}).forEach(indice=>{
if(window.colunasMonitoramentoOcultas[indice]!==true)return
document.querySelectorAll('#view-mensal table tr').forEach(tr=>{
let cel=tr.children[Number(indice)]
if(cel)cel.style.display='none'
})
})
}
}
/*=========================================================
004 MONITORAMENTO FUNCTION RENDERCONCLUIDOS
=========================================================*/
function renderConcluidos(){

let dados=[...(window.allData||[])]
.filter(i=>getTotal(i)>=100)
.sort(compareSubitem)

let box=document.getElementById('concluidos-container')
let listaEl=document.getElementById('concluidos-list')

if(!box||!listaEl)return

box.innerHTML=''
listaEl.innerHTML=''

let total=document.createElement('div')

total.className='rounded-2xl shadow-2xl flex items-center justify-center p-3'
total.style.background='linear-gradient(135deg,#bbf7d0,#86efac,#dcfce7)'
total.style.minHeight='120px'

total.innerHTML=`
<div class="text-center w-full">
<div style="font-size:9px;font-weight:900;color:#166534;line-height:1;">
TOTAL GERAL
</div>
<div style="font-size:34px;font-weight:900;color:#166534;line-height:1;">
${dados.length}
</div>
<div style="font-size:11px;font-weight:900;color:#166534;line-height:1.1;">
SUBITENS 100%
</div>
</div>
`

box.appendChild(total)

dados.forEach(i=>{

let card=document.createElement('div')

card.className='card-micro shadow-lg'
card.style.background='linear-gradient(135deg,#1e3a8a,#0f172a)'
card.style.color='#ffffff'

card.innerHTML=`
<div class="text-center w-full">
<div style="font-size:12px;font-weight:900;color:#ffffff;">
SUBITEM
</div>
<div style="font-size:28px;font-weight:900;color:#ffffff;">
${i.subitem}
</div>
<div style="font-size:13px;font-weight:900;color:#bfdbfe;">
ITEM ${i.item||'-'}
</div>
</div>
`

box.appendChild(card)

let div=document.createElement('div')

div.className='border-b border-slate-300 pb-1 mb-1'

div.innerHTML=`
<div style="font-size:15px;font-weight:900;color:#000000;line-height:1;">
${i.subitem}
</div>
<div style="font-size:11px;line-height:1.05;color:#000000;font-weight:700;margin-top:1px;">
${i.descricao||'-'}
</div>
<div style="font-size:10px;line-height:1;color:#0f172a;font-weight:900;margin-top:1px;">
PRODUTO: ${i.produto||'-'}
</div>
<div style="font-size:10px;line-height:1;color:#1e3a8a;font-weight:900;margin-top:1px;">
RESPONSÁVEL: ${i.responsavel||'-'}
</div>
`

listaEl.appendChild(div)

})

}
/*=========================================================
005 MONITORAMENTO FUNCTION SALVAR
=========================================================*/
async function salvar(valor,id,campo){
let v=parseFloat(String(valor).replace(',','.'))
if(isNaN(v))v=0
if(v<0||v>100){
alert("Informe 0 a 100")
return
}
let podeEditar=(userP&&(
Number(userP.nivel_acesso)===1||
(
[2,3,4].includes(Number(userP.nivel_acesso))&&
podeEditarMes(campo)
)
))
if(
Number(userP.nivel_acesso)!==1&&
!podeEditarMes(campo)
){
alert('Somente o mês atual pode ser alterado')
return
}
if(!podeEditar){
alert("Sem permissão")
return
}
let {error}=await client.from('deliberacoes').update({[campo]:v}).eq('id',id)
if(error){
console.error(error)
alert("Erro ao salvar")
return
}
carregarDados()
}
/*=========================================================
999 RESUMO TOGGLE 100
=========================================================*/
window.ocultarResumo100=false
function toggleOcultarResumo(){
window.ocultarResumo100=document.getElementById('ocultar100Resumo')?.checked||false
renderResumo()
}

/*=========================================================
152 TOGGLE CABECALHO MONITORAMENTO
=========================================================*/
window.cabecalhoMonitoramentoOculto=false
function toggleCabecalhoMonitoramento(){
window.cabecalhoMonitoramentoOculto=!window.cabecalhoMonitoramentoOculto
let topo=document.querySelector('.topo-sedam-modern')
let menu=document.querySelector('nav')
let filtros=document.getElementById('view-mensal-filtros')
if(topo)topo.style.display=window.cabecalhoMonitoramentoOculto?'none':'flex'
if(menu)menu.style.display=window.cabecalhoMonitoramentoOculto?'none':'grid'
if(filtros)filtros.style.position=window.cabecalhoMonitoramentoOculto?'sticky':''
if(filtros)filtros.style.top=window.cabecalhoMonitoramentoOculto?'0':''
if(filtros)filtros.style.zIndex=window.cabecalhoMonitoramentoOculto?'999':''
let btn=document.getElementById('btnOcultarCabecalho')
if(btn){
btn.innerText=window.cabecalhoMonitoramentoOculto?'MOSTRAR CABEÇALHO':'OCULTAR CABEÇALHO'
}
}
/*=========================================================
153 TOGGLE COLUNAS MONITORAMENTO
=========================================================*/
window.colunasMonitoramentoOcultas={}
function toggleColunaMonitoramento(indice){
window.colunasMonitoramentoOcultas[indice]=!window.colunasMonitoramentoOcultas[indice]
document.querySelectorAll('#view-mensal table tr').forEach(tr=>{
let cel=tr.children[indice]
if(cel)cel.style.display=window.colunasMonitoramentoOcultas[indice]?'none':''
})
}
/*=========================================================
154 RESTAURAR COLUNAS MONITORAMENTO
=========================================================*/
function restaurarColunasMonitoramento(){
window.colunasMonitoramentoOcultas={}
window.cabecalhoMonitoramentoOculto=false
let topo=document.querySelector('.topo-sedam-modern')
let menu=document.querySelector('nav')
let filtros=document.getElementById('view-mensal-filtros')
if(topo)topo.style.display='flex'
if(menu)menu.style.display='grid'
if(filtros)filtros.style.display='flex'
let btn=document.getElementById('btnOcultarCabecalho')
if(btn)btn.innerText='OCULTAR CABEÇALHO'
document.querySelectorAll('#view-mensal table tr').forEach(tr=>{
Array.from(tr.children).forEach(td=>{
td.style.display=''
})
})
}
/*=========================================================
155 MODO APRESENTACAO MONITORAMENTO
=========================================================*/
function modoApresentacaoMonitoramento(){
restaurarColunasMonitoramento()
let ocultar=[3,6,7,8,9,12]
ocultar.forEach(indice=>{
window.colunasMonitoramentoOcultas[indice]=true
document.querySelectorAll('#view-mensal table tr').forEach(tr=>{
let cel=tr.children[indice]
if(cel)cel.style.display='none'
})
})
}
