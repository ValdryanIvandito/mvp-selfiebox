export function createLog(context) {
  return {
    info(message, meta = {}) {
      window.api.log("INFO", context, message, meta);
    },

    error(message, meta = {}) {
      window.api.log("ERROR", context, message, meta);
    },
  };
}
