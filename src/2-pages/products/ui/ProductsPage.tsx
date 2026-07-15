import { useMemo, useState } from "react";
import { Card, type SelectOption } from "@/shared/ui";
import { formatCurrency } from "@/shared/lib";
import { PageHeader } from "@/widgets/page-header";
import { DataTable, applySort, type Column, type SortState } from "@/widgets/data-table";
import { FilterBar, useFilters, type FilterDef } from "@/widgets/filter-bar";
import {
  useProductsQuery,
  ProductStatusBadge,
  StockIndicator,
  PRODUCT_CATEGORY_LABEL,
  type Product,
  type ProductCategory,
} from "@/entities/product";

/**
 * ProductsPage — 라우트 `/products` (page).
 * 필터는 스키마(defs) 선언 + useFilters(memory — 재방문 유지, 새로고침 초기화).
 */
const CATEGORY_OPTIONS: SelectOption[] = [
  { value: "all", label: "카테고리 전체" },
  ...(Object.keys(PRODUCT_CATEGORY_LABEL) as ProductCategory[]).map((c) => ({
    value: c,
    label: PRODUCT_CATEGORY_LABEL[c],
  })),
];

const FILTER_DEFS: FilterDef[] = [
  { type: "search", key: "search", placeholder: "상품명 또는 SKU 검색", className: "max-w-xs" },
  { type: "select", key: "category", options: CATEGORY_OPTIONS, className: "w-40" },
];

export function ProductsPage() {
  const [sort, setSort] = useState<SortState | null>(null);
  const { values, debouncedValues, setValue, reset, isDirty } = useFilters({
    defaults: { search: "", category: "all" },
    persist: "memory",
    storageKey: "products",
    debounceKeys: ["search"],
  });

  const { data, isLoading } = useProductsQuery({
    search: debouncedValues.search,
    category: debouncedValues.category as ProductCategory | "all",
  });
  const products = data ?? [];

  const columns: Column<Product>[] = [
    {
      header: "상품",
      cell: (p) => (
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{p.name}</p>
          <p className="truncate text-xs text-muted-foreground">{p.sku}</p>
        </div>
      ),
      sortKey: "name",
      sortAccessor: (p) => p.name,
    },
    {
      header: "카테고리",
      cell: (p) => <span className="text-sm">{PRODUCT_CATEGORY_LABEL[p.category]}</span>,
    },
    {
      header: "가격",
      align: "right",
      cell: (p) => <span className="text-sm font-medium tabular-nums">{formatCurrency(p.price)}</span>,
      sortKey: "price",
      sortAccessor: (p) => p.price,
    },
    {
      header: "재고",
      align: "right",
      cell: (p) => <StockIndicator stock={p.stock} />,
      sortKey: "stock",
      sortAccessor: (p) => p.stock,
    },
    { header: "상태", cell: (p) => <ProductStatusBadge status={p.status} /> },
  ];

  const sortedProducts = useMemo(() => applySort(products, sort, columns), [products, sort]);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="상품" description="판매 상품의 재고와 상태를 확인합니다." />
      <Card>
        <FilterBar
          defs={FILTER_DEFS}
          values={values}
          onChange={setValue}
          onReset={reset}
          dirty={isDirty}
        />
        <DataTable
          storageKey="products"
          columns={columns}
          rows={sortedProducts}
          loading={isLoading}
          getRowKey={(p) => p.id}
          emptyMessage="조건에 맞는 상품이 없습니다."
          sort={sort}
          onSortChange={setSort}
        />
      </Card>
    </div>
  );
}
