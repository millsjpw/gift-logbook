import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  Autocomplete,
  Input,
  ListBox,
  ListBoxItem,
  TextField,
  useFilter,
} from "react-aria-components";
import type { Selection } from "react-aria-components";
import type { CSSProperties } from "react";
import type { Person } from "../models/Person";

type PersonTypeaheadProps = {
  persons: Person[];
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
};

export default function PersonTypeahead({
  persons,
  value,
  onChange,
  disabled,
}: PersonTypeaheadProps) {
  const { contains } = useFilter({ sensitivity: "base" });
  const [open, setOpen] = useState(false);
  const [dropdownStyle, setDropdownStyle] = useState<CSSProperties>({});
  const inputRef = useRef<HTMLInputElement>(null);
  const listboxContainerRef = useRef<HTMLDivElement>(null);

  // Measure input position so the portaled dropdown can align to it
  function measureInput() {
    if (inputRef.current) {
      const rect = inputRef.current.getBoundingClientRect();
      setDropdownStyle({
        position: "fixed",
        top: rect.bottom + 4,
        left: rect.left,
        width: rect.width,
        zIndex: 9999,
      });
    }
  }

  // Close on outside click — no onBlur, so arrow-key navigation never closes the list
  useEffect(() => {
    if (!open) return;
    function handleMouseDown(e: MouseEvent) {
      const target = e.target as Node;
      if (
        !inputRef.current?.contains(target) &&
        !listboxContainerRef.current?.contains(target)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleMouseDown);
    return () => document.removeEventListener("mousedown", handleMouseDown);
  }, [open]);

  function handleSelectionChange(keys: Selection) {
    if (keys === "all") return;
    const id = [...(keys as Set<string | number>)][0] as string | undefined;
    if (!id) return;
    const person = persons.find((p) => p.id === id);
    if (person) {
      onChange(person.name);
      setOpen(false);
    }
  }

  return (
    <Autocomplete
      inputValue={value}
      onInputChange={(v) => {
        onChange(v);
        if (v.length > 0) {
          measureInput();
          setOpen(true);
        } else {
          setOpen(false);
        }
      }}
      filter={contains}
    >
      <TextField isDisabled={disabled} aria-label="Person">
        <Input
          ref={inputRef}
          placeholder="Search people…"
          className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
          onFocus={() => {
            if (value) {
              measureInput();
              setOpen(true);
            }
          }}
        />
      </TextField>
      {open &&
        createPortal(
          <div ref={listboxContainerRef} style={dropdownStyle}>
            <ListBox
              items={persons}
              aria-label="People suggestions"
              selectionMode="single"
              onSelectionChange={handleSelectionChange}
              renderEmptyState={() => (
                <span className="block px-3 py-2 text-sm text-gray-500">
                  No matches
                </span>
              )}
              className="bg-white border border-gray-200 rounded-md shadow-lg max-h-48 overflow-y-auto"
            >
              {(person) => (
                <ListBoxItem
                  id={person.id}
                  textValue={person.name}
                  className={({ isFocused, isSelected }) =>
                    `px-3 py-1.5 cursor-pointer text-sm outline-none ${
                      isSelected
                        ? "bg-blue-100"
                        : isFocused
                          ? "bg-blue-50"
                          : "hover:bg-gray-50"
                    }`
                  }
                >
                  {person.name}
                </ListBoxItem>
              )}
            </ListBox>
          </div>,
          document.body,
        )}
    </Autocomplete>
  );
}
