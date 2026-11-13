import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.112.4";
const CORS={"Access-Control-Allow-Origin":"*","Access-Control-Allow-Headers":"authorization, apikey, content-type, content-profile, accept-profile, x-client-info, prefer","Access-Control-Allow-Methods":"GET,POST,OPTIONS"};
const json=(b:any,s=200)=>new Response(JSON.stringify(b),{status:s,headers:{...CORS,"Content-Type":"application/json; charset=utf-8","Cache-Control":"no-store"}});
const SIPAM_WFS="https://panorama.sipam.gov.br/geoserver/painel_do_fogo/wfs";
const SIPAM_LAYER="painel_do_fogo:tb_evento";
const INPE_API="https://queimadas.dgi.inpe.br/queimadas/mapas/ows";
const PROTEGE_API="https://protege.sedam.ro.gov.br/api/queimadas/focos-latam?scope=ro";
const num=(v:any)=>{if(v===null||v===undefined||v==='')return null;const n=Number(String(v).replace(',','.'));return Number.isFinite(n)?n:null};
const SATELLITE_ALIASES:Record<string,string[]>={NOAA20:["NOAA20","NOAA-20"],NOAA21:["NOAA21","NOAA-21"],AQUA:["AQUA","AQUA_M-M","AQUA_M-T"],SNPP:["SNPP","NPP-375","NPP-375D"],TERRA:["TERRA","TERRA_M-M","TERRA_M-T"],GOES19:["GOES19","GOES-19"],METOPB:["METOPB","METOP-B"],METOPC:["METOPC","METOP-C"]};
function satelliteKey(value:any){const k=String(value||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toUpperCase().replace(/[^A-Z0-9]/g,"");for(const [canonical,aliases] of Object.entries(SATELLITE_ALIASES)){if([canonical,...aliases].some(x=>String(x).toUpperCase().replace(/[^A-Z0-9]/g,"")===k))return canonical}return null}
function selectedSatellite(body:any){const k=satelliteKey(body?.satellite||body?.satelite);return k||"NOAA20"}

const iso=(v:any)=>{if(v==null||v==='')return null;const d=new Date(String(v));return Number.isNaN(d.getTime())?null:d.toISOString()};
const ymd=(v:any)=>{const z=iso(v);return z?z.slice(0,10):null};
const prop=(o:any,ks:string[])=>{for(const k of ks)if(o?.[k]!==undefined&&o?.[k]!==null&&o?.[k]!=="")return o[k];return null};
function addDay(s:string){const d=new Date(`${s}T12:00:00Z`);d.setUTCDate(d.getUTCDate()+1);return d.toISOString().slice(0,10)}
function period(body:any){const now=new Date().toLocaleDateString("en-CA",{timeZone:"America/Porto_Velho"});let start="2026-01-01",end=now;const mode=String(body?.mode||"year");if(mode==="month"){const ym=/^\d{4}-\d{2}$/.test(String(body?.month||""))?String(body.month):now.slice(0,7);start=`${ym}-01`;const d=new Date(`${start}T12:00:00Z`);d.setUTCMonth(d.getUTCMonth()+1);d.setUTCDate(0);end=d.toISOString().slice(0,10);if(end>now)end=now}else if(mode==="custom"){if(/^\d{4}-\d{2}-\d{2}$/.test(String(body?.start||"")))start=String(body.start);if(/^\d{4}-\d{2}-\d{2}$/.test(String(body?.end||"")))end=String(body.end)}if(start>end)[start,end]=[end,start];return{mode,start,end,label:mode==="year"?"ANO 2026":`${start} a ${end}`}}
async function allRows(build:(a:number,b:number)=>Promise<any>,max=30000){const out:any[]=[];for(let from=0;from<max;from+=1000){const r=await build(from,from+999);if(r.error)throw r.error;const lote=r.data||[];out.push(...lote);if(lote.length<1000)break}return out}
function bucket(rows:any[],start:string,end:string,get=(x:any)=>x.data_hora){const span=(new Date(end).getTime()-new Date(start).getTime())/86400000,monthly=span>62,m=new Map<string,number>();for(const x of rows){const d=ymd(get(x));if(!d)continue;const k=monthly?d.slice(0,7):d;m.set(k,(m.get(k)||0)+1)}return[...m].sort((a,b)=>a[0].localeCompare(b[0])).map(([at,count])=>({at,count}))}
function summary(rows:any[],start:string,end:string,method:string,coverage?:any){const valid=rows.filter(x=>x.data_hora);const dates=valid.map(x=>iso(x.data_hora)).filter(Boolean).sort() as string[];const latest=dates.at(-1)||null;return{product:"FOCOS",count_period:valid.length,latest_detection:latest,delay_minutes:latest?Math.max(0,Math.round((Date.now()-new Date(latest).getTime())/60000)):null,satellites:[...new Set(valid.map(x=>x.satelite).filter(Boolean))],evolution:bucket(valid,start,end),rows:valid.slice(-5000),coverage_start:coverage?.start||ymd(dates[0]),coverage_end:coverage?.end||ymd(dates.at(-1)),method,status:"LIVE"}}
function centroid(g:any){if(!g)return{lat:null,lon:null};if(g.type==="Point"&&Array.isArray(g.coordinates))return{lon:num(g.coordinates[0]),lat:num(g.coordinates[1])};const pts:any[]=[];const walk=(x:any)=>{if(Array.isArray(x)&&x.length>=2&&typeof x[0]==="number"&&typeof x[1]==="number")pts.push(x);else if(Array.isArray(x))x.forEach(walk)};walk(g.coordinates);if(!pts.length)return{lat:null,lon:null};return{lon:pts.reduce((a,p)=>a+Number(p[0]),0)/pts.length,lat:pts.reduce((a,p)=>a+Number(p[1]),0)/pts.length}}
function eventDate(p:any){for(const k of ["data_inicio","dt_inicio","inicio","data_primeira_deteccao","first_seen","created_at","data_evento","data"]){const z=iso(p?.[k]);if(z)return z}for(const [k,v] of Object.entries(p||{})){if(/(data|date|dt|inicio|start|primeira)/i.test(k)){const z=iso(v);if(z)return z}}return null}
function eventLast(p:any){for(const k of ["data_fim","dt_fim","fim","data_ultima_deteccao","last_seen","updated_at","data_atualizacao"]){const z=iso(p?.[k]);if(z)return z}return eventDate(p)}
function normEvent(f:any){const p=f?.properties||{},pt=centroid(f?.geometry);return{id:String(prop(p,["id","id_evento","gid"])??f?.id??""),data_hora:eventDate(p),ultima_atualizacao:eventLast(p),latitude:pt.lat,longitude:pt.lon,municipio:prop(p,["municipio","nm_municipio","nome_municipio","mun_nome"]),uf:prop(p,["uf","estado","sigla_uf"]),status_evento:prop(p,["status","situacao","status_evento","ds_status"]),persistencia_dias:num(prop(p,["persistencia_dias","persistencia","duracao_dias","duracao","dias"])),qtd_deteccoes:num(prop(p,["qtd_deteccoes","quantidade_deteccoes","num_deteccoes","n_deteccoes","deteccoes"])),area_km2:num(prop(p,["area_km2","area","area_total_km2","area_total"])),frp_total:num(prop(p,["frp_total","soma_frp","frp","frp_sum","potencia_radiativa"])),raw_keys:Object.keys(p)}}
function isRO(x:any){const uf=String(x.uf||"").toUpperCase();if(uf==="RO"||uf.includes("RONDONIA"))return true;const la=num(x.latitude),lo=num(x.longitude);return la!==null&&lo!==null&&la>=-13.72&&la<=-7.85&&lo>=-66.75&&lo<=-59.65}

async function fetchTimeout(url:string,ms=18000){
  const ctrl=new AbortController();
  const timer=setTimeout(()=>ctrl.abort(),ms);
  try{return await fetch(url,{headers:{Accept:"application/json,text/xml,*/*","User-Agent":"TCE-RO-Monitoramento/2.0"},signal:ctrl.signal})}
  finally{clearTimeout(timer)}
}
function focusDate(p:any){
  for(const k of ["detected_at","data_hora","datahora","datetime","timestamp","acq_datetime","acq_date","data","dt_deteccao","data_deteccao","date","created_at","updated_at"]){
    const z=iso(p?.[k]);if(z)return z;
  }
  for(const[k,v]of Object.entries(p||{})){
    if(/(data|date|time|hora|detect|acq)/i.test(k)){const z=iso(v);if(z)return z}
  }
  return null
}
function normFocus(f:any){
  const p=f?.properties||{},pt=centroid(f?.geometry);
  return{
    id:String(prop(p,["id","gid","source_id","id_foco"])??f?.id??""),
    data_hora:focusDate(p),
    latitude:pt.lat,longitude:pt.lon,
    satelite:prop(p,["satelite","satellite","platform","sensor","satelite_nome"]),
    frp:num(prop(p,["frp","frp_mw","potencia_radiativa","fire_radiative_power"])),
    municipio:prop(p,["municipio","nm_municipio","nome_municipio","mun_nome"]),
    uf:prop(p,["uf","estado","sigla_uf"]),
    raw_keys:Object.keys(p)
  }
}
async function sipamCapabilities(){
  const u=new URL(SIPAM_WFS);
  u.searchParams.set("service","WFS");u.searchParams.set("version","2.0.0");u.searchParams.set("request","GetCapabilities");
  const r=await fetchTimeout(u.toString(),15000);
  if(!r.ok)throw new Error(`Capabilities HTTP ${r.status}`);
  const txt=await r.text();
  const blocks=[...txt.matchAll(/<(?:\w+:)?FeatureType>([\s\S]*?)<\/(?:\w+:)?FeatureType>/gi)].map(m=>m[1]);
  const found=blocks.map(b=>({
    name:(b.match(/<(?:\w+:)?Name>([^<]+)<\/(?:\w+:)?Name>/i)||[])[1]||"",
    title:(b.match(/<(?:\w+:)?Title>([^<]+)<\/(?:\w+:)?Title>/i)||[])[1]||""
  })).filter(x=>x.name);
  const score=(x:any)=>{
    const s=(x.name+" "+x.title).normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase();
    let n=0;if(/foco/.test(s))n+=8;if(/calor/.test(s))n+=7;if(/baixa/.test(s)||/latencia/.test(s))n+=5;if(/beta/.test(s))n+=3;if(/evento/.test(s))n-=10;return n;
  };
  found.sort((a,b)=>score(b)-score(a));
  return found;
}
async function sipamGetFeatures(layer:string,count=12000,timeout=20000){
  const u=new URL(SIPAM_WFS);
  u.searchParams.set("service","WFS");u.searchParams.set("version","2.0.0");u.searchParams.set("request","GetFeature");
  u.searchParams.set("typeNames",layer);u.searchParams.set("outputFormat","application/json");
  u.searchParams.set("srsName","CRS:84");u.searchParams.set("bbox","-66.75,-13.72,-59.65,-7.85,CRS:84");u.searchParams.set("count",String(count));
  const r=await fetchTimeout(u.toString(),timeout);
  if(!r.ok)throw new Error(`GetFeature HTTP ${r.status}`);
  const gj=await r.json();
  return gj?.features||[];
}
function bucketDetections(rows:any[],start:string,end:string){
  const span=(new Date(end).getTime()-new Date(start).getTime())/86400000,monthly=span>62,m=new Map<string,number>();
  for(const x of rows){
    const d=ymd(x.data_hora);if(!d)continue;
    const k=monthly?d.slice(0,7):d;
    m.set(k,(m.get(k)||0)+(num(x.qtd_deteccoes)||0));
  }
  return[...m].sort((a,b)=>a[0].localeCompare(b[0])).map(([at,count])=>({at,count}));
}
async function sipam(start:string,end:string,selected:string){
  let betaError="";
  try{
    const candidates=await sipamCapabilities();
    const beta=candidates.find((x:any)=>{
      const s=(x.name+" "+x.title).normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase();
      return /foco/.test(s)&&!/evento/.test(s);
    });
    if(beta?.name){
      const feats=await sipamGetFeatures(beta.name,12000,20000);
      const all=feats.map(normFocus).filter(isRO);
      const identified=all.filter((x:any)=>satelliteKey(x.satelite));
      if(!identified.length)return{status:"SATELITE_NAO_DISPONIVEL",product:"FOCOS_DE_CALOR_BAIXA_LATENCIA_BETA",product_kind:"FOCOS",count_period:null,event_count:null,detections_aggregated:null,area_ha_total:null,duration_mean_days:null,frp_total:null,active_events:null,latest_detection:null,delay_minutes:null,satellites:[],evolution:[],evolution_detections:[],rows:[],coverage_start:null,coverage_end:null,method:"CENSIPAM/SIPAM • Painel do Fogo • focos de baixa latência (beta)",layer:beta.name,layer_title:beta.title,api:SIPAM_WFS,available_total_ro:all.length,attributes_sample:all[0]?.raw_keys||[],notice:"A camada Beta não identifica individualmente a plataforma para filtrar os focos. O total multissensor foi omitido para não somar satélites."};
      const selectedRows=identified.filter((x:any)=>satelliteKey(x.satelite)===selected);
      const dated=selectedRows.filter((x:any)=>ymd(x.data_hora));
      const rows=dated.filter((x:any)=>{const d=ymd(x.data_hora)!;return d>=start&&d<=end});
      const dates=dated.map((x:any)=>x.data_hora).filter(Boolean).sort() as string[];
      const latest=dates.at(-1)||null;
      return{
        status:rows.length?"LIVE":"SEM_DETECCOES",
        product:"FOCOS_DE_CALOR_BAIXA_LATENCIA_BETA",product_kind:"FOCOS",
        count_period:rows.length,event_count:null,detections_aggregated:null,
        area_ha_total:null,duration_mean_days:null,frp_total:null,active_events:null,
        latest_detection:latest,delay_minutes:latest?Math.max(0,Math.round((Date.now()-new Date(latest).getTime())/60000)):null,
        satellites:[...new Set(rows.map((x:any)=>x.satelite).filter(Boolean))],
        evolution:bucket(rows,start,end),evolution_detections:[],
        rows:rows.slice(-5000),
        coverage_start:ymd(dates[0]),coverage_end:ymd(dates.at(-1)),
        method:"CENSIPAM/SIPAM • Painel do Fogo • focos de baixa latência (beta)",
        layer:beta.name,layer_title:beta.title,api:SIPAM_WFS,
        available_total_ro:all.length,attributes_sample:all[0]?.raw_keys||[],
        notice:"Produto operacional de focos de baixa latência do CENSIPAM. Pode possuir metodologia/sensores distintos do INPE e do PROTEGE."
      };
    }
    betaError="Camada de focos de baixa latência não identificada no GetCapabilities";
  }catch(e){betaError=e instanceof Error?e.name+": "+e.message:String(e)}
  const fallback=(msg:string)=>({status:"DEGRADED",product:"EVENTOS_DE_FOGO",product_kind:"EVENTOS",count_period:null,event_count:null,detections_aggregated:null,area_ha_total:null,duration_mean_days:null,frp_total:null,active_events:null,latest_detection:null,delay_minutes:null,satellites:["Painel do Fogo / múltiplos sensores"],evolution:[],evolution_detections:[],rows:[],coverage_start:null,coverage_end:null,method:"CENSIPAM/SIPAM • Painel do Fogo • tb_evento",layer:SIPAM_LAYER,api:SIPAM_WFS,error:msg,notice:"Focos Beta indisponíveis. O painel tenta exibir os Eventos de Fogo do CENSIPAM como série própria, sem convertê-los em focos."});
  try{
    const feats=await sipamGetFeatures(SIPAM_LAYER,10000,22000);
    const all=feats.map(normEvent).filter(isRO);
    const dated=all.filter((x:any)=>ymd(x.data_hora));
    const rows=dated.filter((x:any)=>{const d=ymd(x.data_hora)!;return d>=start&&d<=end});
    const latest=(all.map((x:any)=>x.ultima_atualizacao||x.data_hora).filter(Boolean).sort() as string[]).at(-1)||null;
    const det=rows.reduce((a:number,x:any)=>a+(num(x.qtd_deteccoes)||0),0);
    const area=rows.reduce((a:number,x:any)=>a+(num(x.area_km2)||0),0);
    const durs=rows.map((x:any)=>num(x.persistencia_dias)).filter((x:any)=>x!==null) as number[];
    const frps=rows.map((x:any)=>num(x.frp_total)).filter((x:any)=>x!==null) as number[];
    return{
      status:rows.length?"LIVE_FALLBACK":"SEM_DETECCOES",
      product:"EVENTOS_DE_FOGO",product_kind:"EVENTOS",
      count_period:rows.length,event_count:rows.length,detections_aggregated:det||null,
      area_ha_total:Number((area*100).toFixed(1)),
      duration_mean_days:durs.length?Number((durs.reduce((a,b)=>a+b,0)/durs.length).toFixed(1)):null,
      frp_total:frps.length?Number(frps.reduce((a,b)=>a+b,0).toFixed(2)):null,
      active_events:rows.filter((x:any)=>/ativ|active|abert|andamento/i.test(String(x.status_evento||""))).length||null,
      latest_detection:latest,delay_minutes:latest?Math.max(0,Math.round((Date.now()-new Date(latest).getTime())/60000)):null,
      satellites:["Painel do Fogo / múltiplos sensores"],
      evolution:bucket(rows,start,end),evolution_detections:bucketDetections(rows,start,end),
      rows:rows.slice(-5000),
      coverage_start:ymd((dated.map((x:any)=>x.data_hora).filter(Boolean).sort() as string[])[0]),
      coverage_end:ymd((dated.map((x:any)=>x.data_hora).filter(Boolean).sort() as string[]).at(-1)),
      method:"CENSIPAM/SIPAM • Painel do Fogo • Eventos de Fogo (fallback)",
      layer:SIPAM_LAYER,api:SIPAM_WFS,available_total_ro:all.length,attributes_sample:all[0]?.raw_keys||[],
      fallback_reason:betaError,
      notice:rows.length
        ?"Eventos de fogo são agrupamentos espaço-temporais e não equivalem 1:1 a focos. A linha do gráfico representa número de eventos; detecções agregadas são mostradas separadamente."
        :"A fonte respondeu, mas não retornou eventos datados no período consultado."
    };
  }catch(e){
    const msg=e instanceof Error?e.name+": "+e.message:String(e);
    return fallback(`Beta: ${betaError||"indisponível"} • Eventos: ${msg}`);
  }
}
Deno.serve(async(req:Request)=>{if(req.method==="OPTIONS")return new Response(null,{status:200,headers:CORS});try{const body=req.method==="POST"?await req.json().catch(()=>({})):{};const p=period(body),satellite=selectedSatellite(body),aliases=SATELLITE_ALIASES[satellite],url=Deno.env.get("SUPABASE_URL")||"",key=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")||"",db=createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}});const inpeP=allRows((a,b)=>db.schema("queimadas").from("queimadas_focos_inpe").select("id,data_hora,data_foco,latitude,longitude,satelite,frp,municipio,uf").eq("uf","RO").in("satelite",aliases).gte("data_foco",p.start).lte("data_foco",p.end).order("data_hora",{ascending:true}).range(a,b));const protP=allRows((a,b)=>db.from("rfc_focos").select("source_id,detected_at,latitude,longitude,satellite,frp,municipality,state").eq("state","RO").in("satellite",aliases).gte("detected_at",`${p.start}T00:00:00-04:00`).lt("detected_at",`${addDay(p.end)}T00:00:00-04:00`).order("detected_at",{ascending:true}).range(a,b));const covP=Promise.all([db.schema("queimadas").from("queimadas_focos_inpe").select("data_foco").eq("uf","RO").order("data_foco",{ascending:true}).limit(1),db.schema("queimadas").from("queimadas_focos_inpe").select("data_foco").eq("uf","RO").order("data_foco",{ascending:false}).limit(1),db.from("rfc_focos").select("detected_at").eq("state","RO").order("detected_at",{ascending:true}).limit(1),db.from("rfc_focos").select("detected_at").eq("state","RO").order("detected_at",{ascending:false}).limit(1)]);const [inpeRowsAll,protRowsAll,covs,sip]=await Promise.all([inpeP,protP,covP,sipam(p.start,p.end,satellite)]);const inpeNorm=inpeRowsAll.map((x:any)=>({...x,data_hora:iso(x.data_hora||x.data_foco)}));const protNorm=protRowsAll.map((x:any)=>({data_hora:iso(x.detected_at),latitude:x.latitude,longitude:x.longitude,satelite:x.satellite,frp:x.frp,municipio:x.municipality,uf:x.state}));const inpe={...summary(inpeNorm,p.start,p.end,"INPE • Programa Queimadas • focos detectados • UF=RO",{start:ymd(covs[0].data?.[0]?.data_foco),end:ymd(covs[1].data?.[0]?.data_foco)}),api:INPE_API};const protege={...summary(protNorm,p.start,p.end,"PROTEGE/SEDAM • base operacional de focos • UF=RO",{start:ymd(covs[2].data?.[0]?.detected_at),end:ymd(covs[3].data?.[0]?.detected_at)}),api:PROTEGE_API};return json({ok:true,scope:"RO",scope_label:"Estado de Rondônia • 52 municípios",selected_satellite:satellite,period:p,generated_at:new Date().toISOString(),sources:{inpe,protege,sipam:sip},methodology:{warning:"INPE/PROTEGE representam focos/detecções; CENSIPAM representa eventos de fogo consolidados."}})}catch(e){return json({ok:false,error:e instanceof Error?e.message:String(e)},500)}});
