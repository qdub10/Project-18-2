import './App.css';
import { Outlet } from 'react-router-dom';
import { ApolloClient, InMemoryCache, ApolloProvider, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

import Navbar from './components/Navbar';

// Create an HTTP link to the GraphQL server
const httpLink = createHttpLink({
  uri: '/graphql', // Adjust this URI if your GraphQL endpoint differs
});

// Add an auth link to include the token in the headers
const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem('id_token'); // Replace with the actual key storing the token
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  };
});

// Create the Apollo Client
const client = new ApolloClient({
  link: authLink.concat(httpLink), // Combine auth link and HTTP link
  cache: new InMemoryCache(), // Use in-memory caching
});

function App() {
  return (
    <ApolloProvider client={client}>
      <Navbar />
      <Outlet />
    </ApolloProvider>
  );
}

export default App;

