window.S_URL='https://zvtzbiqfwhggysiuiuxh.supabase.co'

window.S_KEY='sb_publishable_6rUNIHwItIcgG_HLyTfOxA_bKACJEQt'

/*=========================================================
ROOT INDEX • GARANTIR PAINEL GERAL DE ACESSO
=========================================================*/
;(function resetarEstadoPainelGeral(){
const path=location.pathname.replace(/\/+$/,'')
const ehIndexRaiz=/\/tags(?:\/index\.html)?$/i.test(path)
if(!ehIndexRaiz)return
sessionStorage.removeItem('painelAtivo')
localStorage.removeItem('user')
localStorage.removeItem('activeTab')
})()

window.clientPublic = supabase.createClient(
    window.S_URL,
    window.S_KEY,
    {
        db:{ schema:'public' },
        global:{
            headers:{
                "Accept-Profile":"public",
                "Content-Profile":"public"
            }
        }
    }
)

window.clientQueimadas = supabase.createClient(
    window.S_URL,
    window.S_KEY,
    {
        db:{ schema:'queimadas' },
        global:{
            headers:{
                "Accept-Profile":"queimadas",
                "Content-Profile":"queimadas"
            }
        }
    }
)

/*=========================================================
PAINEL GERAL • LAYOUT COMPACTO MOBILE
=========================================================*/
;(function painelGeralCompacto(){
function montar(){
const path=location.pathname.replace(/\/+$/,'')
if(!/\/tags(?:\/index\.html)?$/i.test(path))return
if(sessionStorage.getItem('painelAtivo')==='sedam')return
const geral=document.getElementById('painel-geral-acesso')
if(!geral)return
const styleId='painel-geral-mobile-style'
document.getElementById(styleId)?.remove()
const style=document.createElement('style')
style.id=styleId
style.textContent=`
#painel-geral-acesso{position:fixed!important;inset:0!important;z-index:999999!important;overflow:auto!important;background:linear-gradient(rgba(7,54,90,.15),rgba(7,54,90,.42)),url('assets/portovelho.png') center/cover no-repeat fixed!important;padding:0!important}
#painel-geral-acesso .painel-geral-overlay{position:absolute!important;inset:0!important;background:rgba(8,66,104,.12)!important;backdrop-filter:blur(5px)!important}
#painel-geral-acesso .painel-geral-conteudo{position:relative!important;z-index:2!important;width:min(1180px,96vw)!important;margin:auto!important;padding:12px!important}
#painel-geral-acesso .painel-geral-titulo{font-size:0!important;text-align:left!important;margin:0 0 2px!important;text-shadow:none!important;color:#fff!important}
#painel-geral-acesso .painel-geral-titulo:before{content:'PROJETO TAGs';font-size:36px!important;font-weight:1000!important;letter-spacing:1px!important;color:#fff!important}
#painel-geral-acesso .painel-geral-subtitulo{font-size:0!important;text-align:left!important;margin:0 0 10px!important;color:#fff!important}
#painel-geral-acesso .painel-geral-subtitulo:before{content:'TCE-RO • ACOMPANHAMENTO E RESULTADOS';font-size:13px!important;font-weight:800!important;letter-spacing:.4px!important}
#painel-geral-acesso .painel-geral-grid{display:grid!important;grid-template-columns:repeat(3,1fr)!important;gap:14px!important;margin-top:8px!important}
#painel-geral-acesso .painel-card{display:grid!important;grid-template-rows:auto 150px 1fr!important;overflow:hidden!important;border-radius:24px!important;background:rgba(255,255,255,.95)!important;box-shadow:0 18px 45px rgba(0,0,0,.20)!important;border:1px solid rgba(255,255,255,.72)!important;cursor:pointer!important;min-width:0!important}
#painel-geral-acesso .painel-card-topo{min-height:58px!important;padding:10px 14px!important;display:flex!important;align-items:center!important;justify-content:space-between!important;background:rgba(255,255,255,.95)!important}
#painel-geral-acesso .painel-logo-texto,#painel-geral-acesso .painel-logo-sepat{font-size:22px!important;font-weight:1000!important;line-height:1!important;color:#0f172a!important}
#painel-geral-acesso .painel-logo-ro,#painel-geral-acesso .painel-logo-sub{font-size:10px!important;line-height:1.15!important;text-align:right!important;color:#334155!important;font-weight:800!important}
#painel-geral-acesso .painel-logo-ro span{font-size:8px!important}
#painel-geral-acesso .painel-logo-fogo{font-size:23px!important}
#painel-geral-acesso .painel-card-img{height:150px!important;min-height:150px!important;overflow:hidden!important;background-size:cover!important;background-position:center!important}
#painel-geral-acesso .painel-img-unificada{width:100%!important;height:100%!important;object-fit:cover!important;display:block!important;border-radius:0!important}
#painel-geral-acesso .painel-img-queimadas{background-image:url('assets/queimadas-card.png')!important}
#painel-geral-acesso .painel-card-base{padding:12px 14px 14px!important;display:flex!important;flex-direction:column!important;gap:9px!important}
#painel-geral-acesso .painel-card-titulo{font-size:22px!important;line-height:1.05!important;font-weight:1000!important;color:#0f172a!important;letter-spacing:-.4px!important}
#painel-geral-acesso .painel-card-btn{height:44px!important;margin:0!important;border-radius:14px!important;padding:0 13px!important;font-size:12px!important;font-weight:1000!important;display:flex!important;align-items:center!important;justify-content:space-between!important;color:#fff!important;border:none!important}
#painel-geral-acesso .painel-card-btn strong{font-size:12px!important}
#painel-geral-acesso .btn-sedam{background:#16a34a!important}
#painel-geral-acesso .btn-sepat{background:#2563eb!important}
#painel-geral-acesso .btn-queimadas{background:#ea580c!important}
@media(max-width:760px){
#painel-geral-acesso{align-items:flex-start!important;overflow-y:auto!important;-webkit-overflow-scrolling:touch!important}
#painel-geral-acesso .painel-geral-conteudo{width:100%!important;max-width:430px!important;margin:0 auto!important;padding:8px 10px 12px!important}
#painel-geral-acesso .painel-geral-titulo:before{font-size:25px!important}
#painel-geral-acesso .painel-geral-subtitulo{margin-bottom:7px!important}
#painel-geral-acesso .painel-geral-subtitulo:before{font-size:10px!important}
#painel-geral-acesso .painel-geral-grid{grid-template-columns:1fr!important;gap:8px!important;margin-top:4px!important}
#painel-geral-acesso .painel-card{grid-template-columns:41% 59%!important;grid-template-rows:auto 1fr!important;min-height:198px!important;border-radius:20px!important}
#painel-geral-acesso .painel-card-topo{grid-column:2!important;grid-row:1!important;min-height:54px!important;padding:8px 11px!important;border-bottom:1px solid rgba(15,23,42,.08)!important}
#painel-geral-acesso .painel-card-img{grid-column:1!important;grid-row:1 / span 2!important;height:198px!important;min-height:198px!important}
#painel-geral-acesso .painel-card-base{grid-column:2!important;grid-row:2!important;padding:8px 11px 10px!important;gap:8px!important;justify-content:center!important}
#painel-geral-acesso .painel-card-titulo{font-size:21px!important;line-height:1.02!important}
#painel-geral-acesso .painel-card-btn{height:42px!important;padding:0 10px!important;border-radius:13px!important}
#painel-geral-acesso .painel-card-btn strong{font-size:11px!important;white-space:nowrap!important}
#painel-geral-acesso .painel-logo-texto,#painel-geral-acesso .painel-logo-sepat{font-size:19px!important}
#painel-geral-acesso .painel-logo-ro,#painel-geral-acesso .painel-logo-sub{font-size:8px!important;max-width:150px!important}
}
@media(max-width:390px){
#painel-geral-acesso .painel-geral-conteudo{padding:6px 8px 10px!important}
#painel-geral-acesso .painel-geral-titulo:before{font-size:23px!important}
#painel-geral-acesso .painel-card{grid-template-columns:39% 61%!important;min-height:188px!important}
#painel-geral-acesso .painel-card-img{height:188px!important;min-height:188px!important}
#painel-geral-acesso .painel-card-titulo{font-size:19px!important}
#painel-geral-acesso .painel-card-btn strong{font-size:10px!important}
}
`
document.head.appendChild(style)
geral.classList.remove('hidden')
geral.style.display='flex'
geral.style.visibility='visible'
geral.style.opacity='1'
const login=document.getElementById('login-screen')
const dashboard=document.getElementById('dashboard')
if(login){login.classList.add('hidden');login.style.display='none'}
if(dashboard){dashboard.classList.add('hidden');dashboard.style.display='none'}
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{montar();setTimeout(montar,250);setTimeout(montar,900)},{once:true})
else{montar();setTimeout(montar,250);setTimeout(montar,900)}
})()

