const Axios = require('axios');

const axios = Axios.create({
  baseURL: process.env.NEXT_PUBLIC_CS_URL,
});

/**
 *
 * @param {any} credentials
 * @param {import('axios').AxiosRequestConfig} config
 * @param  {...any} args
 * @returns
 */
async function invoke(credentials, config, ...args) {
  var response = {};

  return response;
}

module.exports = {
  invoke,
};
