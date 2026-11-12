interface PaginacaoProps {
  page: number;
  totalPages: number;
  total: number;
  onMudarPagina: (page: number) => void;
}

function Paginacao({ page, totalPages, total, onMudarPagina }: PaginacaoProps) {
  if (totalPages <= 1) return null;

  return (
    <nav className="paginacao" aria-label="Paginação">
      <button onClick={() => onMudarPagina(page - 1)} disabled={page <= 1}>
        Anterior
      </button>
      <span>
        Página {page} de {totalPages} · {total} registros
      </span>
      <button onClick={() => onMudarPagina(page + 1)} disabled={page >= totalPages}>
        Próxima
      </button>
    </nav>
  );
}

export default Paginacao;
