export interface UsuarioData {
  [key: string]: unknown;
  id: string;
  nome: string;
  email: string;
}

export interface usuarioDataToken extends UsuarioData {
  iat: number;
  exp: number;
}
