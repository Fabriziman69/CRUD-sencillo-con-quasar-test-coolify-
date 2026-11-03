const messages = {
  'auth/invalid-credential': 'El correo o la contraseña son incorrectos.',
  'auth/invalid-email': 'Ingresa un correo electrónico válido.',
  'auth/email-already-in-use': 'Ya existe una cuenta con este correo.',
  'auth/weak-password': 'La contraseña debe tener al menos seis caracteres.',
  'auth/too-many-requests': 'Se realizaron demasiados intentos. Intenta de nuevo más tarde.',
  'auth/network-request-failed': 'No se pudo conectar. Revisa tu conexión a internet.',
  'auth/operation-not-allowed': 'Este método de inicio de sesión no está habilitado en Firebase.',
  'auth/unauthorized-domain': 'Este dominio aún no está autorizado en Firebase Authentication.',
  'auth/popup-closed-by-user': 'Se cerró la ventana de inicio de sesión.',
  'auth/popup-blocked': 'Permite la ventana emergente para iniciar sesión con Google.',
  'auth/user-disabled': 'Esta cuenta está deshabilitada.',
  'permission-denied': 'Tu cuenta no tiene permiso para realizar esta operación.',
  unavailable: 'Firebase no está disponible. Revisa tu conexión e intenta de nuevo.',
  'not-found': 'El registro ya no existe. Actualiza la lista.',
}

export function firebaseErrorMessage(error) {
  return messages[error?.code] || 'No se pudo completar la operación. Intenta de nuevo.'
}
