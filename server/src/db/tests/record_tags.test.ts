import { describe, it, expect } from "vitest";
import * as persons from "../queries/persons.js";
import * as records from "../queries/records.js";
import * as tags from "../queries/tags.js";
import * as recordTags from "../queries/record_tags.js";
import {
  createTestUser,
  createTestPerson,
  cleanupTestUser,
} from "./testUtils.js";

describe("record_tags queries", () => {
  it("add and remove tags on a record", async () => {
    let user;
    let person;
    let record;
    let tag;
    let added;
    try {
      user = (await createTestUser("rt")).user;
      person = await createTestPerson(user.id, "RTPerson");
      record = await records.addRecord(user.id, person.id, "Tagged Item");
      tag = await tags.createTag(user.id, "Tag1");
      added = await recordTags.addTagToRecord(record.id, tag.id);
      expect(added).toBeDefined();

      const byRecord = await recordTags.getTagsByRecordId(record.id);
      expect(byRecord.length).toBeGreaterThan(0);

      await recordTags.removeTagFromRecord(record.id, tag.id);
      const after = await recordTags.getTagsByRecordId(record.id);
      expect(after.length).toBe(0);
    } finally {
      if (record?.id) await records.deleteRecord(record.id);
      if (tag?.id) await tags.deleteTag(tag.id);
      if (person?.id) await persons.deletePerson(person.id);
      if (user?.id) await cleanupTestUser(user.id);
    }
  });
});
