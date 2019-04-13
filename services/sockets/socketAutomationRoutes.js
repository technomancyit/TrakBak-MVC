const fs = require('fs'),
path = require('path'),
dir = path.join(__dirname, '../express/js/sockets.js');


let sockets = fs.readFileSync(dir, 'utf8');
let customContent = sockets.replace(/(.|[\r\n])+\/\/ Don\'t Edit above this line -->/igm, '');

let contents = `var socket = io(${config.express.socket ? config.express.socket : "'socket.io'"});`,
mainContent = ``;
firstRun = false;

async function asyncRead(type, name, options) {

  
  
  


  if(!firstRun) {
    firstRun = true;
  //  contents = `${contents}\n${customContent}`;
  await fs.writeFileSync(dir, `${contents}`)
  }
  else if(options.last) {
    await fs.appendFileSync(dir, `\n\n// Don't Edit above this line -->${customContent}`)
  } else {
  // await fs.appendFileSync(dir, `${customContent}`)
  }

  

}

module.exports = asyncRead;