/*=========================================================
SEDAM • ABERTURA GARANTIDA PELO PAINEL GERAL
=========================================================*/
;(function corrigirAberturaSedam(){
function abrirSedamDireto(){
sessionStorage.setItem('painelAtivo','sedam')
localStorage.removeItem('activeTab')
const geral=document.getElementById('painel-geral-acesso')
const login=document.getElementById('login-screen')
const dashboard=document.getElementById('dashboard')
if(geral){
geral.classList.add('hidden')
geral.style.setProperty('display','none','important')
geral.style.visibility='hidden'
geral.style.opacity='0'
}
if(dashboard){
dashboard.classList.add('hidden')
dashboard.style.setProperty('display','none','important')
}
if(login){
login.classList.remove('hidden')
login.style.setProperty('display','flex','important')
login.style.visibility='visible'
login.style.opacity='1'
}
document.body.classList.add('login-bg')
document.body.style.visibility='visible'
}
window.addEventListener('click',function(e){
const alvo=e.target&&e.target.closest?e.target.closest('.painel-card-sedam,.btn-sedam'):null
if(!alvo)return
e.preventDefault()
e.stopImmediatePropagation()
abrirSedamDireto()
},true)
window.abrirPainelSedam=abrirSedamDireto
})()

/*=========================================================
SEPAT • CARREGAR CORREÇÃO DE VIGÊNCIA
=========================================================*/
;(function carregarCorrecaoVigenciaSepat(){
function carregar(){
if(!document.getElementById('app-sepat')&&!/\/sepatindex\.html$/i.test(location.pathname))return
if(document.getElementById('scriptSepatVigencia'))return
let s=document.createElement('script')
s.id='scriptSepatVigencia'
s.src='js/sepat-vigencia.js?v=20260902-3'
s.async=true
document.body.appendChild(s)
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(carregar,0),{once:true})
else setTimeout(carregar,0)
})()

/*=========================================================
MONITORAMENTO • CORRIGIR CONTRASTE DO MENU NO CELULAR
=========================================================*/
;(function corrigirCoresMonitoramentoMobile(){
if(!/\/monitoramento\/monitoramento\.html$/i.test(location.pathname))return
const style=document.createElement('style')
style.id='monitoramento-mobile-color-fix'
style.textContent=`
@media(max-width:900px){
#navMonitoramento{background:#ffffff!important}
#navMonitoramento .nav-btn{background:#eef2f7!important;color:#0f172a!important;border:1px solid #d7dee8!important;box-shadow:0 3px 10px rgba(15,23,42,.06)!important}
#navMonitoramento .nav-btn:hover{background:#e2e8f0!important;color:#0f172a!important}
#navMonitoramento .nav-btn.nav-active{background:linear-gradient(135deg,#2563eb,#1d4ed8)!important;color:#ffffff!important;border-color:#2563eb!important;box-shadow:0 8px 20px rgba(37,99,235,.28)!important}
}
`
document.head.appendChild(style)
})()