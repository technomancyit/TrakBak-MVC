const fs = require('fs'),
  path = require('path'),
  dir = __dirname,
  socketJS = path.join(dir, '../express/js/sockets.js'),
  camelCase = require('camelcase'),
  socketsFile = fs.readFileSync(socketJS, 'utf8'),
  crud = {post:'m_create', get:'m_read', put:'m_update', delete:'m_delete'},
  models = require('mongoose').models
  customContent = socketsFile.replace(/(.|[\r\n])+\/\/ Don\'t Edit above this line -->/igm, ''),
  contents = `var socket = io(${config.express.socket ? `"${config.express.socket}"` : config.express.hostname ? `"${config.express.hostname}"` : `"socket.io"`});`,
  clientScripts = fs.readdirSync(`${dir}/clientScripts`);

let firstRun = false,
  connectionListener = ''

async function currentSocketScript(type, name, prefix, socketJS) {

  let newName = camelCase(`${prefix}-${type}-${name}`);
  // models[filename][crud[i]](query)

  console.log(await models.Categories.m_read({query:{}}));
  connectionListener += `
    socket.on("${newName}", async (data) => {
  
        console.log(data);
        let model = await models.${name}.${crud[type]}(data)
         console.log('FUCK', data, model)
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
    await currentSocketScript(type, name, options.prefix, socketJS);
  }
  else if (options.last) {

    _sockets.io.prependListener('connection', (socket) => {
      console.log(connectionListener)
      eval(connectionListener);

    });

    await currentSocketScript(type, name, options.prefix, socketJS);
    if (clientScripts.length !== 0) await Functions.asyncForEach(clientScripts, async (script) => {
      let scriptContent = await fs.readFileSync(`${dir}/clientScripts/${script}`, 'utf8');
      scriptContent
      await fs.appendFileSync(socketJS, `\n${scriptContent}`);
    });

    await fs.appendFileSync(socketJS, `\n\n// Don't Edit above this line -->${customContent}`)
  } else {
    await currentSocketScript(type, name, options.prefix, socketJS);
  }

}

module.exports = asyncRead;