exports.default = {
  command: "GET_USERS",
  handler: async ({priv, sid, config, sendUsers}) => {
    if (priv && !config.public) {
      sendUsers(sid);
    }
  }
};
