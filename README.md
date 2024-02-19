# TypeGen

TypegenCLI is a cli tool that helps developers generate typescript types from JSON data. This is especially useful for generating types for API responses in development

## Usage
### CLI
Install the Typegen Server globally to use the cli
```sh
$ npm i -g @peteradeojo/typegencli
```

Then run
```sh
$ typegen -h
```

Start the listener in a terminal window
```sh
$ typegen -l/--listen [PORT]
```

### Generator
Install the `@peteradeojo/typegencli` inn your project
```sh
$ npm i @peteradeojo/typegencli
```

Create a generator
```js
const {sendData} = require('@peteradeojo/typegencli');

const generator = sendData(3000); // 3000 is the port the listener is running on. This should match the port given for the -l/--listen options
```

Pass a type name and the JSON object you want to generate types for into the generator function
```js
// ...
generator("Cat", data); // data can object from API response or parsed JSON. Any object at all will do

// ...
```

This will generate a type and output it to the listener terminal window

```
type Cat = {
  id: number;
  color: string;
  picture: string;
}
```

It would also output to a `typegen/Cat.ts` file in your project directory

## Demo Video
Watch the demo

https://twitter.com/i/status/1759724420602491141