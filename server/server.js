import cors from 'cors';
import express from 'express';
import { authMiddleware, handleLogin } from './api/rest/auth.js';
import { readFile } from 'node:fs/promises'
import { ApolloServer } from '@apollo/server';
import { expressMiddleware as apolloMiddleware } from '@as-integrations/express4'
import { resolvers } from './api/graphql/resolvers/resolvers.js';
import { getUser } from './db/users.js';
import { createCompanyLoader } from './db/companies.js';

// default port definition
const PORT = 9090;

// create server
const app = express();
// add base middleware
app.use(cors({ origin: ['http://localhost:3000'] }), express.json(), authMiddleware);

// setup default endpoints
app.post('/login', handleLogin);

// setup ApolloServer (GraphQL)
const typeDefs = await readFile('./api/graphql/schema.graphql', 'utf8');
const apolloServer = new ApolloServer({ typeDefs, resolvers, introspection: process.env.NODE_ENV !== 'production' });
// start ApolloServer
await apolloServer.start();
// add AppoloServer middleware
async function getContext({ req }) {
  const companyLoader = createCompanyLoader();
  const context = {
    companyLoader
  }

  if (req.auth) { // req.auth is added to the request by the expressjwt middleware
    context.user = await getUser(req.auth.sub)
  }
  return context;
}
app.use('/graphql', apolloMiddleware(apolloServer, { context: getContext }));

// start the server
app.listen({ port: PORT }, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`GraphQL running at http://localhost:${PORT}/graphql`);
});
