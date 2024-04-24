const { default: axios } = require('axios');

const msGraphAxios = (accessToken) => {
  return axios.create({
    baseURL: 'https://graph.microsoft.com/v1.0',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
};
module.exports = {
  msGraphAxios,
};
