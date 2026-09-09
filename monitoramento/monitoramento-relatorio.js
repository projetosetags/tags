/*=========================================================
001 MONITORAMENTO-RELATORIO.JS UTILITÁRIOS
=========================================================*/
function relEsc(v){return String(v??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]))}
function relTexto(v){const s=String(v??'').trim();return s?s:'-'}
function relNL(v){return relEsc(relTexto(v)).replace(/\n/g,'<br>')}
function relData(v){if(!v)return'-';const d=new Date(v);return Number.isNaN(d.getTime())?String(v):d.toLocaleDateString('pt-BR')}
function relNumero(v){const n=Number(v||0);return Number.isFinite(n)?n:0}
function relClasseStatus(s){const t=String(s||'').toUpperCase();if(t==='EXECUTADA')return'rel-status-ok';if(t.includes('PARCIAL'))return'rel-status-parcial';if(t.includes('NÃO'))return'rel-status-nao';return'rel-status-andamento'}
function relOrdenar(data){return typeof ordenarDataGlobal==='function'?ordenarDataGlobal(data||[]):(data||[])}
function relAgrupar(lista,campo){const mapa={};(lista||[]).forEach(x=>{const k=x[campo];if(!mapa[k])mapa[k]=[];mapa[k].push(x)});return mapa}
function relFontePorId(fontes){const m={};(fontes||[]).forEach(f=>m[String(f.id)]=f);return m}
function relAnaliseMaisRecente(analises){const m={};(analises||[]).forEach(a=>{if(!m[a.item_id])m[a.item_id]=a});return m}

/*=========================================================
002 MONITORAMENTO-RELATORIO.JS PACOTE DE DADOS
=========================================================*/
async function carregarPacoteRelatorio(itemId=null){
const origem=String(document.getElementById('filtroOrigem')?.value||'TODAS').toUpperCase()
let qMon=client.from('monitoramentos').select('*').order('id',{ascending:true})
if(window.MONITORAMENTO_ATUAL)qMon=qMon.eq('id',Number(window.MONITORAMENTO_ATUAL))
else if(origem!=='TODAS')qMon=qMon.eq('origem',origem)
let qItens=client.from('monitoramento_itens').select('*')
if(itemId)qItens=qItens.eq('id',Number(itemId))
else if(window.MONITORAMENTO_ATUAL)qItens=qItens.eq('monitoramento_id',Number(window.MONITORAMENTO_ATUAL))
else if(origem!=='TODAS')qItens=qItens.eq('origem',origem)
const[{data:monitoramentos,error:erroM},{data:itens,error:erroI},{data:fontes,error:erroF},{data:evidencias,error:erroE},{data:analises,error:erroA},{data:resultados,error:erroR}]=await Promise.all([
qMon,qItens,client.from('vw_monitoramento_integrado').select('*'),client.from('monitoramento_evidencias').select('*').order('created_at',{ascending:false}),client.from('monitoramento_analises').select('*').order('created_at',{ascending:false}),client.from('monitoramento_resultados').select('*').order('created_at',{ascending:false})
])
if(erroM||erroI)throw(erroM||erroI)
if(erroF)console.warn(erroF);if(erroE)console.warn(erroE);if(erroA)console.warn(erroA);if(erroR)console.warn(erroR)
return{
monitoramentos:monitoramentos||[],itens:relOrdenar(itens||[]),fontes:fontes||[],
evidencias:evidencias||[],analises:analises||[],resultados:resultados||[],
fonteMap:relFontePorId(fontes||[]),evidMap:relAgrupar(evidencias||[],'item_id'),analiseMap:relAnaliseMaisRecente(analises||[]),resultadoMap:relAgrupar(resultados||[],'item_id')
}
}

