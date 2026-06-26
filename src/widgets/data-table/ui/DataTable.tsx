import type { ReactNode } from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Skeleton,
} from "@/shared/ui";
import { cn } from "@/shared/lib";

/**
 * DataTable<T> — 범용 데이터 테이블 (widget).
 *
 * "도메인 무관" 하게 컬럼 정의(columns)와 행 데이터(rows)만 받아 그린다.
 * 로딩 스켈레톤·빈 상태를 내장해, 각 page 가 매번 다시 구현하지 않도록 한다.
 * 어떤 컬럼을 보여줄지는 page 가 결정(entities 의 표현 컴포넌트를 render 에 끼움).
 */
export interface Column<T> {
  /** 헤더 라벨 */
  header: string;
  /** 셀 렌더러 */
  cell: (row: T) => ReactNode;
  className?: string;
  align?: "left" | "right" | "center";
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  getRowKey: (row: T) => string;
  loading?: boolean;
  emptyMessage?: string;
  onRowClick?: (row: T) => void;
}

const alignClass = { left: "text-left", right: "text-right", center: "text-center" } as const;

export function DataTable<T>({
  columns,
  rows,
  getRowKey,
  loading,
  emptyMessage = "데이터가 없습니다.",
  onRowClick,
}: DataTableProps<T>) {
  return (
    <Table>
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          {columns.map((col, i) => (
            <TableHead
              key={i}
              className={cn("whitespace-nowrap", col.align && alignClass[col.align], col.className)}
            >
              {col.header}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {loading ? (
          <SkeletonRows cols={columns.length} />
        ) : rows.length === 0 ? (
          <TableRow className="hover:bg-transparent">
            <TableCell colSpan={columns.length} className="py-12 text-center text-muted-foreground">
              {emptyMessage}
            </TableCell>
          </TableRow>
        ) : (
          rows.map((row) => (
            <TableRow
              key={getRowKey(row)}
              className={cn(onRowClick && "cursor-pointer")}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
            >
              {columns.map((col, i) => (
                <TableCell
                  key={i}
                  className={cn(
                    "whitespace-nowrap",
                    col.align && alignClass[col.align],
                    col.className,
                  )}
                >
                  {col.cell(row)}
                </TableCell>
              ))}
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}

function SkeletonRows({ cols }: { cols: number }) {
  return (
    <>
      {Array.from({ length: 5 }).map((_, r) => (
        <TableRow key={r} className="hover:bg-transparent">
          {Array.from({ length: cols }).map((__, c) => (
            <TableCell key={c}>
              <Skeleton className="h-4 w-full max-w-[160px] rounded-radius-sm" />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
}
