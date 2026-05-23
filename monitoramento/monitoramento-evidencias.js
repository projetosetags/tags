window.ITEM_EVIDENCIA_ATUAL=null

async function uploadEvidencia(){

if(!ITEM_EVIDENCIA_ATUAL){
alert('Selecione um item')
return
}

let file=document.getElementById('arquivoEvidencia').files[0]

if(!file){
alert('Selecione um arquivo')
return
}

let tipo=prompt('Tipo da Evidência')
if(tipo===null)return

let numero=prompt('Número do Documento')
if(numero===null)return

let orgao=prompt('Órgão')
if(orgao===null)return

let descricao=prompt('Descrição')
if(descricao===null)return

let confiabilidade=prompt('Confiabilidade: ALTA/MÉDIA/BAIXA')
if(confiabilidade===null)return

let status='PENDENTE'

let nomeArquivo=
Date.now()+
'_'+
file.name
.replaceAll(' ','_')

let caminho=
ITEM_EVIDENCIA_ATUAL+
'/'+
nomeArquivo

let{error:uploadError}=await client
.storage
.from('monitoramento-evidencias')
.upload(caminho,file)

if(uploadError){
console.log(uploadError)
alert('Erro upload')
return
}

let{data:urlData}=client
.storage
.from('monitoramento-evidencias')
.getPublicUrl(caminho)

let link=urlData.publicUrl

let{error}=await client
.from('monitoramento_evidencias')
.insert([{
item_id:ITEM_EVIDENCIA_ATUAL,
tipo_evidencia:tipo,
numero_documento:numero,
descricao:descricao,
orgao:orgao,
link_arquivo:link,
status_validacao:status,
confiabilidade:confiabilidade,
data_documento:new Date().toISOString().slice(0,10)
}])

if(error){
console.log(error)
alert('Erro banco')
return
}

document.getElementById('arquivoEvidencia').value=''
await client
.from('monitoramento_itens')
.update({
evidencia_upload:true
})
.eq('id',ITEM_EVIDENCIA_ATUAL)
await carregarEvidencias()
await renderPainelEvidencias()
await registrarLog(
'UPLOAD EVIDÊNCIA',
'monitoramento_evidencias',
ITEM_EVIDENCIA_ATUAL
)

}

async function carregarEvidencias(){

if(!ITEM_EVIDENCIA_ATUAL)return

let{data,error}=await client
.from('monitoramento_evidencias')
.select('*')
.eq('item_id',ITEM_EVIDENCIA_ATUAL)
.order('id',{ascending:false})

if(error){
console.log(error)
return
}

let html=''

;(data||[]).forEach(e=>{

html+=`
<div class="card-evidencia">

<div class="card-evidencia-topo">

<div>
<div class="evidencia-titulo">
${e.tipo_evidencia||'-'}
</div>

<div class="evidencia-subtitulo">
${e.numero_documento||'-'} • ${e.orgao||'-'}
</div>
</div>

<div class="badge-status ${getClasseValidacao(e.status_validacao)}">
${e.status_validacao||'-'}
</div>

</div>

<div class="evidencia-descricao">
${e.descricao||'-'}
</div>

<div class="evidencia-grid">

<div>
<b>Confiabilidade:</b>
${e.confiabilidade||'-'}
</div>

<div>
<b>Data:</b>
${formatarData(e.data_documento)}
</div>

</div>

<div class="evidencia-actions">

<a href="${e.link_arquivo}" target="_blank" class="btn-link">
📎 Abrir Arquivo
</a>

<button class="btn-padrao azul" onclick="validarEvidencia(${e.id})">
✔ Validar
</button>

<button class="btn-padrao amarelo" onclick="editarEvidencia(${e.id})">
✏ Editar
</button>

<button class="btn-padrao vermelho" onclick="excluirEvidencia(${e.id})">
🗑 Excluir
</button>

</div>

</div>
`

})

document.getElementById('listaEvidencias').innerHTML=html

}

function getClasseValidacao(s){

if(s==='VALIDADA')return'verde'
if(s==='PENDENTE')return'amarelo'
if(s==='REJEITADA')return'vermelho'

return'azul'

}

async function validarEvidencia(id){

let{error}=await client
.from('monitoramento_evidencias')
.update({
status_validacao:'VALIDADA'
})
.eq('id',id)

if(error){
console.log(error)
return
}

await carregarEvidencias()

}



