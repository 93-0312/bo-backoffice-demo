import { delay } from "@/shared/api";
import { TRANSACTION_SEED } from "../model/mock";
import type { Transaction } from "../model/types";

/** Transaction API (entities/transaction/api). */
const db: Transaction[] = [...TRANSACTION_SEED];

export async function fetchTransactions(): Promise<Transaction[]> {
  return delay(db, 350);
}

export async function fetchTransaction(id: string): Promise<Transaction | undefined> {
  return delay(
    db.find((t) => t.id === id),
    300,
  );
}
