exports.default = {
  command: "DESTROY_VIEW",
  handler: async ({sid, vId, setView}) => {
    setView(sid, vId, null);
  }
};
