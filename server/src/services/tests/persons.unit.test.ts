import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";

vi.mock("../../db/queries/persons.js", () => ({
  createPerson: vi.fn(),
  getPersonById: vi.fn(),
  getPersonsByUserId: vi.fn(),
  getPersonsByName: vi.fn(),
  updatePerson: vi.fn(),
  deletePerson: vi.fn(),
  deletePersonsByUserId: vi.fn(),
}));
vi.mock("../../db/queries/person_tags.js", () => ({
  getTagsByPersonId: vi.fn().mockResolvedValue([]),
  syncTagsForPerson: vi.fn().mockResolvedValue(undefined),
}));
vi.mock("../../db/queries/tags.js", () => ({
  findOrCreateTag: vi.fn(),
  getTagsByUserId: vi.fn(),
  getTagById: vi.fn(),
  updateTag: vi.fn(),
  deleteTag: vi.fn(),
  deleteTagsByUserId: vi.fn(),
  createTag: vi.fn(),
}));
import * as personsService from "../persons.js";
import * as personsDb from "../../db/queries/persons.js";
import { NotFoundError, UserForbiddenError } from "../../api/errors.js";

beforeEach(() => vi.clearAllMocks());

describe("persons service", () => {
  it("updatePerson throws NotFoundError when person not found", async () => {
    (personsDb.getPersonById as any).mockResolvedValue(null);
    await expect(
      personsService.updatePerson("u1", "p1", "Name"),
    ).rejects.toThrow(NotFoundError);
  });

  it("updatePerson throws UserForbiddenError when not owner", async () => {
    (personsDb.getPersonById as any).mockResolvedValue({
      id: "p1",
      userId: "other",
    });
    await expect(
      personsService.updatePerson("u1", "p1", "Name"),
    ).rejects.toThrow(UserForbiddenError);
  });

  it("updatePerson calls db when owner", async () => {
    (personsDb.getPersonById as any).mockResolvedValue({
      id: "p1",
      userId: "u1",
    });
    (personsDb.updatePerson as any).mockResolvedValue({
      id: "p1",
      name: "New",
    });
    const res = await personsService.updatePerson("u1", "p1", "New");
    expect(personsDb.updatePerson).toHaveBeenCalledWith(
      "p1",
      "New",
      undefined,
      undefined,
      undefined,
    );
    expect(res).toBeDefined();
  });

  it("updatePerson passes birth date fields to db", async () => {
    (personsDb.getPersonById as any).mockResolvedValue({
      id: "p1",
      userId: "u1",
    });
    (personsDb.updatePerson as any).mockResolvedValue({
      id: "p1",
      name: "Name",
      birthMonth: 4,
      birthDay: 10,
      birthYear: 1992,
    });
    const res = await personsService.updatePerson(
      "u1",
      "p1",
      "Name",
      4,
      10,
      1992,
    );
    expect(personsDb.updatePerson).toHaveBeenCalledWith(
      "p1",
      "Name",
      4,
      10,
      1992,
    );
    expect(res).toBeDefined();
  });
});

describe("addPerson", () => {
  it("passes birth date fields through to db", async () => {
    (personsDb.createPerson as any).mockResolvedValue({
      id: "p1",
      name: "Alice",
      birthMonth: 6,
      birthDay: 15,
      birthYear: 1995,
    });
    await personsService.addPerson("u1", "Alice", 6, 15, 1995);
    expect(personsDb.createPerson).toHaveBeenCalledWith(
      "u1",
      "Alice",
      6,
      15,
      1995,
    );
  });

  it("passes null birth fields when not provided", async () => {
    (personsDb.createPerson as any).mockResolvedValue({
      id: "p1",
      name: "Bob",
    });
    await personsService.addPerson("u1", "Bob");
    expect(personsDb.createPerson).toHaveBeenCalledWith(
      "u1",
      "Bob",
      undefined,
      undefined,
      undefined,
    );
  });
});

