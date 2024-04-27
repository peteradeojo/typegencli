#!/usr/bin/env node

import { Command } from 'commander';
import { Server, sendData } from './tcp';
import figlet from 'figlet';

if (require.main === module) {
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
	const port = Number(options.listen);
	Server(port);
}

export { sendData };
