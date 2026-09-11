/*=========================================================
001 TCERO CLIENT + AJUSTES MOBILE
=========================================================*/
const clientTCERO=window.clientPublic

;(function aplicarAjustesMobileSedam(){
if(document.getElementById('sedam-mobile-fix'))return
const style=document.createElement('style')
style.id='sedam-mobile-fix'
style.textContent=`
html,body{width:100%;max-width:100%;touch-action:pan-x pan-y pinch-zoom;-webkit-text-size-adjust:100%}
#dashboard{width:100%!important;max-width:100%!important;margin:0 auto!important}
.tab-view{width:100%!important;max-width:100%!important}
#view-tcero{overflow:visible!important}
#listaTCERO{width:100%!important;max-width:100%!important}
.tcero-scroll{width:100%!important;max-width:100%!important;overflow-x:auto!important;-webkit-overflow-scrolling:touch!important}
@media(max-width:768px){
body{padding:6px!important}
#dashboard{padding:4px!important}
.topo-sedam-modern{position:relative!important;top:auto!important;padding:14px 12px!important;gap:12px!important;flex-direction:column!important;align-items:stretch!important;border-radius:0!important}
.topo-esquerda-sedam{width:100%!important}
.titulo-sedam-modern{font-size:24px!important;line-height:1.12!important;letter-spacing:.2px!important}
.usuario-sedam-modern{font-size:10px!important;line-height:1.45!important;white-space:normal!important}
.topo-direita-sedam{width:100%!important;margin-left:0!important;display:grid!important;grid-template-columns:1fr 1fr!important;gap:8px!important;align-items:stretch!important}
.mini-kpis-sedam{grid-column:1 / -1!important;width:100%!important;margin:0!important;display:grid!important;grid-template-columns:1fr 1fr!important;gap:8px!important}
.mini-kpi-sedam{width:100%!important;min-width:0!important;height:54px!important}
.media-topo-sedam{min-height:54px!important;padding:4px 8px!important}
.btn-topo-sedam,#btn-monitoramento,.topo-direita-sedam>a{width:100%!important;min-width:0!important}
#btn-monitoramento a{width:100%!important}
nav{display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:8px!important;overflow:visible!important;padding:8px 0!important;align-items:stretch!important}
.tab-btn{width:100%!important;min-width:0!important;max-width:none!important;min-height:72px!important;margin:0!important;padding:8px!important}
.tab-btn div:last-child{white-space:normal!important;overflow-wrap:anywhere!important}
#view-dashboard{padding:8px 4px 18px!important}
#view-dashboard>.grid{grid-template-columns:1fr!important}
#view-dashboard .bg-white\\/90{min-width:0!important}
#bandeiraFlutuante{top:430px!important;width:min(76vw,300px)!important;opacity:.20!important}
.tcero-scroll table{min-width:720px!important}
#boxCadastroTCERO{flex-direction:column!important;align-items:stretch!important}
#boxCadastroTCERO>*{width:100%!important;max-width:100%!important}
}
@media(max-width:420px){
.titulo-sedam-modern{font-size:22px!important}
.topo-direita-sedam{grid-template-columns:1fr 1fr!important}
.media-topo-sedam strong{font-size:25px!important}
.tab-btn{min-height:68px!important}
}
`
document.head.appendChild(style)
})()

