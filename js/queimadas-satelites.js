const FOCOS_SATELITES={
 NOAA20:{label:'NOAA-20',aliases:['NOAA20','NOAA-20']},
 NOAA21:{label:'NOAA-21',aliases:['NOAA21','NOAA-21']},
 AQUA:{label:'AQUA',aliases:['AQUA','AQUA_M-M','AQUA_M-T']},
 SNPP:{label:'Suomi-NPP (SNPP)',aliases:['SNPP','NPP-375','NPP-375D']},
 TERRA:{label:'TERRA',aliases:['TERRA','TERRA_M-M','TERRA_M-T']},
 GOES19:{label:'GOES-19',aliases:['GOES-19','GOES19']},
 METOPB:{label:'METOP-B',aliases:['METOP-B','METOPB']},
 METOPC:{label:'METOP-C',aliases:['METOP-C','METOPC']}
}
const FOCOS_SATELITE_PADRAO='NOAA20'
function normalizarChaveSatelite(valor){
 return String(valor||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toUpperCase().replace(/[^A-Z0-9]/g,'')
}
function focosSatelite(){
 const seletor=document.getElementById('filtroSateliteFocos')
 let valor=seletor?.value
 if(!valor){try{valor=localStorage.getItem('queimadasSateliteFocos')}catch(_){}}
 return Object.prototype.hasOwnProperty.call(FOCOS_SATELITES,valor)?valor:FOCOS_SATELITE_PADRAO
}
function focosSateliteVariantes(){
 return FOCOS_SATELITES[focosSatelite()]?.aliases||FOCOS_SATELITES[FOCOS_SATELITE_PADRAO].aliases
}
function focosSateliteRotulo(){
 return FOCOS_SATELITES[focosSatelite()]?.label||FOCOS_SATELITES[FOCOS_SATELITE_PADRAO].label
}
function focosRanking(registros){
 const grupos=new Map()
 for(const {municipio} of registros){
  if(municipio)grupos.set(municipio,(grupos.get(municipio)||0)+1)
 }
 return [...grupos].map(([municipio,focos])=>({municipio,focos})).sort((a,b)=>b.focos-a.focos||a.municipio.localeCompare(b.municipio,'pt-BR'))
}
async function recarregarAbaComSatelite(){
 const ativa=[...document.querySelectorAll('.abaQueimadas')].find(a=>!a.classList.contains('hidden'))
 if(ativa?.id==='aba3Fontes'){
  if(typeof q3Carregar==='function')await q3Carregar(true)
  return
 }
 const abas={
  abaExecutivo:'executivo',abaExecutivoMunicipal:'executivomunicipal',abaEstado:'estado',abaMapa:'mapa',
  abaPlanejamento:'planejamento',abaMonitoramento:'monitoramento',abaTempoReal:'temporeal',
  abaRioMadeira:'riomadeira',abaTempoRealMunicipio:'temporealmunicipio',abaAnalise:'analise',
  abaSituacao:'situacao',abaPresidente:'presidente',abaAuditor:'auditor',abaRelatorios:'relatorios'
 }
 const nome=ativa&&abas[ativa.id]
 if(nome&&typeof mostrarAbaQueimadas==='function')await mostrarAbaQueimadas(nome)
}
document.addEventListener('DOMContentLoaded',()=>{
 const seletor=document.getElementById('filtroSateliteFocos')
 if(seletor){
  let salvo=''
  try{salvo=localStorage.getItem('queimadasSateliteFocos')||''}catch(_){}
  seletor.value=Object.prototype.hasOwnProperty.call(FOCOS_SATELITES,salvo)?salvo:FOCOS_SATELITE_PADRAO
  try{localStorage.setItem('queimadasSateliteFocos',seletor.value)}catch(_){}
  seletor.addEventListener('change',async()=>{
   try{localStorage.setItem('queimadasSateliteFocos',seletor.value)}catch(_){}
   seletor.disabled=true
   try{await recarregarAbaComSatelite()}finally{seletor.disabled=false}
  })
 }
 const ano=document.getElementById('anoProdes')
 const saida=document.getElementById('resultadoProdes')
 if(!ano||!saida)return
 async function consultar(){
  const periodo=ano.value
  const campo='ano_'+periodo
  saida.textContent='Consultando o PRODES…'
  try{
   const {data,error}=await client.from('queimadas_prodes').select('municipio,'+campo).limit(1000)
   if(ano.value!==periodo)return
   if(error)throw error
   const linhas=(data||[]).filter(r=>r[campo]!=null&&r[campo]!==''&&Number.isFinite(Number(r[campo])))
   const porMunicipio=new Map(linhas.map(r=>[r.municipio,Number(r[campo])]))
   if(!linhas.length||porMunicipio.size!==linhas.length){
    saida.textContent='O painel não dispõe de uma série anual consolidada para '+periodo+'.'
    return
   }
   const total=[...porMunicipio.values()].reduce((s,v)=>s+v,0)
   saida.textContent=periodo+' · '+total.toLocaleString('pt-BR',{maximumFractionDigits:2})+' ha · '+porMunicipio.size+' municípios com valor informado'+(porMunicipio.size<52?' (cobertura parcial).':'.')
  }catch(error){
   if(ano.value===periodo)saida.textContent='Não foi possível consultar os dados anuais do PRODES.'
  }
 }
 ano.addEventListener('change',consultar)
 consultar()
})
async function focosRankingAno(limite){
 const hoje=formatarDataISOFocos(new Date())
 const {data,error}=await buscarTodosFocosINPE(hoje.slice(0,4)+'-01-01',hoje)
 const ranking=error?[]:focosRanking(data||[])
 return {data:limite?ranking.slice(0,limite):ranking,error}
}
