import querystring from "querystring";

import nonce from "nonce";

const createNonce = nonce();

export default function oAuthQueryString(ctx, options, callbackPath) {
  const { host } = ctx;
  const { scopes = [], apiKey, accessMode } = options;

  const requestNonce = createNonce();

  const redirectParams = {
    state: requestNonce,
    scope: scopes.join(", "),
    client_id: apiKey,
    redirect_uri: `https://${host}${callbackPath}`,
  };

  if (accessMode === "online") {
    redirectParams["grant_options[]"] = "per-user";
  }

  return querystring.stringify(redirectParams);
}
