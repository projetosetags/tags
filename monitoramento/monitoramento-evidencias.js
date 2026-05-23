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

await carregarEvidencias()
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
let query=client.from('monitoramento_itens').select('*').gte('percentual',100).order('item',{ascending:true})
if(origem!=='TODAS'){
query=query.eq('origem',origem)
}
let{data,error}=await query
if(error){
console.log(error)
return
}
data=(data||[]).filter(i=>{
let txt=`${i.item||''} ${i.subitem||''} ${i.produto||''} ${i.descricao||''}`.toLowerCase()
return txt.includes(busca)
})
let html=''
data.forEach(i=>{

let status=i.status||'-'
let classe='badge-andamento'

if(status.includes('EXECUTADA'))classe='badge-executada'
if(status.includes('PARCIAL'))classe='badge-parcial'
if(status.includes('NÃO'))classe='badge-nao'

let mes100=i.mes_100||i.mes_referencia||'-'

html+=`
<div class="linha-evidencia linha-evidencia-item">

<div>
<b>${i.item||'-'}</b>
</div>

<div>
${i.subitem||'-'}
</div>

<div>
${i.produto||i.produto_esperado||'-'}
</div>

<div>
${mes100}
</div>

<div>
<span class="badge-status-evidencia ${classe}">
${status}
</span>
</div>

<div>

<div class="box-evidencias-check">

<label class="item-check-evidencia">
<input type="checkbox" value="OFÍCIO">
OFÍCIO
</label>

<label class="item-check-evidencia">
<input type="checkbox" value="RELATÓRIO">
RELATÓRIO
</label>

<label class="item-check-evidencia">
<input type="checkbox" value="ATA">
ATA
</label>

<label class="item-check-evidencia">
<input type="checkbox" value="SEI">
SEI
</label>

<label class="item-check-evidencia">
<input type="checkbox" value="DESPACHO">
DESPACHO
</label>

<label class="item-check-evidencia">
<input type="checkbox" value="PORTARIA">
PORTARIA
</label>

<label class="item-check-evidencia">
<input type="checkbox" value="PRINT SISTEMA">
PRINT SISTEMA
</label>

<label class="item-check-evidencia">
<input type="checkbox" value="CHECKLIST">
CHECKLIST
</label>

<label class="item-check-evidencia">
<input type="checkbox" value="PARECER">
PARECER
</label>

<label class="item-check-evidencia">
<input type="checkbox" value="MEMORANDO">
MEMORANDO
</label>

<label class="item-check-evidencia">
<input type="checkbox" value="INSPEÇÃO">
INSPEÇÃO
</label>

<label class="item-check-evidencia">
<input type="checkbox" value="FOTO">
FOTO
</label>

</div>

<textarea
id="obsEvidencia_${i.id}"
class="evidencia-textarea"
placeholder="Exemplo: Ofício n. 120/2026/GAB/SEDAM; Processo SEI 0000.123456/2026-10; Relatório técnico da Coordenadoria X; Ata reunião 15-05-2026..."
></textarea>

</div>

<div>
<button
class="btn-salvar-evidencia"
onclick="salvarEvidenciaLancada(${i.id},this)">
💾 SALVAR
</button>
</div>

</div>
`
})
if(!html){
html=`
<div style="padding:30px;color:#fff;font-weight:700;">
Nenhum subitem atingiu 100% até o momento.
</div>
`
}
box.innerHTML=html
}
/*=========================================================
052 MONITORAMENTO-EVIDENCIAS.JS FUNCTION SALVAREVIDENCIALANCADA
=========================================================*/
async function salvarEvidenciaLancada(itemId,btn){

try{

let linha=btn.closest('.linha-evidencia-item')

let checks=[...linha.querySelectorAll('input[type="checkbox"]:checked')]
.map(c=>c.value)
.join('; ')

let observacoes=linha.querySelector('.evidencia-textarea')?.value||''

let{data:item,error:itemError}=await client
.from('monitoramento_itens')
.select('*')
.eq('id',itemId)
.single()

if(itemError||!item){
console.log(itemError)
alert('Item não encontrado')
return
}

let payload={
item_id:Number(item.id),
origem:item.origem||'',
item:String(item.item||''),
subitem:String(item.subitem||''),
produto:item.produto||item.produto_esperado||'',
status:item.status||'',
percentual:Number(item.percentual||0),
mes_100:item.mes_100||item.mes_referencia||'',
evidencias:checks,
descricao:observacoes,
observacoes:observacoes
}

console.log(payload)

let{error}=await client
.from('monitoramento_evidencias_lancadas')
.upsert(payload)

if(error){
console.log(error)
alert('Erro ao salvar evidência')
return
}

btn.innerHTML='✅ SALVO'
btn.style.background='#166534'

setTimeout(()=>{
btn.innerHTML='💾 SALVAR'
btn.style.background='#16a34a'
},2000)

}catch(e){
console.log(e)
alert('Erro inesperado ao salvar')
}

}
