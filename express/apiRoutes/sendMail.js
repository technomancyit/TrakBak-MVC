const express = require('express'),
    mongoose = require('mongoose')
    models = mongoose.models,
    server = require('../server'),
    randomstring = require("randomstring"),
    mailer = require('../../services/mail/mailer'),
    Verifier = require("email-verifier"),
    {
        Tickets
    } = require("../../apiModels/Tickets"),
    cookie = require('cookie'),
    {
        promisify
    } = require("util"),
    jwt = require('jsonwebtoken'),
    {
        Users
    } = require('../../apiModels/Users'),
    router = express.Router()

let verifier = new Verifier("at_VLZKJ87dDSp9lQEGjMGPzW71bh4f8");

let hostname;
if (config.express.port) {
    hostname = `${config.express.hostname}:${config.express.port}`
} else {
    hostname = config.express.hostname;
}

verifier.verify = promisify(verifier.verify);

var pathSet = '/';
router.route(pathSet).post(async (req, res) => {

    let error = {};
    let verifiedEmail = await verifier.verify(req.body.email, {
        hardRefresh: true
    }).catch(e => e);

    verifiedEmail.smtpCheck = (verifiedEmail.smtpCheck === 'true');
    verifiedEmail.formatCheck = (verifiedEmail.formatCheck === 'true');
    verifiedEmail.dnsCheck = (verifiedEmail.dnsCheck === 'true');

    if (verifiedEmail.formatCheck && verifiedEmail.smtpCheck && verifiedEmail.dnsCheck || verifiedEmail.formatCheck && verifiedEmail.freeCheck && verifiedEmail.dnsCheck) {
        
        let randomPassword = randomstring.generate(32);
        let user = await models.Users.m_create({
            query: {
                account:req.body.email,
                email:req.body.email,
                status:2,
                permissions: 2,
                password:randomPassword
        }}).catch( e => console.log(e));

        let sender = user ? user._id : await models.Users.m_read({query:{email:req.body.email}, type:'findOne'}).catch(e => e);
        
        if(sender && typeof sender === 'object') sender = sender._id
        var ticketID = mongoose.Types.ObjectId();
        var messageID = mongoose.Types.ObjectId();
        let message = models.Messages.m_create({
            query: {
                _id: messageID,
                type:"ticket",
                sender,
                ticket: ticketID,
                text: req.body.message
        }}).catch( e => console.log(e));
        
        let ticket = await models.Tickets.m_create({
            body: {
                _id: ticketID,
                status: 1,
                type: req.body.type,
                owner: sender,
                messages: [messageID]
            }
        }).catch(e => {
            console.log(e);
            error.err = "Could not create contact ticket"
        });

        if (ticket) {
         

            switch (req.body.template) {
                case "general":
                    await mailer({
                        subject: "Recieved your request. You may email back to this",
                        from: config.mail.user,
                        to: req.body.email
                    }, {
                        name: 'general',
                        replace: [{
                                server: "TechnomancyIT"
                            },
                            {
                                link: `${hostname}/ticket/?vreply=${ticket._id}`
                            },
                            {
                                user: req.body.name
                            }
                        ]
                    });
                    break;

                default:

                    break;
            }
        }

    } else {
        console.log('dooka', verifiedEmail);
        error.err = "Could not verify your email address.";
    }

    if (error.err) {

        return res.status(404).send(JSON.stringify(error));

    }

    return res.status(200).send(JSON.stringify({}));

});

server.use('/mailer', router);