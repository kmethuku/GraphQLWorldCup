const express = require('express');
const server = express();
const port = 4000;
const data = require('../data/world-cup.json');
const expressGraphQL = require('express-graphql').graphqlHTTP;

const {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString,
  GraphQLList,
  GraphQLNonNull,
  GraphQLInt,
  GraphQLFloat,
  GraphQLBoolean,

} = require('graphql');

const StadType = new GraphQLObjectType({
  name: 'Stadium',
  description: 'List of All Stadiums',
  fields: () => ({
      id: {type: GraphQLNonNull(GraphQLInt)},
      name: {type: GraphQLNonNull(GraphQLString)},
      city: {type: GraphQLNonNull(GraphQLString)},
      latitude: {type: GraphQLNonNull(GraphQLFloat)},
      longitude: {type: GraphQLNonNull(GraphQLFloat)},
      image: {type: GraphQLNonNull(GraphQLString)}
  })
})

const TeamType = new GraphQLObjectType({
  name: 'Team',
  description: 'List of All Teams',
  fields: () => ({
      id: {type: GraphQLNonNull(GraphQLInt)},
      name: {type: GraphQLNonNull(GraphQLString)},
      eliminated: {type: GraphQLNonNull(GraphQLBoolean)},
      eliminated_at_which_stage: {type: GraphQLNonNull(GraphQLString)},
      fifa_code: {type: GraphQLNonNull(GraphQLString)},
      iso2: {type: GraphQLNonNull(GraphQLString)},
      flag: {type: GraphQLNonNull(GraphQLString)},
      emoji: {type: GraphQLNonNull(GraphQLString)},
      emoji_string: {type: GraphQLNonNull(GraphQLString)}
  })
})

const GroupType = new GraphQLObjectType({
  name: 'Group',
  description: 'List of All Groups',
  fields: () => ({
      name: {type: GraphQLNonNull(GraphQLString)},
      winner: {type: GraphQLString},
      runnerup: {type: GraphQLString},
      matches: {
        type: new GraphQLList(MatchType),
        description: 'List of All Matches',
        resolve: (parent) => {
          let res = Object.keys(data.groups).map(key => data.groups[key]);
          return res.find(el => el.name === parent.name).matches;
        }
      }
  })
})

const KnockoutType = new GraphQLObjectType({
  name: 'Knockout',
  description: 'List of All Knockouts',
  fields: () => ({
      name: {type: GraphQLNonNull(GraphQLString)},
      matches: {
        type: new GraphQLList(MatchType),
        description: 'List of All Matches',
        resolve: (parent) => {
          let res = Object.keys(data.knockout).map(key => data.knockout[key]);
          return res.find(el => el.name === parent.name).matches;
        }
      }
  })
})

const MatchType = new GraphQLObjectType({
  name: 'Match',
  description: 'List of All Matches',
  fields: () => ({
      id: {type: GraphQLNonNull(GraphQLInt)},
      type: {type: GraphQLNonNull(GraphQLString)},
      home_team_id: {type: GraphQLNonNull(GraphQLInt)},
      away_team_id: {type: GraphQLNonNull(GraphQLInt)},
      home_team: {
        type: TeamType,
        resolve: (parent) => {
          return data.teams.find(el => el.name === parent.home_team);
        }
      },
      away_team: {
        type: TeamType,
        resolve: (parent) => {
          return data.teams.find(el => el.name === parent.away_team);
        }
      },
      home_score: {type: GraphQLNonNull(GraphQLString)},
      away_score: {type: GraphQLNonNull(GraphQLString)},
      home_scorers: {type: GraphQLString},
      away_scorers: {type: GraphQLString},
      date: {type: GraphQLNonNull(GraphQLString)},
      stadium_id: {
        type: StadType,
        resolve: (parent) => {
          return data.stadiums.find(el => el.id === parent.stadium_id);
        }
      },
      time_elapsed: {type: GraphQLNonNull(GraphQLString)},
      finished: {type: GraphQLNonNull(GraphQLBoolean)},
      matchday: {type: GraphQLNonNull(GraphQLInt)}
  })
})

const RootQueryType = new GraphQLObjectType({
  name: 'Query',
  description: 'Root Query',
  fields: () => ({
    stadiums: {
      type: new GraphQLList(StadType),
      description: 'List of All Stadiums',
      resolve: () => data.stadiums
    },
    stadium: {
      type: StadType,
      description: 'A Single Stadium',
      args: {
        name: {type: GraphQLString}
      },
      resolve: (parent, args) => {
        return data.stadiums.find(el => elem => elem.name === args.name);
      }
    },
    teams: {
      type: new GraphQLList(TeamType),
      description: 'List of All Teams',
      resolve: () => data.teams
    },
    team: {
      type: TeamType,
      description: 'A Single Team',
      args: {
        name: {type: GraphQLString}
      },
      resolve: (parent, args) => {
        return data.teams.find(el => elem => elem.name === args.name);
      }
    },
    groups: {
      type: new GraphQLList(GroupType),
      description: 'List of All Groups',
      resolve: () => {
        return Object.keys(data.groups).map(key => data.groups[key]);
      }
    },
    group: {
      type: GroupType,
      description: 'A Single Group',
      args: {
        name: {type: GraphQLString}
      },
      resolve: (parent, args) => {
          let res = Object.keys(data.groups).map(key => data.groups[key]);
          return res.find(el => el.name === args.name);
      }
    },
    knockouts: {
      type: new GraphQLList(KnockoutType),
      description: 'List of All Knockouts',
      resolve: () => {
        return Object.keys(data.knockout).map(key => data.knockout[key]);
      }
    },
    knockout: {
      type: KnockoutType,
      description: 'A Single Knockout',
      args: {
        name: {type: GraphQLString}
      },
      resolve: (parent, args) => {
          let res = Object.keys(data.knockout).map(key => data.knockout[key]);
          console.log(res.find(el => el.name === args.name));
          return res.find(el => el.name === args.name);
      }
    }
  })
})

const schema = new GraphQLSchema({
  query: RootQueryType
})

server.use('/', expressGraphQL({
  schema: schema,
  graphiql: true
}))

server.listen(port, () => console.log(`Server listening on port ${port}...`));
