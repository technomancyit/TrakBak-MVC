const fs = require('fs'),
  path = require('path'),
  dir = __dirname,
  socketJS = path.join(dir, '../express/js/sockets.js'),
  camelCase = require('camelcase'),
  socketsFile = fs.readFileSync(socketJS, 'utf8'),
  customContent = socketsFile.replace(/(.|[\r\n])+\/\/ Don\'t Edit above this line -->/igm, ''),
  contents = `var socket = io(${config.express.socket ? `"${config.express.socket}"` : config.express.hostname ? `"${config.express.hostname}"` : `"socket.io"`});`,
  clientScripts = fs.readdirSync(`${dir}/clientScripts`);

let firstRun = false,
  connectionListener = ''

async function currentSocketScript(type, name, prefix, socketJS) {

  let newName = camelCase(`${prefix}-${type}-${name}`);

  connectionListener += `
    socket.on("${newName}", (data) => {
         console.log('FUCK', data)
       });`

  let scriptContent = `
  let ${newName} = (data) => {
    socket.emit('${newName}', data);
  console.log("RAN");
  }
  `
  await fs.appendFileSync(socketJS, scriptContent);
}

async function asyncRead(type, name, options) {

  if (!firstRun) {
    firstRun = true;

    await fs.writeFileSync(socketJS, `${contents}`)
    currentSocketScript(type, name, options.prefix, socketJS);
  }
  else if (options.last) {

    _sockets.io.prependListener('connection', (socket) => {
      eval(connectionListener);

    });

    currentSocketScript(type, name, options.prefix, socketJS);
    if (clientScripts.length !== 0) await Functions.asyncForEach(clientScripts, async (script) => {
      let scriptContent = await fs.readFileSync(`${dir}/clientScripts/${script}`, 'utf8');
      scriptContent
      await fs.appendFileSync(socketJS, `\n${scriptContent}`);
    });

    await fs.appendFileSync(socketJS, `\n\n// Don't Edit above this line -->${customContent}`)
  } else {
    currentSocketScript(type, name, options.prefix, socketJS);
  }

}

module.exports = asyncRead;