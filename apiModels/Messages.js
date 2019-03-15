//These are schemas that the system automatically loads into models and routes within the application. It will pick the schema name and the prefix to determine which routes the models are attached too.

const mongoose = require('mongoose'),
    uniqueValidator = require("mongoose-unique-validator"),
    crud = require('../controllers/mongoose/crud'),
    bcrypt = require('bcrypt-nodejs'),
    mailer = require('../services/mail/mailer');

var modelName = 'Messages';
var schema = new mongoose.Schema({

    type: {
        type: String,
        required: true
    },
    sender: {
        type: mongoose.Schema.ObjectId,
        ref: 'Users',
        required: true
    },
    text: {
        type: String,
        required: true
    },
    ticket: {
        type: mongoose.Schema.ObjectId,
        ref: 'Tickets',
    },
    recipients: [{
        type: {
            type: mongoose.Schema.ObjectId,
            ref: 'Users'
        }
    }],
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

require('../controllers/mongoose/middleware/mongooseAutoMiddleware')(schema, modelName);

// schema.post('save', async doc => {
//     console.log('RAN', mongoose.modelSchemas);
//     //  Object.keys(doc._doc).forEach((schemaName) => {
   
//     //     if (schema.paths[schemaName].options.ref) {
           
//     //         let modelName = schema.paths[schemaName].options.ref;

//     //       //  let schemaList = mongoose.modelSchemas[modelName].paths;
//     //         console.log('RAN', modelName,  mongoose.modelSchemas);
            
//     //         Object.keys(schemaList).forEach((deepSchemaName) => {
                
//     //             if (schemaList[deepSchemaName].options.type[0] && schemaList[deepSchemaName].options.type[0].ref === model) {
//     //                 let modelSchema = mongoose.modelSchemas[modelName];
                   
//     //                 modelSchema.m_update({
//     //                     where: {
//     //                         _id: doc[schemaName]
//     //                     },
//     //                     body: {
//     //                         [deepSchemaName]: doc._id
//     //                     },
//     //                     push: true
//     //                 })
//     //             }
//     //         });
//     //     }

//     // })
//     // console.log(MessageSchema.paths);

//     // if (config.mail.notifications && config.mail.notifications.Messages) {
//     //     let emails = config.mail.notifications.Messages.emails ? config.mail.notifications.Messages.emails : [];
//     //     let users = config.mail.notifications.Messages.users ? config.mail.notifications.Messages.users : 'Admin';
//     //     mailer({
//     //         sendSeperate: true,
//     //         ratelimit: 120,
//     //         subject: `New Message generated #${doc._id}`,
//     //         from: config.mail.user,
//     //         to: emails
//     //     }, {
//     //         name: 'newMessage',
//     //         replace: [{
//     //                 server: "TechnomancyIT"
//     //             },
//     //             {
//     //                 link: `${hostname}/Message/${doc._id}`
//     //             },
//     //             {
//     //                 user: users
//     //             },
//     //             {
//     //                 MessageMessage: doc.messages[0]
//     //             },
//     //             {
//     //                 MessageNumber: doc._id
//     //             },
//     //             {
//     //                 Messagesubject: 'Email Contact form'
//     //             },
//     //             {
//     //                 fromEmail: doc.email
//     //             },
//     //             {
//     //                 fromName: doc.customerName
//     //             },
//     //             {
//     //                 type: doc.type
//     //             }
//     //         ]
//     //     });
//     // }

// });


let Model = mongoose.model(modelName, schema);

let crudObj = {
    m_create: crud.m_create(Model),
    m_read: crud.m_read(Model),
    m_update: crud.m_update(Model),
    m_delete: crud.m_delete(Model)
}

Model = Object.assign(Model, crudObj);

//mongoose.modelSchemas[modelName] = Object.assign(Model, crudObj);

const options = {
    prefix: 'api',
    routes: {
        m_create: {

        },
        m_read: {
            permissions: 1
        },
        m_update: {
            permissions: 1
        },
        m_delete: {
            permissions: 1
        }
    }
}

module.exports = {
    [modelName]: Model,
    options
};