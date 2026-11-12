import { formatarData, formatarDataHora } from '@/utils/datas';

// Sem "Z": o horário é interpretado no fuso local, então o teste não depende
// do fuso da máquina que roda a suíte.
const ISO_LOCAL = '2026-03-05T09:07:00';

describe('datas', () => {
  it('formatarData deve usar dd/mm/aaaa', () => {
    expect(formatarData(ISO_LOCAL)).toBe('05/03/2026');
  });

  it('formatarDataHora deve incluir a hora com dois dígitos', () => {
    expect(formatarDataHora(ISO_LOCAL)).toBe('05/03/2026 às 09:07');
  });

  it('deve devolver vazio para data inválida', () => {
    expect(formatarData('não é data')).toBe('');
    expect(formatarDataHora('não é data')).toBe('');
  });
});
