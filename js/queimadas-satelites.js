function focosSatelite(){
 const valor=document.getElementById('filtroSateliteFocos')?.value
 return ['AQUA','NOAA20','NOAA21','SNPP'].includes(valor)?valor:'AQUA'
}
function focosRanking(registros){
 const grupos=new Map()
 for(const {municipio} of registros){
  if(municipio)grupos.set(municipio,(grupos.get(municipio)||0)+1)
 }
 return [...grupos].map(([municipio,focos])=>({municipio,focos})).sort((a,b)=>b.focos-a.focos||a.municipio.localeCompare(b.municipio,'pt-BR'))
}
document.addEventListener('DOMContentLoaded',()=>{
 const seletor=document.getElementById('filtroSateliteFocos')
 seletor?.addEventListener('change',async ()=>{
  seletor.disabled=true
  try{
   await Promise.all([carregarKPIsExecutivos(),carregarFocosPeriodo(),renderAlertas()])
  }finally{
   seletor.disabled=false
  }
 })
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
