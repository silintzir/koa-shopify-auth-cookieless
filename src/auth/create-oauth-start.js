const Error = require("./errors");
const oAuthQueryString = require("./oauth-query-string");

const createOAuthStart = (options, callbackPath) => {
  return function oAuthStart(ctx) {
    const { myShopifyDomain } = options;
    const { query } = ctx;
    const { shop } = query;

    let transformed = shop;
    if (shop.startsWith("https://")) {
      const tmp = new URL(shop);
      transformed = tmp.hostname;
    }

    const shopRegex = new RegExp(
      `^[a-z0-9][a-z0-9\\-]*[a-z0-9]\\.${myShopifyDomain}$`,
      "i"
    );

    if (shop == null || !shopRegex.test(transformed)) {
      ctx.throw(400, Error.ShopParamMissing);
      return;
    }

    const formattedQueryString = oAuthQueryString(ctx, options, callbackPath);

    const redirectUri = `https://${transformed}/admin/oauth/authorize?${formattedQueryString}`;

    ctx.redirect(redirectUri);
  };
};

module.exports = createOAuthStart;
