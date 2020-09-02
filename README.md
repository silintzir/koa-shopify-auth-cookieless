# koa-shopify-auth-cookieless

This is a fork of the Shopify quilt package https://github.com/Shopify/quilt/tree/master/packages/koa-shopify-auth/src

This is not sponsored or endorsed by Shopify, or connected with Shopify in any way.

I'm providing this package as a reference for using with Shopify's Next Gen JWT-based Cookieless Auth.

# Important
This is a near drop-in replacement for the official koa-shopify-auth package, but make sure to import like this:

```
import { createShopifyAuth, verifyToken, redirectQueryString } from "koa-shopify-auth-cookieless";

```

# Example
Here's the basic example:
```
server.use(
    createShopifyAuth({
      apiKey: SHOPIFY_API_KEY,
      secret: SHOPIFY_API_SECRET,
      scopes: [SCOPES],
      accessMode: "offline",

      async afterAuth(ctx) {
        const redirectQuery = redirectQueryString(ctx);

        ctx.redirect(`/?${redirectQuery}`);
      },
    })
  );
  ```

  # Please NOTE:
  This package doesn't use any cookies ( obviously ¯\_( ͡° ͜ʖ ͡°)_/¯ ) or Koa session. If you want to retrieve the shop or accessToken from the 
  context it looks like this:

  ```
  const { shop, accessToken } = ctx.state.shopify;
  ```

