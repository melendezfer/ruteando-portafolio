// Fragmento de RUTEANDO (simplificado). © Fernando Melendez. Todos los derechos reservados.
//
// Token de refresco rotativo con detección de reuso (RFC 9700). En la base
// solo se guarda el hash del token; cada uso lo cambia por uno nuevo y
// encadena el viejo con `reemplazado_por`.
async function refresh({ refreshToken }) {
  const registro = await tokensRefrescoRepo.buscarPorHash(hashToken(refreshToken));
  if (!registro) throw new UnauthorizedError('Refresh token inválido');

  if (registro.revocado_en) {
    // Un token ya rotado que vuelve a usarse es la señal de reuso: probable
    // robo. Se revoca toda la familia de sesiones del usuario.
    await tokensRefrescoRepo.revocarTodosDeUsuario(registro.usuario_id);
    throw new UnauthorizedError('Refresh token inválido');
  }

  if (new Date(registro.expira_en).getTime() < Date.now()) {
    throw new UnauthorizedError('Refresh token expirado');
  }

  const usuario = await usuariosRepo.buscarPorId(registro.usuario_id);
  if (!usuario || !usuario.activo) throw new UnauthorizedError('Refresh token inválido');

  const tokens = await emitirTokens(usuario);
  const nuevo = await tokensRefrescoRepo.buscarPorHash(hashToken(tokens.refreshToken));
  await tokensRefrescoRepo.marcarRevocado(registro.id, nuevo.id);
  return tokens;
}
