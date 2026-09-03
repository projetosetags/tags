/*=========================================================
SEPAT • VIGÊNCIA INÍCIO/FIM
Correção de exibição, filtro e relatórios
=========================================================*/
(function(){
'use strict'

const VERSAO_VIGENCIA_SEPAT='20260902-3'

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

/*=========================================================
CASOS ESPECIAIS DE VIGÊNCIA • SEM INVENTAR DATAS
=========================================================*/
const CASOS_ESPECIAIS_VIGENCIA_SEPAT={
'P02:71':{
tipo:'sem_inicio',
inicioTexto:'NÃO INFORMADO NO PLANO',
nota:'O Plano/TAG não informa data inicial para este subitem. Encerramento previsto: 31/08/2025.'
},
'P02:72':{
tipo:'sem_inicio',
inicioTexto:'NÃO INFORMADO NO PLANO',
nota:'O Plano/TAG não informa data inicial para este subitem. Encerramento previsto: 30/06/2025.'
},
'P02:73':{
tipo:'condicional',
fimTexto:'CONDICIONAL • 60 DIAS APÓS O TERMO DE DOAÇÃO',
nota:'O Plano/TAG condiciona o encerramento ao termo de doação, com previsão de regularização e incorporação em 60 dias.'
},
'GR05:95':{
tipo:'condicional',
inicioTexto:'APÓS PROVOCAÇÃO DO MUNICÍPIO',
fimTexto:'PRAZO MÉDIO • ATÉ 90 DIAS',
nota:'Conforme Observação 19, a ação depende de provocação do Município. O processo de doação até a apresentação do projeto à ALE/RO é, em média, de até 90 dias.'
},
'GR05:96':{
tipo:'condicional',
inicioTexto:'APÓS PROVOCAÇÃO DO MUNICÍPIO',
fimTexto:'PRAZO MÉDIO • ATÉ 90 DIAS',
nota:'Conforme Observação 19, a ação depende de provocação do Município. O processo de doação até a apresentação do projeto à ALE/RO é, em média, de até 90 dias.'
},
'GR05:97':{
tipo:'condicional',
inicioTexto:'APÓS PROVOCAÇÃO DO MUNICÍPIO',
fimTexto:'PRAZO MÉDIO • ATÉ 90 DIAS',
nota:'Conforme Observação 19, a ação depende de provocação do Município. O processo de doação até a apresentação do projeto à ALE/RO é, em média, de até 90 dias.'
}
}

function chaveCasoEspecialVigenciaSepat(i){
return String(i?.siglaitem||'').trim().toUpperCase()+':'+String(Number(i?.numsubitem||0))
}

function obterCasoEspecialVigenciaSepat(i){
return CASOS_ESPECIAIS_VIGENCIA_SEPAT[chaveCasoEspecialVigenciaSepat(i)]||null
}

function vigenciaInicioExibicaoSepat(i){
let caso=obterCasoEspecialVigenciaSepat(i)
if(caso?.inicioTexto)return caso.inicioTexto
return formatarVigenciaSepat(i?.data_inicio)
}

function vigenciaFimExibicaoSepat(i){
let caso=obterCasoEspecialVigenciaSepat(i)
if(caso?.fimTexto)return caso.fimTexto
return formatarVigenciaSepat(i?.data_fim)
}

function vigenciaNotaExibicaoSepat(i){
return obterCasoEspecialVigenciaSepat(i)?.nota||''
}

function vigenciaEhEspecialSepat(i){
return!!obterCasoEspecialVigenciaSepat(i)
}

function obterFiltrosVigenciaSepat(){
return{
inicio:String(document.getElementById('filtroVigenciaInicioSepat')?.value||''),
fim:String(document.getElementById('filtroVigenciaFimSepat')?.value||'')
}
}
function dataHojeLocalSepat(){
let d=new Date()
let ano=d.getFullYear()
let mes=String(d.getMonth()+1).padStart(2,'0')
let dia=String(d.getDate()).padStart(2,'0')
return`${ano}-${mes}-${dia}`
}
function preencherPeriodoPadraoVigenciaSepat(){
let limites=atualizarOpcoesExtremasVigenciaSepat()
let inicio=document.getElementById('filtroVigenciaInicioSepat')
let fim=document.getElementById('filtroVigenciaFimSepat')
if(inicio&&!inicio.value&&limites.primeira)inicio.value=limites.primeira
if(fim&&!fim.value)fim.value=dataHojeLocalSepat()
}
function obterLimitesVigenciaSepat(){
let lista=[...(typeof sepatData!=='undefined'?(sepatData||[]):[])]
// Casos condicionais/incompletos não entram nos extremos cronológicos.
let regulares=lista.filter(i=>!vigenciaEhEspecialSepat(i))
let inicios=regulares.map(i=>dataIsoSepat(i.data_inicio)).filter(Boolean).sort()
let finais=regulares.map(i=>dataIsoSepat(i.data_fim)).filter(Boolean).sort()
let primeira=inicios.length?inicios[0]:''
let ultima=finais.length?finais[finais.length-1]:(inicios.length?inicios[inicios.length-1]:'')
return{primeira,ultima}
}

function atualizarOpcoesExtremasVigenciaSepat(){
let limites=obterLimitesVigenciaSepat()
let inputInicio=document.getElementById('filtroVigenciaInicioSepat')
let inputFim=document.getElementById('filtroVigenciaFimSepat')
if(inputInicio){
if(limites.primeira)inputInicio.min=limites.primeira
if(limites.ultima)inputInicio.max=limites.ultima
}
if(inputFim){
if(limites.primeira)inputFim.min=limites.primeira
if(limites.ultima)inputFim.max=limites.ultima
}
let primeiraTexto=document.getElementById('textoPrimeiraDataVigenciaSepat')
let ultimaTexto=document.getElementById('textoUltimaDataVigenciaSepat')
if(primeiraTexto)primeiraTexto.textContent=formatarVigenciaSepat(limites.primeira)
if(ultimaTexto)ultimaTexto.textContent=formatarVigenciaSepat(limites.ultima)
let btnPrimeira=document.getElementById('btnPrimeiraDataVigenciaSepat')
let btnUltima=document.getElementById('btnUltimaDataVigenciaSepat')
let btnCompleto=document.getElementById('btnPeriodoCompletoVigenciaSepat')
if(btnPrimeira)btnPrimeira.disabled=!limites.primeira
if(btnUltima)btnUltima.disabled=!limites.ultima
if(btnCompleto)btnCompleto.disabled=!(limites.primeira&&limites.ultima)
return limites
}

function usarPrimeiraDataVigenciaSepat(){
let limites=atualizarOpcoesExtremasVigenciaSepat()
let input=document.getElementById('filtroVigenciaInicioSepat')
if(input&&limites.primeira){input.value=limites.primeira;renderTabelaSepat()}
}

function usarUltimaDataVigenciaSepat(){
let limites=atualizarOpcoesExtremasVigenciaSepat()
let input=document.getElementById('filtroVigenciaFimSepat')
if(input&&limites.ultima){input.value=limites.ultima;renderTabelaSepat()}
}

function usarPeriodoCompletoVigenciaSepat(){
let limites=atualizarOpcoesExtremasVigenciaSepat()
let inicio=document.getElementById('filtroVigenciaInicioSepat')
let fim=document.getElementById('filtroVigenciaFimSepat')
if(inicio&&limites.primeira)inicio.value=limites.primeira
if(fim&&limites.ultima)fim.value=limites.ultima
renderTabelaSepat()
}

function registroDentroVigenciaSepat(i,inicioFiltro,fimFiltro){
if(!inicioFiltro&&!fimFiltro)return true
let limites=obterLimitesVigenciaSepat()
let periodoCompleto=inicioFiltro===limites.primeira&&fimFiltro===limites.ultima
if(periodoCompleto)return true
if(vigenciaEhEspecialSepat(i))return false
let inicio=dataIsoSepat(i.data_inicio)
let fim=dataIsoSepat(i.data_fim)
if(!inicio||!fim)return false
if(inicioFiltro&&inicio<inicioFiltro)return false
if(fimFiltro&&fim>fimFiltro)return false
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
i.data_fim,
vigenciaInicioExibicaoSepat(i),
vigenciaFimExibicaoSepat(i),
vigenciaNotaExibicaoSepat(i)
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

function atualizarMiniKPIsPeriodoSepat(lista){
lista=[...(lista||[])]
let itens=[...new Set(lista.map(i=>String(i.siglaitem||'').trim()).filter(v=>v&&v!=='-'))].length
let subitens=lista.filter(i=>String(i.subitem||'').trim()!=='').length
let produtos=[...new Set(lista.map(i=>String(i.produto||'').trim()).filter(v=>v&&v!=='-'))].length
let miniItens=document.getElementById('miniItensSepat')
let miniSubitens=document.getElementById('miniSubitensSepat')
let miniProdutos=document.getElementById('miniProdutosSepat')
if(miniItens)miniItens.innerText=itens||0
if(miniSubitens)miniSubitens.innerText=subitens||0
if(miniProdutos)miniProdutos.innerText=produtos||0
}

function instalarEstiloVigenciaSepat(){
if(document.getElementById('styleVigenciaSepat'))return
let style=document.createElement('style')
style.id='styleVigenciaSepat'
style.textContent=`
#filtrosVigenciaSepat{display:flex;align-items:center;gap:6px;flex-wrap:wrap}
.filtro-vigencia-sepat{height:44px;display:flex;align-items:center;gap:6px;padding:0 9px;border:1px solid #bfd7ff;border-radius:14px;background:#fff;box-shadow:0 4px 12px rgba(15,23,42,.06)}
.filtro-vigencia-sepat span{font-size:8px;font-weight:1000;color:#475569;text-transform:uppercase;white-space:nowrap}
.filtro-vigencia-sepat input{height:30px;border:0;outline:0;background:transparent;font-size:10px;font-weight:900;color:#0f172a;min-width:100px}
.atalhos-vigencia-sepat{display:flex;align-items:center;gap:6px;flex-wrap:wrap}
.btn-extremo-vigencia-sepat{height:44px;min-width:96px;padding:4px 8px;border:1px solid #bfdbfe;border-radius:14px;background:linear-gradient(180deg,#eff6ff,#dbeafe);color:#1e3a5f;cursor:pointer;display:flex;flex-direction:column;align-items:center;justify-content:center;line-height:1.05;box-shadow:0 4px 10px rgba(37,99,235,.08)}
.btn-extremo-vigencia-sepat small{font-size:7px;font-weight:1000;letter-spacing:.2px}
.btn-extremo-vigencia-sepat strong{margin-top:3px;font-size:10px;font-weight:1000;color:#0f5fd7}
.btn-extremo-vigencia-sepat:hover{transform:translateY(-1px);box-shadow:0 8px 16px rgba(37,99,235,.13)}
.btn-extremo-vigencia-sepat:disabled{opacity:.45;cursor:not-allowed;transform:none}
.btn-periodo-total-sepat{height:44px;padding:0 11px;border:1px solid #93c5fd;border-radius:14px;background:linear-gradient(135deg,#0f5fd7,#2563eb);color:#fff;font-size:8px;font-weight:1000;cursor:pointer;white-space:nowrap}
.vigencia-sepat{min-width:0!important;max-width:none!important;text-align:center!important;white-space:normal!important;font-size:8px!important;font-weight:900!important;background:#f8fbff!important}
.vigencia-sepat.fim-texto{text-align:left!important;line-height:1.25!important}
.vigencia-especial-sepat{background:#fff7ed!important;color:#9a3412!important;border-left:2px solid #f97316!important;border-right:2px solid #f97316!important;line-height:1.25!important}
.vigencia-sem-inicio-sepat{background:#f8fafc!important;color:#475569!important;border-left:2px solid #94a3b8!important;line-height:1.25!important}
.nota-filtro-vigencia-sepat{width:100%;font-size:7px;font-weight:800;color:#64748b;line-height:1.15;padding-left:2px}
.btn-cabecalho-sepat{height:44px;padding:0 18px;border:1px solid #d6d3d1;border-radius:18px;background:#f5f5f4;color:#111827;font-size:11px;font-weight:1000;cursor:pointer;white-space:nowrap;box-shadow:0 4px 12px rgba(15,23,42,.05)}
.btn-cabecalho-sepat:hover{background:#e7e5e4}
.cabecalho-oculto-sepat{display:none!important}
#view-monitoramento .barra-filtros-sepat{display:flex!important;align-items:center!important;justify-content:flex-start!important;flex-wrap:wrap!important;gap:8px!important;padding:12px 14px!important;margin-bottom:12px!important;border-radius:20px!important;background:linear-gradient(180deg,#fff,#f5f9ff)!important;border:1px solid #d9e7f8!important;box-shadow:0 10px 24px rgba(0,70,150,.07)!important}
#view-monitoramento .input-busca-sepat{order:1!important;flex:0 0 24%!important;width:24%!important;max-width:24%!important;min-width:220px!important;height:46px!important;padding:0 15px!important;border-radius:16px!important;font-size:13px!important;font-weight:900!important}
#view-monitoramento .input-busca-sepat::placeholder{color:#64748b!important;font-weight:900!important}
#view-monitoramento #filtrosVigenciaSepat{order:2!important;flex:1 1 calc(76% - 8px)!important;width:auto!important;display:flex!important;align-items:center!important;justify-content:flex-start!important;gap:6px!important;flex-wrap:wrap!important}
#view-monitoramento .filtro-vigencia-sepat{height:44px!important;padding:0 9px!important;border-radius:14px!important}
#view-monitoramento .filtro-vigencia-sepat span{font-size:8px!important}
#view-monitoramento .filtro-vigencia-sepat input{min-width:100px!important;font-size:10px!important}
#view-monitoramento .atalhos-vigencia-sepat{display:flex!important;align-items:center!important;gap:6px!important;flex-wrap:wrap!important}
#view-monitoramento .btn-extremo-vigencia-sepat{height:44px!important;min-width:96px!important;padding:4px 8px!important;border-radius:14px!important}
#view-monitoramento .btn-periodo-total-sepat{height:44px!important;padding:0 11px!important;border-radius:14px!important}
#view-monitoramento #btnLimparVigenciaSepat{height:44px!important;padding:0 16px!important;border-radius:18px!important;font-size:11px!important}
#view-monitoramento .nota-filtro-vigencia-sepat{order:3!important;flex:0 0 100%!important;width:100%!important;margin-top:-2px!important}
#view-monitoramento .barra-filtros-sepat>.flex{order:4!important;flex:0 0 100%!important;display:flex!important;align-items:center!important;justify-content:flex-start!important;gap:10px!important;flex-wrap:wrap!important}
#view-monitoramento .btn-modo-sepat{height:44px!important;padding:0 20px!important;border:1px solid #bfdbfe!important;border-radius:18px!important;background:linear-gradient(180deg,#eff6ff,#dbeafe)!important;color:#1e3a5f!important;font-size:11px!important;font-weight:1000!important;min-width:92px!important}
#view-monitoramento .btn-modo-sepat.ativo,#view-monitoramento .btn-modo-sepat.active{background:linear-gradient(135deg,#0f5fd7,#2563eb)!important;color:#fff!important;border-color:#2563eb!important}
#view-monitoramento .btn-pdf-sepat{height:44px!important;padding:0 18px!important;border:none!important;border-radius:18px!important;background:linear-gradient(135deg,#ef4444,#dc2626)!important;color:#fff!important;font-size:12px!important;font-weight:1000!important;min-width:108px!important;display:inline-flex!important;align-items:center!important;justify-content:center!important;gap:7px!important;box-shadow:0 6px 16px rgba(239,68,68,.22)!important}
#view-monitoramento .btn-word-sepat{height:44px!important;padding:0 18px!important;border:none!important;border-radius:18px!important;background:linear-gradient(135deg,#2563eb,#1d4ed8)!important;color:#fff!important;font-size:12px!important;font-weight:1000!important;min-width:108px!important;display:inline-flex!important;align-items:center!important;justify-content:center!important;gap:7px!important;box-shadow:0 6px 16px rgba(37,99,235,.22)!important}
#view-monitoramento .check-ocultar-sepat{height:44px!important;padding:0 18px!important;border:1px solid #d6d3d1!important;border-radius:18px!important;background:#f5f5f4!important;color:#111827!important;font-size:11px!important;font-weight:1000!important;display:inline-flex!important;align-items:center!important;gap:6px!important;white-space:nowrap!important}
#view-monitoramento .check-ocultar-sepat input{width:14px!important;height:14px!important}
#view-monitoramento .tabela-wrap-sepat{width:100%!important;overflow-x:auto!important;overflow-y:auto!important;max-height:calc(100vh - 245px)!important}
#view-monitoramento .tabela-sepat{width:100%!important;min-width:0!important;table-layout:fixed!important}
#view-monitoramento .tabela-sepat th{white-space:normal!important;line-height:1.1!important;padding:4px 2px!important;font-size:7px!important}
#view-monitoramento .tabela-sepat td{padding:4px 3px!important;font-size:7.5px!important;line-height:1.25!important;white-space:normal!important;word-break:break-word!important}
#view-monitoramento .tabela-sepat th:nth-child(1),#view-monitoramento .tabela-sepat td:nth-child(1){width:7%!important;min-width:0!important;max-width:none!important;font-size:7.5px!important}
#view-monitoramento .tabela-sepat th:nth-child(2),#view-monitoramento .tabela-sepat td:nth-child(2){width:22%!important;min-width:0!important;max-width:none!important;font-size:7.5px!important;line-height:1.25!important}
#view-monitoramento .tabela-sepat th:nth-child(3),#view-monitoramento .tabela-sepat td:nth-child(3){width:16%!important;min-width:0!important;max-width:none!important;font-size:7.5px!important;line-height:1.25!important}
#view-monitoramento .tabela-sepat th:nth-child(4),#view-monitoramento .tabela-sepat td:nth-child(4){width:8%!important;min-width:0!important;max-width:none!important;font-size:7px!important;line-height:1.2!important}
#view-monitoramento .tabela-sepat th:nth-child(5),#view-monitoramento .tabela-sepat td:nth-child(5){width:6%!important;min-width:0!important;max-width:none!important;text-align:center!important;font-size:7px!important}
#view-monitoramento .tabela-sepat th:nth-child(6),#view-monitoramento .tabela-sepat td:nth-child(6){width:6%!important;min-width:0!important;max-width:none!important;text-align:center!important;font-size:7px!important}
#view-monitoramento .tabela-sepat th:nth-child(n+7),#view-monitoramento .tabela-sepat td:nth-child(n+7){width:3%!important;min-width:0!important;max-width:none!important;padding:2px!important;text-align:center!important;font-size:7px!important;font-weight:1000!important}
#view-monitoramento .input-mes-sepat{width:28px!important;height:24px!important;padding:0!important;font-size:7px!important;border-radius:5px!important}
#view-monitoramento .td-total-sepat{width:4%!important;min-width:0!important;max-width:none!important;font-size:7px!important}
.vigencia-modal-sepat{margin:8px 0 2px;padding:8px 10px;border-radius:10px;background:#eff6ff;border:1px solid #bfdbfe;font-size:10px;font-weight:900;color:#1e3a5f}
@media(max-width:1200px){#view-monitoramento .input-busca-sepat{flex:0 0 100%!important;width:100%!important;max-width:100%!important}#view-monitoramento #filtrosVigenciaSepat{flex:0 0 100%!important;width:100%!important}.topo-botoes-sepat{flex-wrap:wrap!important}}
@media(max-width:900px){#filtrosVigenciaSepat{width:100%}.filtro-vigencia-sepat{flex:1;min-width:145px}#view-monitoramento .barra-filtros-sepat>.flex{gap:8px!important}#view-monitoramento .check-ocultar-sepat,#view-monitoramento .btn-cabecalho-sepat{font-size:10px!important}}
`
document.head.appendChild(style)
}
function toggleCabecalhoSepat(){
let topo=document.querySelector('#app-sepat .topo-sepat')
let tabs=document.querySelector('#app-sepat .tabs-sepat')
let oculto=false
if(topo){
topo.classList.toggle('cabecalho-oculto-sepat')
oculto=topo.classList.contains('cabecalho-oculto-sepat')
}
if(tabs)tabs.classList.toggle('cabecalho-oculto-sepat',oculto)
let btn=document.getElementById('btnOcultarCabecalhoSepat')
if(btn)btn.textContent=oculto?'EXIBIR CABEÇALHO':'OCULTAR CABEÇALHO'
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
<div class="atalhos-vigencia-sepat" title="Datas extremas existentes no Plano de Ação/TAG SEPAT">
<button id="btnPrimeiraDataVigenciaSepat" type="button" class="btn-extremo-vigencia-sepat">
<small>PRIMEIRA DATA</small><strong id="textoPrimeiraDataVigenciaSepat">-</strong>
</button>
<button id="btnUltimaDataVigenciaSepat" type="button" class="btn-extremo-vigencia-sepat">
<small>ÚLTIMA DATA</small><strong id="textoUltimaDataVigenciaSepat">-</strong>
</button>
<button id="btnPeriodoCompletoVigenciaSepat" type="button" class="btn-periodo-total-sepat">PERÍODO COMPLETO</button>
</div>
<button id="btnLimparVigenciaSepat" type="button" class="btn-modo-sepat" style="height:48px;padding:0 14px">LIMPAR DATAS</button>
<div class="nota-filtro-vigencia-sepat">Registros condicionais ou sem uma das datas não entram no filtro cronológico nem definem a primeira/última data.</div>
`
busca.insertAdjacentElement('afterend',box)
document.getElementById('filtroVigenciaInicioSepat').addEventListener('change',()=>renderTabelaSepat())
document.getElementById('filtroVigenciaFimSepat').addEventListener('change',()=>renderTabelaSepat())
document.getElementById('btnPrimeiraDataVigenciaSepat').addEventListener('click',usarPrimeiraDataVigenciaSepat)
document.getElementById('btnUltimaDataVigenciaSepat').addEventListener('click',usarUltimaDataVigenciaSepat)
document.getElementById('btnPeriodoCompletoVigenciaSepat').addEventListener('click',usarPeriodoCompletoVigenciaSepat)
document.getElementById('btnLimparVigenciaSepat').addEventListener('click',()=>{
document.getElementById('filtroVigenciaInicioSepat').value=''
document.getElementById('filtroVigenciaFimSepat').value=''
renderTabelaSepat()
})

atualizarOpcoesExtremasVigenciaSepat()
preencherPeriodoPadraoVigenciaSepat()
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
preencherPeriodoPadraoVigenciaSepat()
atualizarOpcoesExtremasVigenciaSepat()
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
let casoEspecial=obterCasoEspecialVigenciaSepat(i)
let fimOriginal=String(i.data_fim||'').trim()
let fimEhData=!!dataIsoSepat(fimOriginal)
let inicioExibicao=vigenciaInicioExibicaoSepat(i)
let fimExibicao=vigenciaFimExibicaoSepat(i)
let notaVigencia=vigenciaNotaExibicaoSepat(i)
let classeInicio=casoEspecial?(casoEspecial.tipo==='sem_inicio'?'vigencia-sem-inicio-sepat':'vigencia-especial-sepat'):''
let classeFim=casoEspecial?'vigencia-especial-sepat':(fimOriginal&&!fimEhData?'fim-texto':'')
let tituloVigencia=escaparHtmlVigenciaSepat(notaVigencia)
let html=`
<tr>
<td class="col-subitem">
${escaparHtmlVigenciaSepat(typeof modoTabelaSepat!=='undefined'&&modoTabelaSepat==='item'?(i.item||'-'):(i.siglaitem||'-'))}
</td>
<td>
${escaparHtmlVigenciaSepat(typeof modoTabelaSepat!=='undefined'&&modoTabelaSepat==='item'?(i.descricaoitem||'-'):(i.subitem||'-'))}
</td>
<td>
${escaparHtmlVigenciaSepat(i.produto||'-')}
</td>
<td>
${escaparHtmlVigenciaSepat(i.cargo||i.setor||'-')}
</td>
<td class="vigencia-sepat ${classeInicio}" title="${tituloVigencia}">
${escaparHtmlVigenciaSepat(inicioExibicao)}
</td>
<td class="vigencia-sepat ${classeFim}" title="${tituloVigencia}">
${escaparHtmlVigenciaSepat(fimExibicao)}
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
atualizarMiniKPIsPeriodoSepat(lista)
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
<div class="vigencia-modal-sepat"><b>Vigência:</b> ${escaparHtmlVigenciaSepat(vigenciaInicioExibicaoSepat(i))} <b>até</b> ${escaparHtmlVigenciaSepat(vigenciaFimExibicaoSepat(i))}${vigenciaNotaExibicaoSepat(i)?`<br><span style="font-size:10px;font-weight:700;color:#64748b">${escaparHtmlVigenciaSepat(vigenciaNotaExibicaoSepat(i))}</span>`:''}</div>
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
vigenciaInicioExibicaoSepat(i),
vigenciaFimExibicaoSepat(i)
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
<td align="center">${escaparHtmlVigenciaSepat(vigenciaInicioExibicaoSepat(i))}</td>
<td>${escaparHtmlVigenciaSepat(vigenciaFimExibicaoSepat(i))}</td>
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
