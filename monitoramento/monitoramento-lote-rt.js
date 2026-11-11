(() => {
  const chave = 'monitoramento-lote-rt-v1';
  const entrada = document.getElementById('loteRT');
  const aviso = document.getElementById('loteRTAviso');
  if (!entrada || !aviso) return;
  let lote;
  function validar(dados) {
    if (dados?.versao !== 1) throw new Error('Formato do lote inválido.');
    for (const orgao of ['SEDAM', 'SEPAT']) {
      const registros = dados.orgs?.[orgao]?.registros;
      if (!Array.isArray(registros) || !registros.length ||
          registros.some(r => !/^R\d+$/.test(r?.registro)) ||
          new Set(registros.map(r => r.registro)).size !== registros.length) {
        throw new Error('Registros inválidos ou duplicados em ' + orgao + '.');
      }
    }
    return dados;
  }
  function resumo() {
    aviso.textContent = lote
      ? ['SEDAM', 'SEPAT'].map(o => o + ': ' + lote.orgs[o].registros.length + ' registros').join(' · ') + ' · lote neste navegador'
      : 'Importe o lote consolidado para incorporar as referências dos relatórios e das matrizes.';
  }
  try {
    const salvo = localStorage.getItem(chave);
    if (salvo) lote = validar(JSON.parse(salvo));
  } catch (erro) {
    console.warn('Lote documental indisponível:', erro.message);
  }
  resumo();
  entrada.addEventListener('change', async () => {
    try {
      const arquivo = entrada.files[0];
      if (!arquivo) return;
      const novo = validar(JSON.parse(await arquivo.text()));
      localStorage.setItem(chave, JSON.stringify(novo));
      lote = novo;
      resumo();
      await window.gerarRelatorioCompleto();
    } catch (erro) {
      aviso.textContent = 'Não foi possível importar o lote. ' + erro.message;
    } finally {
      entrada.value = '';
    }
  });
  const normalizar = v => String(v ?? '').trim().toUpperCase();
  const codigo = (item, sub) => normalizar(sub).startsWith(normalizar(item) + '.')
    ? normalizar(sub) : normalizar(item) + '.' + normalizar(sub);
  window.mtConciliarLoteRT = function(orgao, itens, pacote) {
    const origem = normalizar(orgao);
    const dados = lote?.orgs?.[origem];
    if (!dados) return {extras: '', mapa: new Map()};
    const porCodigo = new Map();
    for (const item of itens) {
      const fonte = pacote.fonteMap[String(item.deliberacao_id)] || {};
      const chave = codigo(fonte.codigo_item || item.item, fonte.codigo_subitem || item.subitem);
      const grupo = porCodigo.get(chave) || [];
      grupo.push(item);
      porCodigo.set(chave, grupo);
    }
    const mapa = new Map();
    const pendentes = [];
    for (const registro of dados.registros) {
      const encontrados = porCodigo.get(codigo(registro.item, registro.subitem)) || [];
      if (encontrados.length === 1 && !mapa.has(encontrados[0].id)) mapa.set(encontrados[0].id, registro);
      else pendentes.push(registro);
    }
    const extras = `<h2>Conferência da base documental ${mtEsc(origem)}</h2>
      <p>${mapa.size} de ${dados.registros.length} registros conciliados por item e subitem. ${pendentes.length} aguardam conferência de vínculo. ${itens.length-mapa.size} fichas do painel sem correspondência no lote.</p>
      ${pendentes.map(r=>window.mtFichaLoteRT(r,origem)).join('')}`;
    return {extras,mapa};
  };
  window.mtFichaLoteRT = function(registro, orgao) {
    if (!registro) return '';
    const campos = [
      ['Referência', 'referencia'], ['Ação prevista', 'acao'], ['Atividade', 'atividade'],
      ['Responsável', 'responsavel'], ['Produto previsto', 'produto'], ['Prazo', 'prazo'],
      ['Informações e evidências referenciadas', 'evidencia'], ['Análise técnica do lote', 'analise'],
      ['Situação técnica indicada no lote', 'situacao'], ['Documentos ou providências pendentes', 'pendencia'],
      ['Controle do prazo', 'controle']
    ];
    return `<section class="rel-ficha-v2">
      <h3>${mtEsc(orgao)} · ${mtEsc(registro.registro)} · ${mtEsc(registro.subitem)}</h3>
      <table class="rel-meta-v2">${campos.map(([rotulo,campo])=>
        `<tr><th>${rotulo}</th><td>${mtNL(registro[campo])}</td></tr>`
      ).join('')}</table></section>`;
  };
  document.getElementById('consultarLoteRT')?.addEventListener('click', () => {
    const alvo = document.getElementById('previewRelatorio');
    if (!alvo || !lote) return;
    alvo.innerHTML = Object.entries(lote.orgs).map(([orgao,dados]) => {
      const anexos = Object.entries(dados.anexos || {}).map(([nome,linhas]) =>
        `<details><summary>${mtEsc(nome)} (${linhas.length} linhas)</summary><div class="table-responsive"><table class="rel-meta-v2">${linhas.map(linha=>'<tr>'+linha.map(c=>`<td>${mtNL(c ?? '')}</td>`).join('')+'</tr>').join('')}</table></div></details>`
      ).join('');
      return `<article class="relatorio-oficial-v2">${mtCab()}<h2>Base documental ${orgao}</h2>
        <p>${dados.registros.length} registros importados. As referências a PDFs seguem os códigos e páginas informados nas fontes.</p>
        ${anexos}
        <details><summary>Texto do RT de referência</summary>${dados.textoRT.map(p=>`<p>${mtNL(p)}</p>`).join('')}</details>
        <details><summary>Tabelas do RT de referência</summary>${dados.tabelasRT.map(t=>`<table class="rel-meta-v2">${t.map(r=>'<tr>'+r.map(c=>`<td>${mtNL(c)}</td>`).join('')+'</tr>').join('')}</table>`).join('')}</details>
        ${dados.registros.map(r=>window.mtFichaLoteRT(r,orgao)).join('')}</article>`;
    }).join('');
  });
})();
