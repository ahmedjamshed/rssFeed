const { createServer } = require("http");
const { SubscriptionServer } = require("subscriptions-transport-ws");
const { execute, subscribe } = require("graphql");
const express = require("express");
const cors = require("cors");

require("module-alias/register");
require("dotenv").config();

require("@app/service/logger");
require("@app/service/rssTracker");
require("@app/graphql/subscription");


const graphql = require("@app/graphql");
const schema = require("@app/graphql/schema");
const expressPlayground = require("graphql-playground-middleware-express")
  .default;

const app = express();
const PORT = process.env.APP_PORT || 8080;
const BASE_URI = process.env.BASE_URI || `http://0.0.0.0:${PORT}`;
const WS_BASE_URI =
  process.env.WS_BAS_URI || BASE_URI.replace(/^https?/, 'ws');

app.use(
  "/graphql",
  express.json(),
  cors({
    origin: process.env.CLIENT_URL,
    optionsSuccessStatus: 200,
  }),
  graphql
);

app.get(
  "/playground",
  expressPlayground({
    endpoint: "/graphql",
    subscriptionsEndpoint: `ws://0.0.0.0:${PORT}/subscriptions`
  })
);

app.use("*", (req, res) => {
  res.status(404).send("404 Not Found");
});

const ws = createServer(app);
ws.listen(PORT, () => {
  console.log(
    `Server is now running on ${BASE_URI}`
  );
  // Set up the WebSocket for handling GraphQL subscriptions
  new SubscriptionServer(
    {
      execute,
      subscribe,
      schema,
    },
    {
      server: ws,
      path: "/subscriptions",
    }
  );
});
