import { db } from "../db.js";
import { NewUserSettings, UserSettings, userSettings } from "../schema.js";
import { eq } from "drizzle-orm";

const defaults: Omit<UserSettings, "userId" | "createdAt" | "updatedAt"> = {
  darkMode: false,
};

export async function getSettings(userId: string): Promise<UserSettings> {
  const [settings] = await db
    .select()
    .from(userSettings)
    .where(eq(userSettings.userId, userId))
    .limit(1);

  if (!settings) {
    return {
      userId,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...defaults,
    };
  }

  return settings;
}

export async function upsertSettings(
  userId: string,
  values: Partial<Omit<NewUserSettings, "userId">>,
): Promise<UserSettings> {
  const [result] = await db
    .insert(userSettings)
    .values({ userId, ...defaults, ...values })
    .onConflictDoUpdate({
      target: userSettings.userId,
      set: { ...values, updatedAt: new Date() },
    })
    .returning();

  return result;
}
