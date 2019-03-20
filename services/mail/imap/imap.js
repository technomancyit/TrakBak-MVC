const Imap = require('imap'),
  fs = require('fs'),
  mongoose = require('mongoose'),
  inspect = require('util').inspect,
 MailParser = require("mailparser").MailParser;
Promise = require("bluebird");
Promise.longStackTraces();




module.exports = (auth, options) => {
  if (!options) options = {};
  let imap = new Imap({
    user: auth.user,
    password: auth.password,
    host: auth.host,
    port: auth.port,
    tls: auth.tls ? auth.tls : false
  });


  imap.once("ready", execute);
  imap.once("error", function (err) {
    log.error("Connection error: " + err.stack);
  });

  imap.connect();

  function execute() {
    imap.openBox(options.folder ? options.folder : 'INBOX', false, function (err, mailBox) {
      if (err) {
        console.error(err);
        return;
      }
      imap.search(["ALL"], function (err, results) {
        if (!results || !results.length) {
          console.log("No unread mails");
          imap.end();
          return;
        }
        /* mark as seen
        imap.setFlags(results, ['\\Seen'], function(err) {
            if (!err) {
                console.log("marked as read");
            } else {
                console.log(JSON.stringify(err, null, 2));
            }
        });*/

        var f = imap.fetch(results, {
          bodies: ['HEADER.FIELDS (TO FROM SUBJECT DATE)', 'TEXT'],
          struct: true
        });
    
        let x = 1
        f.on('message', function (msg, seqno) {
       
          let header;
          let actualText;
          let objects = [];
          var message;
          //  console.log('Message #%d', seqno);
          var prefix = '(#' + seqno + ') ';
          msg.on('body', function (stream, info) {
           if (info.which === 'TEXT') var buffer = '';
            stream.on('data', function (chunk) {

              //      count += chunk.length;
              buffer += chunk.toString('utf8');
              //     console.log(buffer);
              if (!message) message = chunk
              else message += chunk;
            });
            stream.once('end', function () {


              if (info.which !== 'TEXT')

              header = Imap.parseHeader(buffer);

              else {
                var text = buffer;
                let reg = new RegExp(`Content-Transfer-Encoding: quoted-printable(.|\n|\r)+<${auth.user}> | \{(?:[^{}]|(R))*\}`, 'gi');
              
                let findText = text.match(reg);
                let object = JSON.parse(findText[1])
                if (findText) {
                  let text = findText[0].split('\n');
                  findText = findText[0].split('\r');
                  text[findText.length - 1] = undefined;
                  text[0] = undefined;
                  actualText = text.join('\n');


                  console.log('text', actualText)

            //        console.log('FA FUC')
                 
                      objects.push(object);
                 
                  
                  

                } 


                

              }

            });
          });


          msg.once('attributes', function (attrs) {
            //    console.log(prefix + 'Attributes: %s', inspect(attrs, false, 8));
          });
          msg.once('end', async function () {

            console.log (objects);

            var email = header.undefinedfrom[0].match(/<(.*?)>/)[0].substring(1, header.undefinedfrom[0].match(/<(.*?)>/)[0].length-1);

            let user = await models.Users.m_read({query:{email}, type:"findOne"}).catch(e => console.log(e));

            if(user) {

              var message = {
                "type":"ticket",
                "ticket": objects[0].id,
                "sender": user._id,
                "text": actualText
              }

              console.log('WTT', message);

              let socketInfo =  {
                "script": "socketPush",
                "object": "ticket"
               }

            models.Messages.m_create({body:message,socketInfo, populate:'sender'}).catch(e => console.log(e));

            }



            console.log(user);


            imap.seq.move(seqno, 'processed', (err, data) => {
              console.log(err, data)
              console.log(x, results.length)
              if(x === results.length) {
    
                imap.end();
              }
              x++;
          });
  
           
            console.log(prefix + 'Finished');
          });

        });
        f.once('error', function (err) {
          console.log('Fetch error: ' + err);
        });
        f.once('end', function () {
      
          console.log('Done fetching all messages!');
        //  imap.end();
        });
      });
    });
  }


  function processMessage(msg, seqno) {
    console.log("Processing msg #" + seqno);
    console.log(msg);
    console.log(seqno)
    var parser = new MailParser();
    parser.on("headers", function (headers) {
      console.log("Header: " + JSON.stringify(headers));
    });

    parser.on('data', data => {
      console.log(Object.keys(data));

      if (data.type === 'text') {
        //    console.log(data.text)
        //   console.log(seqno);
        //   console.log(data.textAsHtml);/* data.html*/
        let findText = data.text.match(/Content-Transfer-Encoding: quoted-printable(.|\n\r)*?<support@technomancyit.com>/g);
        let actualText;
        if (findText) {
          findText = findText[0].split('\n')
          findText = findText[0].split('\r')
          delete findText[findText.length - 1];
          delete findText[0]
          actualText = findText.join('\n');
        }

        //console.log(actualText);



        //   fs.writeFileSync('./test.html',data.text);
        //        console.log(Object.keys(data));
        let matchTest = data.textAsHtml.match(/<div>[\s\S]*?<\/div>/g)

        console.log(matchTest)
      } else {
        console.log(data.type);
      }

      // if (data.type === 'attachment') {
      //     console.log(data.filename);
      //     data.content.pipe(process.stdout);
      //     // data.content.on('end', () => data.release());
      // }
    });


    msg.on("body", function (stream) {
      stream.on("data", function (chunk) {
        parser.write(chunk.toString("utf8"));
      });
    });
    msg.once("end", function () {
      // console.log("Finished msg #" + seqno);
      parser.end();
    });
  }

}