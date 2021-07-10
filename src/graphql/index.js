const graphqlHTTP = require("express-graphql");

const schema = require("@app/graphql/schema");

module.exports = graphqlHTTP(async (request) => ({
  schema,
  graphiql: false,
  context: {
    headers: request.headers,
  },
}));
