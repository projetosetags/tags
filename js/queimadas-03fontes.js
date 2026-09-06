/*=========================================================
BOOTSTRAP • 3 FONTES + CADASTRO MUNICIPAL
Mantém a versão estável do painel 3 Fontes e carrega o
Cadastro Municipal e o layout em colunas após os scripts principais.
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
carregar('../js/queimadas-municipios-timeline.js?v=20260906-2','qmtTimeline',function(){
carregar('../js/queimadas-municipios-layout-v2.js?v=20260906-3','qmtLayoutV2')
})
})
})();
