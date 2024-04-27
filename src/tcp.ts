import net from 'net';
import { DeliveryFunc } from './server';

const { Generator } = require('typegen-generator');

export const Server = (port: number = 3000) => {
	const server = net.createServer(function (socket) {
		socket.on('connect', (errored: boolean) => {
			if (errored) {
				console.log('Client connection error');
				return;
			}

			console.log('Connection establised.');
			socket.write('Welcome Client!');
			socket.pipe(socket);
		});

		socket.on('data', (data) => {
			try {
				const generator = new Generator();
				const text = data.toString();

				const r = generator.resolve(JSON.parse(text), 'Gen');
				console.log(r);
				socket.write(r);
				socket.pipe(socket);
			} catch (err) {
				console.error(err);
			}
		});
	});

	server.listen(port, '127.0.0.1', () => {
		console.log(`Server listening on port ${port}`);
	});
};

export const sendData = (port: number = 3000) => {
	const client = new net.Socket();
	client.connect(port, '127.0.0.1', () => {});

	client.on('data', (data) => {});

	return async (name: string, data: any) => {
		client.write(JSON.stringify(data), () => {
			client.end();
		});
	};
};
