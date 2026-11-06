export function to24h(time: string): string {
  const m = /^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i.exec(time.trim());
  if (!m) return time;
  let h = Number(m[1]);
  const suffix = m[3]?.toUpperCase();
  if (suffix === 'PM' && h < 12) h += 12;
  if (suffix === 'AM' && h === 12) h = 0;
  return `${String(h).padStart(2, '0')}:${m[2]}`;
}

export function formatTimeLabel(time: string): string {
  const [hh, mm] = to24h(time).split(':').map(Number);
  if (Number.isNaN(hh) || Number.isNaN(mm)) return time;
  const suffix = hh >= 12 ? 'PM' : 'AM';
  const h12 = hh % 12 === 0 ? 12 : hh % 12;
  return `${h12}:${String(mm).padStart(2, '0')} ${suffix}`;
}
