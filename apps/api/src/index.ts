import { Hono } from "hono";

const app = new Hono();

app.get("/", (c) => {
  return c.json({ status: "ok", service: "moodio-api" });
});

export default app;