/*=========================================================
003 MONITORAMENTO-RELATORIO.JS CABEÇALHO E METADADOS
=========================================================*/
function relCabecalhoInstitucional(){
return`<div class="rel-institucional"><div class="rel-orgao">TRIBUNAL DE CONTAS DO ESTADO DE RONDÔNIA</div><div>Secretaria-Geral de Controle Externo - SGCE</div><div>Monitoramento Técnico - TAGs SEDAM e SEPAT</div></div>`
}
function relMetadados(m){
return`<table class="rel-meta"><tr><th>PROCESSO</th><td>${relEsc(m.processo)}</td></tr><tr><th>UNIDADE JURISDICIONADA</th><td>${relEsc(m.orgao)}</td></tr><tr><th>CATEGORIA</th><td>Auditoria e Inspeção</td></tr><tr><th>SUBCATEGORIA</th><td>Monitoramento</td></tr><tr><th>ASSUNTO</th><td>${relNL(m.assuntos||m.assunto||m.descricao_origem)}</td></tr><tr><th>ACÓRDÃO / ATO DE REFERÊNCIA</th><td>${relNL(m.acordao)}</td></tr><tr><th>RELATOR</th><td>${relEsc(m.relator)}</td></tr><tr><th>AUDITOR RESPONSÁVEL</th><td>${relEsc(m.auditor_responsavel)}</td></tr></table>`
}

/*=========================================================
004 MONITORAMENTO-RELATORIO.JS FICHA POR ITEM
=========================================================*/
function relFichaItem(i,p){
const f=p.fonteMap[String(i.deliberacao_id||'')]||{}
const docs=p.evidMap[i.id]||[]
const analise=p.analiseMap[i.id]
const achado=f.achado||i.achado||i.deliberacao
const acao=f.acao||i.acao_gestor||i.descricao
const prazo=f.prazo_texto||i.entrega_esperada||i.prazo
const produto=f.produto||i.produto||i.produto_esperado
const orgao=String(i.origem||'JURISDICIONADO').toUpperCase()
const codigoItem=f.codigo_item||i.item
const codigoSubitem=f.codigo_subitem||i.subitem
const infoManual=String(i.evidencia||'').trim()
let infoHtml=''
if(infoManual)infoHtml+=`<div class="rel-evidencia-texto">${relNL(infoManual)}</div>`
if(docs.length){infoHtml+=`<ol class="rel-lista-evidencias">${docs.map(e=>`<li><b>${relEsc(relTexto(e.tipo_evidencia))}${e.numero_documento?` - ${relEsc(e.numero_documento)}`:''}</b>${e.descricao?`: ${relEsc(e.descricao)}`:''}${e.orgao_setor||e.orgao?` <span class="rel-muted">(${relEsc(e.orgao_setor||e.orgao)})</span>`:''} <span class="rel-validacao">[${relEsc(e.status_validacao||'PENDENTE')}]</span></li>`).join('')}</ol>`}
if(!infoHtml)infoHtml='<div class="rel-pendente">Não há evidência registrada no painel para este subitem.</div>'
const analiseHtml=analise?`<div class="rel-analise-texto">${relNL(analise.analise_tecnica)}</div>${analise.encaminhamento?`<div class="rel-encaminhamento"><b>Encaminhamento registrado:</b> ${relNL(analise.encaminhamento)}</div>`:''}`:'<div class="rel-pendente">Análise técnica pendente de registro/validação pela equipe de auditoria.</div>'
return`<section class="rel-ficha page-break-avoid"><div class="rel-ficha-titulo">Achado: ${relEsc(relTexto(achado))} <span>(Item ${relEsc(relTexto(codigoItem))}${codigoSubitem?` - Subitem ${relEsc(codigoSubitem)}`:''} do Plano de Ação)</span></div><table class="rel-quadro"><thead><tr><th>Situação Encontrada</th><th>Ação a ser Adotada</th><th>Prazo</th></tr></thead><tbody><tr><td>${relNL(achado)}</td><td>${relNL(acao)}</td><td>${relNL(prazo)}</td></tr><tr><th>Produto esperado</th><td colspan="2">${relNL(produto)}</td></tr></tbody></table><div class="rel-subtitulo">Informações prestadas pela ${relEsc(orgao)}</div>${infoHtml}<div class="rel-subtitulo">Análise Técnica</div>${analiseHtml}<div class="rel-situacao ${relClasseStatus(i.status)}"><b>SITUAÇÃO: ${relEsc(i.status||'-')} (${relNumero(i.percentual).toFixed(0)}%)</b></div></section>`
}

