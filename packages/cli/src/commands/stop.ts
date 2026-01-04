import { log } from "@droppyjs/server";
import ps from "ps-node";
import type { Argv, Pkg } from "../types.js";

export async function stop(pkg: Pkg, _argv: Argv) {
    ps.lookup({ command: pkg.name }, async (err, procs) => {
        if (err) {
            log.error(err);
            process.exit(1);
        } else {
            procs = procs.filter((proc) => Number(proc.pid) !== process.pid);
            if (!procs.length) {
                log.info("No processes found");
                process.exit(0);
            }

            const pids = await Promise.all(
                procs.map((proc) => {
                    return new Promise((resolve) => {
                        ps.kill(proc.pid, (killErr: unknown) => {
                            if (killErr) {
                                log.error(killErr);
                                return process.exit(1);
                            }
                            resolve(proc.pid);
                        });
                    });
                }),
            );

            if (pids.length) {
                console.info(`Killed PIDs: ${pids.join(", ")}`);
            }
            process.exit(0);
        }
    });
}
