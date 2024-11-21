const https = require("https");
const axios = require("axios");
const http = require("http");
const error = require("./cli.js").error;
const checkForAnkiConnectError = require("./anki.js").checkForAnkiConnectError;
// Create a custom HTTP agent
const httpAgent = new http.Agent({
  keepAlive: false, // Enable socket keep-alive
  //   keepAliveMsecs: 3000, // Time to keep sockets alive (ms)
  //   maxSockets: 10, // Maximum number of sockets per host
  timeout: 10000, // Socket timeout (ms)
});
// Configure the custom agent
const httpsAgent = new https.Agent({
  keepAlive: false,
  //   keepAliveMsecs: 3000,
  //   maxSockets: 10,
  timeout: 10000,
});

/**
 * Makes a request to AnkiConnect.
 * @param {string} method - The HTTP method to use for the request (e.g., "POST").
 * @param {Object} body - The body of the request, containing the action and parameters.
 * @returns {Promise<Object>} The result of the request.
 */
async function makeRequest(method, body) {
  let result;
  try {
    console.info("Making request to AnkiConnect... ", `${body.action}`);
    // console.info("Request body: ", body);

    const _result = await axios({
      url: "http://localhost:8765/",
      method,
      data: JSON.stringify(body),
      headers: { "Content-Type": "application/json", Connection: "close" },
      httpsAgent: httpsAgent,
      httpAgent: httpAgent,
      timeout: 5000,
      proxy: false,
    });
    result = _result.data ?? {
      error: "No data returned from AnkiConnect.",
      result: null,
    };
    // console.log({ result });
  } catch (err) {
    console.error("Error making request to AnkiConnect: ", err.message);
    console.error({ cause: err.cause });
    error(err.message);

    if (err.response) {
      // Server responded with a status code outside the 2xx range
      console.error("Status Code:", err.response.status);
      console.error("Response Headers:", err.response.headers);
      console.error("Response Data:", err.response.data);
    } else if (err.request) {
      // Request was made but no response received
      console.error("No Response:", err.request);
    } else {
      // Something went wrong setting up the request
      console.error("Error Config:", err.config);
    }
  } finally {
    checkForAnkiConnectError(result);
  }
  return result;
}

async function makeFetchRequest(method, body) {
  // Use the agent with `node-fetch`
  const response = await fetch("http://127.0.0.1:8765", {
    method: method,
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
    agent: httpAgent,
    // Use the custom HTTP agent
  });

  const result = await response.json();
  //   console.log(result);
}

module.exports = {
  makeRequest,
};
