export type Exchange = {
    id: string;
    name: string;
    userId: string;
    createdAt: Date;
    updatedAt: Date;
};

export type ExchangeParticipant = {
    exchangeId: string;
    personId: string;
    personName: string;
};

export type ExchangeAssignment = {
    exchangeId: string;
    giverId: string;
    receiverId: string;
    giverName: string;
    receiverName: string;
};

export type ExchangeExclusion = {
    exchangeId: string;
    personId1: string;
    personId2: string;
    personName1: string;
    personName2: string;
};

export type FullExchange = {
    exchange: Exchange;
    participants: ExchangeParticipant[];
    assignments?: ExchangeAssignment[];
    exclusions?: ExchangeExclusion[];
};