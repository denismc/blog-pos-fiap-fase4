import { useCallback, useEffect, useState } from 'react';
import { mensagemDeErro } from '@/utils/erros';

export interface Requisicao<T> {
  dados: T | null;
  /** Primeira carga (mostra o indicador no meio da tela). */
  carregando: boolean;
  /** Recarga pelo "puxar para atualizar" ou depois de uma alteração. */
  atualizando: boolean;
  erro: string;
  recarregar: () => Promise<void>;
}

type Resultado<T> = { dados: T; erro: '' } | { dados: null; erro: string };

/** Executa a chamada sem mexer em estado: quem chama decide o que atualizar. */
async function executar<T>(
  buscar: () => Promise<T>,
  erroPadrao: string
): Promise<Resultado<T>> {
  try {
    return { dados: await buscar(), erro: '' };
  } catch (err) {
    return { dados: null, erro: mensagemDeErro(err, erroPadrao) };
  }
}

/**
 * Carrega dados da API ao montar a tela e expõe carregamento, erro e recarga.
 * `buscar` precisa ser estável (useCallback ou função fora do componente):
 * quando ele muda, a carga é refeita.
 */
export function useRequisicao<T>(
  buscar: () => Promise<T>,
  erroPadrao: string
): Requisicao<T> {
  const [dados, setDados] = useState<T | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [atualizando, setAtualizando] = useState(false);
  const [erro, setErro] = useState('');

  const aplicar = useCallback((resultado: Resultado<T>) => {
    // Num erro de recarga, mantém os dados que já estavam na tela.
    if (resultado.dados !== null) setDados(resultado.dados);
    setErro(resultado.erro);
  }, []);

  useEffect(() => {
    // Evita atualizar estado se a tela fechar antes da resposta.
    let ativo = true;
    void executar(buscar, erroPadrao).then((resultado) => {
      if (!ativo) return;
      aplicar(resultado);
      setCarregando(false);
    });
    return () => {
      ativo = false;
    };
  }, [buscar, erroPadrao, aplicar]);

  const recarregar = useCallback(async () => {
    setAtualizando(true);
    aplicar(await executar(buscar, erroPadrao));
    setAtualizando(false);
  }, [buscar, erroPadrao, aplicar]);

  return { dados, carregando, atualizando, erro, recarregar };
}
