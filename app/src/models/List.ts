import type { ListItem } from "./ListItem";

export type List = {
  id: string;
  name: string;
  userId: string;
  personId?: string;
  items: ListItem[];
  createdAt: Date;
  updatedAt: Date;
};
