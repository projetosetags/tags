/*=========================================================
001 MONITORAMENTO-ANALISE-IA.JS RASCUNHO ASSISTIDO
NÃO ALTERA PERCENTUAL OU STATUS ORIGINADOS DOS TAGS.
=========================================================*/
async function gerarAnaliseIA(){
const itemId=window.ITEM_EVIDENCIA_ATUAL
if(!itemId){alert('Selecione um item no painel Evidências.');return}
const[{data:item,error:itemError},{data:evidencias,error:evidError}]=await Promise.all([
client.from('monitoramento_itens').select('*').eq('id',itemId).single(),
client.from('monitoramento_evidencias').select('*').eq('item_id',itemId).order('created_at',{ascending:true})
])
if(itemError||!item){console.error(itemError);return}
if(evidError)console.warn(evidError)
const docs=evidencias||[]
const validas=docs.filter(e=>e.status_validacao==='VALIDADA').length
const pendentes=docs.filter(e=>(e.status_validacao||'PENDENTE')==='PENDENTE').length
const rejeitadas=docs.filter(e=>e.status_validacao==='REJEITADA').length
const percentual=Number(item.percentual||0)
const statusFonte=item.status||'EM ANDAMENTO'
let texto='ANÁLISE TÉCNICA DO MONITORAMENTO\n\n'
texto+=`ITEM: ${item.item||'-'}\nSUBITEM: ${item.subitem||'-'}\nORIGEM: ${item.origem||'-'}\nEXECUÇÃO DECLARADA NO TAG: ${percentual.toFixed(0)}% - ${statusFonte}\n\n`
texto+='AÇÃO / MEDIDA MONITORADA:\n'
texto+=`${item.acao_gestor||item.descricao||'-'}\n\n`
texto+='PRODUTO ESPERADO:\n'
texto+=`${item.produto_esperado||item.produto||'-'}\n\n`
texto+='INFORMAÇÕES PRESTADAS PELO JURISDICIONADO:\n'
texto+=`${item.evidencia||'Não há síntese registrada no painel Evidências.'}\n\n`
texto+='EVIDÊNCIAS DOCUMENTAIS:\n'
if(!docs.length){
texto+='Não há documentos estruturados registrados para este subitem.\n\n'
}else{
docs.forEach((e,n)=>{
texto+=`${n+1}. ${e.tipo_evidencia||'Documento'}${e.numero_documento?` - ${e.numero_documento}`:''}: ${e.descricao||'sem descrição'} [${e.status_validacao||'PENDENTE'}].\n`
})
texto+=`\nSíntese de validação: ${validas} validada(s), ${pendentes} pendente(s) e ${rejeitadas} rejeitada(s).\n\n`
}
texto+='AVALIAÇÃO TÉCNICA:\n'
if(percentual>=100&&validas>0&&pendentes===0&&rejeitadas===0){
texto+='Os registros do TAG indicam execução integral da ação e há evidência documental validada no sistema. A conclusão definitiva deve considerar a suficiência, a adequação, a confiabilidade e a aderência do conteúdo das evidências ao produto pactuado.\n\n'
}else if(percentual>=100){
texto+='Embora o TAG registre 100% de execução, a comprovação documental ainda demanda validação técnica suficiente para sustentar conclusão definitiva sobre o cumprimento integral.\n\n'
}else if(percentual>0){
texto+='Os registros do TAG indicam execução parcial. As evidências devem ser confrontadas com a ação pactuada, o produto esperado e o prazo, de modo a identificar quais parcelas estão efetivamente comprovadas e quais permanecem pendentes.\n\n'
}else{
texto+='Os registros do TAG não indicam avanço de execução. Caso existam documentos recentes ainda não refletidos no TAG, estes devem ser validados antes de qualquer reclassificação técnica.\n\n'
}
texto+='CONCLUSÃO:\n'
texto+='[Registrar a conclusão técnica fundamentada, indicando se a ação está comprovada, parcialmente comprovada, não comprovada ou se necessita de complementação documental.]\n\n'
texto+='ENCAMINHAMENTO:\n'
texto+='[Registrar providências, complementações, prazos ou proposta de encerramento do item.]'
const editor=document.getElementById('textoAnalise')
if(editor)editor.innerText=texto
const situacao=document.getElementById('analiseSituacao')
if(situacao)situacao.value=statusFonte
}

