export type UserRecord = {
    _id: string; // auto inserted by the impl

    hash: string;
    privileged: boolean;
};

export type SessionRecord = {
    _id: string; // auto inserted by the impl

    privileged: boolean;
    lastSeen: number;
    username?: string;
};

export type LinkRecord = {
    _id: string; // auto inserted by the impl

    location: string;
    isAttachment: boolean;
    ext?: string;
};

export type Database = {
    users: Record<string, UserRecord>;
    sessions: Record<string, SessionRecord>;
    links: Record<string, LinkRecord>;
};