describe("getUpcomingBirthdays", () => {
  // Freeze time to May 6, 2026 for deterministic date math
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 4, 6)); // month is 0-indexed
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns empty array when no people have birth dates set", async () => {
    (personsDb.getPersonsByUserId as any).mockResolvedValue([
      {
        id: "p1",
        name: "Alice",
        userId: "u1",
        birthMonth: null,
        birthDay: null,
        birthYear: null,
      },
    ]);
    const res = await personsService.getUpcomingBirthdays("u1");
    expect(res).toEqual([]);
  });

  it("formats birthday without year when birthYear is null", async () => {
    (personsDb.getPersonsByUserId as any).mockResolvedValue([
      {
        id: "p1",
        name: "Alice",
        userId: "u1",
        birthMonth: 5,
        birthDay: 10,
        birthYear: null,
      },
    ]);
    const res = await personsService.getUpcomingBirthdays("u1");
    expect(res).toEqual(["4 days until 5/10 - Alice's birthday"]);
  });

  it("formats birthday without ordinal when birth year is placeholder 1900", async () => {
    (personsDb.getPersonsByUserId as any).mockResolvedValue([
      {
        id: "p1",
        name: "Bob",
        userId: "u1",
        birthMonth: 5,
        birthDay: 10,
        birthYear: 1900,
      },
    ]);
    const res = await personsService.getUpcomingBirthdays("u1");
    expect(res).toEqual(["4 days until 5/10 - Bob's birthday"]);
  });

  it("formats birthday with ordinal age when birth year is set", async () => {
    // May 10, 1990 → turning 36 in 2026
    (personsDb.getPersonsByUserId as any).mockResolvedValue([
      {
        id: "p1",
        name: "Carol",
        userId: "u1",
        birthMonth: 5,
        birthDay: 10,
        birthYear: 1990,
      },
    ]);
    const res = await personsService.getUpcomingBirthdays("u1");
    expect(res).toEqual(["4 days until 5/10 - Carol's 36th birthday"]);
  });

  it("uses 11th/12th/13th (not 11st/12nd/13rd) for teen ordinals", async () => {
    // May 10, 2015 → turning 11 in 2026
    (personsDb.getPersonsByUserId as any).mockResolvedValue([
      {
        id: "p1",
        name: "Dave",
        userId: "u1",
        birthMonth: 5,
        birthDay: 10,
        birthYear: 2015,
      },
    ]);
    const res = await personsService.getUpcomingBirthdays("u1");
    expect(res).toEqual(["4 days until 5/10 - Dave's 11th birthday"]);
  });

  it("includes today's birthday with daysUntil of 0", async () => {
    (personsDb.getPersonsByUserId as any).mockResolvedValue([
      {
        id: "p1",
        name: "Eve",
        userId: "u1",
        birthMonth: 5,
        birthDay: 6,
        birthYear: null,
      },
    ]);
    const res = await personsService.getUpcomingBirthdays("u1");
    expect(res).toEqual(["0 days until 5/6 - Eve's birthday"]);
  });

  it("rolls to next year for birthdays already passed", async () => {
    // April 30 has already passed (today is May 6)
    (personsDb.getPersonsByUserId as any).mockResolvedValue([
      {
        id: "p1",
        name: "Frank",
        userId: "u1",
        birthMonth: 4,
        birthDay: 30,
        birthYear: null,
      },
      {
        id: "p2",
        name: "Grace",
        userId: "u1",
        birthMonth: 5,
        birthDay: 10,
        birthYear: null,
      },
    ]);
    // Pass daysAhead=400 so Frank (Apr 30 next year, ~359 days) is included
    const res = await personsService.getUpcomingBirthdays("u1", 5, 400);
    // Grace (May 10, 4 days away) should come before Frank (Apr 30 next year)
    expect(res[0]).toContain("Grace");
    expect(res[1]).toContain("Frank");
  });

  it("sorts by days until upcoming (sooner first)", async () => {
    (personsDb.getPersonsByUserId as any).mockResolvedValue([
      {
        id: "p2",
        name: "Zara",
        userId: "u1",
        birthMonth: 5,
        birthDay: 20,
        birthYear: null,
      },
      {
        id: "p1",
        name: "Amy",
        userId: "u1",
        birthMonth: 5,
        birthDay: 10,
        birthYear: null,
      },
    ]);
    const res = await personsService.getUpcomingBirthdays("u1");
    expect(res[0]).toContain("Amy");
    expect(res[1]).toContain("Zara");
  });

  it("respects limit parameter", async () => {
    (personsDb.getPersonsByUserId as any).mockResolvedValue([
      {
        id: "p1",
        name: "A",
        userId: "u1",
        birthMonth: 5,
        birthDay: 10,
        birthYear: null,
      },
      {
        id: "p2",
        name: "B",
        userId: "u1",
        birthMonth: 5,
        birthDay: 11,
        birthYear: null,
      },
      {
        id: "p3",
        name: "C",
        userId: "u1",
        birthMonth: 5,
        birthDay: 12,
        birthYear: null,
      },
    ]);
    const res = await personsService.getUpcomingBirthdays("u1", 2);
    expect(res).toHaveLength(2);
  });

  it("defaults to limit of 5", async () => {
    const people = Array.from({ length: 7 }, (_, i) => ({
      id: `p${i}`,
      name: `Person${i}`,
      userId: "u1",
      birthMonth: 5,
      birthDay: 10 + i,
      birthYear: null,
    }));
    (personsDb.getPersonsByUserId as any).mockResolvedValue(people);
    const res = await personsService.getUpcomingBirthdays("u1");
    expect(res).toHaveLength(5);
  });

  it("excludes birthdays beyond daysAhead", async () => {
    (personsDb.getPersonsByUserId as any).mockResolvedValue([
      // 4 days away — within 10 day window
      {
        id: "p1",
        name: "Near",
        userId: "u1",
        birthMonth: 5,
        birthDay: 10,
        birthYear: null,
      },
      // 30 days away — outside 10 day window
      {
        id: "p2",
        name: "Far",
        userId: "u1",
        birthMonth: 6,
        birthDay: 5,
        birthYear: null,
      },
    ]);
    const res = await personsService.getUpcomingBirthdays("u1", 5, 10);
    expect(res).toHaveLength(1);
    expect(res[0]).toContain("Near");
  });

  it("defaults to daysAhead of 180", async () => {
    // 181 days from May 6, 2026 is Nov 3, 2026
    (personsDb.getPersonsByUserId as any).mockResolvedValue([
      // Nov 2 = 180 days ahead — included
      {
        id: "p1",
        name: "InWindow",
        userId: "u1",
        birthMonth: 11,
        birthDay: 2,
        birthYear: null,
      },
      // Nov 4 = 182 days ahead — excluded
      {
        id: "p2",
        name: "OutOfWindow",
        userId: "u1",
        birthMonth: 11,
        birthDay: 4,
        birthYear: null,
      },
    ]);
    const res = await personsService.getUpcomingBirthdays("u1");
    expect(res.some((r) => r.includes("InWindow"))).toBe(true);
    expect(res.some((r) => r.includes("OutOfWindow"))).toBe(false);
  });
});