/*=========================================================
002 MONITORAMENTO-ANALISE-IA.JS SALVAR ANÁLISE
=========================================================*/
async function salvarAnalise(){
const itemId=window.ITEM_EVIDENCIA_ATUAL
if(!itemId){alert('Selecione um item no painel Evidências.');return}
const texto=document.getElementById('textoAnalise')?.innerText?.trim()||''
if(!texto){alert('Digite a análise técnica.');return}
const{data:item,error:itemError}=await client.from('monitoramento_itens').select('*').eq('id',itemId).single()
if(itemError||!item){console.error(itemError);return}
const situacao=document.getElementById('analiseSituacao')?.value||item.status||'EM ANDAMENTO'
const impacto=document.getElementById('analiseImpacto')?.value||item.criticidade||'MÉDIA'
const encaminhamento=document.getElementById('analiseEncaminhamento')?.value?.trim()||''
const conclusao=extrairSecaoAnalise(texto,'CONCLUSÃO')||texto
const{error}=await client.from('monitoramento_analises').insert([{
item_id:itemId,
analise_tecnica:texto,
situacao,
impacto,
beneficio:item.beneficio_esperado||'',
encaminhamento,
conclusao,
workflow_status:'RASCUNHO'
}])
if(error){console.error(error);alert('Erro ao salvar a análise.');return}
if(typeof registrarLog==='function')await registrarLog('ANÁLISE TÉCNICA SALVA','monitoramento_analises',itemId)
alert('Análise técnica salva. O percentual do TAG foi preservado.')
await carregarAnalises()
}
function extrairSecaoAnalise(texto,titulo){
const re=new RegExp(`${titulo}:\\s*([\\s\\S]*?)(?:\\n[A-ZÁÉÍÓÚÃÕÇ /-]{3,}:|$)`,'i')
const m=String(texto||'').match(re)
return m?m[1].trim():''
}

/*=========================================================
003 MONITORAMENTO-ANALISE-IA.JS HISTÓRICO
=========================================================*/
async function carregarAnalises(){
const itemId=window.ITEM_EVIDENCIA_ATUAL
const lista=document.getElementById('listaAnalises')
if(!lista||!itemId)return
const{data,error}=await client.from('monitoramento_analises').select('*').eq('item_id',itemId).order('created_at',{ascending:false})
if(error){console.error(error);return}
lista.innerHTML=(data||[]).map(a=>`
<div class="card-analise">
<div class="card-analise-topo"><div><div class="analise-titulo">${a.situacao||'-'}</div><div class="analise-subtitulo">Impacto: ${a.impacto||'-'} • ${a.created_at?new Date(a.created_at).toLocaleString('pt-BR'):'-'}</div></div><span class="badge-status ${typeof getClasseStatus==='function'?getClasseStatus(a.situacao):''}">${a.workflow_status||'RASCUNHO'}</span></div>
<pre class="texto-analise-pre">${a.analise_tecnica||'-'}</pre>
${a.encaminhamento?`<div class="analise-encaminhamento"><b>Encaminhamento:</b> ${a.encaminhamento}</div>`:''}
<div class="analise-actions"><button class="btn-padrao azul" onclick="copiarAnalise(${a.id})">📋 Copiar</button><button class="btn-padrao vermelho" onclick="excluirAnalise(${a.id})">🗑 Excluir</button></div>
</div>`).join('')||'<div class="evidencia-vazia">Nenhuma análise registrada.</div>'
}
async function copiarAnalise(id){
const{data}=await client.from('monitoramento_analises').select('analise_tecnica').eq('id',id).single()
if(data?.analise_tecnica){await navigator.clipboard.writeText(data.analise_tecnica);alert('Análise copiada.')}
}
async function excluirAnalise(id){
if(!confirm('Excluir esta versão da análise?'))return
const{error}=await client.from('monitoramento_analises').delete().eq('id',id)
if(error){console.error(error);alert('Erro ao excluir.');return}
await carregarAnalises()
}

/*=========================================================
004 MONITORAMENTO-ANALISE-IA.JS RESUMO
=========================================================*/
async function gerarResumoIA(){
if(typeof gerarResumoExecutivo==='function')return gerarResumoExecutivo()
}

/*=========================================================
005 MONITORAMENTO-ANALISE-IA.JS EDITOR
=========================================================*/
function formatarTexto(comando){document.execCommand(comando,false,null)}
function inserirTopico(){document.execCommand('insertText',false,'\n• ')}
function inserirConclusaoPadrao(){document.execCommand('insertText',false,'\n\nCONCLUSÃO:\n[Fundamentar a conclusão a partir das evidências validadas e do produto pactuado.]\n')}
