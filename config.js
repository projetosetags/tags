window.S_URL='https://zvtzbiqfwhggysiuiuxh.supabase.co'

window.S_KEY='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJIUzI1NiIsInJlZiI6Inp2dHpiaXFmd2hnZ3lzaXVpdXhoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc1ODYyMjcsImV4cCI6MjA5MzE2MjIyN30.tCnFZv2B6Kmd9KsyZM8CHFlZqsq7Nyu-8nxyYVs_ZMQ'

/*=========================================================
ROOT INDEX • GARANTIR PAINEL GERAL DE ACESSO
=========================================================*/
;(function garantirPainelGeral(){
const path=location.pathname.replace(/\/+$/,'')
const ehIndexRaiz=/\/tags(?:\/index\.html)?$/i.test(path)
if(!ehIndexRaiz)return

sessionStorage.removeItem('painelAtivo')
localStorage.removeItem('user')
localStorage.removeItem('activeTab')

function mostrarPainelGeral(){
const geral=document.getElementById('painel-geral-acesso')
const login=document.getElementById('login-screen')
const dashboard=document.getElementById('dashboard')

if(geral){
geral.classList.remove('hidden')
geral.style.setProperty('display','flex','important')
geral.style.setProperty('visibility','visible','important')
geral.style.setProperty('opacity','1','important')
geral.style.setProperty('position','fixed','important')
geral.style.setProperty('inset','0','important')
geral.style.setProperty('z-index','999999','important')
}

if(login){
login.classList.add('hidden')
login.style.setProperty('display','none','important')
}

if(dashboard){
dashboard.classList.add('hidden')
dashboard.style.setProperty('display','none','important')
}

document.body.classList.remove('login-bg')
document.body.style.visibility='visible'
}

if(document.readyState==='loading'){
document.addEventListener('DOMContentLoaded',()=>{
mostrarPainelGeral()
setTimeout(mostrarPainelGeral,0)
setTimeout(mostrarPainelGeral,250)
},{once:true})
}else{
mostrarPainelGeral()
setTimeout(mostrarPainelGeral,0)
setTimeout(mostrarPainelGeral,250)
}
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
