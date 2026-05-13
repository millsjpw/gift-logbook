export type GiftRecord = {
  id: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  personId: string | null;
  itemText: string;
  amount: string | null; // Postgres numeric comes back as a string
  date: string;
  meta: Record<string, unknown>;
  tags: string[];
};
