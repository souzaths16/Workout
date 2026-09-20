export const t = {
  tabs: { hoje: 'Hoje', semana: 'Semana', progresso: 'Progresso', barra: 'Barra fixa', corpo: 'Corpo', ajustes: 'Ajustes' },
  hoje: {
    restDay: 'Dia de descanso', rowDay: 'Remo leve', rowHint: '20–30 min em ritmo de conversa. Opcional.', logRow: 'Registrar remo', minutes: 'minutos',
    start: 'Começar treino', finish: 'Concluir treino', discard: 'Descartar', sore: 'Estou dolorida', light: 'Semana leve', lightOn: 'Semana leve ativa',
    warmup: 'Aquecimento', warmupRow: 'Remo leve 3 min', warmupRamp: 'Séries de aproximação no primeiro exercício: 50% e 75% da carga',
    cooldown: 'Alongamento (mobilidade)', stretchNote: 'Alongar depois do treino não reduz a dor muscular (Cochrane 2011). Está aqui por mobilidade, porque você pediu.',
    set: 'Série', load: 'kg', reps: 'reps', rir: 'RIR', amrap: 'MÁX', calibration: 'Calibração', buy: 'Comprar peso', pain: 'Dor no joelho (0–10)',
    paired: 'pareado com', rest: 'Descanso', clock: 'Sessão', over: 'acima do limite', doneToday: 'Treino concluído', alreadyDone: 'Você já concluiu o treino de hoje.',
    noWeek: 'Semana não gerada', hold: 'seg', seconds: 's', assist: 'banda', noAssist: 'sem banda', noBand: 'sem banda', topUp: '+ banda', bandKg: 'banda (kg)',
    trainInstead: 'Treinar hoje', chooseTitle: 'Qual treino você quer fazer hoje?', chooseHint: 'O dia escolhido vira descanso/remo no lugar de hoje. O total de séries da semana não muda.', chooseNone: 'Nenhum outro dia de treino disponível esta semana.'
  },
  semana: { title: 'Semana', recovery: 'Recuperação', sets: 'séries', swapped: 'trocado', done: 'feito', planned: 'planejado', skipped: 'pulado', total: 'Total de séries na semana', rule: 'Cada grupo tem ≥48 h entre sessões.' },
  progresso: { title: 'Progresso', volume: 'Séries por grupo muscular por semana', e1rm: '1RM estimado (Epley)', pullup: 'Barra fixa: estágio e repetições estritas', adherence: 'Adesão (treinos feitos / planejados)', body: 'Peso corporal e circunferência do braço', empty: 'Ainda sem dados.' },
  barra: { title: 'Escada da barra fixa', stage: 'Estágio', criteria: 'Avança após 2 sessões seguidas com todas as séries no alvo e ≤1 de reserva.', nextTest: 'Próximo teste', logTest: 'Registrar teste de repetições estritas', tests: 'Testes', setStage: 'Ajustar estágio manualmente' },
  corpo: { title: 'Corpo', weight: 'Peso (kg)', armL: 'Braço esquerdo (cm)', armR: 'Braço direito (cm)', save: 'Salvar', hint: 'Meça 1× por semana, mesmo dia e horário, braço relaxado no ponto mais largo.',
    importCsv: 'Importar CSV', importHint: 'De um export do Apple Health (Atalhos → Encontrar Amostras de Saúde → Peso) ou outro app: CSV com colunas "date" e "weight" (ou "data"/"peso").' },
  ajustes: { title: 'Ajustes', inventory: 'Meus pesos', plates: 'Anilhas (kg × quantidade)', handle: 'Peso do cabo (kg)', handles: 'Cabos', kettlebells: 'Kettlebells (kg)', bands: 'Bandas', belt: 'Cinto de mergulho', adjustable: 'Halteres ajustáveis (min–max, passo)', add: 'Adicionar', remove: 'Remover',
    weekMode: 'Formato da semana', mode6: '6 dias × 45 min', mode4: '4 dias × 45 min', rowRest: 'Remo leve no dia de descanso', startDate: 'Início do programa', cap: 'Limite por sessão (min)', bodyweight: 'Peso corporal (kg)',
    export: 'Exportar', exportJson: 'Exportar JSON', exportCsv: 'Exportar CSV', import: 'Importar JSON', reset: 'Apagar tudo', resetConfirm: 'Apagar todos os dados? Não dá para desfazer.', shopping: 'Lista de compras', evidence: 'Evidências', buyNow: 'Agora', buyLater: 'Depois, quando o app avisar',
    fitbod: 'Calibrar peso inicial com o Fitbod', fitbodHint: 'Suba o CSV exportado do Fitbod (conta em fitbod.me → Export). Para cada exercício do programa, escolha o exercício equivalente do seu histórico (ou "nenhum"); o app sugere um peso inicial com a carga mais recente.',
    fitbodUpload: 'Escolher CSV do Fitbod', fitbodNone: 'nenhum', fitbodApply: 'Aplicar pesos sugeridos', fitbodApplied: 'Peso(s) inicial(is) calibrado(s).' },
  groups: { biceps: 'Bíceps', triceps: 'Tríceps', peito: 'Peito', costas: 'Costas', ombros: 'Ombros', quadriceps: 'Quadríceps', posterior_gluteos: 'Posterior/glúteos', panturrilha: 'Panturrilha' } as Record<string, string>,
  sore: { title: 'Quais grupos estão doloridos?', apply: 'Trocar o treino de hoje', swap: 'Treino trocado com outro dia da semana.', row: 'Hoje virou remo leve; o treino foi movido para o dia de descanso.', none: 'O treino de hoje não usa esses grupos.' },
  common: { cancel: 'Cancelar', ok: 'OK', save: 'Salvar', close: 'Fechar', week: 'Semana' }
}
