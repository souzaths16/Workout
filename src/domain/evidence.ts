import type { EvidenceTier } from './types'

export interface EvidenceItem { n: number; claim: string; source: string; tier: EvidenceTier; strength: string }

export const EVIDENCE: EvidenceItem[] = [
  { n: 1, claim: 'Mulheres pós-menopausa: 6 séries por exercício de perna cresceram mais massa magra que 3 séries (+6,1% vs +2,3%).', source: 'Nunes et al. 2020, J Strength Cond Res (58 mulheres)', tier: 'W40+', strength: 'Moderada' },
  { n: 2, claim: 'Mulheres ~52 anos com 6–8 séries/músculo/semana: pré-menopausa ganharam músculo; pós-menopausa não. Autores sugerem >6–8 séries após a menopausa.', source: 'Isenmann et al. 2023, BMC Women\'s Health (41 mulheres)', tier: 'W40+', strength: 'Moderada' },
  { n: 3, claim: 'Mulheres idosas: 8–12RM superou 10–15RM para força de membros superiores; 10–15RM levemente melhor para massa muscular.', source: 'Grupo de Londrina, Med Sci Sports Exerc 2023 (101 mulheres)', tier: 'W40+', strength: 'Moderada' },
  { n: 4, claim: 'Mulheres idosas: 10RM e 15RM geram ganho de massa muscular semelhante.', source: 'Kassiano et al. 2026, Exp Gerontol (27 mulheres)', tier: 'W40+', strength: 'Moderada' },
  { n: 5, claim: 'Mulheres idosas destreinadas: 1 ou 3 séries dão resultado igual nas primeiras 12 semanas.', source: 'Ribeiro et al. 2015; Cunha et al. 2019/20 (62 mulheres)', tier: 'W40+', strength: 'Moderada' },
  { n: 6, claim: 'Mulheres idosas treinadas: 2 ou 3 sessões/semana recuperam força e massa magra igualmente após pausa.', source: 'J Strength Cond Res 2022 (40 mulheres >60)', tier: 'W40+', strength: 'Moderada' },
  { n: 7, claim: 'Mulheres: divisão em 4 dias e corpo inteiro em 2 dias, com volume igual, deram ganhos idênticos.', source: 'Pedersen et al. 2022, BMC Sports Sci Med Rehabil (44 mulheres)', tier: 'W', strength: 'Moderada' },
  { n: 8, claim: 'Mulheres treinadas: duas sessões curtas renderam um pouco mais de volume que uma longa.', source: 'Pedersen et al. 2022, Front Psychol (23 mulheres)', tier: 'W', strength: 'Fraca–moderada (aguda)' },
  { n: 9, claim: 'Mulheres: a fase excêntrica é essencial; só-excêntrico cresceu +6,1% de massa magra da coxa e preservou ganhos no destreino.', source: 'Coratella et al. 2022, J Strength Cond Res (60 mulheres)', tier: 'W', strength: 'Moderada' },
  { n: 10, claim: 'Mulheres: rosca na amplitude alongada cresceu mais o bíceps distal que na encurtada.', source: 'Pedrosa et al. 2023, Sports (19 mulheres)', tier: 'W', strength: 'Moderada' },
  { n: 11, claim: 'Mulheres: parciais na amplitude alongada da extensão de joelho cresceram mais o quadríceps.', source: 'Pedrosa et al. 2022, Eur J Sport Sci (45 mulheres)', tier: 'W', strength: 'Moderada' },
  { n: 12, claim: 'Mulheres: parciais alongadas na panturrilha cresceram mais que amplitude completa (15,2% vs 6,7%).', source: 'Kassiano et al. 2023, J Strength Cond Res (42 mulheres)', tier: 'W', strength: 'Moderada' },
  { n: 13, claim: 'Mulheres: agachamento frontal e posterior deram hipertrofia igual do quadríceps.', source: 'Enes et al. 2024, Eur J Sport Sci (24 mulheres)', tier: 'W', strength: 'Moderada' },
  { n: 14, claim: 'Mulheres: agachamento com peso do corpo progredindo para unilateral cresceu tanto quanto com barra.', source: 'Sci Rep 2023 (13 mulheres)', tier: 'W', strength: 'Fraca (amostra pequena)' },
  { n: 15, claim: 'Mulheres (EMG): supino inclinado ativa mais a porção clavicular do peitoral.', source: 'Luczak et al. 2013, J Sports Med (24 mulheres)', tier: 'W', strength: 'Fraca (EMG)' },
  { n: 16, claim: 'Mulheres: quem conseguiu a barra fixa tinha maior relação força/massa; gordura corporal e força/massa magra previram o sucesso.', source: 'Flanagan et al. 2003, Res Q Exerc Sport', tier: 'W', strength: 'Fraca (observacional)' },
  { n: 17, claim: 'Mulheres treinadas: 3 min de descanso permitiram mais volume que 1 min (agudo).', source: 'PMC8758160, 2022 (14 mulheres)', tier: 'W', strength: 'Fraca (aguda)' },
  { n: 18, claim: 'Mulheres perdem menos velocidade que homens ao treinar até a falha; 1 RIR custa pouco.', source: 'Refalo et al. 2023, Sports Med Open (12 mulheres, 12 homens)', tier: 'W', strength: 'Fraca–moderada (aguda)' },
  { n: 19, claim: 'Mulheres jovens: cargas altas e baixas deram força similar no braço; massa magra do braço subiu só com carga baixa.', source: 'Appl Physiol Nutr Metab 2022 (16 mulheres)', tier: 'W', strength: 'Fraca–moderada' },
  { n: 20, claim: 'Fase do ciclo menstrual não altera força nem adaptações; o app não periodiza por ciclo.', source: 'Colenso-Semple et al. 2023 (revisão guarda-chuva)', tier: 'W', strength: 'Moderada–forte' },
  { n: 21, claim: 'Mulheres e homens ganham a mesma proporção de músculo; mulheres ganham mais força relativa no tronco superior.', source: 'Roberts, Nuckols, Krieger 2020 (meta-análise)', tier: 'X', strength: 'Forte' },
  { n: 22, claim: 'Hipertrofia é similar entre 6 e 30 reps quando perto da falha.', source: 'Schoenfeld et al. 2017, J Strength Cond Res', tier: 'X', strength: 'Forte (extrapolado)' },
  { n: 23, claim: 'Crescimento aumenta quanto mais perto da falha, estabilizando após ~2 RIR; 1–2 RIR ≈ falha com menos fadiga.', source: 'Robinson et al. 2024, Sports Med; Refalo et al. 2024', tier: 'X', strength: 'Forte / moderada' },
  { n: 24, claim: 'Descanso >60–90 s basta; nada além de 90 s. Dados crônicos em mulheres: desconhecidos.', source: 'Singer, Wolf et al. 2024', tier: 'X', strength: 'Moderada' },
  { n: 25, claim: 'Duração da repetição de 0,5 a 8 s dá crescimento igual. Em mulheres: desconhecido.', source: 'Schoenfeld et al. 2015, Sports Med', tier: 'X', strength: 'Forte' },
  { n: 26, claim: 'Séries semanais impulsionam o crescimento com retornos decrescentes; ~10 séries/músculo/semana como limiar.', source: 'Schoenfeld et al. 2017, J Sports Sci; Pelland et al. 2025/26', tier: 'X', strength: 'Forte' },
  { n: 27, claim: 'Aeróbio leve junto com musculação não reduz a hipertrofia. Em mulheres: desconhecido.', source: 'Schumann et al. 2022, Sports Med', tier: 'X', strength: 'Forte' },
  { n: 28, claim: 'Séries pareadas (antagonistas) reduzem o tempo pela metade com adaptações iguais.', source: 'Iversen et al. 2021, Sports Med', tier: 'X', strength: 'Moderada' },
  { n: 29, claim: 'Tríceps: extensão acima da cabeça cresce mais que com braço neutro.', source: 'Maeo et al. 2023, Eur J Sport Sci (adultos jovens)', tier: 'X', strength: 'Moderada (extrapolado; nada só em mulheres)' },
  { n: 30, claim: 'Posterior de coxa: treinar com quadril flexionado (alongado) cresce mais (+14% vs +9%).', source: 'Maeo et al. 2021, Med Sci Sports Exerc (20 adultos)', tier: 'X', strength: 'Moderada (extrapolado; nada só em mulheres)' },
  { n: 31, claim: 'Glúteos: elevação pélvica e agachamento crescem os glúteos igualmente.', source: 'Plotkin et al. 2023, Front Physiol (34 adultos)', tier: 'X', strength: 'Moderada (extrapolado)' },
  { n: 32, claim: 'Peito: supino inclinado cresceu mais a porção superior que o reto.', source: 'Chaves et al. 2020, Int J Exerc Sci (47 homens)', tier: 'M', strength: 'Fraca (extrapolado)' },
  { n: 33, claim: 'Deltoide lateral: elevação com halter e com cabo crescem igual (3,3–4,6%).', source: 'Nord University 2025, Front Physiol (24 homens e mulheres)', tier: 'X', strength: 'Moderada' },
  { n: 34, claim: 'Agachamento completo cresce mais glúteos e adutores que o meio agachamento.', source: 'Kubo et al. 2019, Eur J Appl Physiol (17 homens)', tier: 'M', strength: 'Fraca (extrapolado)' },
  { n: 35, claim: 'Alongar depois do treino não reduz dor muscular; o alongamento aqui é por mobilidade.', source: 'Herbert et al. 2011, Cochrane', tier: 'X', strength: 'Forte (achado negativo)' },
  { n: 36, claim: 'Exercício ajuda na dor patelofemoral; a melhor forma é desconhecida.', source: 'van der Heijden et al. 2015, Cochrane', tier: 'X', strength: 'Qualidade muito baixa' },
  { n: 37, claim: 'Escada da barra fixa (pendurada → escapular → negativas → banda → estrita): sem RCT em mulheres.', source: 'Programa do US Marine Corps (Posey)', tier: 'unknown', strength: 'Desconhecida (prática)' },
  { n: 38, claim: 'Dupla progressão como regra.', source: '—', tier: 'unknown', strength: 'Desconhecida como regra testada; forma operacional da sobrecarga progressiva' },
  { n: 39, claim: 'Semanas de deload.', source: '—', tier: 'unknown', strength: 'Desconhecida / contestada; só manual' },
  { n: 40, claim: 'Proteína ≈1,6 g/kg/dia é o platô para ganho de massa magra.', source: 'Morton et al. 2018, Br J Sports Med (49 RCTs)', tier: 'X', strength: 'Forte (informativo)' }
]

export const TIER_LABEL: Record<EvidenceTier, string> = {
  'W40+': 'Mulheres 40+',
  'W': 'Mulheres',
  'X': 'Sexo misto (extrapolado)',
  'M': 'Homens (extrapolado)',
  'unknown': 'Sem evidência controlada'
}
