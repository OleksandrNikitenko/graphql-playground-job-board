import { ApolloClient, InMemoryCache } from '@apollo/client';
import { HttpLink } from '@apollo/client/link/http';
import { SetContextLink } from '@apollo/client/link/context';
import { getAccessToken } from '../auth.js'


const httpLink = new HttpLink({ uri: 'http://localhost:9090/graphql' });

const authLink = new SetContextLink(({ headers }) => {
    const accessToken = getAccessToken();
    if (accessToken) {
        return {
            headers: {
                ...headers,
                'Authorization': `Bearer ${accessToken}`,
            },
        };
    }
    return { headers };
});

export const client = new ApolloClient({
    cache: new InMemoryCache(),
    link: authLink.concat(httpLink),
    // defaultOptions: {
        // query: {
            // fetchPolicy: 'network-only',
        // },
        // watchQuery: {
            // fetchPolicy: 'network-only',
        // }
    // }
});