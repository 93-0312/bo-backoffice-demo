import { useEffect, useState } from "react";
import { Card, Input, Select, IconSearch, type SelectOption } from "@/shared/ui";
import { useDebouncedValue } from "@/shared/hooks";
import { formatCurrency } from "@/shared/lib";
import { PageHeader } from "@/widgets/page-header";
import { DataTable, type Column } from "@/widgets/data-table";
import {
  fetchProducts,
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
  const [products, setProducts] = useState<Product[] | null>(null);
  const debounced = useDebouncedValue(search, 300);

  useEffect(() => {
    let alive = true;
    setProducts(null);
    fetchProducts({ search: debounced, category }).then((d) => alive && setProducts(d));
    return () => {
      alive = false;
    };
  }, [debounced, category]);

  const columns: Column<Product>[] = [
    {
      header: "상품",
      cell: (p) => (
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{p.name}</p>
          <p className="truncate text-xs text-muted-foreground">{p.sku}</p>
        </div>
      ),
    },
    {
      header: "카테고리",
      cell: (p) => <span className="text-sm">{PRODUCT_CATEGORY_LABEL[p.category]}</span>,
    },
    { header: "가격", align: "right", cell: (p) => <span className="text-sm font-medium tabular-nums">{formatCurrency(p.price)}</span> },
    { header: "재고", align: "right", cell: (p) => <StockIndicator stock={p.stock} /> },
    { header: "상태", cell: (p) => <ProductStatusBadge status={p.status} /> },
  ];

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
          columns={columns}
          rows={products ?? []}
          loading={products === null}
          getRowKey={(p) => p.id}
          emptyMessage="조건에 맞는 상품이 없습니다."
        />
      </Card>
    </div>
  );
}
