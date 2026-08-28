import { CognitoJwtVerifier } from "aws-jwt-verify";
import { createMiddleware } from "hono/factory";

import env from "@/env";

const verifier = CognitoJwtVerifier.create({
  userPoolId: env.COGNITO_USER_POOL_ID,
  tokenUse: "access",
  clientId: env.COGNITO_CLIENT_ID,
});

export interface CognitoAuthVariables {
  userId: string;
}

export const cognitoAuth = createMiddleware<{
  Variables: CognitoAuthVariables;
}>(async (c, next) => {
  if (env.NODE_ENV === "test") {
    c.set("userId", "00000000-0000-0000-0000-000000000000");
    return next();
  }

  const header = c.req.header("Authorization");

  if (!header?.startsWith("Bearer ")) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  try {
    const payload = await verifier.verify(header.split(" ")[1]);
    c.set("userId", payload.sub);

    await next();
  } catch {
    return c.json({ error: "Unauthorized" }, 401);
  }
});
