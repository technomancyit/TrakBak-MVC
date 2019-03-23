class Notification {

    constructor(doc, text, options) {
        this.doc = doc;
        this.sender = options.sender;
        this.text = text;
        this.promises = [];
        this.rooms = options.rooms;
        this.recipients = options.recipients;
        this.model = options.model;
    }
    
    socketNotification(sockets) {

        this.promises.push(new Promise(async (resolve, reject) => {

            if (!sockets) sockets = this.rooms;
            if (!Array.isArray(sockets)) sockets = [sockets];

            await Functions.asyncForEach(sockets, socket => {
          //      console.log(socket);
            });

            resolve({sockets:sockets})

        }));

    }

    emailNotification(recipients) {

        this.promises.push(new Promise(async (resolve, reject) => {

            if (!recipients) recipients = this.recipients;
            if (!Array.isArray(recipients)) recipients = [recipients];

            await Functions.asyncForEach(recipients, recipient => {
      //          console.log(recipient);
            });

            resolve({emails:recipients})

        }));

    }

    schedule() {



    }

    exec(functions) {

        if(functions) {
           functions.forEach( (key) => {
                this[key]();
            });
        }

        Promise.all(this.promises).then(function(values) {

            
            console.log(values);
          });
    }

}

module.exports = Notification;