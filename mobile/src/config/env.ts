/**
 * URL base da API. No celular, `localhost` é o próprio aparelho, então o valor
 * vem de EXPO_PUBLIC_API_URL (veja .env.example):
 *   - Emulador Android: http://10.0.2.2:3000/api
 *   - Celular físico:   http://<IP-do-PC-na-rede>:3000/api
 */
export const API_URL =
  process.env.EXPO_PUBLIC_API_URL ?? 'http://10.0.2.2:3000/api';
