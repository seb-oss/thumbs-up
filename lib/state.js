const { encrypt, decrypt } = require("./aes");
const invalidError = new Error("state is invalid");
const expiredError = new Error("state is expired");
const validityPeriod = 5 * 60 * 1000; // 5 minutes

module.exports = {
  encodeState(value, password) {
    const state = { value, expires: Date.now() + validityPeriod };
    return encrypt(JSON.stringify(state), password);
  },

  async tryDecodeState(encryptedState, password) {
    let state;
    try {
      state = JSON.parse(await decrypt(encryptedState, password));
    } catch (err) {
      return invalidError;
    }
    if (Date.now() > state.expires) {
      return expiredError;
    }
    return state.value;
  }
};
