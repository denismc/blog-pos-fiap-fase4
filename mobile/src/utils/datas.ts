/*
 * Datas montadas à mão para não depender do suporte a Intl/locale pt-BR do
 * motor JavaScript do aparelho. Usam o fuso horário do celular.
 */

const doisDigitos = (n: number) => String(n).padStart(2, '0');

function paraData(iso: string): Date | null {
  const data = new Date(iso);
  return Number.isNaN(data.getTime()) ? null : data;
}

/** dd/mm/aaaa */
export function formatarData(iso: string): string {
  const data = paraData(iso);
  if (!data) return '';
  return `${doisDigitos(data.getDate())}/${doisDigitos(data.getMonth() + 1)}/${data.getFullYear()}`;
}

/** dd/mm/aaaa às hh:mm */
export function formatarDataHora(iso: string): string {
  const data = paraData(iso);
  if (!data) return '';
  return `${formatarData(iso)} às ${doisDigitos(data.getHours())}:${doisDigitos(data.getMinutes())}`;
}
