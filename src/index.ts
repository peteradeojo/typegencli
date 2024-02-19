import { Command } from 'commander';
import { IncomingMessage, ServerResponse, createServer } from 'http';
import url from 'url';
import RequestHandler from './handler';

const figlet = require('figlet');

const program = new Command();
console.log(figlet.textSync('Typegen'));

program.version('1.0.0').description('Typegen CLI for generating types');
program.option(
	'-l, --listen [port]',
	'Listen to a port other than the default port',
	'3000'
);
program.parse(process.argv);

const options = program.opts();

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
	const parsedURl = url.parse(req.url!, true);
	const queries = parsedURl.query;

	if (req.method == 'POST') {
		reqBody = '';
		req.on('data', (chunk) => {
			// console.log(typeof chunk)
			reqBody += chunk.toString();
		});
		return req.on('end', () => {
			const response = respond(req, res, JSON.parse(reqBody || '{}'));
			res.writeHead(response.status, response.statusMessage, response.headers);
			res.end(response.response);
		});
	}

	const response = respond(req, res);
	res.writeHead(response.status, response.statusMessage, response.headers);
	res.end(response.response);
});

const port = Number(options.listen);
server.listen(port);
console.log("Server listening on port", port)