import { Alert } from 'react-native';

/**
 * Caixa de confirmação nativa (equivalente ao window.confirm do web).
 * Resolve true só quando o usuário toca no botão de confirmar.
 */
export function confirmar(
  titulo: string,
  mensagem: string,
  textoConfirmar = 'Excluir'
): Promise<boolean> {
  return new Promise((resolve) => {
    Alert.alert(
      titulo,
      mensagem,
      [
        { text: 'Cancelar', style: 'cancel', onPress: () => resolve(false) },
        {
          text: textoConfirmar,
          style: 'destructive',
          onPress: () => resolve(true),
        },
      ],
      // Android: tocar fora da caixa fecha sem confirmar.
      { cancelable: true, onDismiss: () => resolve(false) }
    );
  });
}
