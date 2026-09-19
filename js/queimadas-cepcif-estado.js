/*=========================================================
CEPCIF • PAINEL ESTADO • QUEIMADAS 2026
=========================================================*/
(function(){
const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))
const dt=v=>{
 if(!v)return'—'
 const p=String(v).slice(0,10).split('-')
 return p.length===3?`${p[2]}/${p[1]}/${p[0]}`:String(v)
}
function estilo(){
 if(document.getElementById('cepEstilo'))return
 const s=document.createElement('style');s.id='cepEstilo'
 s.textContent=`
 .cep-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:12px;margin:12px 0}
 .cep-kpi{border:1px solid #dbeafe;background:linear-gradient(180deg,#eff6ff,#fff);border-radius:14px;padding:14px}
 .cep-kpi b{display:block;font-size:19px;color:#0f172a;margin-top:4px}.cep-kpi small{font-weight:800;color:#475569}
 .cep-box{border:1px solid #e2e8f0;border-radius:14px;padding:14px;margin:12px 0;background:#fff}
 .cep-box h3{margin:0 0 10px;color:#0f172a;font-size:16px}.cep-tag{display:inline-block;padding:5px 9px;border-radius:999px;background:#e0f2fe;color:#075985;font-weight:800;font-size:11px;margin:2px 4px 2px 0}
 .cep-linha{display:grid;grid-template-columns:180px 1fr;gap:8px;padding:7px 0;border-bottom:1px solid #f1f5f9}.cep-linha:last-child{border-bottom:0}.cep-linha strong{color:#334155}
 .cep-alerta{background:#fff7ed;border-left:5px solid #f59e0b;border-radius:10px;padding:12px;margin-top:12px}
 @media(max-width:700px){.cep-linha{grid-template-columns:1fr}}
 `
 document.head.appendChild(s)
}
async function renderCEPCIFEstado(){
 const box=document.getElementById('painelCEPCIFEstado')
 if(!box||!window.clientQueimadas)return
 estilo()
 box.innerHTML='<div class="cep-box">Carregando dados do CEPCIF...</div>'
 try{
  const [{data:orgao,error:e1},{data:mon,error:e2},{data:marcos,error:e3}]=await Promise.all([
   window.clientQueimadas.schema('queimadas').from('queimadas_estado_oficio').select('*').eq('estado','CEPCIF - Comitê Estadual de Prevenção e Combate a Incêndios Florestais').limit(1),
   window.clientQueimadas.schema('queimadas').from('queimadas_monitoramento').select('*').eq('origem','CEPCIF').order('prazo',{ascending:true}),
   window.clientQueimadas.schema('queimadas').from('queimadas_marcos').select('*').ilike('titulo','%CEPCIF%').order('data_inicio',{ascending:true})
  ])
  if(e1)throw e1;if(e2)throw e2;if(e3)throw e3
  const o=orgao?.[0]||{}
  const m=mon||[]
  const marco=(marcos||[])[0]
  box.innerHTML=`
  <div class="cep-grid">
   <div class="cep-kpi"><small>ÓRGÃO ESTADUAL</small><b>CEPCIF</b></div>
   <div class="cep-kpi"><small>PROCESSO PRINCIPAL</small><b>SEI 006691/2026</b></div>
   <div class="cep-kpi"><small>REUNIÃO</small><b>22/09/2026 • 9h</b></div>
   <div class="cep-kpi"><small>SITUAÇÃO</small><b>${esc(marco?.status||'AGENDADO')}</b></div>
  </div>
  <div class="cep-box">
   <h3>🏛️ Comitê Estadual de Prevenção e Combate a Incêndios Florestais</h3>
   <span class="cep-tag">Governança estadual</span><span class="cep-tag">Prevenção</span><span class="cep-tag">Fiscalização</span><span class="cep-tag">Combate</span><span class="cep-tag">Mudanças climáticas</span>
   <div class="cep-linha"><strong>Instituição</strong><span>${esc(o.estado||'CEPCIF')}</span></div>
   <div class="cep-linha"><strong>Base institucional</strong><span>Decreto nº 28.811/2024 • Presidência do CEPCIF: Decreto nº 31.804/2026</span></div>
   <div class="cep-linha"><strong>Presidente do CEPCIF</strong><span>Nivaldo de Azevedo Ferreira – CEL BM RR</span></div>
   <div class="cep-linha"><strong>11ª Reunião</strong><span>22/09/2026, às 9h • Sala de Situação da Operação Verde Rondônia • Centro de Treinamento Operacional do CBMRO • Porto Velho</span></div>
  </div>
  <div class="cep-box">
   <h3>📑 Documentação vinculada</h3>
   <div class="cep-linha"><strong>Doc. 06947/26</strong><span>Ofício nº 6391/2026/CASA CIVIL-COGCLIMA • recebido em ${dt(o.idatarecebimentodoc)} • Processo SEI 006691/2026</span></div>
   <div class="cep-linha"><strong>Doc. 06985/26</strong><span>Ofício nº 19368/2026/CBM-GABCMD • recebido em ${dt(o.iidatarecebimentodoc)} • Processo relacionado SEI 006714/2026</span></div>
   <div class="cep-linha"><strong>Resposta TCE-RO</strong><span>${esc(o.nroficioenviadotcero||'Ofício nº 942/2026/GABPRES/TCERO')} • ${dt(o.dataenviodoc)}</span></div>
   <div class="cep-linha"><strong>Despacho da Presidência</strong><span>SEI nº 1116561 • 18/09/2026 • remessa aos Relatores Temáticos do Desenvolvimento Sustentável, SEPEPP e SGCE</span></div>
   <div class="cep-linha"><strong>Comprovante de envio</strong><span>18/09/2026 às 12:04 • resposta enviada ao CBMRO e CEPCIF/COGCLIMA</span></div>
  </div>
  <div class="cep-box">
   <h3>📌 Pauta prévia da 11ª Reunião</h3>
   <div class="cep-linha"><strong>CENSIPAM</strong><span>Atualização climática</span></div>
   <div class="cep-linha"><strong>SEDAM</strong><span>Atualização do Sistema PROTEGE</span></div>
   <div class="cep-linha"><strong>BPA</strong><span>Atualização sobre fiscalizações</span></div>
   <div class="cep-linha"><strong>CBMRO / SCI</strong><span>Atualização dos dados da Operação Verde Rondônia e demonstração das operações nas bases avançadas</span></div>
   <div class="cep-linha"><strong>PCRO</strong><span>Ações de investigação e acompanhamento dos trabalhos realizados</span></div>
   <div class="cep-alerta"><b>Controle de evidência:</b> convite, pauta e resposta institucional estão documentados. A realização da reunião, suas deliberações e resultados somente devem ser marcados como executados após ata, memória, apresentações ou documento equivalente.</div>
  </div>
  <div class="cep-box">
   <h3>🧭 Acompanhamento no sistema</h3>
   ${m.length?m.map(x=>`<div class="cep-linha"><strong>${esc(x.subitem||x.item)}</strong><span>${esc(x.descricao)} • <b>${esc(x.status||'—')}</b> • Evidência: ${esc(x.evidencia_status||'—')}</span></div>`).join(''):'<div>Sem itens de monitoramento.</div>'}
  </div>`
 }catch(err){
  console.error('CEPCIF:',err)
  box.innerHTML='<div class="cep-alerta">Não foi possível carregar os dados do CEPCIF neste momento.</div>'
 }
}
window.renderCEPCIFEstado=renderCEPCIFEstado
document.addEventListener('DOMContentLoaded',()=>setTimeout(renderCEPCIFEstado,500))
})()
