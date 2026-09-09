/*=========================================================
001 MONITORAMENTO-MATRIZ.JS MATRIZ INTEGRADA E PROTEGIDA
=========================================================*/
window.ITEM_EDITANDO=null
async function carregarItensMatriz(){
const tbody=document.getElementById('tbodyMatriz');if(!tbody)return
if(!window.MONITORAMENTO_ATUAL&&!MONITORAMENTO_ATUAL){tbody.innerHTML='<tr><td colspan="7">Selecione um monitoramento.</td></tr>';return}
const mid=window.MONITORAMENTO_ATUAL||MONITORAMENTO_ATUAL
const[{data:itens,error},{data:fontes,error:erroFonte}]=await Promise.all([
client.from('monitoramento_itens').select('*').eq('monitoramento_id',mid),
client.from('vw_monitoramento_integrado').select('id,codigo_item,codigo_subitem,acao,produto,prazo_texto,tematica')
])
if(error){console.error(error);tbody.innerHTML='<tr><td colspan="7">Erro ao carregar a matriz.</td></tr>';return}
if(erroFonte)console.warn(erroFonte)
const mapa={};(fontes||[]).forEach(f=>mapa[String(f.id)]=f)
const dados=typeof ordenarDataGlobal==='function'?ordenarDataGlobal(itens||[]):(itens||[])
tbody.innerHTML=dados.map(i=>{
const f=mapa[String(i.deliberacao_id||'')]||{}
const codigoItem=f.codigo_item||i.item||'-'
const codigoSub=f.codigo_subitem||i.subitem||'-'
const acao=f.acao||i.acao_gestor||i.subitem||'-'
const produto=f.produto||i.produto||i.produto_esperado||'-'
const classe=String(i.status||'').includes('NÃO')?'vermelho':String(i.status||'').includes('PARCIAL')?'amarelo':i.status==='EXECUTADA'?'verde':'azul'
return`<tr><td><b>${matEsc(codigoItem)}</b>${f.tematica?`<div style="font-size:10px;opacity:.65">${matEsc(f.tematica)}</div>`:''}</td><td><b>${matEsc(codigoSub)}</b><div style="font-size:11px;line-height:1.35;max-width:420px">${matEsc(acao)}</div></td><td><span class="badge-status ${classe}">${matEsc(i.status||'-')}</span></td><td><b>${Number(i.percentual||0).toFixed(0)}%</b></td><td>${matEsc(i.criticidade||'-')}</td><td><div style="max-width:300px;font-size:11px;line-height:1.35">${matEsc(produto)}</div></td><td style="display:flex;gap:6px;flex-wrap:wrap"><button class="btn-tabela azul" onclick="abrirEvidencias(${i.id})">📎</button><button class="btn-tabela" onclick="abrirAnalises(${i.id})">🧠</button>${i.deliberacao_id?'':'<button class="btn-tabela vermelho" onclick="excluirItemMatriz('+i.id+')">🗑</button>'}</td></tr>`
}).join('')||'<tr><td colspan="7">Nenhum item encontrado.</td></tr>'
}
function matEsc(v){return String(v??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]))}

/*=========================================================
002 MONITORAMENTO-MATRIZ.JS FONTE ÚNICA
=========================================================*/
async function salvarNovoItemMatriz(){
alert('Para SEDAM e SEPAT, os itens são criados e atualizados automaticamente a partir dos TAGs. Use o painel Evidências para registrar comprovação e Análises para a conclusão técnica.')
}
async function editarItemMatriz(id){return abrirEvidencias(id)}
function limparFormularioMatriz(){window.ITEM_EDITANDO=null}
async function excluirItemMatriz(id){
const{data:item}=await client.from('monitoramento_itens').select('deliberacao_id').eq('id',id).single()
if(item?.deliberacao_id){alert('Este item é vinculado ao TAG e não pode ser excluído pelo Monitoramento Técnico.');return}
if(!confirm('Excluir item manual?'))return
const{error}=await client.from('monitoramento_itens').delete().eq('id',id)
if(error){console.error(error);alert('Erro ao excluir.');return}
await carregarItensMatriz();if(typeof carregarDashboard==='function')await carregarDashboard()
}

/*=========================================================
003 MONITORAMENTO-MATRIZ.JS NAVEGAÇÃO
=========================================================*/
function abrirEvidencias(id){
window.ITEM_EVIDENCIA_ATUAL=id
ITEM_EVIDENCIA_ATUAL=id
if(typeof abrirTela==='function')abrirTela('evidencias')
if(typeof renderPainelEvidencias==='function')renderPainelEvidencias().then(()=>setTimeout(()=>{document.querySelector(`[data-evidencia-item="${id}"]`)?.scrollIntoView({behavior:'smooth',block:'start'})},200))
}
function abrirAnalises(id){
window.ITEM_EVIDENCIA_ATUAL=id
ITEM_EVIDENCIA_ATUAL=id
if(typeof abrirAnaliseDoItem==='function')return abrirAnaliseDoItem(id)
if(typeof abrirTela==='function')abrirTela('analises')
if(typeof carregarAnalises==='function')carregarAnalises()
}
function formatarData(d){if(!d)return'-';const dt=new Date(d);return Number.isNaN(dt.getTime())?String(d):dt.toLocaleDateString('pt-BR')}
async function importarDaTAG(){return sincronizarTAGsMonitoramento()}
