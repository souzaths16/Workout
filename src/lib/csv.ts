export function detectDelimiter(headerLine: string): string {
  return headerLine.includes(';') && !headerLine.includes(',') ? ';' : ','
}

export function splitCsvLine(line: string, delim: string): string[] {
  const out: string[] = []
  let cur = ''
  let q = false
  for (let i = 0; i < line.length; i++) {
    const c = line[i]
    if (q) {
      if (c === '"') { if (line[i + 1] === '"') { cur += '"'; i++ } else q = false }
      else cur += c
    } else {
      if (c === '"') q = true
      else if (c === delim) { out.push(cur); cur = '' }
      else cur += c
    }
  }
  out.push(cur)
  return out.map(s => s.trim())
}

export function parseCsv(text: string): string[][] {
  const lines = text.split(/\r?\n/).filter(l => l.trim().length > 0)
  if (lines.length === 0) return []
  const delim = detectDelimiter(lines[0])
  return lines.map(l => splitCsvLine(l, delim))
}