/*=========================================================
005 MONITORAMENTO-RELATORIO.JS RELATÓRIO OFICIAL
=========================================================*/
async function gerarRelatorioCompleto(){
const box=document.getElementById('previewRelatorio');if(!box)return
box.innerHTML='<div class="rel-gerando">Gerando relatório integrado...</div>'
try{
const p=await carregarPacoteRelatorio()
if(!p.monitoramentos.length){box.innerHTML='<div class="rel-pendente">Selecione um monitoramento em Monitoramentos.</div>';return}
let html=''
for(const m of p.monitoramentos){
const itens=relOrdenar(p.itens.filter(i=>Number(i.monitoramento_id)===Number(m.id)))
const total=itens.length
const exec=itens.filter(i=>i.status==='EXECUTADA').length
const parciais=itens.filter(i=>String(i.status||'').includes('PARCIAL')).length
const nao=itens.filter(i=>String(i.status||'').includes('NÃO')).length
const andamento=itens.filter(i=>i.status==='EM ANDAMENTO').length
const media=total?itens.reduce((s,i)=>s+relNumero(i.percentual),0)/total:0
const comAnalise=itens.filter(i=>p.analiseMap[i.id]).length
const comDocs=itens.filter(i=>(p.evidMap[i.id]||[]).length||String(i.evidencia||'').trim()).length
const docs=itens.flatMap(i=>p.evidMap[i.id]||[])
const docsValidos=docs.filter(e=>e.status_validacao==='VALIDADA').length
const resultados=itens.flatMap(i=>p.resultadoMap[i.id]||[])
const barreiras=resultados.map(r=>r.causas).filter(Boolean)
const beneficios=resultados.map(r=>r.beneficios).filter(Boolean)
const parciaisLista=itens.filter(i=>String(i.status||'').includes('PARCIAL'))
html+=`<article class="relatorio-oficial">${relCabecalhoInstitucional()}<section class="rel-capa"><div class="rel-faixa">RELATÓRIO DE MONITORAMENTO</div><h1>${relEsc(m.titulo||`TAG ${m.origem||''}`)}</h1><p>${relEsc(m.orgao||'-')}</p><p class="rel-capa-processo">Processo ${relEsc(m.processo||'-')} • ${relEsc(m.acordao||'-')}</p><div class="rel-capa-data">Porto Velho, ${new Date().toLocaleDateString('pt-BR',{month:'long',year:'numeric'})}.</div></section>${relMetadados(m)}<h2>1. SUMÁRIO EXECUTIVO</h2><p>O presente relatório consolida o acompanhamento do plano de ação vinculado ao <b>${relEsc(m.acordao||'ato de referência')}</b>, a partir dos dados declarados no TAG e das evidências e análises registradas no Monitoramento Técnico.</p><div class="rel-kpis"><div><span>Subitens monitorados</span><b>${total}</b></div><div><span>Executados</span><b>${exec}</b></div><div><span>Parciais</span><b>${parciais}</b></div><div><span>Não executados</span><b>${nao}</b></div><div><span>Execução média declarada</span><b>${media.toFixed(1)}%</b></div><div><span>Com análise técnica</span><b>${comAnalise}/${total}</b></div></div><p>Quanto à documentação, ${comDocs} de ${total} subitens possuem alguma informação/evidência registrada no painel; foram cadastrados ${docs.length} documentos estruturados, dos quais ${docsValidos} constam como validados.</p><h2>2. INTRODUÇÃO</h2><p>Este documento organiza os dados do acompanhamento da execução das ações pactuadas pela ${relEsc(m.orgao||'unidade jurisdicionada')}, mantendo a rastreabilidade entre o registro do TAG, os produtos esperados, as evidências apresentadas e a análise técnica.</p><h3>2.1 Identificação do objeto da fiscalização</h3><p>${relNL(m.descricao_origem||m.objeto||m.assuntos||'Monitoramento do cumprimento das ações previstas no plano de ação.')}</p><h3>2.2 Objetivos e escopo do monitoramento</h3><p>Verificar o grau de implementação das ações previstas no plano de ação e sua aderência às deliberações do Tribunal, identificar pendências e barreiras, avaliar a suficiência das evidências apresentadas e registrar, quando comprovados, os benefícios decorrentes das medidas implementadas.</p><h3>2.3 Critérios</h3><p>Constituem referências de análise o ato/acórdão monitorado, o plano de ação cadastrado no TAG, os produtos e prazos pactuados e os atributos de suficiência, adequação, confiabilidade e rastreabilidade das evidências registradas.</p><h3>2.4 Métodos utilizados</h3><p>O painel suporta análise documental, confronto entre o progresso declarado e os produtos pactuados, rastreabilidade de documentos e processos, validação de evidências e registro de análise técnica por subitem. O percentual exibido permanece vinculado ao TAG de origem e não é recalculado a partir da quantidade de evidências.</p><h2>3. ANÁLISE QUANTO À EXECUÇÃO DAS AÇÕES HOMOLOGADAS</h2><p>As fichas a seguir reproduzem, para cada subitem, a situação/achado de referência, a ação pactuada, o prazo, as informações prestadas pelo jurisdicionado e a análise técnica existente no sistema.</p>${itens.map(i=>relFichaItem(i,p)).join('')}<h3>3.2 Indicação das evidências</h3><p>Foram localizados ${docs.length} registros estruturados de evidência para os itens deste monitoramento. ${docs.length?`Destes, ${docsValidos} estão validados, ${docs.filter(e=>(e.status_validacao||'PENDENTE')==='PENDENTE').length} pendentes e ${docs.filter(e=>e.status_validacao==='REJEITADA').length} rejeitados.`:'Ainda não há documentos estruturados cadastrados.'}</p><h3>3.3 Principais barreiras ou dificuldades</h3>${barreiras.length?`<ul>${[...new Set(barreiras)].map(b=>`<li>${relNL(b)}</li>`).join('')}</ul>`:'<p class="rel-pendente">Não há registro estruturado de barreiras/dificuldades no painel Resultados. A equipe técnica deverá preencher este tópico quando a análise identificar entraves relevantes.</p>'}<h3>3.4 Principais ações implementadas parcialmente e benefícios observados</h3>${parciaisLista.length?`<p>Encontram-se classificadas como parcialmente executadas ${parciaisLista.length} ação(ões):</p><ul>${parciaisLista.slice(0,25).map(i=>`<li>Item ${relEsc(relTexto(i.item))}${i.subitem?` / ${relEsc(i.subitem)}`:''} - ${relNumero(i.percentual).toFixed(0)}%.</li>`).join('')}</ul>`:'<p>Não há ações classificadas como parcialmente executadas no recorte atual.</p>'}${beneficios.length?`<p><b>Benefícios registrados:</b></p><ul>${[...new Set(beneficios)].map(b=>`<li>${relNL(b)}</li>`).join('')}</ul>`:'<p class="rel-pendente">Benefícios ainda não registrados/validados no painel Resultados.</p>'}<h2>4. CONCLUSÃO</h2><p>Com base nos dados atualmente registrados, o monitoramento abrange ${total} subitens, com ${exec} executado(s), ${parciais} parcialmente executado(s), ${nao} não executado(s) e ${andamento} em andamento. A média aritmética do percentual declarado no TAG é de ${media.toFixed(1)}%.</p><p>${comAnalise===total&&total>0?'Todos os subitens possuem análise técnica registrada.':`Há análise técnica registrada para ${comAnalise} de ${total} subitens; portanto, a conclusão final deve considerar as análises ainda pendentes antes da emissão definitiva.`}</p><h2>5. PROPOSTAS DE ENCAMINHAMENTO</h2><p class="rel-pendente">Minuta a ser consolidada pela equipe técnica após a validação das evidências e das conclusões individuais. O sistema não transforma automaticamente o percentual declarado no TAG em conclusão de auditoria.</p><div class="rel-nota">Documento gerado automaticamente a partir dos dados do Monitoramento Técnico. Informações declaratórias e análises em rascunho devem ser validadas pela equipe de auditoria antes de uso processual.</div></article>`
}
box.innerHTML=html
if(typeof abrirTela==='function')abrirTela('relatorios')
}catch(e){console.error(e);box.innerHTML='<div class="rel-pendente">Erro ao gerar o relatório. Verifique os dados e tente novamente.</div>'}
}