async function registrarLog(
acao,
tabela,
registro
){

try{

await client
.from('monitoramento_logs')
.insert([{
usuario:
USER_MONITORAMENTO?.nome||
USER_MONITORAMENTO?.username||
'AUDITOR',
acao:acao,
tabela:tabela,
registro_id:registro,
monitoramento_id:MONITORAMENTO_ATUAL||null,
origem:
USER_MONITORAMENTO?.origem||'-',
nivel:
USER_MONITORAMENTO?.nivel||4,
dados:{
data:new Date().toISOString()
}
}])

}catch(e){

console.log(e)

}

}
async function editarEvidencia(id){
let{data,error}=await client.from('monitoramento_evidencias').select('*').eq('id',id).single()
if(error||!data){
console.log(error)
return
}
let descricao=prompt('Descrição',data.descricao||'')
if(descricao===null)return
let confiabilidade=prompt('Confiabilidade: ALTA, MÉDIA ou BAIXA',data.confiabilidade||'MÉDIA')
if(confiabilidade===null)return
let status=prompt('Status: VALIDADA, PENDENTE ou REJEITADA',data.status_validacao||'PENDENTE')
if(status===null)return
let payload={
descricao:descricao,
confiabilidade:confiabilidade.toUpperCase(),
status_validacao:status.toUpperCase()
}
let{error:updateError}=await client.from('monitoramento_evidencias').update(payload).eq('id',id)
if(updateError){
console.log(updateError)
alert('Erro ao editar')
return
}
await registrarLog('EDIÇÃO EVIDÊNCIA','monitoramento_evidencias',id)
await carregarCentralEvidencias()
alert('Evidência atualizada')
}

