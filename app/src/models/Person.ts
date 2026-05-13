import type { Tag } from "./Tag";

export type Person = {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  birthMonth: number | null;
  birthDay: number | null;
  birthYear: number | null;
  tags: Tag[];
};
