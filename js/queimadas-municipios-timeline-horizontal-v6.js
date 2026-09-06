/*=========================================================
380 MUNICÍPIOS • LINHA DO TEMPO ESTADUAL V6
Linha do tempo horizontal consolidada dos 52 municípios.
Agrupa eventos por data e natureza documental para evitar
repetição visual e facilitar leitura executiva.
=========================================================*/
(function(){
const LT_TIPOS={
OFICIO_TCE:{rotulo:'OFÍCIO CIRCULAR TCE',icone:'📤',cor:'#2563eb'},
REITERACAO_TCE:{rotulo:'REITERAÇÕES TCE',icone:'🔁',cor:'#7c3aed'},
RESPOSTA:{rotulo:'RESPOSTAS / PLANOS',icone:'📥',cor:'#0f766e'},
PLANO_ENVIADO:{rotulo:'RESPOSTAS / PLANOS',icone:'📘',cor:'#16a34a'},
PEDIDO_DILACAO:{rotulo:'DILAÇÕES',icone:'⏳',cor:'#d97706'},
COMPLEMENTACAO:{rotulo:'COMPLEMENTAÇÕES',icone:'📎',cor:'#0891b2'}
}
const LT_MESES=['JAN','FEV','MAR','ABR','MAI','JUN','JUL','AGO','SET','OUT','NOV','DEZ']
let LT_DADOS=[]
function ltEsc(v){return String(v??'').replace(/[&<>"']/g,s=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[s]))}
function ltData(x){return x?.data_recebimento||x?.data_envio||x?.data_documento||''}
function ltISO(v){let s=String(v||'').slice(0,10);return /^\d{4}-\d{2}-\d{2}$/.test(s)?s:''}
function ltBR(v){let s=ltISO(v);if(!s)return'—';let[a,m,d]=s.split('-');return`${d}/${m}/${a}`}
function ltNormTipo(t){return LT_TIPOS[t]?t:'OUTRO'}
function ltDiaAno(v){let d=new Date(v+'T12:00:00');let ini=new Date(d.getFullYear(),0,1);return Math.floor((d-ini)/86400000)}
function ltPos(v,ano){let d=new Date(v+'T12:00:00');let ini=new Date(ano,0,1),fim=new Date(ano+1,0,1);return Math.max(0,Math.min(100,((d-ini)/(fim-ini))*100))}
function ltAgrupar(dados){
const mapa=new Map()
dados.forEach(x=>{
let data=ltISO(ltData(x));if(!data)return
let tipo=ltNormTipo(x.tipo_evento);if(tipo==='OUTRO')return
let chave=`${tipo}|${data}`
if(!mapa.has(chave))mapa.set(chave,{tipo,data,itens:[]})
mapa.get(chave).itens.push(x)
})
return[...mapa.values()].sort((a,b)=>a.data.localeCompare(b.data))
}
function ltCss(){if(document.getElementById('ltHorizontalStyle'))return;let s=document.createElement('style');s.id='ltHorizontalStyle';s.textContent=`
#e4Timeline{max-height:none!important;overflow:visible!important;padding:0!important}
.lt6Wrap{border:1px solid #dbe3ef;border-radius:16px;background:#fff;overflow:hidden}.lt6Topo{display:flex;justify-content:space-between;gap:12px;align-items:flex-end;padding:16px 18px 8px}.lt6Topo h3{margin:0;font-size:15px;color:#0f172a}.lt6Topo p{margin:3px 0 0;font-size:9px;color:#64748b}.lt6Legenda{display:flex;gap:8px;flex-wrap:wrap;justify-content:flex-end}.lt6Legenda span{font-size:8px;font-weight:850;color:#475569;display:inline-flex;align-items:center;gap:4px}.lt6Legenda i{width:9px;height:9px;border-radius:50%;display:inline-block}
.lt6Scroll{overflow-x:auto;overflow-y:hidden;padding:4px 14px 16px}.lt6Board{min-width:1060px}.lt6Meses{display:grid;grid-template-columns:170px 1fr;align-items:end}.lt6MesLabel{font-size:8px;font-weight:900;color:#64748b;padding:0 10px 8px}.lt6MesEixo{position:relative;height:34px;border-bottom:2px solid #94a3b8}.lt6Mes{position:absolute;bottom:6px;transform:translateX(-50%);font-size:8px;font-weight:900;color:#475569}.lt6Tick{position:absolute;bottom:-2px;width:1px;height:8px;background:#94a3b8}
.lt6Lane{display:grid;grid-template-columns:170px 1fr;min-height:70px;border-bottom:1px solid #eef2f7}.lt6Lane:last-child{border-bottom:0}.lt6LaneNome{display:flex;align-items:center;gap:8px;padding:10px 12px;font-size:9px;font-weight:900;color:#334155;background:#f8fafc;border-right:1px solid #e2e8f0}.lt6LaneNome i{width:10px;height:10px;border-radius:50%;display:inline-block}.lt6Track{position:relative;background:repeating-linear-gradient(to right,transparent 0,transparent calc(8.333% - 1px),#eef2f7 calc(8.333% - 1px),#eef2f7 8.333%)}.lt6Base{position:absolute;left:0;right:0;top:34px;height:3px;background:#cbd5e1;border-radius:999px}.lt6Mark{position:absolute;top:16px;transform:translateX(-50%);border:0;background:transparent;padding:0;cursor:pointer;z-index:3}.lt6Dot{width:18px;height:18px;border-radius:50%;border:3px solid #fff;box-shadow:0 0 0 2px currentColor,0 3px 8px rgba(15,23,42,.18);display:block;background:currentColor}.lt6Badge{position:absolute;left:13px;top:-8px;min-width:18px;height:18px;padding:0 5px;border-radius:999px;color:#fff;background:#0f172a;font-size:7px;font-weight:900;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 6px rgba(15,23,42,.25)}.lt6Data{position:absolute;top:24px;left:50%;transform:translateX(-50%);white-space:nowrap;font-size:7px;font-weight:850;color:#475569}.lt6Mark:hover .lt6Dot{transform:scale(1.15)}
.lt6Resumo{display:grid;grid-template-columns:repeat(5,1fr);gap:8px;padding:0 18px 14px}.lt6Resumo div{border:1px solid #e2e8f0;background:#f8fafc;border-radius:10px;padding:9px 10px}.lt6Resumo b{display:block;font-size:18px;color:#0f172a}.lt6Resumo span{font-size:7px;font-weight:900;color:#64748b;text-transform:uppercase}.lt6Detalhe{margin:0 18px 16px;border:1px solid #dbe3ef;border-radius:12px;display:none;overflow:hidden}.lt6Detalhe.aberto{display:block}.lt6DetTopo{display:flex;justify-content:space-between;gap:10px;align-items:center;background:#f8fafc;padding:10px 12px;border-bottom:1px solid #e2e8f0}.lt6DetTopo b{font-size:10px;color:#0f172a}.lt6Fechar{border:0;background:#e2e8f0;border-radius:7px;padding:5px 8px;font-size:8px;font-weight:900;cursor:pointer}.lt6DetGrid{display:grid;grid-template-columns:repeat(2,1fr);gap:0}.lt6Item{padding:9px 11px;border-bottom:1px solid #eef2f7;border-right:1px solid #eef2f7;font-size:8.5px;line-height:1.45}.lt6Item b{color:#0f172a}.lt6Item span{color:#64748b}.lt6Vazio{padding:20px;text-align:center;color:#64748b;font-size:9px}
@media(max-width:900px){.lt6Resumo{grid-template-columns:repeat(2,1fr)}.lt6DetGrid{grid-template-columns:1fr}}
`;document.head.appendChild(s)}
function ltMesesHtml(ano){return LT_MESES.map((m,i)=>{let p=((new Date(ano,i,1)-new Date(ano,0,1))/(new Date(ano+1,0,1)-new Date(ano,0,1)))*100;return`<span class="lt6Mes" style="left:${p+4.1}%">${m}</span><i class="lt6Tick" style="left:${p}%"></i>`}).join('')}
function ltItemDetalhe(x){let doc=x.numero_documento||'Sem nº';let meta=[ltBR(ltData(x)),x.pagina?`pág. ${x.pagina}`:'',x.situacao_resultante||''].filter(Boolean).join(' • ');return`<div class="lt6Item"><b>${ltEsc(x.municipio)} — ${ltEsc(doc)}</b><br><span>${ltEsc(meta||'Sem metadados adicionais')}</span>${x.referencia?`<br><span>${ltEsc(x.referencia)}</span>`:''}</div>`}
window.lt6Abrir=function(tipo,data){let g=ltAgrupar(LT_DADOS).find(x=>x.tipo===tipo&&x.data===data);let box=document.getElementById('lt6Detalhe');if(!g||!box)return;let cfg=LT_TIPOS[tipo];box.innerHTML=`<div class="lt6DetTopo"><b>${cfg.icone} ${cfg.rotulo} • ${ltBR(data)} • ${g.itens.length} registro${g.itens.length===1?'':'s'}</b><button class="lt6Fechar" onclick="document.getElementById('lt6Detalhe').classList.remove('aberto')">FECHAR</button></div><div class="lt6DetGrid">${g.itens.sort((a,b)=>String(a.municipio).localeCompare(String(b.municipio),'pt-BR')).map(ltItemDetalhe).join('')}</div>`;box.classList.add('aberto');box.scrollIntoView({behavior:'smooth',block:'nearest'})}
async function ltRender(){
let alvo=document.getElementById('e4Timeline');if(!alvo)return
let c=window.clientQueimadas||window.client;if(!c)return
try{let{data,error}=await c.from('queimadas_municipios_movimentacoes').select('*').order('data_documento').order('data_envio').order('data_recebimento');if(error)throw error;LT_DADOS=data||[];let grupos=ltAgrupar(LT_DADOS),anos=grupos.map(x=>Number(x.data.slice(0,4))).filter(Number.isFinite),ano=anos.length?Math.max(...anos):new Date().getFullYear();let tipos=['OFICIO_TCE','RESPOSTA','REITERACAO_TCE','PEDIDO_DILACAO','COMPLEMENTACAO'];let totais={};tipos.forEach(t=>totais[t]=LT_DADOS.filter(x=>x.tipo_evento===t||(t==='RESPOSTA'&&x.tipo_evento==='PLANO_ENVIADO')).length)
alvo.innerHTML=`<div class="lt6Wrap"><div class="lt6Topo"><div><h3>📅 Linha do Tempo Estadual — 52 Municípios</h3><p>Visão cronológica consolidada. Eventos iguais na mesma data são agrupados; clique nos marcos para abrir os municípios e documentos.</p></div><div class="lt6Legenda">${tipos.map(t=>`<span><i style="background:${LT_TIPOS[t].cor}"></i>${LT_TIPOS[t].rotulo}</span>`).join('')}</div></div><div class="lt6Scroll"><div class="lt6Board"><div class="lt6Meses"><div class="lt6MesLabel">ANO ${ano}</div><div class="lt6MesEixo">${ltMesesHtml(ano)}</div></div>${tipos.map(t=>{let cfg=LT_TIPOS[t],gs=grupos.filter(g=>g.tipo===t||(t==='RESPOSTA'&&g.tipo==='PLANO_ENVIADO'));return`<div class="lt6Lane"><div class="lt6LaneNome"><i style="background:${cfg.cor}"></i>${cfg.rotulo}</div><div class="lt6Track"><span class="lt6Base"></span>${gs.map(g=>`<button class="lt6Mark" title="${ltBR(g.data)} • ${g.itens.length} registro(s)" onclick="lt6Abrir('${g.tipo}','${g.data}')" style="left:${ltPos(g.data,ano)}%;color:${LT_TIPOS[g.tipo]?.cor||cfg.cor}"><span class="lt6Dot"></span>${g.itens.length>1?`<span class="lt6Badge">${g.itens.length}</span>`:''}<span class="lt6Data">${ltBR(g.data).slice(0,5)}</span></button>`).join('')}</div></div>`}).join('')}</div></div><div class="lt6Resumo"><div><b>${totais.OFICIO_TCE||0}</b><span>Ofícios TCE</span></div><div><b>${totais.REITERACAO_TCE||0}</b><span>Reiterações</span></div><div><b>${totais.RESPOSTA||0}</b><span>Respostas / Planos</span></div><div><b>${totais.PEDIDO_DILACAO||0}</b><span>Dilações</span></div><div><b>${totais.COMPLEMENTACAO||0}</b><span>Complementações</span></div></div><div id="lt6Detalhe" class="lt6Detalhe"></div></div>`
}catch(e){console.warn('Linha do Tempo V6:',e);alvo.innerHTML='<div class="lt6Vazio">Não foi possível carregar a linha do tempo documental.</div>'}}
function ltAgendar(){[150,500,1100].forEach(t=>setTimeout(ltRender,t))}
ltCss();document.addEventListener('click',e=>{if(e.target?.id==='btnAbaExecutivoMunicipal')ltAgendar()});setTimeout(ltAgendar,1800)
window.renderLinhaTempoMunicipalHorizontal=ltRender
})();
