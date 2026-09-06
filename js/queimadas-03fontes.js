/*=========================================================
BOOTSTRAP • 3 FONTES + LINHA DO TEMPO MUNICIPAL
Mantém a versão estável do painel 3 Fontes e carrega o novo
Cadastro Municipal após os scripts principais.
=========================================================*/
(function(){
function carregar(src,id,cb){
if(document.getElementById(id)){if(cb)cb();return}
let s=document.createElement('script')
s.id=id
s.src=src
s.defer=true
if(cb)s.onload=cb
document.head.appendChild(s)
}
carregar('https://cdn.jsdelivr.net/gh/projetosetags/tags@bb2b833bd89dd178362793aa935b2d75d6688e71/js/queimadas-03fontes.js','q3BaseEstavel',function(){
carregar('../js/queimadas-municipios-timeline.js?v=20260906-1','qmtTimeline')
})
})();