async function excluirEvidencia(id){
let ok=confirm('Excluir evidência?')
if(!ok)return
let{error}=await client.from('monitoramento_evidencias').delete().eq('id',id)
if(error){
console.log(error)
alert('Erro ao excluir')
return
}
await registrarLog('EXCLUSÃO EVIDÊNCIA','monitoramento_evidencias',id)
await carregarCentralEvidencias()
alert('Evidência removida')
}
/*=========================================================
046 MONITORAMENTO-EVIDENCIAS.JS FUNCTION RENDERPAINELEVIDENCIAS
=========================================================*/
async function renderPainelEvidencias(){

let box=document.getElementById('painelEvidenciasItens')

if(!box)return

box.innerHTML=''

let busca=(document.getElementById('buscaEvidencia')?.value||'').toLowerCase()

let origem=document.getElementById('filtroOrigemEvidencia')?.value||'TODAS'

let query=client
.from('monitoramento_itens')
.select('*')
.gte('percentual',100)
.order('item',{ascending:true})

if(origem!=='TODAS'){
query=query.eq('origem',origem)
}

let{data,error}=await query

if(error){
console.log(error)
return
}

data=(data||[]).filter(i=>{

let txt=`
${i.item||''}
${i.subitem||''}
${i.produto||''}
${i.descricao||''}
`.toLowerCase()

return txt.includes(busca)

})

let html=''

data.forEach(i=>{

let status=i.status||'-'

let classe='badge-andamento'

if(status.includes('EXECUTADA')){
classe='badge-executada'
}

if(status.includes('PARCIAL')){
classe='badge-parcial'
}

if(status.includes('NÃO')){
classe='badge-nao'
}

let mes100=i.mes_100||i.mes_referencia||'-'

let possuiEvidencia=
i.evidencia&&
String(i.evidencia).trim()!==''

let checks=i.evidencias_check||[]
let totalChecks=
checks.length+
(possuiEvidencia?1:0)+
(i.evidencia_upload?1:0)
let classeBorda='card-evidencia-pendente'

if(i.evidencia_status==='PARCIAL'){
classeBorda='card-evidencia-parcial'
}

if(i.evidencia_status==='COMPLETA'){
classeBorda='card-evidencia-completa'
}

html+=`
<div class="linha-evidencia linha-evidencia-item ${classeBorda}" data-evidencia-item="${i.id}">

<div>
<b>${i.item||'-'}</b>
</div>

<div>
${i.subitem||'-'}
</div>

<div style="
font-size:11px;
line-height:1.35;
white-space:normal;
word-break:break-word;
">
${i.produto||i.produto_esperado||'-'}
</div>

<div>
${mes100}
</div>

<div>

<span class="badge-status-evidencia ${classe}">
${status}
</span>

<div style="
margin-top:6px;
font-size:10px;
font-weight:800;
color:#111;
">
📎 ${totalChecks} evidências
</div>

</div>

<div>

<div class="box-evidencias-check">

<label class="item-check-evidencia">
<input
type="checkbox"
value="OFÍCIO"
${checks.includes('OFÍCIO')?'checked':''}>
OFÍCIO
</label>

<label class="item-check-evidencia">
<input
type="checkbox"
value="RELATÓRIO"
${checks.includes('RELATÓRIO')?'checked':''}>
RELATÓRIO
</label>

<label class="item-check-evidencia">
<input
type="checkbox"
value="ATA"
${checks.includes('ATA')?'checked':''}>
ATA
</label>

<label class="item-check-evidencia">
<input
type="checkbox"
value="SEI"
${checks.includes('SEI')?'checked':''}>
SEI
</label>

<label class="item-check-evidencia">
<input
type="checkbox"
value="DESPACHO"
${checks.includes('DESPACHO')?'checked':''}>
DESPACHO
</label>

<label class="item-check-evidencia">
<input
type="checkbox"
value="PORTARIA"
${checks.includes('PORTARIA')?'checked':''}>
PORTARIA
</label>

<label class="item-check-evidencia">
<input
type="checkbox"
value="PRINT SISTEMA"
${checks.includes('PRINT SISTEMA')?'checked':''}>
PRINT SISTEMA
</label>

<label class="item-check-evidencia">
<input
type="checkbox"
value="CHECKLIST"
${checks.includes('CHECKLIST')?'checked':''}>
CHECKLIST
</label>

<label class="item-check-evidencia">
<input
type="checkbox"
value="PARECER"
${checks.includes('PARECER')?'checked':''}>
PARECER
</label>

<label class="item-check-evidencia">
<input
type="checkbox"
value="MEMORANDO"
${checks.includes('MEMORANDO')?'checked':''}>
MEMORANDO
</label>

<label class="item-check-evidencia">
<input
type="checkbox"
value="INSPEÇÃO"
${checks.includes('INSPEÇÃO')?'checked':''}>
INSPEÇÃO
</label>

<label class="item-check-evidencia">
<input
type="checkbox"
value="FOTO"
${checks.includes('FOTO')?'checked':''}>
FOTO
</label>

</div>

${!i.evidencia_upload?`
<div class="alerta-upload">
📎 Fazer Upload PDF/IMG
</div>
`:''}

<textarea
id="obsEvidencia_${i.id}"
class="evidencia-textarea"
placeholder="Exemplo: Ofício n. 120/2026/GAB/SEDAM; Processo SEI 0000.123456/2026-10; Relatório técnico da Coordenadoria X; Ata reunião 15-05-2026..."
>${i.evidencia||''}</textarea>

${i.evidencia_resumo_ia?`
<div class="box-resumo-ia">
<div class="titulo-resumo-ia">
🧠 Resumo IA
</div>
<div class="texto-resumo-ia">
${i.evidencia_resumo_ia}
</div>
</div>
`:''}

<div style="
display:flex;
gap:8px;
flex-wrap:wrap;
margin-top:10px;
">

<button
class="btn-salvar-evidencia ${possuiEvidencia?'btn-evidencia-ok':''}"
onclick="salvarEvidenciaLancada(${i.id},this)">
${possuiEvidencia?'✔ SALVO':'💾 SALVAR'}
</button>

<button
class="btn-padrao azul"
onclick="gerarPDFItem(${i.id})">
📄 PDF
</button>

<button
class="btn-padrao roxo"
onclick="gerarResumoIA(${i.id})">
🧠 IA
</button>
<button
class="btn-padrao verde"
onclick="abrirModalUpload(${i.id})">
📎 Upload
</button>
</div>

</div>

<div style="
font-size:10px;
line-height:1.4;
color:#222;
">

<div>
<b>Usuário:</b>
${i.evidencia_usuario||'-'}
</div>

<div>
<b>Data:</b>
${i.evidencia_data
?new Date(i.evidencia_data)
.toLocaleString('pt-BR')
:'-'}
</div>

<div style="
margin-top:8px;
font-weight:800;
color:${
i.evidencia_status==='COMPLETA'
?'#15803d'
:
i.evidencia_status==='PARCIAL'
?'#b45309'
:'#b91c1c'
};
">
${i.evidencia_status||'PENDENTE'}
</div>

</div>

</div>
`

})

if(!html){

html=`
<div style="
padding:30px;
color:#fff;
font-weight:700;
">
Nenhum subitem atingiu 100% até o momento.
</div>
`

}

box.innerHTML=html

}
async function salvarEvidenciaLancada(id,btn){

let texto=document
.getElementById(`obsEvidencia_${id}`)
?.value||''

let linha=document.querySelector(
`[data-evidencia-item="${id}"]`
)

let checks=[]

if(linha){

linha
.querySelectorAll('input[type="checkbox"]:checked')
.forEach(c=>{
checks.push(c.value)
})

}

let status='PENDENTE'

if(texto.trim()!==''&&checks.length>=3){
status='COMPLETA'
}else if(texto.trim()!==''||checks.length>0){
status='PARCIAL'
}

btn.disabled=true
btn.innerHTML='SALVANDO...'

let payload={

evidencia:texto,
evidencias_check:checks,
evidencia_usuario:
USER_MONITORAMENTO?.username||'-',

evidencia_data:new Date(),

evidencia_status:status

}

let{error}=await client
.from('monitoramento_itens')
.update(payload)
.eq('id',id)

if(error){
console.log(error)
alert('Erro ao salvar')
btn.disabled=false
return
}

await registrarLog(
'EVIDÊNCIA LANÇADA',
'monitoramento_itens',
id
)
btn.classList.add('btn-evidencia-ok')
btn.innerHTML='✔ SALVO'
btn.disabled=false
if(typeof atualizarCardDashboard==='function'){
atualizarCardDashboard(id,status)
}
}
/*=========================================================
071 MONITORAMENTO-EVIDENCIAS.JS DEBUG GLOBAL
LOCAL: FINAL DO ARQUIVO
AÇÃO: ADICIONAR
=========================================================*/
window.addEventListener('error',e=>{
console.log('ERRO GLOBAL:',e.message)
})
/*=========================================================
072 MONITORAMENTO-EVIDENCIAS.JS PDF ITEM
=========================================================*/
async function gerarPDFItem(id){

let{jsPDF}=window.jspdf

let doc=new jsPDF()

let{data,error}=await client
.from('monitoramento_itens')
.select('*')
.eq('id',id)
.single()

if(error||!data){
console.log(error)
return
}

doc.setFontSize(16)

doc.text(
`ITEM ${data.item||'-'}`,
14,
20
)

doc.setFontSize(12)

doc.text(
`SUBITEM: ${data.subitem||'-'}`,
14,
32
)

doc.text(
`STATUS: ${data.status||'-'}`,
14,
42
)

doc.text(
`EVIDÊNCIA:`,
14,
56
)

let texto=
doc.splitTextToSize(
data.evidencia||'-',
180
)

doc.text(
texto,
14,
66
)

doc.save(
`ITEM_${data.item||'MONITORAMENTO'}.pdf`
)

}
/*=========================================================
073 MONITORAMENTO-EVIDENCIAS.JS IA RESUMO
=========================================================*/
async function gerarResumoIA(id){

let{data,error}=await client
.from('monitoramento_itens')
.select('*')
.eq('id',id)
.single()

if(error||!data){
console.log(error)
return
}

let texto=data.evidencia||''

if(!texto.trim()){
alert('Sem evidência para resumir')
return
}

let resumo=
texto
.split('.')
.slice(0,3)
.join('.')
.trim()+'.'

let{error:updateError}=await client
.from('monitoramento_itens')
.update({
evidencia_resumo_ia:resumo
})
.eq('id',id)

if(updateError){
console.log(updateError)
return
}

await registrarLog(
'IA RESUMO EVIDÊNCIA',
'monitoramento_itens',
id
)

await renderPainelEvidencias()

alert('Resumo IA gerado')

}

