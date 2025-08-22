import 'dotenv/config';
import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  schema: [
    'node_modules/@dcoutinho96/spotify-clone-luizalabs-coding-challenge-graphql-schema/dist/**/*.graphql',
  ],
  generates: {
    'src/gql/generated.ts': {
      plugins: [
        'typescript',            
        'typescript-resolvers',  
      ],
      config: {
        contextType: '../context#GraphQLContext', 
      },
    },
  },
};

export default config;
