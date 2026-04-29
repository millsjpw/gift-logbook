import type { Tag } from "./Tag";

export type ListItem = {
  id: string;
  title: string;
  url?: string;
  listId: string;
  tags: Tag[];
  createdAt: Date;
  updatedAt: Date;
};
