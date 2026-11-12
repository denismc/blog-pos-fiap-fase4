import { useCallback, useRef } from 'react';
import { useFocusEffect } from 'expo-router';

/**
 * Recarrega os dados quando a tela volta a ficar visível (ex.: depois de criar
 * ou editar um post em outra tela). A primeira exibição é ignorada, porque a
 * carga inicial já é feita pelo useRequisicao.
 */
export function useRecarregarAoVoltar(recarregar: () => Promise<void>): void {
  const primeiraVez = useRef(true);

  useFocusEffect(
    useCallback(() => {
      if (primeiraVez.current) {
        primeiraVez.current = false;
        return;
      }
      void recarregar();
    }, [recarregar])
  );
}
