import { vi, describe, it, expect, beforeEach } from 'vitest';

vi.mock('../../db/queries/tags.js', () => ({
  createTag: vi.fn(),
  getTagById: vi.fn(),
  getTagsByUserId: vi.fn(),
  updateTag: vi.fn(),
  deleteTag: vi.fn(),
}));

import * as tagsService from '../tags.js';
import * as tagsDb from '../../db/queries/tags.js';

beforeEach(() => vi.clearAllMocks());

describe('tags service', () => {
  it('updateTag enforces ownership', async () => {
    (tagsDb.getTagById as any).mockResolvedValue(null);
    await expect(tagsService.updateTag('u1', 't1', 'name')).rejects.toThrow();

    (tagsDb.getTagById as any).mockResolvedValue({ id: 't1', userId: 'other' });
    await expect(tagsService.updateTag('u1', 't1', 'name')).rejects.toThrow();
  });
});
