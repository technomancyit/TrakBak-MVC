const mongoose = require('mongoose'),
Notifications = mongoose.models.Notifications;

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

    async checkDoc(doc) {

         return doc.type ? doc[doc.type] : doc._id;

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

    async emailNotification(recipients) {
            //layerone is global notifications. after this information will be used to look for user notiifcaitons that will overide these.
            let layerOne = await Notifications.m_read({query:{type:0, enabled:true}, populate:"groups"}).catch(e => console.log(e));
            let users = {};
            if(layerOne) {
                layerOne.forEach( (notification) => {
 
                    if(notification.actions[this.model.modelName]) {
                        notification.groups.forEach( group => {
                            
                            group.users.forEach( user => users[user] = notification.status);

                        });
                    }

                })
            }

           

            var _id = this.doc.type ? this.doc[this.doc.type] : this.doc._id;
            let pathName = this.doc.type;
            let modelName, object;
            if(pathName) {
                modelName = this.model.schema.paths[pathName].options.ref;
                object = await mongoose.models[modelName].m_read({query:{_id}, type:'findById'});
            } 
          
            if(object) {
                await Functions.asyncForEach(Object.keys(mongoose.models[modelName].schema.paths), async (key) => {
                    let schema = mongoose.models[modelName].schema.paths[key];
                    let ref = schema.options.ref;

                    if(ref === 'Users' && this.sender !== object[key].toString()) users[object[key]] = true
                });



                if(object.categories) {

                }

            }

            console.log('USERS', users)

        if(layerOne && layerOne.objectName && layerOne.objectName !=='') {
            layerOne.forEach( (action) => {
                if(action == 'all') {

                } else {
                    var model = mongoose.models[action];
                     model.m_read();
                }
            });
        } 

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