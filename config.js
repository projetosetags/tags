window.S_URL='https://zvtzbiqfwhggysiuiuxh.supabase.co'

window.S_KEY='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp2dHpiaXFmd2hnZ3lzaXVpdXhoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc1ODYyMjcsImV4cCI6MjA5MzE2MjIyN30.tCnFZv2B6Kmd9KsyZM8CHClZqsq7Nyu-8nxyYVs_ZMQ'

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