/*=========================================================
006 MONITORAMENTO-RELATORIO.JS QUADRO DE ANÁLISE
=========================================================*/
async function gerarQuadroAnaliseItens(itemId=null){
const box=document.getElementById('previewRelatorio');if(!box)return
box.innerHTML='<div class="rel-gerando">Gerando quadro de análise...</div>'
try{
const p=await carregarPacoteRelatorio(itemId)
const titulo=itemId?'FICHA DE ANÁLISE DO SUBITEM':'QUADRO DE ANÁLISE DAS EVIDÊNCIAS'
box.innerHTML=`<article class="relatorio-oficial">${relCabecalhoInstitucional()}<div class="rel-faixa">${titulo}</div>${p.itens.map(i=>relFichaItem(i,p)).join('')||'<div class="rel-pendente">Nenhum item encontrado.</div>'}</article>`
if(typeof abrirTela==='function')abrirTela('relatorios')
}catch(e){console.error(e);box.innerHTML='<div class="rel-pendente">Erro ao gerar o quadro.</div>'}
}

/*=========================================================
007 MONITORAMENTO-RELATORIO.JS RESUMO EXECUTIVO
=========================================================*/
async function gerarResumoExecutivo(){
const box=document.getElementById('previewRelatorio');if(!box)return
try{
const p=await carregarPacoteRelatorio()
const itens=p.itens
const total=itens.length
const exec=itens.filter(i=>i.status==='EXECUTADA').length
const parciais=itens.filter(i=>String(i.status||'').includes('PARCIAL')).length
const nao=itens.filter(i=>String(i.status||'').includes('NÃO')).length
const media=total?itens.reduce((s,i)=>s+relNumero(i.percentual),0)/total:0
const docs=itens.flatMap(i=>p.evidMap[i.id]||[])
const validadas=docs.filter(e=>e.status_validacao==='VALIDADA').length
box.innerHTML=`<article class="relatorio-oficial">${relCabecalhoInstitucional()}<div class="rel-faixa">RESUMO EXECUTIVO</div><div class="rel-kpis"><div><span>Subitens</span><b>${total}</b></div><div><span>Executados</span><b>${exec}</b></div><div><span>Parciais</span><b>${parciais}</b></div><div><span>Não executados</span><b>${nao}</b></div><div><span>Média declarada</span><b>${media.toFixed(1)}%</b></div><div><span>Evidências validadas</span><b>${validadas}/${docs.length}</b></div></div><p>O resumo apresenta o estado atual do TAG selecionado e preserva a separação entre <b>execução declarada pelo jurisdicionado</b> e <b>validação técnica das evidências</b>.</p><p>${total?`Foram monitorados ${total} subitens. A execução média declarada é ${media.toFixed(1)}%, com ${exec} subitem(ns) em 100%, ${parciais} parcialmente executado(s) e ${nao} sem execução registrada.`:'Não há itens no recorte selecionado.'}</p><div class="rel-nota">Resumo automático para apoio à equipe técnica; não substitui a conclusão de auditoria.</div></article>`
if(typeof abrirTela==='function')abrirTela('relatorios')
}catch(e){console.error(e)}
}