function tceroPodeEditar(){
const u=String(window.userP?.username||'').toLowerCase().trim()
return ['manoel','vagner','gleidi'].includes(u)
}
function tceroEsc(v){
return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))
}
function tceroErro(lista,error){
console.error('TCERO:',error)
if(lista)lista.innerHTML='<div class="p-3 text-red-700 text-[11px] font-black">Erro ao carregar Perfis TCE-RO. Atualize a página e tente novamente.</div>'
}
/*=========================================================
002 TCERO FUNCTION EDITARTCERO
=========================================================*/
function editarTCERO(id){
let p=(window.perfisTCERO||[]).find(x=>String(x.id)===String(id))
if(!p){alert('Perfil não encontrado');return}
window.editTCEROId=p.id
const campos={tc_nome:p.nome_completo||'',tc_user:p.username||'',tc_senha:p.senha||'',tc_cargo:p.cargo||'',tc_nivel:p.nivel_acesso||4,tc_pdf:p.permissao_pdf?'true':'false'}
Object.entries(campos).forEach(([idCampo,valor])=>{let e=document.getElementById(idCampo);if(e)e.value=valor})
let btn=document.getElementById('btnSalvarTCERO')
if(btn){btn.innerText='ATUALIZAR';btn.classList.remove('bg-blue-600');btn.classList.add('bg-amber-600')}
window.scrollTo({top:0,behavior:'smooth'})
}
/*=========================================================
003 TCERO FUNCTION NOVOTCERO
=========================================================*/
window.novoTCERO=function(){
window.editTCEROId=null
;['tc_nome','tc_user','tc_senha','tc_cargo'].forEach(id=>{let e=document.getElementById(id);if(e)e.value=''})
let nivel=document.getElementById('tc_nivel');if(nivel)nivel.value='4'
let pdf=document.getElementById('tc_pdf');if(pdf)pdf.value='false'
window.scrollTo({top:0,behavior:'smooth'})
}
/*=========================================================
004 TCERO FUNCTION SALVARLINHATCERO
=========================================================*/
window.salvarLinhaTCERO=async function(id){
if(!clientTCERO){alert('Conexão com o banco não inicializada.');return}
let payload={
nome_completo:document.getElementById('nome_'+id)?.value||'',
username:document.getElementById('user_'+id)?.value||'',
cargo:document.getElementById('cargo_'+id)?.value||'',
nivel_acesso:Number(document.getElementById('nivel_'+id)?.value||1)
}
let {error}=await clientTCERO.from('perfistce').update(payload).eq('id',id)
if(error){console.error(error);alert('Erro ao salvar');return}
await carregarTCERO()
}
/*=========================================================
005 TCERO FUNCTION SALVARPERFILTCERO
=========================================================*/
async function salvarPerfilTCERO(){
if(!clientTCERO){alert('Conexão com o banco não inicializada.');return}
let nome=document.getElementById('tc_nome')?.value.trim()||''
let user=document.getElementById('tc_user')?.value.trim().toLowerCase()||''
let senha=document.getElementById('tc_senha')?.value.trim()||''
let cargo=document.getElementById('tc_cargo')?.value.trim()||''
let permissao_pdf=document.getElementById('tc_pdf')?.value==='true'
let nivel=Number(document.getElementById('tc_nivel')?.value||4)
if(!nome||!user){alert('Preencha nome e usuário');return}
let payload={nome_completo:nome,username:user,senha,cargo,nivel_acesso:nivel,permissao_pdf}
let res=window.editTCEROId
?await clientTCERO.from('perfistce').update(payload).eq('id',window.editTCEROId)
:await clientTCERO.from('perfistce').insert(payload)
if(res.error){console.error(res.error);alert('Erro ao salvar');return}
window.editTCEROId=null
window.novoTCERO()
await carregarTCERO()
alert('Registro salvo com sucesso')
}
/*=========================================================
006 TCERO FUNCTION EXCLUIRTCERO
=========================================================*/
async function excluirTCERO(id){
if(!tceroPodeEditar()){alert('Sem permissão');return}
if(!clientTCERO){alert('Conexão com o banco não inicializada.');return}
let p=(window.perfisTCERO||[]).find(x=>String(x.id)===String(id))
if(!p){alert('Perfil não encontrado');return}
let protegidos=['manoel','vagner','gleidi']
if(protegidos.includes(String(p.username||'').toLowerCase())){alert('Este perfil não pode ser excluído');return}
if(!confirm('Excluir perfil '+(p.nome_completo||'')+' ?'))return
let {error}=await clientTCERO.from('perfistce').delete().eq('id',id)
if(error){console.error(error);alert('Erro ao excluir');return}
await carregarTCERO()
alert('Perfil excluído com sucesso')
}
/*=========================================================
007 TCERO FUNCTION ATIVAREDICAOTCERO
=========================================================*/
function ativarEdicaoTCERO(){
if(!tceroPodeEditar()){alert('Sem permissão');return}
window.modoEdicaoTCERO=true
document.querySelectorAll('.campo-editavel-tcero').forEach(e=>{e.disabled=false;e.classList.remove('opacity-70')})
let btnEditar=document.getElementById('btnEditarTCERO');if(btnEditar)btnEditar.classList.add('hidden')
let btnSalvar=document.getElementById('btnSalvarTCERO')
if(btnSalvar){btnSalvar.hidden=false;btnSalvar.style.display='inline-flex';btnSalvar.style.visibility='visible';btnSalvar.style.opacity='1';btnSalvar.classList.remove('hidden')}
document.querySelectorAll('.btn-excluir-tcero').forEach(b=>b.classList.remove('hidden'))
}
/*=========================================================
008 TCERO FUNCTION SALVAREDICAOTCERO
=========================================================*/
async function salvarEdicaoTCERO(){
if(!clientTCERO){alert('Conexão com o banco não inicializada.');return}
for(const l of document.querySelectorAll('.linha-tcero')){
let id=l.dataset.id
let payload={
nome_completo:document.getElementById('nome_'+id)?.value||'',
username:document.getElementById('user_'+id)?.value||'',
cargo:document.getElementById('cargo_'+id)?.value||'',
senha:document.getElementById('senha_'+id)?.value||'',
nivel_acesso:Number(document.getElementById('nivel_'+id)?.value||1),
permissao_pdf:document.getElementById('pdf_'+id)?.value==='SIM'
}
let {error}=await clientTCERO.from('perfistce').update(payload).eq('id',id)
if(error){console.error(error);alert('Erro ao salvar alterações');return}
}
window.modoEdicaoTCERO=false
await carregarTCERO()
alert('Alterações salvas com sucesso')
}
/*=========================================================
009 TCERO FUNCTION CARREGARTCERO
=========================================================*/
async function carregarTCERO(){
let lista=document.getElementById('listaTCERO')
if(!lista)return
lista.innerHTML='<div class="p-3 text-[11px] font-black">Carregando Perfis TCE-RO...</div>'
if(!clientTCERO){tceroErro(lista,new Error('window.clientPublic não inicializado'));return}
try{
let {data,error}=await clientTCERO.from('perfistce').select('*').order('nome_completo',{ascending:true})
if(error){tceroErro(lista,error);return}
window.perfisTCERO=data||[]
let podeEditar=tceroPodeEditar()
let boxCadastro=document.getElementById('boxCadastroTCERO')
if(boxCadastro){
boxCadastro.style.display='flex'
if(!podeEditar)boxCadastro.classList.add('opacity-50','pointer-events-none')
else boxCadastro.classList.remove('opacity-50','pointer-events-none')
}
if(!data||!data.length){lista.innerHTML='<div class="p-3 text-[11px] font-black">Nenhum perfil encontrado.</div>';return}
lista.innerHTML=`
<div class="flex justify-end items-center gap-2 mb-2 flex-wrap">
${podeEditar?'<button id="btnEditarTCERO" onclick="ativarEdicaoTCERO()" class="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-xl text-[9px] font-black shadow flex items-center justify-center min-w-[82px]">EDITAR</button>':''}
${podeEditar?'<button id="btnSalvarTCERO" onclick="salvarEdicaoTCERO()" class="bg-emerald-700 hover:bg-emerald-800 text-white px-3 py-1.5 rounded-xl text-[9px] font-black shadow flex items-center justify-center min-w-[82px] hidden" hidden>SALVAR</button>':''}
</div>
<div class="tcero-scroll rounded-2xl bg-white/60 backdrop-blur-sm shadow-[0_8px_30px_rgba(0,0,0,.06)]">
<table class="w-full min-w-[780px] border-separate border-spacing-y-1 text-[10px]">
<thead><tr class="text-[9px] uppercase font-black text-slate-700 leading-none">
<th class="text-left px-2 py-1.5">Nome</th><th class="text-left px-2 py-1.5">Usuário</th><th class="text-left px-2 py-1.5">Cargo</th><th class="text-left px-2 py-1.5">Senha</th><th class="text-center px-2 py-1.5">Nível</th><th class="text-center px-2 py-1.5">PDF</th><th class="text-center px-2 py-1.5">Ações</th>
</tr></thead><tbody>
${data.map(p=>{
const id=tceroEsc(p.id)
const nivel=Number(p.nivel_acesso)
return `<tr class="linha-tcero bg-white/92 hover:bg-amber-50 transition shadow-[0_4px_18px_rgba(0,0,0,0.05)]" data-id="${id}">
<td class="px-2 py-1 rounded-l-xl"><input id="nome_${id}" value="${tceroEsc(p.nome_completo)}" disabled class="campo-editavel-tcero opacity-70 w-full bg-transparent text-[10px] font-black outline-none border-none"></td>
<td class="px-2 py-1"><input id="user_${id}" value="${tceroEsc(p.username)}" disabled class="campo-editavel-tcero opacity-70 w-full bg-transparent text-[9px] font-bold outline-none border-none text-blue-900"></td>
<td class="px-2 py-1"><input id="cargo_${id}" value="${tceroEsc(p.cargo)}" disabled class="campo-editavel-tcero opacity-70 w-full bg-transparent text-[9px] font-semibold outline-none border-none"></td>
<td class="px-2 py-1"><input id="senha_${id}" value="${tceroEsc(p.senha)}" disabled class="campo-editavel-tcero opacity-70 w-full bg-transparent text-[9px] font-black outline-none border-none text-red-700"></td>
<td class="px-2 py-1 text-center"><select id="nivel_${id}" disabled class="campo-editavel-tcero opacity-70 bg-blue-100 text-blue-700 px-2 py-1 rounded-lg text-[8px] font-black border-none outline-none">
${[1,2,3,4].map(n=>`<option value="${n}" ${nivel===n?'selected':''}>Nível ${n}</option>`).join('')}</select></td>
<td class="px-2 py-1 text-center"><select id="pdf_${id}" ${nivel!==1?'disabled':''} class="campo-editavel-tcero opacity-70 bg-amber-100 text-amber-700 px-2 py-1 rounded-lg text-[8px] font-black border-none outline-none"><option value="SIM" ${p.permissao_pdf?'selected':''}>COM PDF</option><option value="NAO" ${!p.permissao_pdf?'selected':''}>SEM PDF</option></select></td>
<td class="px-2 py-1 text-center rounded-r-xl">${podeEditar&&nivel!==1?`<button onclick="excluirTCERO('${id}')" class="btn-excluir-tcero hidden bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded-lg text-[8px] font-black shadow">EXCLUIR</button>`:''}</td>
</tr>`}).join('')}
</tbody></table></div>`
}catch(error){tceroErro(lista,error)}
}
window.carregarTCERO=carregarTCERO
window.salvarPerfilTCERO=salvarPerfilTCERO
window.editarTCERO=editarTCERO
window.excluirTCERO=excluirTCERO
window.ativarEdicaoTCERO=ativarEdicaoTCERO
window.salvarEdicaoTCERO=salvarEdicaoTCERO
/*=========================================================
010 TCERO FUNCTION SALVARNOVOTCERO
=========================================================*/
window.salvarNovoTCERO=async function(){
if(!clientTCERO){alert('Conexão com o banco não inicializada.');return}
let nome=document.getElementById('tc_nome')?.value||''
let username=document.getElementById('tc_user')?.value||''
let senha=document.getElementById('tc_senha')?.value||''
let cargo=document.getElementById('tc_cargo')?.value||''
let nivel=document.getElementById('tc_nivel')?.value||4
let permissao=document.getElementById('tc_pdf')?.value==='true'
if(!nome||!username){alert('Preencha nome e usuário');return}
let {error}=await clientTCERO.from('perfistce').insert({nome_completo:nome,username:username,senha:senha,cargo:cargo,nivel_acesso:Number(nivel),permissao_pdf:permissao})
if(error){console.error(error);alert('Erro ao inserir');return}
alert('Usuário inserido com sucesso')
await carregarTCERO()
window.novoTCERO()
}
