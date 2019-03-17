global.log = require('./functions/messenger');
global.config = require('./config/scripts/config');

Promise.all(require('./config/scripts/config').doneArray).then((data) => {
    global.config.bash = data[0];
    global.config.mail = data[2];
    global.config.express = data[3];
    global.config.mongo = data[4];
    require('./controllers/mongoose/mongoose');
 //  global.crud = require('./controllers/crud');
    require('./services/express/server');



});
