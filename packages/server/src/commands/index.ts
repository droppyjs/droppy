export { CLIPBOARD } from "./clipboard.js";
export { CREATE_FILE } from "./createFile.js";
export { CREATE_FILES } from "./createFiles.js";
export { CREATE_FOLDER } from "./createFolder.js";
export { CREATE_FOLDERS } from "./createFolders.js";
export { DELETE_FILE } from "./deleteFile.js";
export { DESTROY_VIEW } from "./destroyView.js";
export { GET_MEDIA } from "./getMedia.js";
export { GET_USERS } from "./getUsers.js";
export { RELOAD_DIRECTORY } from "./reloadDirectory.js";
export { RENAME } from "./rename.js";
export { REQUEST_SETTINGS } from "./requestSettings.js";
export { REQUEST_SHARELINK } from "./requestSharelink.js";
export { REQUEST_UPDATE } from "./requestUpdate.js";
export { SAVE_FILE } from "./saveFile.js";
export { SEARCH } from "./search.js";
export { UPDATE_USER } from "./updateUser.js";

export type CommandHandler<T = any> = {
    handler: (args: {
        priv: boolean;
        msg: T;
        sendObj: (sid: string, data: any) => void;
        sid: string;
        updateClientLocation: (dir: any, sid: any, vId: any) => void;
        sendFiles: (sid: string, vId: any) => void;
        sendError: (sid: string, vId: any, text: string) => void;
        validatePaths: (paths: any, type: any, ws: any, sid: any, vId: any) => boolean;
        sendUsers: (sid: string) => void;
        pkg: {
            name: string,
            version: string,
            tag: string;
        };
        config: any;
        cache: any;
        ws: WebSocket;
        setView: (sid: any, vId: any, view: any) => void;
        vId: string;
        cookie: string;
    }) => Promise<void>;
};
