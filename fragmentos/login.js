// Fragmento de RUTEANDO (simplificado). © Fernando Melendez. Todos los derechos reservados.
//
// Inicio de sesión sin enumeración de cuentas: si el correo no existe se
// verifica igual contra un hash argon2 de relleno, así el tiempo de
// respuesta no delata qué correos están registrados, y todos los fallos
// devuelven el mismo mensaje.
async function login({ email, password }) {
  const usuario = await usuariosRepo.buscarPorCorreo(email);

  const passwordOk = await argon2.verify(usuario ? usuario.contrasena_hash : DUMMY_HASH, password);

  if (!usuario || !passwordOk || !usuario.activo) {
    // Un solo mensaje para credenciales inválidas, correo inexistente o
    // cuenta suspendida: distinguirlos permitiría enumerar cuentas.
    throw new UnauthorizedError('Credenciales inválidas');
  }

  return emitirTokens(usuario);
}
