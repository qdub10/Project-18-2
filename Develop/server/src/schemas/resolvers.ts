import { AuthenticationError } from 'apollo-server-express';
import User from '../models/User';
import { signToken } from '../services/auth';

interface Context {
  user?: { _id: string; username: string; email: string };
}

const resolvers = {
  Query: {
    // Fetch the logged-in user's information
    me: async (_parent: unknown, _args: unknown, context: Context) => {
      if (!context.user) {
        throw new AuthenticationError('You need to be logged in!');
      }

      const userData = await User.findById(context.user._id).select('-__v -password');
      return userData;
    },
  },
  Mutation: {
    // Log in a user and return the Auth object with token and user data
    login: async (_parent: unknown, { email, password }: { email: string; password: string }) => {
      const user = await User.findOne({ email });

      if (!user) {
        throw new AuthenticationError('Incorrect email or password');
      }

      const isValidPassword = await user.isCorrectPassword(password);
      if (!isValidPassword) {
        throw new AuthenticationError('Incorrect email or password');
      }

      const token = signToken(user.username, user.email, user._id);
      return { token, user };
    },

    // Add a new user and return the Auth object with token and user data
    addUser: async (
      _parent: unknown,
      { username, email, password }: { username: string; email: string; password: string }
    ) => {
      const user = await User.create({ username, email, password });
      const token = signToken(user.username, user.email, user._id);
      return { token, user };
    },

    // Save a book to the logged-in user's account
    saveBook: async (
      _parent: unknown,
      {
        bookInput,
      }: {
        bookInput: {
          bookId: string;
          authors: string[];
          description: string;
          title: string;
          image: string;
          link: string;
        };
      },
      context: Context
    ) => {
      if (!context.user) {
        throw new AuthenticationError('You need to be logged in!');
      }

      const updatedUser = await User.findByIdAndUpdate(
        context.user._id,
        { $addToSet: { savedBooks: bookInput } },
        { new: true, runValidators: true }
      );

      return updatedUser;
    },

    // Remove a book from the logged-in user's account
    removeBook: async (_parent: unknown, { bookId }: { bookId: string }, context: Context) => {
      if (!context.user) {
        throw new AuthenticationError('You need to be logged in!');
      }

      const updatedUser = await User.findByIdAndUpdate(
        context.user._id,
        { $pull: { savedBooks: { bookId } } },
        { new: true }
      );

      return updatedUser;
    },
  },
};

export default resolvers;
