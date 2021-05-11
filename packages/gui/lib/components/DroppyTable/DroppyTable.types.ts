export type TableRow = Record<string, string>

export type DroppyTableProps = {
  rows: TableRow[]
  columns: Record<string, string>
  onRowClick?: CallableFunction
}