function abrirModalUpload(itemId){

ITEM_EVIDENCIA_ATUAL=itemId

document
.getElementById('modalUploadEvidencia')
.classList.remove('hidden')

carregarEvidencias()

}

function fecharModalUpload(){

document
.getElementById('modalUploadEvidencia')
.classList.add('hidden')

}
/*=========================================================
074 MONITORAMENTO-EVIDENCIAS.JS MODAL EVIDENCIAS
=========================================================*/
function abrirModalEvidencia(itemId){

ITEM_EVIDENCIA_ATUAL=itemId

let modal=document.getElementById('modalUploadEvidencia')

if(modal){
modal.classList.remove('hidden')
}

carregarEvidencias()

}

function fecharModalEvidencia(){

let modal=document.getElementById('modalUploadEvidencia')

if(modal){
modal.classList.add('hidden')
}

}

/*=========================================================
075 MONITORAMENTO-EVIDENCIAS.JS AUTO PERSIST CHECKBOX
=========================================================*/
async function persistirChecksAutomatico(id){

let linha=document.querySelector(
`[data-evidencia-item="${id}"]`
)

if(!linha)return

let checks=[]

linha
.querySelectorAll('input[type="checkbox"]:checked')
.forEach(c=>{
checks.push(c.value)
})

let status='PENDENTE'

if(checks.length>0){
status='PARCIAL'
}

if(checks.length>=5){
status='COMPLETA'
}

let payload={
evidencias_check:checks,
evidencia_status:status,
evidencia_usuario:
USER_MONITORAMENTO?.username||'-',
evidencia_data:new Date()
}

let{error}=await client
.from('monitoramento_itens')
.update(payload)
.eq('id',id)

if(error){
console.log(error)
return
}

}

/*=========================================================
076 MONITORAMENTO-EVIDENCIAS.JS EVENTOS CHECKBOX
=========================================================*/
document.addEventListener('change',async e=>{

if(
e.target.matches(
'.box-evidencias-check input[type="checkbox"]'
)
){

let linha=e.target.closest(
'[data-evidencia-item]'
)

if(!linha)return

let id=linha.dataset.evidenciaItem

await persistirChecksAutomatico(id)

}

})
