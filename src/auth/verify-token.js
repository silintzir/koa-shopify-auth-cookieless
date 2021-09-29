const { Shopify } = require("@shopify/shopify-api")
const { StatusCode } = require("@shopify/network");
const { redirectToAuth, getShopCredentials } = require("./utilities");

const verifyToken = async (ctx, next) => {
  const [shop, accessToken] = getShopCredentials(ctx);
  const routes = {
    authRoute: "/auth",
    fallbackRoute: "/auth",
  };

  if (accessToken) {
    const client = new Shopify.Clients.Rest(shop, accessToken)
    const response = await client.get({ path: "metafields", query: {'limit': 1} }) 

    if (response.status === StatusCode.Unauthorized) {
      redirectToAuth(routes, ctx);
      return;
    }

    await next();
    return;
  }

  redirectToAuth(routes, ctx);
}

module.exports = verifyToken;
