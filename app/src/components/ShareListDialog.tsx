import { useEffect, useState } from "react";
import {
  Button,
  Dialog,
  Heading,
  Modal,
  ModalOverlay,
} from "react-aria-components";
import { XMarkIcon } from "@heroicons/react/24/solid";
import { apiFetch } from "../api/client";

type ListShareUser = {
  userId: string;
  name: string;
  email: string;
  createdAt: string;
};

interface Props {
  isOpen: boolean;
  onClose: () => void;
  listId: string;
  listName: string;
}

export default function ShareListDialog({
  isOpen,
  onClose,
  listId,
  listName,
}: Props) {
  const [shares, setShares] = useState<ListShareUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [sharing, setSharing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    loadShares();
  }, [isOpen, listId]);

  async function loadShares() {
    setError(null);
    setEmail("");
    setLoading(true);
    try {
      const s: ListShareUser[] = await apiFetch(`/lists/${listId}/shares`);
      setShares(s);
    } catch (err: any) {
      setError(err.message || "Failed to load shares");
    } finally {
      setLoading(false);
    }
  }

  async function handleShare(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) return;
    setSharing(true);
    setError(null);
    try {
      await apiFetch(`/lists/${listId}/shares`, {
        method: "POST",
        body: JSON.stringify({ email: trimmed }),
      });
      const updated: ListShareUser[] = await apiFetch(
        `/lists/${listId}/shares`,
      );
      setShares(updated);
      setEmail("");
    } catch (err: any) {
      setError(err.message || "Failed to share list");
    } finally {
      setSharing(false);
    }
  }

  async function handleRemove(userId: string) {
    setError(null);
    try {
      await apiFetch(`/lists/${listId}/shares/${userId}`, {
        method: "DELETE",
      });
      setShares((prev) => prev.filter((s) => s.userId !== userId));
    } catch (err: any) {
      setError(err.message || "Failed to remove share");
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
      <Modal className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md flex flex-col max-h-[90vh]">
        <Dialog
          aria-label={`Share ${listName}`}
          className="flex flex-col flex-1 overflow-hidden outline-none"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700 shrink-0">
            <Heading
              slot="title"
              className="text-lg font-semibold text-gray-900 dark:text-gray-100"
            >
              Share "{listName}"
            </Heading>
            <Button
              onPress={onClose}
              aria-label="Close"
              className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 rounded-md p-1 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              <XMarkIcon className="h-5 w-5" />
            </Button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
            <form onSubmit={handleShare} className="flex gap-2">
              <input
                type="email"
                placeholder="Their email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={sharing}
                className="flex-1 min-w-0 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 dark:bg-gray-700 dark:text-white dark:disabled:bg-gray-600"
              />
              <button
                type="submit"
                disabled={sharing || !email.trim()}
                className={`px-3 py-1 rounded-md text-white ${
                  sharing || !email.trim()
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-500 hover:bg-blue-700"
                }`}
              >
                Share
              </button>
            </form>

            {error && <p className="text-red-600 text-sm">{error}</p>}

            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                People with view access
              </p>
              {loading ? (
                <p className="text-sm text-gray-400 dark:text-gray-500">
                  Loading…
                </p>
              ) : shares.length === 0 ? (
                <p className="text-sm text-gray-400 dark:text-gray-500">
                  Not shared with anyone yet.
                </p>
              ) : (
                <div className="border border-gray-200 dark:border-gray-700 rounded-md divide-y divide-gray-100 dark:divide-gray-700">
                  {shares.map((share) => (
                    <div
                      key={share.userId}
                      className="flex items-center justify-between gap-2 px-3 py-2"
                    >
                      <div className="min-w-0">
                        <div className="text-sm font-medium truncate dark:text-gray-100">
                          {share.name}
                        </div>
                        <div className="text-xs text-gray-400 dark:text-gray-500 truncate">
                          {share.email}
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemove(share.userId)}
                        className="shrink-0 cursor-pointer"
                        aria-label={`Remove access for ${share.name}`}
                      >
                        <XMarkIcon className="h-4 w-4 text-gray-400 hover:text-red-600" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </Dialog>
      </Modal>
    </ModalOverlay>
  );
}
