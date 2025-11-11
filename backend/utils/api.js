const axios = require("axios")

const apiClient = axios.create({
  timeout: 10000,
  headers: { 'Accept': 'application/json' }
});

module.exports = apiClient