/*=========================================================
008 MONITORAMENTO-RELATORIO.JS EXPORTAÇÃO WORD REAL (.DOCX)
=========================================================*/
async function exportarWordMonitoramento(){
const conteudo=document.getElementById('previewRelatorio')?.innerHTML
if(!conteudo){alert('Gere o relatório antes de exportar.');return}
if(!window.htmlDocx?.asBlob){alert('Componente de exportação Word não carregou. Recarregue a página e tente novamente.');return}
const css=`<style>@page{size:A4;margin:1.8cm}body{font-family:Arial,sans-serif;font-size:10.5pt;color:#111;line-height:1.45}.rel-institucional{text-align:center;border-bottom:1px solid #000;padding-bottom:8px;margin-bottom:24px}.rel-orgao{font-weight:bold}.rel-capa{text-align:center;margin:90px 0 70px}.rel-faixa{font-size:15pt;font-weight:bold;background:#e5e7eb;padding:8px;text-align:center}.rel-meta,.rel-quadro{width:100%;border-collapse:collapse;margin:12px 0}.rel-meta th,.rel-meta td,.rel-quadro th,.rel-quadro td{border:1px solid #777;padding:6px;vertical-align:top}.rel-meta th{width:30%;background:#d1d5db}.rel-quadro th{background:#dbe4f0}.rel-subtitulo{font-weight:bold;text-align:center;margin:12px 0 7px}.rel-situacao{font-weight:bold;border:1px solid #777;padding:6px;margin-top:8px}.rel-status-ok{background:#d9ead3}.rel-status-parcial{background:#fff2cc}.rel-status-nao{background:#f4cccc}.rel-status-andamento{background:#cfe2f3}.rel-ficha{margin:15px 0 22px;page-break-inside:avoid}.rel-ficha-titulo{font-weight:bold;background:#fff2cc;border:1px solid #777;padding:6px}.rel-kpis{display:table;width:100%;margin:12px 0}.rel-kpis>div{display:table-cell;border:1px solid #ccc;padding:8px;text-align:center}.rel-kpis span{display:block;font-size:8pt}.rel-kpis b{font-size:14pt}.rel-nota{margin-top:20px;padding:8px;border-left:4px solid #b58900;background:#fff8dc}.rel-pendente{font-style:italic;color:#555}h2{font-size:13pt;background:#fff2cc;padding:5px;margin-top:18px}h3{font-size:11pt;margin-top:14px}</style>`
const html=`<!DOCTYPE html><html><head><meta charset="utf-8">${css}</head><body>${conteudo}</body></html>`
const blob=window.htmlDocx.asBlob(html,{orientation:'portrait',margins:{top:1000,right:900,bottom:1000,left:900}})
const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`RELATORIO_MONITORAMENTO_${new Date().toISOString().slice(0,10)}.docx`;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),1000)
}

