import app from "../src/app.js";

import { handle } from "hono/vercel";

export const config = {
  runtime: "edge",
};

app.get("/", (c) => {
  return c.json({ message: "Hello Honoss!" });
});

export default handle(app);
