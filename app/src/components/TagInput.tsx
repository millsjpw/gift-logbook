import { useEffect, useRef, useState } from "react";
import { apiFetch } from "../api/client";
import type { Tag } from "../models/Tag";
import TagBadge from "./TagBadge";

interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  disabled?: boolean;
  placeholder?: string;
}

export default function TagInput({
  tags,
  onChange,
  disabled,
  placeholder,
}: TagInputProps) {
  const [inputValue, setInputValue] = useState("");
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    apiFetch("/tags")
      .then((data: Tag[]) => setAvailableTags(data))
      .catch(() => {}); // degrade gracefully — typeahead just won't show
  }, []);

  const suggestions = availableTags
    .filter(
      (t) =>
        t.name.toLowerCase().includes(inputValue.toLowerCase()) &&
        !tags.includes(t.name),
    )
    .slice(0, 8);

  function getTagColor(name: string): string {
    return availableTags.find((t) => t.name === name)?.color ?? "#1d4ed8";
  }

  function commit(value: string) {
    const trimmed = value.trim();
    if (!trimmed || tags.includes(trimmed)) {
      setInputValue("");
      return;
    }
    onChange([...tags, trimmed]);
    setInputValue("");
  }

  function removeTag(tag: string) {
    onChange(tags.filter((t) => t !== tag));
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((i) => Math.min(i + 1, suggestions.length - 1));
      setIsOpen(true);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((i) => Math.max(i - 1, -1));
    } else if (e.key === "Enter" || e.key === "Tab") {
      e.preventDefault();
      if (highlightedIndex >= 0 && suggestions[highlightedIndex]) {
        pickSuggestion(suggestions[highlightedIndex]);
      } else if (inputValue.trim()) {
        commit(inputValue);
      }
    } else if (e.key === "Backspace" && !inputValue && tags.length > 0) {
      removeTag(tags[tags.length - 1]);
    } else if (e.key === "Escape") {
      setIsOpen(false);
      setHighlightedIndex(-1);
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    if (val.endsWith(",")) {
      commit(val.slice(0, -1));
    } else {
      setInputValue(val);
      setIsOpen(true);
      setHighlightedIndex(-1);
    }
  }

  function pickSuggestion(suggestion: Tag) {
    if (!tags.includes(suggestion.name)) {
      onChange([...tags, suggestion.name]);
    }
    setInputValue("");
    setIsOpen(false);
    setHighlightedIndex(-1);
    inputRef.current?.focus();
  }

  const showDropdown = isOpen && suggestions.length > 0;

  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs text-gray-500">
        Tags (press Enter or comma to add)
      </span>
      <div
        className="relative flex flex-wrap items-center gap-1 px-2 py-1 border border-gray-300 rounded-md bg-white focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 min-h-[36px] cursor-text"
        onClick={() => inputRef.current?.focus()}
      >
        {tags.map((tag) => (
          <TagBadge
            key={tag}
            name={tag}
            color={getTagColor(tag)}
            onRemove={disabled ? undefined : () => removeTag(tag)}
          />
        ))}
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsOpen(true)}
          onBlur={() => setTimeout(() => setIsOpen(false), 150)}
          disabled={disabled}
          placeholder={tags.length === 0 ? (placeholder ?? "Add a tag…") : ""}
          className="outline-none text-sm flex-1 min-w-[6rem] bg-transparent"
        />
        {showDropdown && (
          <ul className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-20 max-h-48 overflow-y-auto">
            {suggestions.map((s, i) => (
              <li key={s.id}>
                <button
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    pickSuggestion(s);
                  }}
                  onMouseEnter={() => setHighlightedIndex(i)}
                  className={`w-full text-left px-3 py-1.5 text-sm flex items-center gap-2 ${
                    i === highlightedIndex ? "bg-gray-100" : "hover:bg-gray-50"
                  }`}
                >
                  <span
                    className="w-3 h-3 rounded-full shrink-0 border border-black/10"
                    style={{ backgroundColor: s.color }}
                  />
                  {s.name}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