/*=========================================================
009 MONITORAMENTO-RELATORIO.JS EXPORTAÇÃO PDF
=========================================================*/
async function gerarPDFMonitoramento(){
const elemento=document.getElementById('previewRelatorio')
if(!elemento||!elemento.innerHTML.trim()){alert('Gere o relatório antes de exportar.');return}
if(typeof window.html2pdf!=='function'){
abrirModoImpressao();alert('O gerador PDF não carregou. Use a opção Imprimir > Salvar como PDF.');return
}
const nome=`RELATORIO_MONITORAMENTO_${new Date().toISOString().slice(0,10)}.pdf`
await window.html2pdf().set({margin:[10,10,12,10],filename:nome,image:{type:'jpeg',quality:.98},html2canvas:{scale:2,useCORS:true,backgroundColor:'#ffffff'},jsPDF:{unit:'mm',format:'a4',orientation:'portrait'},pagebreak:{mode:['css','legacy'],avoid:['.page-break-avoid','.rel-ficha']}}).from(elemento).save()
}

/*=========================================================
010 MONITORAMENTO-RELATORIO.JS IMPRESSÃO
=========================================================*/
function abrirModoImpressao(){
const html=document.getElementById('previewRelatorio')?.innerHTML||''
const conteudo=document.getElementById('conteudoImpressao');const modal=document.getElementById('modalImpressao')
if(conteudo)conteudo.innerHTML=html
if(modal)modal.classList.remove('hidden')
}
function fecharModalImpressao(){document.getElementById('modalImpressao')?.classList.add('hidden')}

/*=========================================================
011 MONITORAMENTO-RELATORIO.JS COMPATIBILIDADE
=========================================================*/
async function gerarPrimeiroMonitoramento(){return gerarQuadroAnaliseItens()}
async function gerarPlanoMonitoramentoWord(){return gerarRelatorioCompleto()}
async function gerarMatrizPlanejamento(){return gerarQuadroAnaliseItens()}
async function gerarMatrizResultados(){return gerarResumoExecutivo()}
async function gerarAnaliseSeparada(){return gerarQuadroAnaliseItens()}
console.log('monitoramento-relatorio.js integrado carregado')
