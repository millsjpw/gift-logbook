import { useEffect, useRef, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import Layout from "../components/Layout";
import PageLoader from "../components/PageLoader";
import { apiFetch } from "../api/client";
import type {
  ExchangeAssignment,
  FullExchange,
  PersonExclusion,
} from "../models/Exchanges";
import type { Person } from "../models/Person";
import {
  ArrowPathIcon,
  BookmarkIcon,
  ChevronDownIcon,
  NoSymbolIcon,
  UserPlusIcon,
  XMarkIcon,
} from "@heroicons/react/24/solid";
import {
  Button,
  ListBox,
  ListBoxItem,
  Popover,
  Select,
  SelectValue,
} from "react-aria-components";

export default function GiftExchangeView() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const [exchange, setExchange] = useState<FullExchange | null>(
    location.state?.exchange ?? null,
  );
  const [loading, setLoading] = useState(!location.state?.exchange);
  const [error, setError] = useState<string | null>(null);
  const [persons, setPersons] = useState<Person[]>([]);
  const [pendingAssignments, setPendingAssignments] = useState<
    ExchangeAssignment[] | null
  >(null);

  const [addInput, setAddInput] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const addInputRef = useRef<HTMLInputElement>(null);
  const addDropdownRef = useRef<HTMLDivElement>(null);

  const [randomizing, setRandomizing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  // Exclusions: cached by personId, loaded lazily when a row is expanded
  const [exclusionsByPerson, setExclusionsByPerson] = useState<
    Map<string, PersonExclusion[]>
  >(new Map());
  const [expandedPersonId, setExpandedPersonId] = useState<string | null>(null);

  const [otherExchanges, setOtherExchanges] = useState<FullExchange[]>([]);
  const [copyLoading, setCopyLoading] = useState(false);

  useEffect(() => {
    if (!exchange) fetchExchange();
    fetchPersons();
    fetchOtherExchanges();
  }, [id]);

  useEffect(() => {
    if (!addOpen) return;
    function handleMouseDown(e: MouseEvent) {
      if (
        !addInputRef.current?.contains(e.target as Node) &&
        !addDropdownRef.current?.contains(e.target as Node)
      ) {
        setAddOpen(false);
      }
    }
    document.addEventListener("mousedown", handleMouseDown);
    return () => document.removeEventListener("mousedown", handleMouseDown);
  }, [addOpen]);

  async function fetchExchange() {
    setLoading(true);
    setError(null);
    try {
      const data: FullExchange = await apiFetch(`/exchanges/${id}`);
      setExchange(data);
    } catch (err: any) {
      setError(err.message || "Failed to load exchange");
    } finally {
      setLoading(false);
    }
  }

  async function fetchPersons() {
    try {
      const data: Person[] = await apiFetch("/persons");
      setPersons(data);
    } catch {
      // non-fatal: persons list just won't be available for typeahead
    }
  }

  async function fetchOtherExchanges() {
    try {
      const data: FullExchange[] = await apiFetch("/exchanges");
      setOtherExchanges(data.filter((e) => e.exchange.id !== id));
    } catch {
      // non-fatal
    }
  }

  function addParticipantToState(person: Person) {
    setExchange((prev) =>
      prev
        ? {
            ...prev,
            participants: [
              ...prev.participants,
              { exchangeId: id!, personId: person.id, personName: person.name },
            ],
          }
        : prev,
    );
    setPendingAssignments(null);
  }

  async function handleAddExistingParticipant(person: Person) {
    setAddInput("");
    setAddOpen(false);
    setAddLoading(true);
    setActionError(null);
    try {
      await apiFetch(`/exchanges/${id}/participants`, {
        method: "POST",
        body: JSON.stringify({ personId: person.id }),
      });
      addParticipantToState(person);
    } catch (err: any) {
      setActionError(err.message || "Failed to add participant");
    } finally {
      setAddLoading(false);
    }
  }

  async function handleCreateAndAddParticipant(name: string) {
    if (!name.trim()) return;
    setAddInput("");
    setAddOpen(false);
    setAddLoading(true);
    setActionError(null);
    try {
      const newPerson: Person = await apiFetch("/persons", {
        method: "POST",
        body: JSON.stringify({ name: name.trim() }),
      });
      await apiFetch(`/exchanges/${id}/participants`, {
        method: "POST",
        body: JSON.stringify({ personId: newPerson.id }),
      });
      setPersons((prev) => [...prev, newPerson]);
      addParticipantToState(newPerson);
    } catch (err: any) {
      setActionError(err.message || "Failed to create participant");
    } finally {
      setAddLoading(false);
    }
  }

  async function handleRemoveParticipant(personId: string) {
    setActionError(null);
    try {
      await apiFetch(`/exchanges/${id}/participants/${personId}`, {
        method: "DELETE",
      });
      setExchange((prev) =>
        prev
          ? {
              ...prev,
              participants: prev.participants.filter(
                (p) => p.personId !== personId,
              ),
            }
          : prev,
      );
      setPendingAssignments(null);
      if (expandedPersonId === personId) setExpandedPersonId(null);
    } catch (err: any) {
      setActionError(err.message || "Failed to remove participant");
    }
  }

  async function handleRandomize() {
    setRandomizing(true);
    setActionError(null);
    try {
      const assignments: ExchangeAssignment[] = await apiFetch(
        `/exchanges/${id}/generate`,
      );
      setPendingAssignments(assignments);
    } catch (err: any) {
      setActionError(err.message || "Failed to generate assignments");
    } finally {
      setRandomizing(false);
    }
  }

  async function handleSave() {
    if (!pendingAssignments) return;
    setSaving(true);
    setActionError(null);
    try {
      await apiFetch(`/exchanges/${id}/assignments`, {
        method: "POST",
        body: JSON.stringify({
          assignments: pendingAssignments.map(({ giverId, receiverId }) => ({
            giverId,
            receiverId,
          })),
        }),
      });
      setExchange((prev) =>
        prev ? { ...prev, assignments: pendingAssignments } : prev,
      );
      setPendingAssignments(null);
    } catch (err: any) {
      setActionError(err.message || "Failed to save assignments");
    } finally {
      setSaving(false);
    }
  }

  async function handleCopyFrom(sourceId: string) {
    if (!exchange) return;
    const source = otherExchanges.find((e) => e.exchange.id === sourceId);
    if (!source) return;
    setCopyLoading(true);
    setActionError(null);
    try {
      const participants = await apiFetch(`/exchanges/${id}/participants`, {
        method: "PUT",
        body: JSON.stringify({
          personIds: source.participants.map((p) => p.personId),
        }),
      });
      setExchange((prev) =>
        prev ? { ...prev, participants } : prev,
      );
      setPendingAssignments(
        source.assignments?.length
          ? source.assignments.map((a) => ({ ...a, exchangeId: id! }))
          : null,
      );
      setExpandedPersonId(null);
      setExclusionsByPerson(new Map());
    } catch (err: any) {
      setActionError(err.message || "Failed to copy exchange");
    } finally {
      setCopyLoading(false);
    }
  }

  async function handleToggleExclusionPanel(personId: string) {
    if (expandedPersonId === personId) {
      setExpandedPersonId(null);
      return;
    }
    if (!exclusionsByPerson.has(personId)) {
      try {
        const data: PersonExclusion[] = await apiFetch(
          `/persons/${personId}/exclusions`,
        );
        setExclusionsByPerson((prev) => new Map(prev).set(personId, data));
      } catch {
        setExclusionsByPerson((prev) => new Map(prev).set(personId, []));
      }
    }
    setExpandedPersonId(personId);
  }

  async function handleToggleExclusion(
    personId: string,
    targetPersonId: string,
    targetPersonName: string,
  ) {
    const current = exclusionsByPerson.get(personId) ?? [];
    const isExcluded = current.some((e) => e.personId2 === targetPersonId);
    const next = isExcluded
      ? current.filter((e) => e.personId2 !== targetPersonId)
      : [
          ...current,
          {
            personId1: personId,
            personId2: targetPersonId,
            personName2: targetPersonName,
          },
        ];

    // Optimistic update
    setExclusionsByPerson((prev) => new Map(prev).set(personId, next));
    try {
      await apiFetch(`/persons/${personId}/exclusions`, {
        method: "PUT",
        body: JSON.stringify({
          excludedPersonIds: next.map((e) => e.personId2),
        }),
      });
    } catch (err: any) {
      setExclusionsByPerson((prev) => new Map(prev).set(personId, current));
      setActionError(err.message || "Failed to update exclusions");
    }
  }

  const participantIds = new Set(
    exchange?.participants.map((p) => p.personId) ?? [],
  );
  const availablePersons = persons.filter((p) => !participantIds.has(p.id));
  const filteredPersons = addInput.trim()
    ? availablePersons.filter((p) =>
        p.name.toLowerCase().includes(addInput.toLowerCase()),
      )
    : availablePersons;
  const showCreateOption =
    addInput.trim().length > 0 &&
    !filteredPersons.some(
      (p) => p.name.toLowerCase() === addInput.trim().toLowerCase(),
    );

  const displayedAssignments =
    pendingAssignments ?? exchange?.assignments ?? [];

  return (
    <Layout>
      <PageLoader loading={loading} error={error}>
        {exchange && (
          <div className="p-4 max-w-2xl mx-auto">
            <div className="flex items-center gap-4 mb-6 flex-wrap">
              <h1 className="text-2xl font-bold">
                {exchange.exchange.name}
              </h1>
              {otherExchanges.length > 0 && (
                <Select
                  placeholder="Copy from…"
                  isDisabled={copyLoading}
                  onSelectionChange={(key) =>
                    key && handleCopyFrom(key as string)
                  }
                  aria-label="Copy participants from another exchange"
                >
                  <Button className="flex items-center gap-1.5 px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
                    <SelectValue className="text-gray-500 dark:text-gray-400 data-[placeholder]:text-gray-400" />
                    <ChevronDownIcon className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                  </Button>
                  <Popover className="w-56 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg overflow-auto max-h-64 z-20">
                    <ListBox className="p-1 outline-none">
                      {otherExchanges.map((e) => (
                        <ListBoxItem
                          key={e.exchange.id}
                          id={e.exchange.id}
                          textValue={e.exchange.name}
                          className="px-3 py-2 text-sm rounded cursor-pointer outline-none text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 focus:bg-blue-50 dark:focus:bg-blue-900 selected:bg-blue-100 dark:selected:bg-blue-800"
                        >
                          {e.exchange.name}
                        </ListBoxItem>
                      ))}
                    </ListBox>
                  </Popover>
                </Select>
              )}
            </div>

            {/* Add participant input */}
            <div className="relative mb-6">
              <div className="flex items-center gap-2">
                <UserPlusIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <input
                  ref={addInputRef}
                  type="text"
                  value={addInput}
                  onChange={(e) => {
                    setAddInput(e.target.value);
                    setAddOpen(true);
                  }}
                  onFocus={() => setAddOpen(true)}
                  placeholder="Add a participant…"
                  disabled={addLoading}
                  className="flex-1 px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 disabled:opacity-50"
                />
              </div>
              {addOpen && (
                <div
                  ref={addDropdownRef}
                  className="absolute left-6 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg max-h-48 overflow-y-auto z-10"
                >
                  {filteredPersons.length === 0 && !addInput.trim() && (
                    <span className="block px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
                      {availablePersons.length === 0
                        ? "All your people are already in this exchange"
                        : "No people yet — type a name to create one"}
                    </span>
                  )}
                  {filteredPersons.map((p) => (
                    <button
                      key={p.id}
                      onMouseDown={() => handleAddExistingParticipant(p)}
                      className="w-full text-left px-3 py-1.5 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-gray-200"
                    >
                      {p.name}
                    </button>
                  ))}
                  {showCreateOption && (
                    <button
                      onMouseDown={() =>
                        handleCreateAndAddParticipant(addInput.trim())
                      }
                      className={`w-full text-left px-3 py-1.5 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900 ${
                        filteredPersons.length > 0
                          ? "border-t border-gray-100 dark:border-gray-700"
                          : ""
                      }`}
                    >
                      Create "{addInput.trim()}"
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Participants table */}
            <div className="mb-4">
              <div className="grid grid-cols-[1fr_1.5rem_1fr_2rem_2rem] gap-x-2 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                <span>Participant</span>
                <span />
                <span>Assigned to</span>
                <span />
                <span />
              </div>

              {exchange.participants.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400 px-3 py-6 text-center border border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                  No participants yet — add someone below.
                </p>
              ) : (
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg divide-y divide-gray-100 dark:divide-gray-700">
                  {exchange.participants.map((p) => {
                    const assignment = displayedAssignments.find(
                      (a) => a.giverId === p.personId,
                    );
                    const exclusions = exclusionsByPerson.get(p.personId);
                    const exclusionCount = exclusions?.length ?? 0;
                    const isExpanded = expandedPersonId === p.personId;
                    const otherParticipants = exchange.participants.filter(
                      (other) => other.personId !== p.personId,
                    );

                    return (
                      <div key={p.personId}>
                        <div className="grid grid-cols-[1fr_1.5rem_1fr_2rem_2rem] gap-x-2 items-center px-3 py-2.5">
                          <span className="font-medium text-gray-800 dark:text-gray-100 truncate">
                            {p.personName}
                          </span>
                          <span className="text-gray-400 dark:text-gray-500 text-center select-none">
                            →
                          </span>
                          <span
                            className={`truncate text-sm ${
                              assignment
                                ? "text-gray-800 dark:text-gray-100"
                                : "text-gray-400 dark:text-gray-500"
                            }`}
                          >
                            {assignment?.receiverName ?? "—"}
                          </span>
                          <button
                            onClick={() =>
                              handleToggleExclusionPanel(p.personId)
                            }
                            className={`flex items-center justify-center p-1 rounded transition-colors ${
                              exclusionCount > 0
                                ? "text-orange-400 dark:text-orange-500"
                                : "text-gray-300 dark:text-gray-600 hover:text-gray-500 dark:hover:text-gray-400"
                            }`}
                            aria-label={`Edit exclusions for ${p.personName}`}
                            title="Edit exclusions"
                          >
                            <NoSymbolIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleRemoveParticipant(p.personId)}
                            className="flex items-center justify-center p-1 text-gray-400 hover:text-red-500 dark:hover:text-red-400 rounded transition-colors"
                            aria-label={`Remove ${p.personName}`}
                          >
                            <XMarkIcon className="w-4 h-4" />
                          </button>
                        </div>

                        {isExpanded && (
                          <div className="px-3 pb-3 pt-1 bg-gray-50 dark:bg-gray-800/60 border-t border-gray-100 dark:border-gray-700">
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                              {p.personName} cannot give to:
                            </p>
                            {otherParticipants.length === 0 ? (
                              <p className="text-xs text-gray-400 dark:text-gray-500 italic">
                                No other participants yet.
                              </p>
                            ) : (
                              <div className="flex flex-wrap gap-1.5">
                                {otherParticipants.map((other) => {
                                  const excluded = (
                                    exclusionsByPerson.get(p.personId) ?? []
                                  ).some((e) => e.personId2 === other.personId);
                                  return (
                                    <button
                                      key={other.personId}
                                      onClick={() =>
                                        handleToggleExclusion(
                                          p.personId,
                                          other.personId,
                                          other.personName,
                                        )
                                      }
                                      className={`px-2.5 py-0.5 text-xs rounded-full border transition-colors ${
                                        excluded
                                          ? "bg-orange-100 border-orange-300 text-orange-700 dark:bg-orange-900/50 dark:border-orange-700 dark:text-orange-300"
                                          : "bg-gray-100 border-gray-300 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600"
                                      }`}
                                    >
                                      {other.personName}
                                    </button>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {actionError && (
              <p className="text-sm text-red-600 dark:text-red-400 mb-4">
                {actionError}
              </p>
            )}
            {pendingAssignments && (
              <p className="text-sm text-amber-600 dark:text-amber-400 mb-4">
                Assignments generated — review and save when ready.
              </p>
            )}

            {/* Actions */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleRandomize}
                disabled={
                  randomizing || (exchange.participants.length ?? 0) < 2
                }
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ArrowPathIcon
                  className={`w-4 h-4 ${randomizing ? "animate-spin" : ""}`}
                />
                {randomizing ? "Randomizing…" : "Randomize"}
              </button>
              {pendingAssignments && (
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <BookmarkIcon className="w-4 h-4" />
                  {saving ? "Saving…" : "Save"}
                </button>
              )}
            </div>
          </div>
        )}
      </PageLoader>
    </Layout>
  );
}
