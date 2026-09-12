/* =========================================================
RESILIÊNCIA CLIMÁTICA MUNICIPAL • QUEIMADAS 2026
Módulo executivo complementar, sem alterar as rotinas existentes.
========================================================= */
(function(){
'use strict';
const FONTES={
  iri:'IRIQ/TCERO • INPE • PRODES • MapBiomas • CHAPT',
  doc:'Ofícios Circulares n. 16/2026 e n. 27/2026/GABPRES/TCERO • PIMF/Planos municipais • Base documental TCERO',
  fogo:'INPE/Programa Queimadas • PROTEGE/SEDAM • CENSIPAM/SIPAM – Painel do Fogo 5.0',
  gov:'SEDAM • CBMRO/POTIF 2026 • CEPCIF • Municípios de Rondônia',
  metodo:'Elaboração: TCERO/CECEX-9 • Índice experimental de apoio à priorização; não substitui avaliação técnica individual.'
};
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
function fonte(t){return `<div class="rcFonte"><b>Fontes:</b> ${esc(t)}</div>`}
function dadosMunicipais(){
  const bases=[window.QUEIMADAS_BASE_MUNICIPAL_ATUAL?.municipios,window.municipiosQueimadas,window.dadosMunicipios,window.listaMunicipios].find(Array.isArray)||[];
  return bases;
}
function planoStatus(x){const s=String(x?.classificacao_cor||x?.situacao||x?.status||x?.status_plano||'').toUpperCase();if(/VERDE|PLANO|RECEBID|ENTREG/.test(s))return 100;if(/AMARELO|DILA/.test(s))return 55;if(/AZUL|PEND/.test(s))return 35;if(/VERMELHO|SEM RESPOSTA/.test(s))return 0;return 25}
function iri(x){for(const k of ['indice_final','iriq','IRIQ','indice_iriq','risco']){const n=Number(x?.[k]);if(Number.isFinite(n))return n}return null}
function prontidao(x){
  const p=planoStatus(x),r=iri(x); // risco alto reduz prontidão quando não compensado por planejamento
  const riscoScore=r==null?50:Math.max(0,100-r);
  return Math.round(.55*p+.45*riscoScore);
}
function faixa(v){return v>=75?['PREPARADO','🟢']:v>=50?['ATENÇÃO','🟡']:v>=25?['ALTA VULNERABILIDADE','🟠']:['PRIORIDADE CRÍTICA','🔴']}
function resumo(){
 const a=dadosMunicipais(), total=a.length||52;
 let planos=0,prior=0,sum=0,n=0;
 a.forEach(x=>{if(planoStatus(x)>=100)planos++;const v=prontidao(x);sum+=v;n++;if(v<25)prior++});
 return {a,total,planos,prior,ipcq:n?Math.round(sum/n):null};
}
function css(){if(document.getElementById('rcCss'))return;const s=document.createElement('style');s.id='rcCss';s.textContent=`
#cardResilienciaClimatica{border-top:5px solid #0f766e;background:linear-gradient(135deg,#fff 0%,#f0fdfa 100%)}
.rcHead{display:flex;justify-content:space-between;gap:16px;align-items:flex-start;flex-wrap:wrap}.rcHead h2{margin:0;color:#0f172a}.rcSub{color:#475569;font-size:13px;margin-top:5px}.rcSelo{background:#0f172a;color:#fff;padding:8px 12px;border-radius:999px;font-size:11px;font-weight:800}
.rcKpis{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;margin:16px 0}.rcKpi{padding:15px;border:1px solid #dbe5e8;border-radius:16px;background:#fff}.rcKpi b{display:block;font-size:28px;color:#0f172a}.rcKpi span{font-size:10px;font-weight:800;color:#64748b;text-transform:uppercase}.rcFluxo{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin:12px 0}.rcFluxo div{text-align:center;padding:11px 6px;border-radius:12px;background:#0f172a;color:#fff;font-weight:800;font-size:12px}.rcGrid{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-top:14px}.rcBox{background:#fff;border:1px solid #dbe5e8;border-radius:16px;padding:14px}.rcBox h3{margin:0 0 10px;color:#0f172a;font-size:15px}.rcBar{height:12px;background:#e2e8f0;border-radius:20px;overflow:hidden}.rcBar i{display:block;height:100%;background:#0f766e}.rcLegenda{font-size:11px;line-height:1.7;color:#475569;margin-top:10px}.rcFonte{margin-top:12px;padding-top:8px;border-top:1px solid #e2e8f0;color:#64748b;font-size:9px;line-height:1.45}.rcNota{margin-top:12px;padding:10px 12px;background:#ecfeff;border-left:4px solid #0891b2;border-radius:10px;color:#164e63;font-size:11px;line-height:1.5}
@media(max-width:700px){.rcKpis{grid-template-columns:1fr 1fr}.rcGrid{grid-template-columns:1fr}.rcFluxo{grid-template-columns:1fr 1fr}.rcKpi b{font-size:23px}}
`;document.head.appendChild(s)}
function render(){
 const exec=document.getElementById('abaExecutivo');if(!exec)return;css();let c=document.getElementById('cardResilienciaClimatica');if(!c){c=document.createElement('div');c.id='cardResilienciaClimatica';c.className='cardExecutivo';const ref=document.getElementById('cardIRIQHeatmap')||document.getElementById('cardMunicipiosPrioritarios');if(ref)ref.insertAdjacentElement('afterend',c);else exec.appendChild(c)}
 const r=resumo(), ipcq=r.ipcq, f=ipcq==null?['EM CONSOLIDAÇÃO','⚪']:faixa(ipcq);
 c.innerHTML=`<div class="rcHead"><div><h2>🌎 RESILIÊNCIA CLIMÁTICA MUNICIPAL</h2><div class="rcSub">Queimadas • prevenção • capacidade de resposta • adaptação climática</div></div><div class="rcSelo">CIDADES PELO CLIMA • RONDÔNIA</div></div>
 <div class="rcKpis"><div class="rcKpi"><b>${r.total}</b><span>Municípios monitorados</span></div><div class="rcKpi"><b>${r.planos||'—'}</b><span>Planejamento preventivo identificado</span></div><div class="rcKpi"><b>${r.prior||'—'}</b><span>Prioridade crítica IPCQ</span></div><div class="rcKpi"><b>${ipcq==null?'—':ipcq+'%'}</b><span>IPCQ estadual • ${f[1]} ${f[0]}</span></div></div>
 ${fonte(FONTES.doc+' • '+FONTES.gov)}
 <div class="rcFluxo"><div>🛰️ MONITORAR</div><div>📋 PLANEJAR</div><div>🛡️ PREVENIR</div><div>🚒 RESPONDER</div></div>
 ${fonte(FONTES.fogo)}
 <div class="rcGrid"><div class="rcBox"><h3>IPCQ • Índice de Prontidão Climática para Queimadas</h3><div class="rcBar"><i style="width:${ipcq||0}%"></i></div><div class="rcLegenda">🟢 75–100 Preparado<br>🟡 50–74 Atenção<br>🟠 25–49 Alta vulnerabilidade<br>🔴 0–24 Prioridade crítica</div>${fonte(FONTES.iri+' • '+FONTES.doc+' • '+FONTES.gov)}</div><div class="rcBox"><h3>Leitura executiva</h3><div class="rcLegenda"><b>Objetivo:</b> transformar monitoramento ambiental e evidências de planejamento em sinal executivo de prontidão municipal.<br><br><b>Composição inicial:</b> 55% planejamento/evidências + 45% exposição ao risco (IRIQ invertido). A metodologia pode ser refinada quando novas dimensões de capacidade operacional forem estruturadas.</div>${fonte(FONTES.metodo)}</div></div>
 <div class="rcNota"><b>Agenda correlata:</b> adaptação climática municipal e integração entre dados, planejamento e resposta. Referências externas são apresentadas como contexto de governança climática e não como origem dos indicadores do TCERO.</div>
 ${fonte('CENSIPAM/SIPAM – Painel do Fogo 5.0 • INPE – Programa Queimadas • PROTEGE/SEDAM • PRODES • MapBiomas • CHAPT • SEDAM • CBMRO/POTIF 2026 • CEPCIF • PIMF/Planos Municipais • Ofícios Circulares TCERO n. 16/2026 e n. 27/2026 • Elaboração TCERO/CECEX-9')}`;
}
function init(){render();setTimeout(render,1500);setTimeout(render,5000)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
document.addEventListener('click',e=>{if(e.target?.id==='btnAbaExecutivo')setTimeout(render,300)});
window.renderResilienciaClimatica=render;
})();