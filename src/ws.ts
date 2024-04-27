import WebSocket, { WebSocketServer } from 'ws';
import { DeliveryFunc, TServer } from './server';
import PromptSync from 'prompt-sync';
import { writeFileSync, mkdirSync, existsSync } from 'fs';

const { Generator } = require('typegen-generator');

let wss: WebSocketServer | undefined = undefined;
export const Server: TServer = (port: number) => {
	const prompt = PromptSync();
	const generator = new Generator();

	wss = new WebSocketServer({
		port,
	});

	wss.on('connection', (socket, request) => {
		console.log('socket connected');
		wss!.on('error', console.error);

		socket.emit('response', 'hello world');

		socket.on('message', async (data, isBinary) => {
			const body = JSON.parse(data.toString());
			const generated = await generator.resolve(body.data, body.name);
			console.log(`\n${generated}\n`);
			socket.send(JSON.stringify({ data: generated, directive: 'print' }), {
				binary: isBinary,
			});

			const input = prompt('save to file? ');
			if (input.toLowerCase() == 'y') {
				socket.send(
					JSON.stringify({
						directive: 'save',
						data: { name: body.name, data: generated },
					})
				);
			} else {
				socket.close();
			}
		});

		socket.on('close', (code) => {});
	});

	wss.on('listening', () => {
		console.log(`Socket listening on port ${port}`);
	});
};

export const sendData: DeliveryFunc = (
	port: number,
	cb?: (data: any) => boolean | null
) => {
	const socket = new WebSocket(`http://localhost:${port}`);

	const callback =
		cb ||
		((data: any) => {
			const { name, data: gen } = data;

			if (!existsSync('./typegen/')) {
				mkdirSync('./typegen');
			}
			try {
				writeFileSync(`./typegen/${name}.ts`, gen);
			} catch (err) {
				console.error(err);
			}
		});

	return (name: string, data: string) => {
		console.log()
		try {
			socket.on('error', console.error);
			socket.on('open', () => {
				socket.on('message', (data, isBinary) => {
					const message = JSON.parse(data.toString());
					console.log(message);

					switch (message.directive) {
						case 'save':
							callback(message.data);
							break;
						case 'print':
						default:
							console.log(message.data);
					}

					socket.close();
				});

				socket.on('connect', () => {
					console.log('connected');
				})

				socket.send(
					JSON.stringify({
						name,
						data,
					})
				);
			});
		} catch (err) {
			console.error(err);
		}
	};
};
