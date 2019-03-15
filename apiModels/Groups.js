const mongoose = require('mongoose'),
    uniqueValidator = require("mongoose-unique-validator"),
    crud = require('../controllers/mongoose/crud'),
    bcrypt = require('bcrypt-nodejs');

var GroupSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    // groups: [{ type: mongoose.Schema.ObjectId, ref: 'Groups' }],
    biography: String,
    permissions: Number,
    profilePicture: Buffer,
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
    passwordHash: { type: String, required: true },
});

GroupSchema.plugin(uniqueValidator);

var Groups = mongoose.model('Groups', GroupSchema);

let crudObj = {
    m_read: crud.m_read(Groups),
    m_create: crud.m_create(Groups)
}

Groups = Object.assign(Groups, crudObj);

const options = {
    prefix : 'api',
    routes: {
        m_create: {
        },
        m_read: {

        },
        m_update: {
            permissions: 1,
            groups: ['administrators']
        },
        m_delete: {

        }
    }
}

module.exports = { Groups, options };