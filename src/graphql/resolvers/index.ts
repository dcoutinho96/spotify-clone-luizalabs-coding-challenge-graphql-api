import { artistQueryResolvers, artistFieldResolvers } from "#graphql/resolvers/artist.resolver";
import { playlistQueryResolvers, playlistFieldResolvers, playlistMutationResolvers } from "#graphql/resolvers/playlist.resolver";
import { userQueryResolvers } from "#graphql/resolvers/user.resolver";

export const resolvers = {
  Query: {
    ...artistQueryResolvers,
    ...playlistQueryResolvers,
    ...userQueryResolvers,  
  },
  Mutation: {
    ...playlistMutationResolvers,
  },
  Artist: artistFieldResolvers,
  Playlist: playlistFieldResolvers,
};
