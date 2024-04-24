const getAuthorization = async (client) => {
  const auth = await client.api('/token').get();

  return auth;
};

module.exports = {
  getAuthorization,
};
