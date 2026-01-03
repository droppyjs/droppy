export function printUsers(users: Record<string, unknown>) {
    if (Object.keys(users).length === 0) {
        console.info("No users defined. Use 'add' to add one.");
    } else {
        console.info(
            `Current Users:\n${Object.keys(users)
                .map((user) => {
                    return `  - ${user}`;
                })
                .join("\n")}`,
        );
    }
}

