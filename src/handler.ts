import { IncomingMessage, ServerResponse } from 'http';
import url, { UrlWithParsedQuery } from 'url';
import Joi from 'joi';
import { ParsedUrlQuery } from 'querystring';

import { generateType } from './generator';

type RequestParam = { [key: string]: string };

type Request = {
	queries?: ParsedUrlQuery;
	body: any;
	method?: string;
	url?: UrlWithParsedQuery;
	params: RequestParam[];
};
type Response = {
	status: number;
	statusMessage: string;
	headers: RequestParam;
	response: string;
};

export default class RequestHandler {
	private url?: UrlWithParsedQuery;
	private request;
	private response;
	private requestBody;
	private outgoingResponse: Response;
	private errors: string[] = [];

	constructor(
		req: IncomingMessage,
		res: ServerResponse<IncomingMessage>,
		requestBody?: any
	) {
		this.request = req;
		this.response = res;
		this.requestBody = requestBody;
		this.outgoingResponse = {
			status: 200,
			statusMessage: 'OK',
			headers: {},
			response: '',
		};

		this.url = req.url ? url.parse(req.url, true) : undefined;
	}

	private setStatus(status: number) {
		this.outgoingResponse.status = status;
	}

	private setHeader(header: any) {
		this.outgoingResponse.headers = {
			...this.outgoingResponse.headers,
			header,
		};
	}

	private buildRequest(): Request {
		return {
			queries: this.url?.query,
			body: this.requestBody,
			url: this.url,
			method: this.request.method,
			params: [],
		};
	}

	private validate() {
		const schema = Joi.object({
			name: Joi.string().required(),
			data: Joi.string().required(),
		});

		const { error } = schema.validate(this.requestBody);
		if (error) {
			this.errors.push(...error.details.map((e) => e.message));
			throw new Error('Validation error');
		}
	}

	handle(): Response {
		const request = this.buildRequest();

		console.log(request);

		if (request.method !== 'POST') {
			this.setStatus(400);
			return this.outgoingResponse;
		}

		try {
			this.validate();
		} catch (err) {
			this.setStatus(400);
			return this.outgoingResponse;
		}

		this.run(request);

		return this.outgoingResponse;
	}

	run(request: Request) {
		const type =
			`\n\ntype ${request.body.name} = ` +
			generateType(JSON.parse(request.body.data)) +
			'\n\n';
		console.log(type);
		this.setHeader({ 'Content-type': 'application/json' });
		this.outgoingResponse.response = JSON.stringify(request.body);
		// return request.body;
	}
}
