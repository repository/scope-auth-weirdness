import SchemaBuilder from "@pothos/core";
import ScopeAuthPlugin from "@pothos/plugin-scope-auth";
import { type YogaInitialContext, createYoga } from "graphql-yoga";

// biome-ignore lint/complexity/noBannedTypes: no env
type Env = {};

export type GraphQLInitalContext = YogaInitialContext & Env & ExecutionContext;
export type GraphQLComputedContext = {
	random: number;
};
export type GraphQLContext = GraphQLInitalContext & GraphQLComputedContext;

const builder = new SchemaBuilder<{
	Context: GraphQLContext;
	AuthScopes: {
		random: boolean;
	};
}>({
	plugins: [ScopeAuthPlugin],
	authScopes: (context) => {
		console.log("random number from authScopes", context.random);

		return {
			random: () => {
				const result = context.random > 0.5;

				console.log("random number from authScopes.random", context.random);
				console.log("result from authScopes.random", result);

				return result;
			},
		};
	},
});

builder.queryType({
	authScopes: {
		random: true,
	},
	fields: (t) => ({
		test: t.float({
			resolve: (_parent, _args, context) => {
				console.log("random number from query.test", context.random);
				return context.random;
			},
		}),
	}),
});

const yoga = createYoga<GraphQLContext>({
	landingPage: false,
	schema: builder.toSchema(),
	context: () => {
		const random = Math.random();
		console.log("random number from context", random);

		return { random };
	},
});

export default { fetch: yoga.fetch };
