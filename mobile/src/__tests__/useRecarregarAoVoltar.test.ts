import { renderHook } from '@testing-library/react-native';
import { useFocusEffect } from 'expo-router';
import { useRecarregarAoVoltar } from '@/hooks/useRecarregarAoVoltar';

jest.mock('expo-router', () => ({ useFocusEffect: jest.fn() }));

const mockUseFocusEffect = useFocusEffect as jest.Mock;

describe('useRecarregarAoVoltar', () => {
  it('deve ignorar a primeira exibição e recarregar nas seguintes', async () => {
    const recarregar = jest.fn().mockResolvedValue(undefined);
    await renderHook(() => useRecarregarAoVoltar(recarregar));

    // Callback que o expo-router chamaria a cada vez que a tela ganha foco.
    const aoFocar = mockUseFocusEffect.mock.calls[0][0] as () => void;

    aoFocar();
    expect(recarregar).not.toHaveBeenCalled();

    aoFocar();
    aoFocar();
    expect(recarregar).toHaveBeenCalledTimes(2);
  });
});
