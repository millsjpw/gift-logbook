import { UserForbiddenError } from "../api/errors.js";

export function assertSelf(authUserId: string, targetUserId: string): void {
  if (authUserId !== targetUserId) {
    throw new UserForbiddenError(
      "You do not have permission to access this account",
    );
  }
}

export type AccessLevel = "read" | "write";

export function assertListAccess(
  authUserId: string,
  list: { userId: string },
  level: AccessLevel,
  isSharedWithRequester = false,
): void {
  if (list.userId === authUserId) return;
  if (level === "read" && isSharedWithRequester) return;
  throw new UserForbiddenError(
    level === "write"
      ? "You do not have permission to modify this list"
      : "You do not have permission to view this list",
  );
}
