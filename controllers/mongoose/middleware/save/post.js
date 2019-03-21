const mongoose = require('mongoose'),
    mailer = require('../../../../services/mail/mailer')



let hostname;
if (config.express.port) {
    hostname = `${config.express.hostname}:${config.express.port}`
} else {
    hostname = config.express.hostname;
}


module.exports = (model, compareName) => {

    return model.post('save', async doc => {
   
        Object.keys(doc._doc).forEach((schemaName) => {
            let ref = model.paths[schemaName].options.ref ?  model.paths[schemaName].options.ref : model.paths[schemaName].options.type && model.paths[schemaName].options.type[0] && model.paths[schemaName].options.type[0].ref ? model.paths[schemaName].options.type[0].ref : undefined;
       
            if (ref) {
        
                let modelName = ref;
                console.log('REFz 1', modelName)
                let schemaList = mongoose.modelSchemas[modelName].paths ? mongoose.modelSchemas[modelName].paths : mongoose.models[modelName].schema.paths;
                
                Object.keys(schemaList).forEach((deepSchemaName) => {



                    if(schemaList[deepSchemaName].options.type && schemaList[deepSchemaName].options.type.ref === compareName) {
                        
                        modelSchema.m_update({
                            where: {
                                _id: doc[schemaName]
                            },
                            body: {
                                [deepSchemaName]: doc._id
                            }
                        });
                    }

                    else if(schemaList[deepSchemaName].options.type[0] && schemaList[deepSchemaName].options.type[0].ref === compareName) {
                        let modelSchema = mongoose.models[modelName];
                        console.log('REFz', modelName)
                        modelSchema.m_update({
                            where: {
                                _id: doc[schemaName]
                            },
                            body: {
                                [deepSchemaName]: doc._id
                            },
                            push: true
                        });
                    }



                });
            }

        });

        if (config.mail.notifications && config.mail.notifications[compareName]) {
            let emails = config.mail.notifications[compareName].emails ? config.mail.notifications[compareName].emails : [];
            let users = config.mail.notifications[compareName].users ? config.mail.notifications[compareName].users : 'Admin';
            mailer({
                sendSeperate: true,
                ratelimit: 120,
                subject: `New ticket generated #${doc._id}`,
                from: config.mail.user,
                to: emails
            }, {
                name: 'newTicket',
                replace: [{
                        server: "TechnomancyIT"
                    },
                    {
                        link: `${hostname}/ticket/${doc._id}`
                    },
                    {
                        user: users
                    },
                    {
                        ticketMessage: doc.messages[0]
                    },
                    {
                        ticketNumber: doc._id
                    },
                    {
                        ticketSubject: 'Email Contact form'
                    },
                    {
                        fromEmail: doc.email
                    },
                    {
                        fromName: doc.customerName
                    },
                    {
                        type: doc.type
                    }
                ]
            });
        }



 

          
        
        


    });
}