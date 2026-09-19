/*=========================================================
CEPCIF • MONITORAMENTO INTELIGENTE
=========================================================*/
(function(){
const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))
function css(){
 if(document.getElementById('miCepCss'))return
 const s=document.createElement('style');s.id='miCepCss'
 s.textContent=`
 .mi-cep{border:1px solid #cbd5e1;border-radius:16px;padding:16px;background:#fff;margin:14px 0;box-shadow:0 3px 10px rgba(15,23,42,.06)}
 .mi-cep h2{margin:0 0 12px;color:#0f172a}.mi-cep-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:10px}
 .mi-cep-card{border:1px solid #e2e8f0;border-radius:12px;padding:12px;background:#f8fafc}.mi-cep-card b{display:block;margin-bottom:5px}
 .mi-cep-status{font-size:11px;font-weight:900;padding:4px 8px;border-radius:999px;background:#fef3c7;color:#92400e;display:inline-block}
 `
 document.head.appendChild(s)
}
async function render(){
 css()
 const target=document.getElementById('tela-documentosqueimadas')
 if(!target||!window.clientPublic)return
 let box=document.getElementById('monitoramentoCEPCIF')
 if(!box){
  box=document.createElement('div');box.id='monitoramentoCEPCIF';box.className='mi-cep'
  const first=target.querySelector(':scope > *')
  first?target.insertBefore(box,first):target.appendChild(box)
 }
 try{
  const {data,error}=await window.clientPublic.from('monitoramento_itens')
   .select('id,item,subitem,descricao,status,criticidade,prazo,responsavel,percentual,produto,evidencia_status,evidencia_resumo_ia')
   .eq('monitoramento_id',4).eq('item','8').order('subitem',{ascending:true})
  if(error)throw error
  box.innerHTML=`<h2>🏛️ CEPCIF • Governança Estadual</h2>
   <div style="margin-bottom:12px;color:#475569">Processo SEI 006691/2026 • documentos 06947/26 e 06985/26 • resposta TCE-RO Ofício nº 942/2026/GABPRES/TCERO.</div>
   <div class="mi-cep-grid">
   ${(data||[]).map(x=>`<div class="mi-cep-card">
     <b>${esc(x.subitem)} • ${esc(x.descricao)}</b>
     <span class="mi-cep-status">${esc(x.status||'—')}</span>
     <div style="margin-top:8px;font-size:12px"><strong>Responsável:</strong> ${esc(x.responsavel||'—')}</div>
     <div style="font-size:12px"><strong>Prazo:</strong> ${esc(x.prazo||'—')}</div>
     <div style="font-size:12px"><strong>Evidência:</strong> ${esc(x.evidencia_status||'—')}</div>
     <div style="font-size:12px;margin-top:6px;color:#475569">${esc(x.evidencia_resumo_ia||'')}</div>
   </div>`).join('')}
   </div>`
 }catch(e){
  console.error('Monitoramento CEPCIF:',e)
  box.innerHTML='<h2>🏛️ CEPCIF • Governança Estadual</h2><div>Falha temporária ao carregar dados.</div>'
 }
 const dash=document.getElementById('tela-dashboard')
 if(dash&&!document.getElementById('cepDashStrip')){
  const d=document.createElement('div');d.id='cepDashStrip';d.className='mi-cep'
  d.innerHTML='<b>🏛️ CEPCIF incorporado ao monitoramento estadual</b><div style="margin-top:5px;color:#475569">11ª Reunião Ordinária prevista para 22/09/2026 às 9h. Convites e resposta institucional documentados; ata e resultados permanecem pendentes de comprovação posterior.</div>'
  dash.insertBefore(d,dash.firstChild)
 }
}
document.addEventListener('DOMContentLoaded',()=>setTimeout(render,700))
window.renderMonitoramentoCEPCIF=render
})()
