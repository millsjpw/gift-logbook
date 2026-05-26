import { useEffect, useRef, useState } from "react";
import {
  Button,
  ColorArea,
  ColorField,
  ColorPicker,
  ColorSlider,
  ColorSwatch,
  ColorThumb,
  Dialog,
  DialogTrigger,
  Heading,
  Input,
  Label,
  Modal,
  ModalOverlay,
  Popover,
  SliderTrack,
  parseColor,
} from "react-aria-components";
import { TrashIcon, XMarkIcon } from "@heroicons/react/24/solid";
import { apiFetch } from "../api/client";
import { useAuth } from "../context/AuthContext";
import type { Tag } from "../models/Tag";
import type { User } from "../api/auth";

type LocalTag = { id: string; name: string; color: string };

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsModal({ isOpen, onClose }: Props) {
  const { user, setUser } = useAuth();
  const [name, setName] = useState(user?.name ?? "");
  const [tags, setTags] = useState<LocalTag[]>([]);
  const [deletedTagIds, setDeletedTagIds] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const originalName = useRef(user?.name ?? "");
  const originalTagNames = useRef<Record<string, string>>({});
  const originalTagColors = useRef<Record<string, string>>({});

  useEffect(() => {
    if (!isOpen || !user) return;

    setName(user.name);
    originalName.current = user.name;
    setDeletedTagIds([]);

    apiFetch("/tags")
      .then((t: Tag[]) => {
        setTags(
          t.map((tag) => ({ id: tag.id, name: tag.name, color: tag.color })),
        );
        originalTagNames.current = Object.fromEntries(
          t.map((tag) => [tag.id, tag.name]),
        );
        originalTagColors.current = Object.fromEntries(
          t.map((tag) => [tag.id, tag.color]),
        );
      })
      .catch(() => {});
  }, [isOpen, user]);

  function handleClose() {
    onClose();
  }

  function updateTagName(id: string, value: string) {
    setTags((prev) =>
      prev.map((t) => (t.id === id ? { ...t, name: value } : t)),
    );
  }

  function updateTagColor(id: string, color: string) {
    setTags((prev) => prev.map((t) => (t.id === id ? { ...t, color } : t)));
  }

  function removeTag(id: string) {
    setTags((prev) => prev.filter((t) => t.id !== id));
    setDeletedTagIds((prev) => [...prev, id]);
  }

  async function handleSave() {
    if (!user) return;
    setSaving(true);
    try {
      const ops: Promise<unknown>[] = [];

      if (name.trim() && name.trim() !== originalName.current) {
        ops.push(
          apiFetch(`/users/${user.id}`, {
            method: "PUT",
            body: JSON.stringify({ name: name.trim() }),
          }).then((u: User) => setUser(u)),
        );
      }

      for (const tag of tags) {
        const origName = originalTagNames.current[tag.id];
        const origColor = originalTagColors.current[tag.id];
        const nameChanged =
          origName !== undefined &&
          tag.name.trim() &&
          tag.name.trim() !== origName;
        const colorChanged = origColor !== undefined && tag.color !== origColor;
        if (nameChanged || colorChanged) {
          const body: Record<string, string> = {};
          if (nameChanged) body.name = tag.name.trim();
          if (colorChanged) body.color = tag.color;
          ops.push(
            apiFetch(`/tags/${tag.id}`, {
              method: "PUT",
              body: JSON.stringify(body),
            }),
          );
        }
      }

      for (const id of deletedTagIds) {
        ops.push(apiFetch(`/tags/${id}`, { method: "DELETE" }));
      }

      await Promise.all(ops);
      originalName.current = name.trim() || originalName.current;
      handleClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <ModalOverlay
      isOpen={isOpen}
      onOpenChange={(open) => {
        if (!open) handleClose();
      }}
      isDismissable
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
    >
      <Modal className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg flex flex-col max-h-[90vh]">
        <Dialog
          aria-label="Settings"
          className="flex flex-col flex-1 overflow-hidden outline-none"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700 shrink-0">
            <Heading
              slot="title"
              className="text-lg font-semibold text-gray-900 dark:text-gray-100"
            >
              Settings
            </Heading>
            <Button
              onPress={handleClose}
              aria-label="Close settings"
              className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 rounded-md p-1 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              <XMarkIcon className="h-5 w-5" />
            </Button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
            {/* Name */}
            <div>
              <label
                htmlFor="settings-name"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Name
              </label>
              <input
                id="settings-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            {/* Tags */}
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tags
              </p>
              <div className="max-h-80 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-md divide-y divide-gray-100 dark:divide-gray-700">
                {tags.length === 0 ? (
                  <p className="px-3 py-3 text-sm text-gray-400 dark:text-gray-500">
                    No tags yet.
                  </p>
                ) : (
                  tags.map((tag) => (
                    <div
                      key={tag.id}
                      className="flex items-center gap-2 px-3 py-2"
                    >
                      <ColorPicker
                        value={parseColor(tag.color)}
                        onChange={(c) =>
                          updateTagColor(tag.id, c.toString("hex"))
                        }
                      >
                        <DialogTrigger>
                          <Button
                            aria-label={`Pick color for tag ${tag.name}`}
                            className="shrink-0 rounded border border-gray-300 overflow-hidden cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                          >
                            <ColorSwatch className="w-6 h-6 block" />
                          </Button>
                          <Popover
                            placement="bottom start"
                            className="bg-white rounded-lg shadow-xl border border-gray-200 p-3 z-[200] outline-none"
                          >
                            <Dialog className="outline-none flex flex-col gap-3">
                              <ColorArea
                                colorSpace="hsb"
                                xChannel="saturation"
                                yChannel="brightness"
                                className="w-48 h-48 rounded relative"
                              >
                                <ColorThumb className="w-4 h-4 rounded-full border-2 border-white shadow -translate-x-1/2 -translate-y-1/2" />
                              </ColorArea>
                              <ColorSlider colorSpace="hsb" channel="hue">
                                <SliderTrack className="h-3 w-48 rounded relative">
                                  <ColorThumb className="w-4 h-4 rounded-full border-2 border-white shadow top-1/2 -translate-x-1/2 -translate-y-1/2" />
                                </SliderTrack>
                              </ColorSlider>
                              <ColorField className="flex items-center gap-2">
                                <Label className="text-xs text-gray-500 shrink-0">
                                  Hex
                                </Label>
                                <Input className="border border-gray-300 rounded px-2 py-1 text-xs w-28 focus:outline-none focus:ring-1 focus:ring-blue-500" />
                              </ColorField>
                            </Dialog>
                          </Popover>
                        </DialogTrigger>
                      </ColorPicker>
                      <input
                        type="text"
                        value={tag.name}
                        onChange={(e) => updateTagName(tag.id, e.target.value)}
                        className="flex-1 min-w-0 text-sm bg-transparent dark:text-gray-100 outline-none border-b border-transparent focus:border-gray-400 dark:focus:border-gray-500 transition-colors"
                        aria-label={`Tag name: ${tag.name}`}
                      />
                      <button
                        onClick={() => removeTag(tag.id)}
                        className="shrink-0 cursor-pointer"
                        aria-label={`Delete tag ${tag.name}`}
                      >
                        <TrashIcon className="h-4 w-4 text-red-500 hover:text-red-700" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end px-6 py-4 border-t border-gray-200 dark:border-gray-700 shrink-0">
            <Button
              onPress={handleSave}
              isDisabled={saving}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded-md text-sm font-medium cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              {saving ? "Saving…" : "Save"}
            </Button>
          </div>
        </Dialog>
      </Modal>
    </ModalOverlay>
  );
}
