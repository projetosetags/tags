/*=========================================================
SEPAT • VIGÊNCIA INÍCIO/FIM
Correção de exibição, filtro e relatórios
=========================================================*/
(function(){
'use strict'

const VERSAO_VIGENCIA_SEPAT='20260902-1'

function dataIsoSepat(v){
if(v===null||v===undefined)return''
let s=String(v).trim()
if(!s)return''
let m=s.match(/^(\d{4})-(\d{2})-(\d{2})(?:[T\s].*)?$/)
if(m)return`${m[1]}-${m[2]}-${m[3]}`
m=s.match(/^(\d{2})[\/\-](\d{2})[\/\-](\d{4})$/)
if(m)return`${m[3]}-${m[2]}-${m[1]}`
return''
}

function formatarVigenciaSepat(v){
if(v===null||v===undefined)return'-'
let s=String(v).trim()
if(!s)return'-'
let iso=dataIsoSepat(s)
if(!iso)return s
let p=iso.split('-')
return`${p[2]}/${p[1]}/${p[0]}`
}

function escaparHtmlVigenciaSepat(v){
return String(v===null||v===undefined?'':v)
.replace(/&/g,'&amp;')
.replace(/</g,'&lt;')
.replace(/>/g,'&gt;')
.replace(/"/g,'&quot;')
.replace(/'/g,'&#039;')
}

function obterFiltrosVigenciaSepat(){
return{
inicio:String(document.getElementById('filtroVigenciaInicioSepat')?.value||''),
fim:String(document.getElementById('filtroVigenciaFimSepat')?.value||'')
}
}

function registroDentroVigenciaSepat(i,inicioFiltro,fimFiltro){
if(!inicioFiltro&&!fimFiltro)return true
let inicio=dataIsoSepat(i.data_inicio)
let fim=dataIsoSepat(i.data_fim)
if(inicioFiltro&&fim&&fim<inicioFiltro)return false
if(fimFiltro&&inicio&&inicio>fimFiltro)return false
if(!inicio&&!fim)return false
return true
}

function obterListaMonitoramentoVigenciaSepat(){
let busca=String(document.getElementById('buscaMonitoramentoSepat')?.value||'').toLowerCase().trim()
let ocultar100=document.getElementById('ocultar100Sepat')?.checked||false
let filtros=obterFiltrosVigenciaSepat()
let lista=[...(typeof sepatData!=='undefined'?(sepatData||[]):[])].sort(compareSepat)
if(busca){
lista=lista.filter(i=>[
i.siglaitem,
i.subitem,
i.item,
i.descricaoitem,
i.produto,
i.cargo,
i.setor,
i.data_inicio,
i.data_fim
].join(' ').toLowerCase().includes(busca))
}
if(ocultar100){
lista=lista.filter(i=>getTotalSepat(i)<100)
}
if(filtros.inicio||filtros.fim){
lista=lista.filter(i=>registroDentroVigenciaSepat(i,filtros.inicio,filtros.fim))
}
return lista
}

function instalarEstiloVigenciaSepat(){
if(document.getElementById('styleVigenciaSepat'))return
let style=document.createElement('style')
style.id='styleVigenciaSepat'
style.textContent=`
#filtrosVigenciaSepat{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.filtro-vigencia-sepat{height:48px;display:flex;align-items:center;gap:7px;padding:0 10px;border:1px solid #bfd7ff;border-radius:16px;background:#fff;box-shadow:0 6px 18px rgba(15,23,42,.06)}
.filtro-vigencia-sepat span{font-size:9px;font-weight:1000;color:#475569;text-transform:uppercase;white-space:nowrap}
.filtro-vigencia-sepat input{height:32px;border:0;outline:0;background:transparent;font-size:11px;font-weight:900;color:#0f172a;min-width:116px}
.vigencia-sepat{min-width:92px!important;max-width:150px!important;text-align:center!important;white-space:normal!important;font-size:9px!important;font-weight:900!important;background:#f8fbff!important}
.vigencia-sepat.fim-texto{text-align:left!important;line-height:1.35!important}
.tabela-sepat th:nth-child(5),.tabela-sepat td:nth-child(5){width:92px!important;min-width:92px!important;max-width:150px!important;text-align:center!important;white-space:normal!important}
.tabela-sepat th:nth-child(6),.tabela-sepat td:nth-child(6){width:98px!important;min-width:98px!important;max-width:170px!important;text-align:center!important;white-space:normal!important}
.tabela-sepat th:nth-child(n+7),.tabela-sepat td:nth-child(n+7){width:52px!important;min-width:52px!important;max-width:52px!important;padding:2px!important;text-align:center!important;font-size:9px!important;font-weight:1000!important}
.vigencia-modal-sepat{margin:10px 0 2px;padding:10px 12px;border-radius:12px;background:#eff6ff;border:1px solid #bfdbfe;font-size:11px;font-weight:900;color:#1e3a5f}
@media(max-width:900px){#filtrosVigenciaSepat{width:100%}.filtro-vigencia-sepat{flex:1;min-width:155px}}
`
document.head.appendChild(style)
}

function instalarCabecalhoVigenciaSepat(){
let tr=document.querySelector('.tabela-sepat thead tr')
if(!tr)return
let ths=[...tr.querySelectorAll('th')]
let thInicio=ths.find(th=>String(th.textContent||'').trim().toUpperCase()==='DATA INÍCIO'||String(th.textContent||'').trim().toUpperCase()==='VIGÊNCIA INÍCIO')
if(!thInicio)return
thInicio.id='thVigenciaInicioSepat'
thInicio.textContent='VIGÊNCIA INÍCIO'
if(!document.getElementById('thVigenciaFimSepat')){
let thFim=document.createElement('th')
thFim.id='thVigenciaFimSepat'
thFim.textContent='VIGÊNCIA FIM'
thInicio.insertAdjacentElement('afterend',thFim)
}
}

function instalarFiltrosVigenciaSepat(){
if(document.getElementById('filtrosVigenciaSepat'))return
let barra=document.querySelector('#view-monitoramento .barra-filtros-sepat')
let busca=document.getElementById('buscaMonitoramentoSepat')
if(!barra||!busca)return
let box=document.createElement('div')
box.id='filtrosVigenciaSepat'
box.innerHTML=`
<label class="filtro-vigencia-sepat" title="Filtrar registros cuja vigência alcance esta data inicial">
<span>INÍCIO</span>
<input id="filtroVigenciaInicioSepat" type="date">
</label>
<label class="filtro-vigencia-sepat" title="Filtrar registros cuja vigência alcance esta data final">
<span>FIM</span>
<input id="filtroVigenciaFimSepat" type="date">
</label>
<button id="btnLimparVigenciaSepat" type="button" class="btn-modo-sepat" style="height:48px;padding:0 14px">LIMPAR DATAS</button>
`
busca.insertAdjacentElement('afterend',box)
document.getElementById('filtroVigenciaInicioSepat').addEventListener('change',()=>renderTabelaSepat())
document.getElementById('filtroVigenciaFimSepat').addEventListener('change',()=>renderTabelaSepat())
document.getElementById('btnLimparVigenciaSepat').addEventListener('click',()=>{
document.getElementById('filtroVigenciaInicioSepat').value=''
document.getElementById('filtroVigenciaFimSepat').value=''
renderTabelaSepat()
})
}

function atualizarCabecalhoModoVigenciaSepat(){
let thModo=document.getElementById('thModoSepat')
let thDescricao=document.getElementById('thDescricaoSepat')
if(typeof modoTabelaSepat!=='undefined'&&modoTabelaSepat==='item'){
if(thModo)thModo.innerText='ITEM'
if(thDescricao)thDescricao.innerText='DESCRIÇÃO ITEM'
}else{
if(thModo)thModo.innerText='SUBITEM'
if(thDescricao)thDescricao.innerText='DESCRIÇÃO'
}
}

function renderTabelaComVigenciaSepat(){
instalarCabecalhoVigenciaSepat()
instalarFiltrosVigenciaSepat()
atualizarCabecalhoModoVigenciaSepat()
let view=document.getElementById('view-monitoramento')
if(view){
if(typeof modoTabelaSepat!=='undefined'&&modoTabelaSepat==='item')view.classList.add('tabela-item-sepat')
else view.classList.remove('tabela-item-sepat')
}
let tbody=document.getElementById('tbodySepat')
if(!tbody)return
let lista=obterListaMonitoramentoVigenciaSepat()
const mesesOrdem=['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez']
const mesAtual=mesesOrdem[new Date().getMonth()]
const indiceAtual=mesesOrdem.indexOf(mesAtual)
tbody.innerHTML=lista.map(i=>{
let total=getTotalSepat(i)
let fimOriginal=String(i.data_fim||'').trim()
let fimEhData=!!dataIsoSepat(fimOriginal)
let html=`
<tr>
<td class="col-subitem" style="width:340px;min-width:340px;max-width:340px;font-size:10px;font-weight:900;line-height:1.5;white-space:normal;word-break:break-word;vertical-align:top;">
${escaparHtmlVigenciaSepat(typeof modoTabelaSepat!=='undefined'&&modoTabelaSepat==='item'?(i.item||'-'):(i.siglaitem||'-'))}
</td>
<td style="max-width:760px;font-size:9px;line-height:1.55;vertical-align:top;">
${escaparHtmlVigenciaSepat(typeof modoTabelaSepat!=='undefined'&&modoTabelaSepat==='item'?(i.descricaoitem||'-'):(i.subitem||'-'))}
</td>
<td style="font-size:9px;line-height:1.4;max-width:170px;vertical-align:top;">
${escaparHtmlVigenciaSepat(i.produto||'-')}
</td>
<td style="font-size:9px;line-height:1.35;max-width:130px;vertical-align:top;">
${escaparHtmlVigenciaSepat(i.cargo||i.setor||'-')}
</td>
<td class="vigencia-sepat">
${escaparHtmlVigenciaSepat(formatarVigenciaSepat(i.data_inicio))}
</td>
<td class="vigencia-sepat ${fimOriginal&&!fimEhData?'fim-texto':''}">
${escaparHtmlVigenciaSepat(formatarVigenciaSepat(i.data_fim))}
</td>
`
MESES_SEPAT.filter(m=>mesesOrdem.indexOf(m)<=indiceAtual).forEach(mes=>{
let nivel=Number((typeof sepatUser!=='undefined'?sepatUser:null)?.nivel_acesso||99)
let valorAtual=Number(i[mes]||0)
let podeEditar=false
if(nivel===1)podeEditar=true
if(nivel===2&&mes===mesAtual&&valorAtual===0)podeEditar=true
let clsMes=mes===mesAtual?'mes-atual-sepat':''
html+=`
<td class="mes-col mes-${mes} ${clsMes}">
<input type="text" inputmode="numeric" min="0" max="100" step="1" value="${parseInt(Number(i[mes]||0))}" ${podeEditar?'':'disabled'} class="input-mes-sepat" onchange="salvarPercentualSepat('${i.id}','${mes}',this.value)">
</td>
`
})
html+=`<td class="td-total-sepat">${total}%</td></tr>`
return html
}).join('')
let ocultas=[]
try{ocultas=JSON.parse(localStorage.getItem('sepatColunasOcultas')||'[]')}catch(e){ocultas=[]}
ocultas.forEach(mes=>{
document.querySelectorAll('.mes-'+mes).forEach(el=>{el.style.display='none'})
})
if(typeof atualizarMiniKPIsSepat==='function')atualizarMiniKPIsSepat()
}

function abrirModalComVigenciaSepat(chave){
let modal=document.getElementById('modalSepat')
let conteudo=document.getElementById('modalConteudoSepat')
if(!modal||!conteudo)return
let lista=[...(typeof sepatData!=='undefined'?(sepatData||[]):[])].filter(i=>{
if(typeof modoResumoSepat!=='undefined'&&modoResumoSepat==='item')return String(i.siglaitem||'')===String(chave)
return String(i.subitem||'')===String(chave)
}).sort(compareSepat)
if(!lista.length){alert('Nenhum dado encontrado');return}
let base=lista[0]
let media=Math.round(lista.reduce((acc,c)=>acc+getTotalSepat(c),0)/(lista.length||1))
conteudo.innerHTML=`
<div class="modal-title-sepat">${typeof modoResumoSepat!=='undefined'&&modoResumoSepat==='item'?'ITEM':'SUBITEM'} ${escaparHtmlVigenciaSepat(typeof modoResumoSepat!=='undefined'&&modoResumoSepat==='item'?base.siglaitem:base.subitem)} • ${media}%</div>
<div class="modal-text-sepat"><b>Item:</b> ${escaparHtmlVigenciaSepat(base.item||'-')}</div>
<div class="modal-text-sepat"><b>Descrição:</b> ${escaparHtmlVigenciaSepat(base.descricaoitem||'-')}</div>
<div class="modal-text-sepat"><b>Total de registros:</b> ${lista.length}</div>
${lista.map(i=>`
<div style="margin-top:14px;border-top:1px solid #e5e7eb;padding-top:12px;">
<div class="modal-text-sepat"><b>Subitem:</b> ${escaparHtmlVigenciaSepat(i.subitem||'-')}</div>
<div class="modal-text-sepat"><b>Produto:</b> ${escaparHtmlVigenciaSepat(i.produto||'-')}</div>
<div class="modal-text-sepat"><b>Responsável:</b> ${escaparHtmlVigenciaSepat(i.cargo||i.setor||'-')}</div>
<div class="vigencia-modal-sepat"><b>Vigência:</b> ${escaparHtmlVigenciaSepat(formatarVigenciaSepat(i.data_inicio))} <b>até</b> ${escaparHtmlVigenciaSepat(formatarVigenciaSepat(i.data_fim))}</div>
<div class="modal-grid-sepat">
${MESES_SEPAT.slice(0,Math.min(new Date().getMonth()+1,12)).map(m=>`<div class="modal-mes-sepat"><div>${m.toUpperCase()}</div><div>${Number(i[m]||0)}%</div></div>`).join('')}
</div>
</div>
`).join('')}
`
modal.classList.remove('hidden')
}

function gerarPDFMonitoramentoComVigenciaSepat(){
if(!window.jspdf||!window.jspdf.jsPDF){alert('Biblioteca PDF não carregada');return}
let doc=criarDocSepat('l')
let lista=obterListaMonitoramentoVigenciaSepat()
let meses=[
{campo:'jan',label:'JAN'},{campo:'fev',label:'FEV'},{campo:'mar',label:'MAR'},{campo:'abr',label:'ABR'},
{campo:'mai',label:'MAI'},{campo:'jun',label:'JUN'},{campo:'jul',label:'JUL'},{campo:'ago',label:'AGO'},
{campo:'set',label:'SET'},{campo:'out',label:'OUT'},{campo:'nov',label:'NOV'},{campo:'dez',label:'DEZ'}
]
let mesesAtivos=meses.slice(0,new Date().getMonth()+1)
let rows=lista.map(i=>{
let linha=[
String(typeof modoTabelaSepat!=='undefined'&&modoTabelaSepat==='item'?(i.item||'-'):(i.siglaitem||'-')),
String(typeof modoTabelaSepat!=='undefined'&&modoTabelaSepat==='item'?(i.descricaoitem||'-'):(i.subitem||'-')),
String(i.produto||'-'),
String(i.cargo||i.setor||'-'),
formatarVigenciaSepat(i.data_inicio),
formatarVigenciaSepat(i.data_fim)
]
mesesAtivos.forEach(m=>linha.push(Number(i[m.campo]||0)+'%'))
linha.push(getTotalSepat(i)+'%')
return linha
})
let head=[
typeof modoTabelaSepat!=='undefined'&&modoTabelaSepat==='item'?'ITEM':'SUBITEM',
typeof modoTabelaSepat!=='undefined'&&modoTabelaSepat==='item'?'DESCRIÇÃO ITEM':'DESCRIÇÃO',
'PRODUTO','RESPONSÁVEL','VIG. INÍCIO','VIG. FIM',...mesesAtivos.map(m=>m.label),'TOTAL'
]
doc.setFontSize(15)
doc.setTextColor(15,23,42)
doc.text('MONITORAMENTO COMPLETO - TAG SEPAT 2026',14,14)
doc.setFontSize(8)
doc.setTextColor(100)
doc.text('Painel consolidado com vigência de início e fim dos itens/subitens.',14,19)
let estilos={0:{cellWidth:26,halign:'left'},1:{cellWidth:70},2:{cellWidth:28},3:{cellWidth:22},4:{cellWidth:18,halign:'center'},5:{cellWidth:28}}
let indice=6
mesesAtivos.forEach(()=>{estilos[indice]={cellWidth:6,halign:'center',valign:'middle'};indice++})
estilos[indice]={cellWidth:10,halign:'center',valign:'middle'}
doc.autoTable({
startY:24,
head:[head],
body:rows,
theme:'striped',
styles:{fontSize:5.8,overflow:'linebreak',cellPadding:1.25,valign:'top',textColor:[15,23,42],lineColor:[210,215,220],lineWidth:.15},
headStyles:{fillColor:[15,23,42],textColor:[255,255,255],fontStyle:'bold',fontSize:6.7,halign:'center',valign:'middle'},
alternateRowStyles:{fillColor:[245,247,250]},
columnStyles:estilos,
margin:{top:20,bottom:42,left:5,right:5},
pageBreak:'auto',rowPageBreak:'avoid',
didParseCell:function(data){if(data.section==='body'&&data.column.index===head.length-1){data.cell.styles.fontStyle='bold';data.cell.styles.textColor=[4,120,87]}},
didDrawPage:function(){let h=doc.internal.pageSize.height,w=doc.internal.pageSize.width;doc.setFillColor(255,255,255);doc.rect(0,h-36,w,36,'F')}
})
rodapeSepat(doc)
doc.save(typeof modoTabelaSepat!=='undefined'&&modoTabelaSepat==='item'?'Itens_Monitoramento_TAG_SEPAT_2026.pdf':'Subitens_Monitoramento_TAG_SEPAT_2026.pdf')
}

function gerarWordMonitoramentoComVigenciaSepat(){
let lista=obterListaMonitoramentoVigenciaSepat()
let linhas=lista.map(i=>`
<tr>
<td>${escaparHtmlVigenciaSepat(typeof modoTabelaSepat!=='undefined'&&modoTabelaSepat==='item'?(i.item||'-'):(i.siglaitem||'-'))}</td>
<td>${escaparHtmlVigenciaSepat(typeof modoTabelaSepat!=='undefined'&&modoTabelaSepat==='item'?(i.descricaoitem||'-'):(i.subitem||'-'))}</td>
<td>${escaparHtmlVigenciaSepat(i.produto||'-')}</td>
<td>${escaparHtmlVigenciaSepat(i.cargo||i.setor||'-')}</td>
<td align="center">${escaparHtmlVigenciaSepat(formatarVigenciaSepat(i.data_inicio))}</td>
<td>${escaparHtmlVigenciaSepat(formatarVigenciaSepat(i.data_fim))}</td>
<td align="center">${getTotalSepat(i)}%</td>
</tr>`).join('')
let html=`
<h1>MONITORAMENTO COMPLETO - TAG SEPAT 2026</h1>
<p><b>Vigência:</b> início e fim conforme Plano de Ação/TAG cadastrado.</p>
<table>
<tr>
<th>${typeof modoTabelaSepat!=='undefined'&&modoTabelaSepat==='item'?'ITEM':'SUBITEM'}</th>
<th>${typeof modoTabelaSepat!=='undefined'&&modoTabelaSepat==='item'?'DESCRIÇÃO ITEM':'DESCRIÇÃO'}</th>
<th>PRODUTO</th><th>RESPONSÁVEL</th><th>VIGÊNCIA INÍCIO</th><th>VIGÊNCIA FIM</th><th>TOTAL</th>
</tr>${linhas}</table>
<p class="small">Relatório consolidado de acompanhamento técnico da TAG SEPAT 2026.</p>`
baixarWordSepat(typeof modoTabelaSepat!=='undefined'&&modoTabelaSepat==='item'?'Itens_Monitoramento_TAG_SEPAT_2026':'Subitens_Monitoramento_TAG_SEPAT_2026',html)
}

function instalarCorrecaoVigenciaSepat(){
if(window.__vigenciaSepatInstalada)return
if(typeof renderTabelaSepat!=='function'||typeof sepatData==='undefined'||!document.getElementById('tbodySepat')){
setTimeout(instalarCorrecaoVigenciaSepat,120)
return
}
window.__vigenciaSepatInstalada=VERSAO_VIGENCIA_SEPAT
instalarEstiloVigenciaSepat()
instalarCabecalhoVigenciaSepat()
instalarFiltrosVigenciaSepat()
formatarDataSepat=formatarVigenciaSepat
renderTabelaSepat=renderTabelaComVigenciaSepat
abrirModalResumoSepat=abrirModalComVigenciaSepat
gerarPDFMonitoramentoSepat=gerarPDFMonitoramentoComVigenciaSepat
gerarWordMonitoramentoSepat=gerarWordMonitoramentoComVigenciaSepat
renderTabelaSepat()
console.log('SEPAT vigência início/fim ativa:',VERSAO_VIGENCIA_SEPAT)
}

if(document.readyState==='loading'){
document.addEventListener('DOMContentLoaded',()=>setTimeout(instalarCorrecaoVigenciaSepat,80),{once:true})
}else{
setTimeout(instalarCorrecaoVigenciaSepat,80)
}

})()

