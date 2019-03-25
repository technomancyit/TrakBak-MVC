const mongoose = require('mongoose'),
mailer = require('../mail/mailer'),
Notifications = mongoose.models.Notifications;

class Notification {

    constructor(doc, text, options) {
        this.doc = doc;
        this.sender = options.sender;
        this.text = text;
        this.promises = [];
        this.route = options.route;
        this.rooms = options.rooms;
        this.recipients = options.recipients;
        this.model = options.model;
    }

    async checkDoc(doc) {

         return doc.type ? doc[doc.type] : doc._id;

    }
    
   async socketNotification(doc) {

        this.promises.push(new Promise(async (resolve, reject) => {




            resolve({sockets:doc})

        }));

    }

    async emailNotification(doc) {

        console.log(doc.user.email)
        this.promises.push(new Promise(async (resolve, reject) => {
           
            mailer({
                subject: "Recieved your request. You may email back to this",
                from: config.mail.user,
                to: doc.user.email
            }, {
                name: 'general',
                replace: [{
                        server: "TechnomancyIT"
                    },
                    {
                        link: `${hostname}/ticket/?vreply=`
                    },
                    {
                        user: doc.user.account
                    },
                    {
                        id: 'Ticket ID goes here'
                    }
                ]
            });

            resolve({emails:doc})

        }));

    }

    schedule() {



    }

    async findNotifications(type) {
                    let typeArr = []
                    if(type === 'both') {
                        typeArr[0] = 'sockets',
                        typeArr[1] = 'email';
                    }


                    if(this.notifications) return this.notifications

                    //layerone is global notifications. after this information will be used to look for user notiifcaitons that will overide these.
                    let layerOne = await Notifications.m_read({query:{type:0, enabled:true}, populate:"groups", deep:{groups:'users'}}).catch(e => console.log(e));
                    let users = {};
                    let global = [];
                    if(layerOne) {
        
                        layerOne.forEach( (notification) => {
         
                            if(notification.actions[this.model.modelName]) {
                                // if(!users[this.doc.owner]) users[this.doc.owner] = {owner:true}
                                // users[this.doc.owner] = this.doc.owner !== this.sender ? users[this.doc.owner].status = true :  users[this.doc.owner].status = false;
                                notification.groups.forEach( group => {
                                        
                                    if(notification.actions[this.route] || notification.actions.all) group.users.forEach( user => users[user._id]  = 
                                        this.sender !== user._id
                                        && !users[user._id]
                                        && notification.actions[typeArr[0]]
                                        || notification.actions[typeArr[1] ? typeArr[1] : typeArr[0]]
                                        || this.sender !== user._id
                                        && notification.actions[typeArr[0]]
                                        || notification.actions[typeArr[1] ? typeArr[1] : typeArr[0]]
                                        && users[user._id].status === true ? { user, templates:{owner:notification.templates.owner, everyone:notification.templates.everyone}, status:notification.status, sockets:notification.actions.sockets, email:notification.actions.email} : { status:false});
        
                                });
                            }
        
                        });
                    }          
        
                    //This is how it finds secondary notification objects (Certain objects dont have user information attached to them, so the system needs to find the parent to find the owner and anyone else that may have accesss)
                    var _id = this.doc.type ? this.doc[this.doc.type] : this.doc._id;
                    let pathName = this.doc.type;
                    let modelName, object;
                    if(pathName && this.model.schema.paths[pathName]) {
                        modelName = this.model.schema.paths[pathName].options.ref;
                        object = await mongoose.models[modelName].m_read({query:{_id}, type:'findById', populate:'categories owner', deep:{categories:'groups'}});
                    } 
                  
                    if(object) {
        
                      //  if(!users[object.owner]) users[object.owner] = {owner:true}
        
                      //  users[object.owner] = object.owner !== this.sender ? users[object.owner].status = true :  users[object.owner].status = false;
                //This is the layerTwo which is the secondary global notification check. Should now be able to do same request as above, but now knowing what the parent object is.
                        let layerTwo = await Notifications.m_read({query:{type:0, enabled:true}, populate:"groups" , deep:{groups:'users'}}).catch(e => console.log(e));
                        if(layerTwo) {
                 
                            layerTwo.forEach( (notification) => {
                                
                                if(notification.actions[modelName]) {
                                    notification.groups.forEach( group => {
                                            
                                        if(notification.actions[this.route] 
                                            || notification.actions.all) group.users.forEach( user => users[user._id]  = 
                                                this.sender 
                                                !== user._id 
                                                && !users[user._id]
                                                && notification.actions[typeArr[0]]
                                                || notification.actions[typeArr[1] ? typeArr[1] : typeArr[0]]
                                                || this.sender !== user._id
                                                && notification.actions[typeArr[0]]
                                                || notification.actions[typeArr[1] ? typeArr[1] : typeArr[0]]
                                                && users[user.id].status === true ? {user, templates:{owner:notification.templates.owner, everyone:notification.templates.everyone}, status:notification.status, sockets:notification.actions.sockets, email:notification.actions.email} : { status:false});
            
                                    });
                                }
            
                            });
                        }  
        
                        //This is the third layer (User layer) any global notiifcations will be replaced with user defaults.
        
                        await Functions.asyncForEach(Object.keys(mongoose.models[modelName].schema.paths), async (key) => {
                      
                            let schema = mongoose.models[modelName].schema.paths[key];
                            let ref = schema.options.type && schema.options.type[0] ? schema.options.type[0].ref :schema.options.ref;
        
                            //this finds the owner
                            let notification = layerOne ? layerOne[0] : layerTwo[0];

                            if(ref === 'Users' && this.sender !== object[key]._id.toString()) users[object[key]._id] = {user: object[key], status: true, owner:true, [type]:true, templates:{owner:notification.templates.owner, everyone:notification.templates.everyone}, status:notification.status, sockets:notification.actions.sockets, email:notification.actions.email}
        
                            if(ref === 'Categories' ) object[key].forEach(categories => {
                                categories.groups.forEach(group => console.log(group.users))
                            });
        
                        });
        
                        if(object.categories) {
        
                        }
        
                    }
                    this.notifications = users;
                    return users;
        
    }

    async exec(functions) {

        let notifications = await this.findNotifications('both');

        if(notifications) {

            Object.keys(notifications).forEach( async (key) => {
                let value = notifications[key];
   
                if(value.sockets && functions.includes('socketNotification')) this.socketNotification(value); 
                if(value.email && functions.includes('emailNotification')) this.emailNotification(value); 
               
            });

        }


        // Promise.all(this.promises).then(async (values) => {

        //     let notifications = await this.findNotifications('both');

        //     console.log(notifications);
            
        //     console.log(values);
        //   });
    }

}

module.exports = Notification;