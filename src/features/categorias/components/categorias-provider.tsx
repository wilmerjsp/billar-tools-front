import React, { useState } from 'react'
import { type RowSelectionState } from '@tanstack/react-table'
import useDialogState from '@/hooks/use-dialog-state'
import { type CategoriaProducto } from '@/types/models'

type CategoriasDialogType = 'add' | 'edit' | 'delete'

type CategoriasContextType = {
  open: CategoriasDialogType | null
  setOpen: (str: CategoriasDialogType | null) => void
  currentRow: CategoriaProducto | null
  setCurrentRow: React.Dispatch<React.SetStateAction<CategoriaProducto | null>>
  rowSelection: RowSelectionState
  setRowSelection: React.Dispatch<React.SetStateAction<RowSelectionState>>
  selectedRows: CategoriaProducto[]
  setSelectedRows: React.Dispatch<React.SetStateAction<CategoriaProducto[]>>
}

const CategoriasContext = React.createContext<CategoriasContextType | null>(null)

export function CategoriasProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useDialogState<CategoriasDialogType>(null)
  const [currentRow, setCurrentRow] = useState<CategoriaProducto | null>(null)
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const [selectedRows, setSelectedRows] = useState<CategoriaProducto[]>([])

  return (
    <CategoriasContext
      value={{
        open,
        setOpen,
        currentRow,
        setCurrentRow,
        rowSelection,
        setRowSelection,
        selectedRows,
        setSelectedRows,
      }}
    >
      {children}
    </CategoriasContext>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useCategorias = () => {
  const ctx = React.useContext(CategoriasContext)
  if (!ctx) {
    throw new Error('useCategorias has to be used within <CategoriasContext>')
  }
  return ctx
}
