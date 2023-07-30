/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npx wrangler dev src/index.ts` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npx wrangler publish src/index.ts --name my-worker` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

// These initial Types are based on bindings that don't exist in the project yet,
// you can follow the links to learn how to implement them.

// export interface Env {
// 	// Example binding to KV. Learn more at https://developers.cloudflare.com/workers/runtime-apis/kv/
// 	// MY_KV_NAMESPACE: KVNamespace
// 	//
// 	// Example binding to Durable Object. Learn more at https://developers.cloudflare.com/workers/runtime-apis/durable-objects/
// 	// MY_DURABLE_OBJECT: DurableObjectNamespace
// 	//
// 	// Example binding to R2. Learn more at https://developers.cloudflare.com/workers/runtime-apis/r2/
// 	// MY_BUCKET: R2Bucket
// }

// export const worker = {
// 	async fetch(
// 		request: Request,
// 		env: Env,
// 		ctx: ExecutionContext
// 	): Promise<Response> {
// 		return new Response(`Hello World from ${request.method}!`);
// 	},
// };

import type { Request as WorkerRequest } from "@cloudflare/workers-types/experimental";

export default {
	async fetch(request: WorkerRequest) {
		async function MethodNotAllowed(request: WorkerRequest) {
			return new Response(`Method ${request.method} not allowed.`, {
				status: 405,
				headers: {
					Allow: "GET,POST",
				},
			});
		}
		// Only GET requests work with this proxy.
		if (request.method !== "GET" && request.method !== "POST")
			return MethodNotAllowed(request);

		// get request params
		const url = new URL(request.url);
		const params = Object.fromEntries(url.searchParams.entries());

		// get request headers
		const headers = Object.fromEntries(
			[...request.headers].map(([name, value]) => [name, value])
		);

		console.log(JSON.stringify(headers, null, 2));

		const xurl = headers["x-url"].replace(/^\s+|\s+$/g, "");

		const uri = new URL(xurl);
		for (const key in params) {
			uri.searchParams.append(key, params[key]);
		}

		const filteredHeaders = Object.fromEntries(
			Object.entries(headers).filter(
				([name]) =>
					!name.startsWith("x-") && name !== "x-url" && !name.startsWith("cf-")
			)
		);

		console.log("uri", uri);
		console.log("params", params);
		console.log("filtered headers", JSON.stringify(filteredHeaders, null, 2));

		return fetch(uri, {
			method: request.method,
			headers: { ...filteredHeaders },
		});
	},
};
