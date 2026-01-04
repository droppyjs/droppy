import type { UserRecord } from "@droppyjs/server/services/db/struct";
export function printUsers(users: UserRecord[]) {
    if (Object.keys(users).length === 0) {
        console.info("No users defined. Use 'add' to add one.");
    } else {
        console.info(
            `Current Users:\n${users
                .map((user) => {
                    return `  - ${user._id}`;
                })
                .join("\n")}`,
        );
    }
}
