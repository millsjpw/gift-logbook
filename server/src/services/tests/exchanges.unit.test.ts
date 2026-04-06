import { vi, describe, it, expect, beforeEach } from 'vitest';

vi.mock('../../db/queries/exchanges.js', () => ({
  getExchangeById: vi.fn(),
  createExchange: vi.fn(),
}));

vi.mock('../../db/queries/exchange_participants.js', () => ({
  getParticipantsByExchangeId: vi.fn(),
  bulkInsertParticipants: vi.fn(),
  addParticipantToExchange: vi.fn(),
}));

vi.mock('../../db/queries/exchange_assignments.js', () => ({
  getAssignmentsByExchangeId: vi.fn(),
  getNextRound: vi.fn(),
  bulkInsertAssignments: vi.fn(),
}));

vi.mock('../../db/queries/exchange_exclusions.js', () => ({
  getExclusionsByExchangeId: vi.fn(),
  removeExclusionsForPersonInExchange: vi.fn(),
  bulkInsertExclusions: vi.fn(),
}));

import * as exchService from '../exchanges.js';
import * as exchangesDb from '../../db/queries/exchanges.js';
import * as participantsDb from '../../db/queries/exchange_participants.js';
import * as assignmentsDb from '../../db/queries/exchange_assignments.js';
import * as exclusionsDb from '../../db/queries/exchange_exclusions.js';
import { NotFoundError, BadRequestError } from '../../api/errors.js';

beforeEach(() => vi.clearAllMocks());

describe('exchanges service', () => {
  it('getFullExchange returns composed object', async () => {
    (exchangesDb.getExchangeById as any).mockResolvedValue({ id: 'e1', name: 'E' });
    (participantsDb.getParticipantsByExchangeId as any).mockResolvedValue([{ personId: 'p1' }]);
    (assignmentsDb.getAssignmentsByExchangeId as any).mockResolvedValue([{ giverId: 'p1', receiverId: 'p2' }]);
    (exclusionsDb.getExclusionsByExchangeId as any).mockResolvedValue([{ personId1: 'p1', personId2: 'p3' }]);

    const res = await exchService.getFullExchange('e1');
    expect(res.exchange).toBeDefined();
    expect(res.participants.length).toBe(1);
    expect(res.assignments.length).toBe(1);
    expect(res.exclusions.length).toBe(1);
  });

  it('getFullExchange throws NotFoundError when exchange not found', async () => {
    (exchangesDb.getExchangeById as any).mockResolvedValue(null);
    await expect(exchService.getFullExchange('nope')).rejects.toThrow(NotFoundError);
  });

  it('createExchange and addParticipant delegate to db', async () => {
    (exchangesDb.createExchange as any).mockResolvedValue({ id: 'ne' });
    (participantsDb.addParticipantToExchange as any).mockResolvedValue({});

    const created = await exchService.createExchange('u1', 'Name');
    expect(exchangesDb.createExchange).toHaveBeenCalledWith('u1', 'Name');

    await exchService.addParticipant('e1', 'p1');
    expect(participantsDb.addParticipantToExchange).toHaveBeenCalledWith('e1', 'p1');
  });

  it('setExclusions removes old and bulk inserts new', async () => {
    (exclusionsDb.removeExclusionsForPersonInExchange as any).mockResolvedValue(undefined);
    (exclusionsDb.bulkInsertExclusions as any).mockResolvedValue(undefined);

    await exchService.setExclusions('e1', 'p1', ['p2', 'p3']);

    expect(exclusionsDb.removeExclusionsForPersonInExchange).toHaveBeenCalledWith('e1', 'p1');
    expect(exclusionsDb.bulkInsertExclusions).toHaveBeenCalledWith('e1', [
      { personId1: 'p1', personId2: 'p2' },
      { personId1: 'p1', personId2: 'p3' },
    ]);
  });

  it('generateAssignments throws BadRequestError with <2 participants', async () => {
    (exchangesDb.getExchangeById as any).mockResolvedValue({ id: 'e1', name: 'E' });
    (participantsDb.getParticipantsByExchangeId as any).mockResolvedValue([{ personId: 'p1' }]);
    (exclusionsDb.getExclusionsByExchangeId as any).mockResolvedValue([]);
    (assignmentsDb.getAssignmentsByExchangeId as any).mockResolvedValue([]);

    await expect(exchService.generateAssignments('e1')).rejects.toThrow(BadRequestError);
  });

  it('generateAssignments returns assignments with valid mapping', async () => {
    (exchangesDb.getExchangeById as any).mockResolvedValue({ id: 'e2', name: 'E2' });
    (participantsDb.getParticipantsByExchangeId as any).mockResolvedValue([
      { personId: 'a' },
      { personId: 'b' },
      { personId: 'c' },
    ]);
    (exclusionsDb.getExclusionsByExchangeId as any).mockResolvedValue([]);
    (assignmentsDb.getAssignmentsByExchangeId as any).mockResolvedValue([]);

    const assignments = await exchService.generateAssignments('e2');
    expect(assignments.length).toBe(3);
    const givers = assignments.map(a => a.giverId);
    const receivers = assignments.map(a => a.receiverId);
    // no one assigned to themselves
    for (let i = 0; i < assignments.length; i++) expect(assignments[i].giverId).not.toBe(assignments[i].receiverId);
    // receivers unique
    expect(new Set(receivers).size).toBe(3);
    // all givers present
    expect(new Set(givers)).toEqual(new Set(['a','b','c']));
  });

  it('cloneExchange creates copy and bulk inserts data', async () => {
    const exchange = { id: 'o', name: 'Orig' };
    const participants = [{ personId: 'p1' }, { personId: 'p2' }];
    const exclusions = [{ personId1: 'p1', personId2: 'p2' }];

    (exchangesDb.getExchangeById as any).mockResolvedValue(exchange);
    (participantsDb.getParticipantsByExchangeId as any).mockResolvedValue(participants);
    (exclusionsDb.getExclusionsByExchangeId as any).mockResolvedValue(exclusions);
    (exchangesDb.createExchange as any).mockResolvedValue({ id: 'new' });
    (participantsDb.bulkInsertParticipants as any).mockResolvedValue(undefined);
    (exclusionsDb.bulkInsertExclusions as any).mockResolvedValue(undefined);

    const newEx = await exchService.cloneExchange('o', 'u2');
    expect(exchangesDb.createExchange).toHaveBeenCalledWith('u2', 'Orig (Copy)');
    expect(participantsDb.bulkInsertParticipants).toHaveBeenCalledWith('new', ['p1','p2']);
    expect(exclusionsDb.bulkInsertExclusions).toHaveBeenCalledWith('new', [{ personId1: 'p1', personId2: 'p2' }]);
    expect(newEx).toBeDefined();
  });

  it('saveAssignments asks for next round and bulk inserts', async () => {
    (assignmentsDb.getNextRound as any).mockResolvedValue(5);
    (assignmentsDb.bulkInsertAssignments as any).mockResolvedValue(undefined);

    const items = [{ giverId: 'g1', receiverId: 'r1' }];
    await exchService.saveAssignments('eX', items);

    expect(assignmentsDb.getNextRound).toHaveBeenCalledWith('eX');
    expect(assignmentsDb.bulkInsertAssignments).toHaveBeenCalledWith('eX', [ { giverId: 'g1', receiverId: 'r1', round: 5 } ]);
  });
});
