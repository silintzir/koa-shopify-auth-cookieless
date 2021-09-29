export const REAUTH_HEADER = 'X-Shopify-API-Request-Failure-Reauthorize';
export const REAUTH_URL_HEADER = 'X-Shopify-API-Request-Failure-Reauthorize-Url';

const redirectToAuth = ({ fallbackRoute, authRoute }, ctx, returnHeader = false) => {
  const shop = getQueryKey(ctx, "shop");

  const routeForRedirect =
    shop == null ? fallbackRoute : `${authRoute}?shop=${shop}`;

  if (returnHeader) {
    ctx.response.status = 403;
    ctx.response.set(REAUTH_HEADER, '1');
    ctx.response.set(REAUTH_URL_HEADER, routeForRedirect);
    ctx.response.redirect(routeForRedirect);
  }

  ctx.redirect(routeForRedirect);
}

const getQueryKey = (ctx, key) => {
  const param = new URL(
    `https://myshopify.com/${ctx.request.url}`
  ).searchParams.get(key);
  return param ? param : null;
}

const getShopCredentials = (ctx) => {
  const shop = ctx.state.shopify && ctx.state.shopify.shop;
  const accessToken = ctx.state.shopify && ctx.state.shopify.accessToken;
  return [shop, accessToken];
}

module.exports = {
  redirectToAuth,
  getQueryKey,
  getShopCredentials
}