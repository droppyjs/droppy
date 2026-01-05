import { createCommand } from "../command/index.js";

export default createCommand("DESTROY_VIEW", async ({ sid, vId, setView }) => {
    setView(sid, vId, null);
});
