export type TokenEntry = {
    tokens: Map<string, number>; // token -> createdAt
    lastSeen: number;
};
