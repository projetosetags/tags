/*=========================================================
400 MUNICÍPIOS • LINHA DO TEMPO ESTADUAL V9
EIXO X: OFÍCIO | DILAÇÕES | RESPOSTAS/PLANOS | REITERAÇÕES | COMPLEMENTAÇÕES
EIXO Y: JAN ... DEZ
Clique em cada marco para abrir a legenda/documentos abaixo.
=========================================================*/
(function(){
const T=[
['OFICIO_TCE','OFÍCIO','📤','#2563eb'],
['PEDIDO_DILACAO','DILAÇÕES','⏳','#d97706'],
['RESPOSTA','RESPOSTAS / PLANOS','📥','#0f766e'],
['REITERACAO_TCE','REITERAÇÕES TCE','🔁','#7c3aed'],
['COMPLEMENTACAO','COMPLEMENTAÇÕES','📎','#0891b2']
]
const M=['JAN','FEV','MAR','ABR','MAI','JUN','JUL','AGO','SET','OUT','NOV','DEZ']
let D=[]
function e(v){return String(v??'').replace(/[&<>"']/g,s=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[s]))}
function dt(x){return x?.data_recebimento||x?.data_envio||x?.data_documento||''}
function iso(v){let s=String(v||'').slice(0,10);return /^\d{4}-\d{2}-\d{2}$/.test(s)?s:''}
function br(v){let s=iso(v);if(!s)return'—';let[a,m,d]=s.split('-');return`${d}/${m}/${a}`}
function dm(v){let s=iso(v);if(!s)return'—';return`${s.slice(8,10)}/${s.slice(5,7)}`}
function tp(t){return t==='PLANO_ENVIADO'?'RESPOSTA':t}
function cfg(t){return T.find(x=>x[0]===tp(t))||['OUTRO','OUTRO','📝','#64748b']}
function css(){
let old=document.getElementById('ltV9Style');if(old)old.remove()
let s=document.createElement('style');s.id='ltV9Style';s.textContent=`
#e4Timeline{max-height:none!important;overflow:visible!important;padding:0!important}
.lt9Wrap{border:1px solid #dbe3ef;border-radius:16px;background:#fff;overflow:hidden}
.lt9Topo{display:flex;justify-content:space-between;gap:12px;align-items:flex-end;padding:15px 17px 11px}
.lt9Topo h3{margin:0;font-size:15px;color:#0f172a}.lt9Topo p{margin:3px 0 0;font-size:9px;color:#64748b}
.lt9Ano{font-size:9px;font-weight:900;color:#475569;background:#f8fafc;border:1px solid #e2e8f0;border-radius:999px;padding:6px 10px;white-space:nowrap}
.lt9Scroll{overflow-x:auto;padding:0 12px 12px}
.lt9Grid{width:100%;min-width:900px;display:grid;grid-template-columns:42px repeat(5,minmax(150px,1fr));border-top:1px solid #dbe3ef;border-left:1px solid #dbe3ef}
.lt9Head,.lt9Mes,.lt9Cell{border-right:1px solid #dbe3ef;border-bottom:1px solid #dbe3ef}
.lt9Head{min-height:47px;background:#f8fafc;padding:7px 5px;display:flex;align-items:center;justify-content:center;text-align:center;font-size:8px;font-weight:900;color:#334155;line-height:1.2}
.lt9Head i{width:8px;height:8px;border-radius:50%;display:inline-block;margin-right:4px}
.lt9Mes{min-height:52px;background:#f8fafc;display:flex;align-items:center;justify-content:center;font-size:8px;font-weight:900;color:#0f2f55;letter-spacing:.2px;padding:0 2px}
.lt9Cell{min-height:52px;padding:5px;background:#fff;display:flex;align-items:center;align-content:center;gap:4px;flex-wrap:wrap}
.lt9Cell.vazio{background:#fcfdff}
.lt9Mark{border:1px solid currentColor;background:#fff;border-radius:999px;padding:4px 6px;cursor:pointer;display:inline-flex;align-items:center;gap:4px;font-size:7px;font-weight:900;line-height:1;white-space:nowrap;max-width:100%}
.lt9Mark:hover{transform:translateY(-1px);box-shadow:0 3px 8px rgba(15,23,42,.12)}
.lt9Dot{width:6px;height:6px;border-radius:50%;background:currentColor;flex:0 0 6px}
.lt9Count{background:#0f172a;color:#fff;border-radius:999px;padding:2px 4px;font-size:6px}
.lt9Resumo{display:grid;grid-template-columns:repeat(5,1fr);gap:7px;padding:0 14px 12px}
.lt9Resumo div{border:1px solid #e2e8f0;background:#f8fafc;border-radius:9px;padding:8px 9px}
.lt9Resumo b{display:block;font-size:17px;color:#0f172a}.lt9Resumo span{font-size:6.6px;font-weight:900;color:#64748b;text-transform:uppercase}
.lt9Detalhe{margin:0 14px 14px;border:1px solid #cbd5e1;border-radius:11px;display:none;overflow:hidden;background:#fff}
.lt9Detalhe.aberto{display:block}
.lt9DetTopo{display:flex;justify-content:space-between;gap:10px;align-items:center;background:#f8fafc;padding:9px 11px;border-bottom:1px solid #e2e8f0;font-size:9px;color:#0f172a}
.lt9DetGrid{display:grid;grid-template-columns:repeat(2,1fr)}
.lt9Item{padding:8px 10px;border-bottom:1px solid #eef2f7;border-right:1px solid #eef2f7;font-size:8.3px;line-height:1.45;color:#334155}
.lt9Item b{color:#0f172a}.lt9Item small{font-size:7.5px;color:#64748b}
.lt9Fechar{border:0;background:#e2e8f0;border-radius:7px;padding:5px 8px;font-size:7.5px;font-weight:900;cursor:pointer}
@media(max-width:900px){.lt9Grid{min-width:760px;grid-template-columns:38px repeat(5,minmax(135px,1fr))}.lt9DetGrid{grid-template-columns:1fr}.lt9Resumo{grid-template-columns:repeat(2,1fr)}}
`;document.head.appendChild(s)
}
function dadosAno(ano){return D.filter(x=>{let d=iso(dt(x));return d&&Number(d.slice(0,4))===ano&&T.some(a=>a[0]===tp(x.tipo_evento))})}
function porMesTipo(ano,mes,tipo){return dadosAno(ano).filter(x=>Number(iso(dt(x)).slice(5,7))===mes&&tp(x.tipo_evento)===tipo)}
function porDia(itens){let m=new Map();itens.forEach(x=>{let d=iso(dt(x));if(!m.has(d))m.set(d,[]);m.get(d).push(x)});return[...m.entries()].sort((a,b)=>a[0].localeCompare(b[0]))}
function item(x){let doc=x.numero_documento||'Sem nº';let meta=[br(dt(x)),x.pagina?`pág. ${x.pagina}`:'',x.situacao_resultante||''].filter(Boolean).join(' • ');return`<div class="lt9Item"><b>${e(x.municipio)} — ${e(doc)}</b><br><small>${e(meta||'Sem metadados adicionais')}</small>${x.referencia?`<br>${e(x.referencia)}`:''}${x.observacao?`<br><small>${e(x.observacao)}</small>`:''}</div>`}
window.lt9Abrir=function(tipo,data){
let box=document.getElementById('lt9Detalhe');if(!box)return
let itens=D.filter(x=>tp(x.tipo_evento)===tipo&&iso(dt(x))===data),c=cfg(tipo)
box.innerHTML=`<div class="lt9DetTopo"><b>${c[2]} ${c[1]} • ${br(data)} • ${itens.length} registro${itens.length===1?'':'s'}</b><button class="lt9Fechar" onclick="document.getElementById('lt9Detalhe').classList.remove('aberto')">FECHAR</button></div><div class="lt9DetGrid">${itens.sort((a,b)=>String(a.municipio).localeCompare(String(b.municipio),'pt-BR')).map(item).join('')}</div>`
box.classList.add('aberto');box.scrollIntoView({behavior:'smooth',block:'nearest'})
}
function cel(ano,mes,tipo){
let itens=porMesTipo(ano,mes,tipo);if(!itens.length)return'<div class="lt9Cell vazio"></div>'
let c=cfg(tipo),gr=porDia(itens)
return`<div class="lt9Cell">${gr.map(([data,arr])=>`<button class="lt9Mark" style="color:${c[3]}" onclick="lt9Abrir('${tipo}','${data}')" title="${c[1]} • ${br(data)} • ${arr.length} registro${arr.length===1?'':'s'}"><span class="lt9Dot"></span><span>${dm(data)}</span>${arr.length>1?`<span class="lt9Count">${arr.length}</span>`:''}</button>`).join('')}</div>`
}
async function render(){
let alvo=document.getElementById('e4Timeline');if(!alvo)return;let c=window.clientQueimadas||window.client;if(!c)return
try{
let{data,error}=await c.from('queimadas_municipios_movimentacoes').select('*').order('data_documento').order('data_envio').order('data_recebimento');if(error)throw error
D=data||[];let anos=D.map(x=>iso(dt(x))).filter(Boolean).map(x=>Number(x.slice(0,4))).filter(Number.isFinite),ano=anos.length?Math.max(...anos):new Date().getFullYear(),base=dadosAno(ano),tot={}
T.forEach(([t])=>tot[t]=base.filter(x=>tp(x.tipo_evento)===t).length)
let head=`<div class="lt9Head">MÊS</div>${T.map(t=>`<div class="lt9Head"><span><i style="background:${t[3]}"></i>${t[1]}</span></div>`).join('')}`
let linhas=M.map((mesNome,i)=>`<div class="lt9Mes">${mesNome}</div>${T.map(t=>cel(ano,i+1,t[0])).join('')}`).join('')
alvo.innerHTML=`<div class="lt9Wrap"><div class="lt9Topo"><div><h3>📅 Linha do Tempo Estadual — 52 Municípios</h3><p>Eixo X: documentos e movimentações. Eixo Y: meses do ano. Clique em cada data para abrir abaixo os municípios, documentos e páginas.</p></div><div class="lt9Ano">ANO ${ano}</div></div><div class="lt9Scroll"><div class="lt9Grid">${head}${linhas}</div></div><div class="lt9Resumo">${T.map(t=>`<div><b>${tot[t[0]]||0}</b><span>${t[1]}</span></div>`).join('')}</div><div id="lt9Detalhe" class="lt9Detalhe"></div></div>`
}catch(err){console.warn('Timeline V9',err)}
}
function ag(){[100,350,800].forEach(t=>setTimeout(render,t))}
css();document.addEventListener('click',ev=>{if(ev.target?.id==='btnAbaExecutivoMunicipal')ag()});document.addEventListener('queimadas:documentos-sincronizados',()=>setTimeout(render,180));setTimeout(ag,1800)
window.renderLinhaTempoMunicipalVertical=render;window.renderLinhaTempoMunicipalHorizontal=render
})();