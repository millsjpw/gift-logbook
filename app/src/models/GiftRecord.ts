import type { Tag } from "./Tag";

export type GiftRecord = {
  id: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  personId: string | null;
  itemText: string;
  amount: string | null; // Postgres numeric → string
  date: string;
  tags: Tag[];
};
