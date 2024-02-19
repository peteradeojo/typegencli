import { IncomingMessage, ServerResponse, createServer } from 'http';
import RequestHandler from './handler';
import axios from 'axios';

export type TServer = (port: number) => void;
export type DeliveryFunc = (
	port: number,
	cb?: () => boolean
) => (name: string, data: string) => void;

export const Server: TServer = (port: Number) => {
	const server = createServer();

	const respond = (
		req: IncomingMessage,
		res: ServerResponse<IncomingMessage>,
		data?: any
	) => {
		const handler = new RequestHandler(req, res, data);
		return handler.handle();
	};

	server.on('request', (req, res) => {
		let reqBody: string | null = null;

		if (req.method == 'POST') {
			reqBody = '';
			req.on('data', (chunk) => {
				// console.log(typeof chunk)
				reqBody += chunk.toString();
			});
			return req.on('end', () => {
				const response = respond(req, res, JSON.parse(reqBody || '{}'));
				res.writeHead(
					response.status,
					response.statusMessage,
					response.headers
				);
				res.end(response.response);
			});
		}

		const response = respond(req, res);
		res.writeHead(response.status, response.statusMessage, response.headers);
		res.end(response.response);
	});

	server.listen(port);
	console.log('Server listening on port', port);
};

export const sendData: DeliveryFunc = (port: number = 3000) => {
	return async (name: string, data: any) => {
		try {
			const res = await axios.post(`http://localhost:${port}`, {
				name,
				data,
			});
		} catch (err: any) {
			console.error(err.message);
		}
	};
};
