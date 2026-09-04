import { useEffect, useState } from "react";
import {
  Button,
  Dialog,
  Heading,
  Modal,
  ModalOverlay,
} from "react-aria-components";
import {
  CheckIcon,
  PencilSquareIcon,
  PlusIcon,
  UsersIcon,
  XMarkIcon,
} from "@heroicons/react/24/solid";
import { apiFetch } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { useLogbook } from "../context/LogbookContext";
import type { Logbook } from "../models/Logbook";

type Member = {
  userId: string;
  name: string;
  email: string;
  createdAt: string;
};

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function LogbookManagerModal({ isOpen, onClose }: Props) {
  const { user } = useAuth();
  const { logbooks, refresh } = useLogbook();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [membersByLogbook, setMembersByLogbook] = useState<
    Map<string, Member[]>
  >(new Map());
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [nameDraft, setNameDraft] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newLogbookName, setNewLogbookName] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    resetAndLoad();
    // refresh (from LogbookContext) isn't memoized, so it's deliberately
    // left out of the deps array — including it would re-run this effect
    // every time LogbookProvider re-renders.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  async function resetAndLoad() {
    setError(null);
    setExpandedId(null);
    setRenamingId(null);
    await refresh();
  }

  async function loadMembers(logbookId: string) {
    try {
      const data: Member[] = await apiFetch(`/logbooks/${logbookId}/members`);
      setMembersByLogbook((prev) => new Map(prev).set(logbookId, data));
    } catch (err: any) {
      setError(err.message || "Failed to load members");
    }
  }

  async function toggleExpand(logbookId: string) {
    if (expandedId === logbookId) {
      setExpandedId(null);
      return;
    }
    setExpandedId(logbookId);
    setInviteEmail("");
    if (!membersByLogbook.has(logbookId)) {
      await loadMembers(logbookId);
    }
  }

  function startRename(logbook: Logbook) {
    setRenamingId(logbook.id);
    setNameDraft(logbook.name);
  }

  async function saveRename(logbookId: string) {
    const trimmed = nameDraft.trim();
    if (!trimmed) return;
    setBusy(true);
    setError(null);
    try {
      await apiFetch(`/logbooks/${logbookId}`, {
        method: "PUT",
        body: JSON.stringify({ name: trimmed }),
      });
      await refresh();
      setRenamingId(null);
    } catch (err: any) {
      setError(err.message || "Failed to rename logbook");
    } finally {
      setBusy(false);
    }
  }

  async function handleInvite(logbookId: string, e: React.FormEvent) {
    e.preventDefault();
    const trimmed = inviteEmail.trim();
    if (!trimmed) return;
    setBusy(true);
    setError(null);
    try {
      await apiFetch(`/logbooks/${logbookId}/members`, {
        method: "POST",
        body: JSON.stringify({ email: trimmed }),
      });
      setInviteEmail("");
      await loadMembers(logbookId);
    } catch (err: any) {
      setError(err.message || "Failed to add member");
    } finally {
      setBusy(false);
    }
  }

  async function handleRemoveMember(logbookId: string, targetUserId: string) {
    setBusy(true);
    setError(null);
    try {
      await apiFetch(`/logbooks/${logbookId}/members/${targetUserId}`, {
        method: "DELETE",
      });
      await loadMembers(logbookId);
    } catch (err: any) {
      setError(err.message || "Failed to remove member");
    } finally {
      setBusy(false);
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = newLogbookName.trim();
    if (!trimmed) return;
    setCreating(true);
    setError(null);
    try {
      await apiFetch("/logbooks", {
        method: "POST",
        body: JSON.stringify({ name: trimmed }),
      });
      setNewLogbookName("");
      await refresh();
    } catch (err: any) {
      setError(err.message || "Failed to create logbook");
    } finally {
      setCreating(false);
    }
  }

  return (
    <ModalOverlay
      isOpen={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      isDismissable
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
    >
      <Modal className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg flex flex-col max-h-[90vh]">
        <Dialog
          aria-label="Logbooks"
          className="flex flex-col flex-1 overflow-hidden outline-none"
        >
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700 shrink-0">
            <Heading
              slot="title"
              className="text-lg font-semibold text-gray-900 dark:text-gray-100"
            >
              Logbooks
            </Heading>
            <Button
              onPress={onClose}
              aria-label="Close"
              className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 rounded-md p-1 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              <XMarkIcon className="h-5 w-5" />
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
            {error && <p className="text-red-600 text-sm">{error}</p>}

            <div className="border border-gray-200 dark:border-gray-700 rounded-md divide-y divide-gray-100 dark:divide-gray-700">
              {logbooks.map((logbook) => {
                const isExpanded = expandedId === logbook.id;
                const members = membersByLogbook.get(logbook.id) ?? [];
                const isOwner = logbook.ownerUserId === user?.id;
                return (
                  <div key={logbook.id}>
                    <div className="flex items-center gap-2 px-3 py-2">
                      {renamingId === logbook.id ? (
                        <>
                          <input
                            type="text"
                            value={nameDraft}
                            onChange={(e) => setNameDraft(e.target.value)}
                            disabled={busy}
                            autoFocus
                            className="flex-1 min-w-0 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                          />
                          <button
                            onClick={() => saveRename(logbook.id)}
                            disabled={busy || !nameDraft.trim()}
                            className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                          >
                            <CheckIcon className="h-4 w-4 text-blue-500" />
                          </button>
                          <button
                            onClick={() => setRenamingId(null)}
                            disabled={busy}
                            className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                          >
                            <XMarkIcon className="h-4 w-4 text-gray-500" />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => toggleExpand(logbook.id)}
                            className="flex-1 min-w-0 flex items-center gap-2 text-left"
                          >
                            <UsersIcon className="h-4 w-4 text-gray-400 shrink-0" />
                            <span className="text-sm font-medium truncate dark:text-gray-100">
                              {logbook.name}
                            </span>
                          </button>
                          <button
                            onClick={() => startRename(logbook)}
                            className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                            aria-label={`Rename ${logbook.name}`}
                          >
                            <PencilSquareIcon className="h-4 w-4 text-blue-400 hover:text-blue-600" />
                          </button>
                        </>
                      )}
                    </div>

                    {isExpanded && (
                      <div className="px-3 pb-3 space-y-2 bg-gray-50 dark:bg-gray-800/60">
                        {members.length === 0 ? (
                          <p className="text-xs text-gray-400 dark:text-gray-500">
                            Loading members…
                          </p>
                        ) : (
                          <div className="space-y-1">
                            {members.map((m) => (
                              <div
                                key={m.userId}
                                className="flex items-center justify-between gap-2 text-sm"
                              >
                                <span className="dark:text-gray-200 truncate">
                                  {m.name}{" "}
                                  <span className="text-gray-400 dark:text-gray-500 text-xs">
                                    ({m.email})
                                  </span>
                                  {m.userId === logbook.ownerUserId && (
                                    <span className="ml-1 text-xs text-gray-400 dark:text-gray-500">
                                      · owner
                                    </span>
                                  )}
                                </span>
                                {(isOwner || m.userId === user?.id) &&
                                  m.userId !== logbook.ownerUserId && (
                                    <button
                                      onClick={() =>
                                        handleRemoveMember(logbook.id, m.userId)
                                      }
                                      disabled={busy}
                                      className="shrink-0 cursor-pointer"
                                      aria-label={`Remove ${m.name}`}
                                    >
                                      <XMarkIcon className="h-4 w-4 text-gray-400 hover:text-red-600" />
                                    </button>
                                  )}
                              </div>
                            ))}
                          </div>
                        )}
                        <form
                          onSubmit={(e) => handleInvite(logbook.id, e)}
                          className="flex gap-2"
                        >
                          <input
                            type="email"
                            placeholder="Invite by email"
                            value={inviteEmail}
                            onChange={(e) => setInviteEmail(e.target.value)}
                            disabled={busy}
                            className="flex-1 min-w-0 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                          />
                          <button
                            type="submit"
                            disabled={busy || !inviteEmail.trim()}
                            className={`px-3 py-1 rounded-md text-white text-sm ${
                              busy || !inviteEmail.trim()
                                ? "bg-gray-400 cursor-not-allowed"
                                : "bg-blue-500 hover:bg-blue-700"
                            }`}
                          >
                            Invite
                          </button>
                        </form>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <form onSubmit={handleCreate} className="flex gap-2">
              <input
                type="text"
                placeholder="New logbook name"
                value={newLogbookName}
                onChange={(e) => setNewLogbookName(e.target.value)}
                disabled={creating}
                className="flex-1 min-w-0 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
              <button
                type="submit"
                disabled={creating || !newLogbookName.trim()}
                className={`flex items-center gap-1 px-3 py-1 rounded-md text-white text-sm ${
                  creating || !newLogbookName.trim()
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-500 hover:bg-blue-700"
                }`}
              >
                <PlusIcon className="h-4 w-4" />
                Create
              </button>
            </form>
          </div>
        </Dialog>
      </Modal>
    </ModalOverlay>
  );
}
