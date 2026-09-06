/*=========================================================
400 MUNICÍPIOS • LINHA DO TEMPO • ORDEM DAS COLUNAS V8
Ordem: OFÍCIO | DILAÇÕES | RESPOSTAS/PLANOS | REITERAÇÕES | COMPLEMENTAÇÕES
=========================================================*/
(function(){
const ORDEM=[0,3,1,2,4]
function reordenarGrupo(parent,inicio){
if(!parent)return
const filhos=[...parent.children]
const bloco=filhos.slice(inicio,inicio+5)
if(bloco.length<5)return
ORDEM.forEach(i=>parent.appendChild(bloco[i]))
}
function ajustar(){
const grid=document.querySelector('#e4Timeline .lt7Grid')
if(!grid)return
const filhos=[...grid.children]
if(filhos.length<6)return
const cab=[...filhos.slice(1,6)]
ORDEM.forEach(i=>grid.appendChild(cab[i]))
for(let linha=0;linha<12;linha++){
const atual=[...grid.children]
const base=6+linha*6
const mes=atual[base]
const cells=atual.slice(base+1,base+6)
if(!mes||cells.length<5)continue
grid.appendChild(mes)
ORDEM.forEach(i=>grid.appendChild(cells[i]))
}
const resumo=document.querySelector('#e4Timeline .lt7Resumo')
if(resumo){const cards=[...resumo.children];if(cards.length>=5)ORDEM.forEach(i=>resumo.appendChild(cards[i]))}
}
function agendar(){[80,220,520,1150].forEach(t=>setTimeout(ajustar,t))}
document.addEventListener('click',e=>{if(e.target?.id==='btnAbaExecutivoMunicipal')agendar()})
const oldV=window.renderLinhaTempoMunicipalVertical
if(typeof oldV==='function')window.renderLinhaTempoMunicipalVertical=async function(){const r=await oldV.apply(this,arguments);agendar();return r}
const oldH=window.renderLinhaTempoMunicipalHorizontal
if(typeof oldH==='function')window.renderLinhaTempoMunicipalHorizontal=async function(){const r=await oldH.apply(this,arguments);agendar();return r}
setTimeout(agendar,2100)
})();
