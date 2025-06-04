export enum TipoRetorno {
  RESPOSTA_SUCESSO = 1,
  ERRO_NEGOCIO = 2,
  ERRO_VALIDACAO = 3,
  ERRO_AUTENTICACAO = 4,
  ERRO_INTERNO_SERVIDOR = 5,
}

export interface RespostaPadrao<T = any> {
  Resultado: T | null;
  Sucesso: boolean;
  Mensagem: string | string[] | null;
  Detalhe: string | string[] | null;
  CodigoRetorno: number;
  TipoRetorno: TipoRetorno;
  TempoResposta: number;
}

export interface RespostaPaginada<T = any> {
  ListaGrid: T[];
  ItensPorPagina: number;
  TotalPaginas: number;
  TotalRegistros: number;
  TotalRegistrosFiltrados: number;
  PaginaAtual: number;
}
