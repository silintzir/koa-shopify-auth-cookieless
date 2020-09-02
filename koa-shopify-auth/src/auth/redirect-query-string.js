import querystring from "querystring";

export default function redirectQueryString(ctx) {
  const shop = ctx.state.shopify
    ? ctx.state.shopify.shop
    : new URL(`https://myshopify.com${ctx.request.url}`).searchParams.get(
        "shop"
      );

  const url = new URL(`https://${shop}${ctx.url || ctx.request.url}`);
  const hmac = url.searchParams.get("hmac");
  const timestamp = url.searchParams.get("timestamp");
  const locale = url.searchParams.get("locale");
  const session = url.searchParams.get("session");
  return querystring.stringify({
    hmac,
    shop,
    timestamp,
    locale,
    session,
  });
}
