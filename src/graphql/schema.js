const { schemaComposer } = require('graphql-compose');
const { withFilter } = require('graphql-subscriptions');

const feeds = [
  { id: 1, title: 'Tom', contentSnippet: 'Coleman' },
  { id: 2, title: 'Sashko', contentSnippet: 'Stubailo' },
  { id: 3, title: 'Mikhail', contentSnippet: 'Novikov' },
];



schemaComposer.createObjectTC({
  name: 'Feed',
  fields: {
    id: 'Int!',
    title: 'String',
    link: 'String',
    pubDate: 'String',
    content: 'String',
    contentSnippet: 'String',
    isoDate: 'String',
    id: 'String'
  },
});

const PubSubIns = require('@app/graphql/subscription');


schemaComposer.Query.addFields({
  feeds: {
    type: '[Feed]',
    resolve: () => feeds,
  },
  feed: {
    type: 'Feed',
    args: { id: 'Int!' },
    resolve: (_, { id }) => feeds.find((f) => f.id  === id),
  },
});

// schemaComposer.Mutation.addFields({
//   addFeed: ChatTC.getResolver('initChat'),
// });

schemaComposer.Subscription.addFields({
  updateStatus: {
    type: () => 'Feed',
    args: {
      subscriber: 'String!',
    },
    resolve: ({ id }) => ({ id }),
    subscribe: withFilter(
      () => PubSubIns.asyncIterator('updateStatus'),
      ({ id }, { subscriber }) => {
        return true;
      }
    ),
  },
});

const schema = schemaComposer.buildSchema();

module.exports = schema;
