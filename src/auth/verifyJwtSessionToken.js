const { Shopify } = require("@shopify/shopify-api")
const { redirectToAuth } = require("./utilities");

const verifyJwtSessionToken = async (ctx, next, api_context) => {
  const routes = {
    authRoute: "/auth",
    fallbackRoute: "/auth",
  };

  let updated_context = {
    ...api_context,
    SCOPES: [...api_context.SCOPES.compressedScopes],
  }
  
  Shopify.Context.initialize(updated_context);

  const authHeader = ctx.req.headers.authorization;
  const matches = authHeader?.match(/Bearer (.*)/);
  const payload = Shopify.Utils.decodeSessionToken(matches[1]);
  const shop = new URL(payload.dest).host;

  if (shop) {
    await next();
    return shop;
  }

  redirectToAuth(routes, ctx, returnHeader = true);
}

module.exports = verifyJwtSessionToken;
