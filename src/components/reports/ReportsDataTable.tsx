
import React from 'react';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface DataTableProps {
  caption?: string;
  data: Array<Record<string, any>>;
  columns: {
    key: string;
    header: string;
    cell?: (item: any) => React.ReactNode;
  }[];
  loading?: boolean;
}

export const ReportsDataTable: React.FC<DataTableProps> = ({
  caption,
  data,
  columns,
  loading = false
}) => {
  if (loading) {
    return (
      <div className="w-full py-10">
        <div className="animate-pulse text-center text-muted-foreground">
          Carregando dados...
        </div>
      </div>
    );
  }

  if (!data.length) {
    return (
      <div className="w-full py-10 text-center text-muted-foreground">
        Nenhum dado disponível para exibição.
      </div>
    );
  }

  return (
    <Table>
      {caption && <TableCaption>{caption}</TableCaption>}
      <TableHeader>
        <TableRow>
          {columns.map((column) => (
            <TableHead key={column.key}>{column.header}</TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((item, index) => (
          <TableRow key={index}>
            {columns.map((column) => (
              <TableCell key={`${index}-${column.key}`}>
                {column.cell ? column.cell(item) : item[column.key]}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
