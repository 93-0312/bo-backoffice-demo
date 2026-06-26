import type { Sid } from "./types";

/** SID 목업 시드 (entities/sid/model). */
export const SID_SEED: Sid[] = [
  { id: "sid_01", mid: "24020005", sellerId: "gamsgo_01", corpName: "감스고코리아㈜", ceoName: "김대표", status: "approved", receivedAt: "2026-01-12", updatedAt: "2026-02-20", midCreated: true },
  { id: "sid_02", mid: "24020005", sellerId: "gamsgo_02", corpName: "감스고코리아㈜", ceoName: "김대표", status: "approved", receivedAt: "2026-01-14", updatedAt: "2026-02-18", midCreated: true },
  { id: "sid_03", mid: "24020011", sellerId: "neostore_01", corpName: "네오스토어㈜", ceoName: "이사장", status: "reviewing", receivedAt: "2026-06-10", updatedAt: "2026-06-15", midCreated: false },
  { id: "sid_04", mid: "24020011", sellerId: "neostore_02", corpName: "네오스토어㈜", ceoName: "이사장", status: "received", receivedAt: "2026-06-18", updatedAt: "2026-06-18", midCreated: false },
  { id: "sid_05", mid: "24020023", sellerId: "marketplus_01", corpName: "마켓플러스㈜", ceoName: "박대표", status: "rejected", receivedAt: "2026-05-02", updatedAt: "2026-05-09", midCreated: false },
  { id: "sid_06", mid: "24020023", sellerId: "marketplus_02", corpName: "마켓플러스㈜", ceoName: "박대표", status: "approved", receivedAt: "2026-04-21", updatedAt: "2026-05-30", midCreated: true },
  { id: "sid_07", mid: "24020045", sellerId: "digitalhub_01", corpName: "디지털허브㈜", ceoName: "최이사", status: "reviewing", receivedAt: "2026-06-19", updatedAt: "2026-06-22", midCreated: false },
  { id: "sid_08", mid: "24020045", sellerId: "digitalhub_02", corpName: "디지털허브㈜", ceoName: "최이사", status: "received", receivedAt: "2026-06-23", updatedAt: "2026-06-23", midCreated: false },
];
