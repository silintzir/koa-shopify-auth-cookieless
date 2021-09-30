# koa-shopify-auth-cookieless

This is a fork of the Shopify package https://github.com/Shopify/koa-shopify-auth/blob/master/README.md

This is not sponsored or endorsed by Shopify, or connected with Shopify in any way.

I'm providing this package as a reference for using with Shopify's Next Gen JWT-based Cookieless Auth.

You may be interested in using this cookieless GraphQL Proxy along with this package:
https://www.npmjs.com/package/koa-shopify-graphql-proxy-cookieless

# Important
This is a near drop-in replacement for the official koa-shopify-auth package, but make sure you don't 
import createShopifyAuth as default, use named imports:

```
import { createShopifyAuth, verifyToken, verifyJwtSessionToken, getQueryKey, redirectQueryString } from "koa-shopify-auth-cookieless";

```

# Example
Here's the basic example:
NOTE: You must now initialize the Shopify Context
You only need to pass accessMode to createShopifyAuth
 
```
Shopify.Context.initialize({
  API_KEY: process.env.SHOPIFY_API_KEY,
  API_SECRET_KEY: process.env.SHOPIFY_API_SECRET,
  SCOPES: process.env.SCOPES.split(","),
  HOST_NAME: process.env.HOST.replace(/https:\/\//, ""),
  API_VERSION: ApiVersion.April21,
  IS_EMBEDDED_APP: true,
  // This should be replaced with your preferred storage strategy
  SESSION_STORAGE: null,
});

server.use(
    createShopifyAuth({
      accessMode: "offline",

      async afterAuth(ctx) {
        const redirectQuery = redirectQueryString(ctx);

        ctx.redirect(`/?${redirectQuery}`);
      },
    })
  );
  ```

# Please NOTE:
This package doesn't use any cookies or session.
The intent was to strip functionality down as much as possible in order to focus on 
the OAuth flow and retrieving an accessToken.

Please note that the official @shopify/koa-shopify-auth package uses sessions to manage access tokens. 
This package takes a different approach and allows for persisting the accessToken however you choose. 
While this may work for some situations, you will probably still need to implement some kind of session strategy when your
app goes into production, in order to log the user out after some time interval. 

If you are otherwise persisting your accessTokens with another method, you do not need to implement a session strategy
that stores your tokens in the session. You will just need to create a mechanism for invalidating
sessions on some interval.

Please keep in mind though, that if the user uninstalls the app, the verifyToken function will
force a redirect to /auth.
https://github.com/Shopify/koa-shopify-auth#session

If you want to retrieve the shop or accessToken from the 
context it looks like this:

```
const { shop, accessToken } = ctx.state.shopify;
```

# Using verifyToken
You can use verifyToken to redirect users to /auth whenever their access token becomes invalid.

```
router.get("(.*)", async (ctx, next) => {
    const shop = getQueryKey(ctx, "shop");
    // Retrieve token here
    const token = "persistedAccessToken";
    ctx.state = { shopify: { shop: shop, accessToken: token } };
    await verifyToken(ctx, next);
    await handleRequest(ctx);
  });
```

# Using verifyJwtSessionToken
Please note that the use of the word "session" here does not mean that we are using any session
with this package. As part of Shopify's new cookieless (or maybe a better term is cookie-lite, or opt-out-of-cookies) 
JWT architecture, the AppBridge component will keep a fresh JWT token available to the app as long
as the user is logged in.
IMPORTANT -- You MUST use some form of detecting whether the following headers are set:
X-Shopify-API-Request-Failure-Reauthorize === 1
X-Shopify-API-Request-Failure-Reauthorize-Url === "your /auth url"

If you are using Shopify's NextJS example that is created with the Shopify CLI, you can see this in 
_app.js:

```
function userLoggedInFetch(app) {
  const fetchFunction = authenticatedFetch(app);

  return async (uri, options) => {
    const response = await fetchFunction(uri, options);

    if (
      response.headers.get("X-Shopify-API-Request-Failure-Reauthorize") === "1"
    ) {
      const authUrlHeader = response.headers.get(
        "X-Shopify-API-Request-Failure-Reauthorize-Url"
      );

      const redirect = Redirect.create(app);
      redirect.dispatch(Redirect.Action.APP, authUrlHeader || `/auth`);
      return null;
    }

    return response;
  };
}
```
This package will set those headers and redirect whenever the JWT session token becomes invalid.
Typically this happens when the user is logged out in another tab, but the embedded app
is still open in a different window / tab. It usually takes about 20 seconds for the JWT to become
invalid, and the app will automatically redirect, as long as you have code like the above.

Using the verifyJwtSessionToken function:

```
router.post(
    "/graphql",
    // verifyRequest({ returnHeader: true }),
    async (ctx, next) => {
      const shop = await verifyJwtSessionToken(ctx, next, Shopify.Context);
      const accessToken = "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";
      // NOTE: You will need to use koa-shopify-graphql-proxy-cookieless 
      // for the graphqlProxy function below
      await graphqlProxy(shop, accessToken, ctx);
    }
  );
```

# See Working Demo
I've created a working demo based on the Shopify-CLI Node project.  
<https://github.com/nprutan/shopify-cookieless-auth-demo>  
If you'd like to see this in action, create a new Shopif-CLI project,
and also clone the demo repo. Once you've cloned the demo, you can connect
an existing Shopify project to the demo. Open a terminal in the 
demo directory and use the command:
```shopify connect```

