/*=========================================================
440 3 FONTES • CENSIPAM FOCOS BETA V2
Usa focos Beta quando disponíveis e faz fallback oficial para Eventos de Fogo.
=========================================================*/
(function(){
function e(v){return String(v??'').replace(/[&<>"']/g,s=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[s]))}
function dh(v){if(!v)return'—';try{return new Date(v).toLocaleString('pt-BR',{timeZone:'America/Porto_Velho'})}catch{return e(v)}}
function docStrip(a){let q=window.QUEIMADAS_BASE_MUNICIPAL_ATUAL?.municipios||[];if(!q.length)return;let n={VERDE:0,AMARELO:0,AZUL:0,VERMELHO:0};q.forEach(x=>n[x.classificacao_cor]=(n[x.classificacao_cor]||0)+1);let s=document.getElementById('q3DocSync');if(!s){s=document.createElement('div');s.id='q3DocSync';s.className='q3Info';let h=a.querySelector('.q3Hero');h?.insertAdjacentElement('afterend',s)}if(s)s.innerHTML=`📑 <b>BASE DOCUMENTAL MUNICIPAL SINCRONIZADA:</b> ${q.length} municípios • 🟢 ${n.VERDE} planos • 🟡 ${n.AMARELO} dilação • 🔵 ${n.AZUL} resposta/plano pendente • 🔴 ${n.VERMELHO} sem resposta.`}
function render(){let a=document.getElementById('aba3Fontes');if(!a)return;docStrip(a);let d=window.QS_SIPAM_BETA,box=document.getElementById('q3SipamBetaFocos');if(!box){box=document.createElement('div');box.id='q3SipamBetaFocos';box.className='q3Bloco';let conteudo=document.getElementById('q3Conteudo');if(conteudo)conteudo.insertAdjacentElement('afterbegin',box);else a.appendChild(box)}if(!d){box.innerHTML='<b>🛰️ CENSIPAM • Carregando dados oficiais...</b>';return}
let status=d.status||'INDISPONIVEL';let fallback=d.source_mode==='EVENTOS_FOGO_FALLBACK'||status==='LIVE_FALLBACK';let ok=status==='LIVE'||status==='LIVE_FALLBACK'||status==='SEM_DETECCOES';let valor=d.count_period??(status==='SEM_DETECCOES'?0:'—');let sats=(d.satellites||[]).length;let camada=d.layer?.title||d.layer?.name||(fallback?'Eventos de Fogo • CENSIPAM':'Focos Beta');let titulo=fallback?'🛰️ CENSIPAM/SIPAM • EVENTOS DE FOGO':'🛰️ CENSIPAM/SIPAM • FOCOS DE CALOR DE BAIXA LATÊNCIA (BETA)';let rotulo=fallback?'EVENTOS • 7 DIAS':'FOCOS • 7 DIAS';let produto=fallback?'EVENTOS DE FOGO':'FOCOS BETA';let statusExibido=status==='LIVE_FALLBACK'?'LIVE • EVENTOS':status;let detalhe='';
if(fallback){detalhe=`<div style="margin-top:10px;padding:10px;border-radius:12px;background:#eff6ff;color:#1e3a8a;font-size:11px;font-weight:700">ℹ️ A camada Beta de focos não respondeu; o painel está usando automaticamente a camada oficial <b>Eventos de Fogo</b> do CENSIPAM. Eventos são agrupamentos espaço-temporais e não equivalem 1:1 a focos.</div>`}
else if(!ok){detalhe=`<div style="margin-top:10px;padding:10px;border-radius:12px;background:#fff7ed;color:#9a3412;font-size:11px;font-weight:700">⚠️ ${e(d.reason||d.error?.message||d.error||'Fonte CENSIPAM temporariamente indisponível')}</div>`}
box.innerHTML=`<div style="display:flex;justify-content:space-between;gap:12px;align-items:center"><div><h3 style="margin:0;color:#0f172a">${titulo}</h3><div style="font-size:9px;color:#64748b;margin-top:3px">Fonte oficial CENSIPAM • Painel do Fogo.</div></div><span class="q3Badge ${ok?'q3Live':'q3Deg'}">${e(statusExibido)}</span></div><div class="q3Comp" style="margin-top:12px"><div><span>${rotulo}</span><b>${valor}</b></div><div><span>ÚLTIMA DETECÇÃO</span><b style="font-size:12px">${dh(d.latest_detection)}</b></div><div><span>FONTE/SENSORES</span><b>${sats||((status==='SEM_DETECCOES')?0:'—')}</b></div><div><span>CAMADA</span><b style="font-size:10px">${e(camada)}</b></div><div><span>PRODUTO</span><b style="font-size:10px">${produto}</b></div></div>${detalhe}<div class="q3Metodo" style="margin-top:10px">CENSIPAM/Painel do Fogo 5.0 • dados oficiais para monitoramento operacional de incêndios e queimadas.</div>`}
}
async function carregar(){let c=window.clientQueimadas||window.client;if(!c?.functions?.invoke){window.QS_SIPAM_BETA={status:'INDISPONIVEL',reason:'Cliente Supabase não inicializado'};render();return}window.QS_SIPAM_BETA={status:'CARREGANDO'};render();try{let{data,error}=await c.functions.invoke('sipam-focos-ro',{body:{days:7}});if(!error&&data)window.QS_SIPAM_BETA=data;else window.QS_SIPAM_BETA={status:'INDISPONIVEL',reason:error?.message||'Falha ao consultar função CENSIPAM'};render()}catch(err){window.QS_SIPAM_BETA={status:'INDISPONIVEL',reason:err?.message||String(err)};render()}}
document.addEventListener('click',ev=>{if(ev.target?.id==='btnAba3Fontes')setTimeout(()=>{render();carregar()},250)});document.addEventListener('queimadas:documentos-sincronizados',()=>setTimeout(render,200));
function iniciar(){render();carregar();setTimeout(carregar,4500)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(iniciar,900),{once:true});else setTimeout(iniciar,900)
})();

/*=========================================================
441 RESILIÊNCIA CLIMÁTICA MUNICIPAL • CARREGAMENTO SEGURO
Módulo complementar e desacoplado do painel principal.
=========================================================*/
(function(){
if(document.getElementById('qResilienciaClimaticaV1'))return;
const s=document.createElement('script');
s.id='qResilienciaClimaticaV1';
s.src='../js/queimadas-resiliencia-climatica-v1.js?v=20260911-2';
s.defer=true;
document.head.appendChild(s);
})();
