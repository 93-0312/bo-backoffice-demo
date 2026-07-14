import { useMemo, useState } from "react";
import { Card, Input, Select, IconSearch, type SelectOption } from "@/shared/ui";
import { useDebouncedValue } from "@/shared/hooks";
import { formatCurrency } from "@/shared/lib";
import { PageHeader } from "@/widgets/page-header";
import { DataTable, applySort, type Column, type SortState } from "@/widgets/data-table";
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
 * 검색(shared Input) + 카테고리 필터를 직접 들고, entities/product 표현을 테이블에 조립.
 */
const CATEGORY_OPTIONS: SelectOption[] = [
  { value: "all", label: "카테고리 전체" },
  ...(Object.keys(PRODUCT_CATEGORY_LABEL) as ProductCategory[]).map((c) => ({
    value: c,
    label: PRODUCT_CATEGORY_LABEL[c],
  })),
];

export function ProductsPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<ProductCategory | "all">("all");
  const [sort, setSort] = useState<SortState | null>(null);
  const debounced = useDebouncedValue(search, 300);

  const { data, isLoading } = useProductsQuery({ search: debounced, category });
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
        <div className="flex flex-wrap items-center gap-3 border-b border-border p-4">
          <Input
            leftIcon={<IconSearch />}
            placeholder="상품명 또는 SKU 검색"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            containerClassName="w-full max-w-xs"
          />
          <Select
            options={CATEGORY_OPTIONS}
            value={category}
            onValueChange={(v) => setCategory(v as ProductCategory | "all")}
            className="w-40"
          />
        </div>
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
