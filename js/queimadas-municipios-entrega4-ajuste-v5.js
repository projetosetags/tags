/*=========================================================
350 ENTREGA 4 • AJUSTE VISUAL V5
Remove informações executivas repetidas e mantém cada
indicador em um único ponto da aba Municípios.
=========================================================*/
(function(){
function e4AjustarDuplicidades(){
const root=document.getElementById('e4Root')
if(!root)return
const bloco=document.getElementById('e4PainelSituacao')
if(bloco){
const cards=[...bloco.querySelectorAll(':scope > .e4Card')]
const executivo=cards.find(c=>(c.querySelector('h2')?.textContent||'').includes('Painel Executivo Municipal'))
if(executivo)executivo.remove()
bloco.style.gridTemplateColumns='1fr'
bloco.style.marginTop='12px'
const documental=[...bloco.querySelectorAll(':scope > .e4Card')].find(c=>(c.querySelector('h2')?.textContent||'').includes('Acompanhamento Documental'))
if(documental){
documental.style.width='100%'
documental.style.boxSizing='border-box'
let p=documental.querySelector('p')
if(p)p.textContent='Movimentações únicas registradas na base municipal, sem repetir os indicadores executivos acima.'
}
}
const kpis=root.querySelector('.e4Kpis')
if(kpis)kpis.setAttribute('aria-label','Indicadores executivos municipais')
}
function e4AgendarAjuste(){[80,250,650,1300].forEach(t=>setTimeout(e4AjustarDuplicidades,t))}
const startOriginal=window.e4Start
if(typeof startOriginal==='function'&&!startOriginal.__ajusteV5){
const novo=async function(){const r=await startOriginal.apply(this,arguments);e4AgendarAjuste();return r}
novo.__ajusteV5=true
window.e4Start=novo
}
document.addEventListener('click',e=>{if(e.target?.id==='btnAbaExecutivoMunicipal')e4AgendarAjuste()})
setTimeout(e4AgendarAjuste,1400)
})();
