const fs = require('fs'),
    path = require('path'),
    express = require('express'),
    server = require('../server').app,
    io = require('../../sockets/socket.io'),
    mongoose = require('mongoose'),
    router = express.Router();
passport = require('passport'),
    dir = __dirname,
    apiModels = `${path.join(dir, '../../../', 'apiModels')}`, {
        promisify
    } = require('util');

const modelFiles = fs.readdirSync(apiModels);

models = mongoose.models

types = ['post', 'get', 'put', 'delete'];
crud = ['m_create', 'm_read', 'm_update', 'm_delete'];

rf = [];

async function asyncRoute() {

    await Functions.asyncForEach(modelFiles, (file) => {
        let filename = file.slice(0, file.length - 3);
        let model = require(`${apiModels}/${file}`);
        let options = {};
        if (model) options = model.options;
        options.path = options.prefix ? `/${options.prefix}/${filename}` : `/${filename}`;

        for (let i = 0; i < 4; i++) {
            let permissions = options.permissions ? options.permissions : undefined;
            let groups = options.groups ? options.groups : undefined;

            let route = {

                route: async (req, res) => {
                    res.setHeader('Content-Type', 'application/json');

                    let options = {
                        page: Object.keys(req.query).length !== 0 && req.query.page && !req.query.start ? Number(req.query.page) - 1 : req.query.start ? req.query.start / req.query.length : undefined,
                        perPage: Object.keys(req.query).length !== 0 && req.query.perPage && !req.query.length ? req.query.perPage : req.query.length ? req.query.length : undefined,
                        populate: Object.keys(req.query).length !== 0 && req.query.populate ? req.query.populate : undefined,
                        socketInfo: Object.keys(req.query).length !== 0 && req.query.socketInfo ? req.query.socketInfo : req.body.socketInfo ? req.body.socketInfo : {
                            script: "socketPush",
                            room: req.query.room ? req.query.room : req.body.room,
                            object: req.query.type ? req.query.type : req.body ? req.body.type : undefined,
                            id: ''
                        },
                        excludes: Object.keys(req.query).length !== 0 && req.query.excludes ? req.query.excludes : req.body.excludes ? req.body.excludes : undefined,
                        count: Object.keys(req.query).length !== 0 && req.query.count ? req.query.count : undefined,
                        or: Object.keys(req.query).length !== 0 && req.query.or ? req.query.or : undefined
                    }

                    if (options.page || Number(options.page) === 0) delete req.query.page
                    if (options.perPage) delete req.query.perPage;
                    if (options.count) delete req.query.count;
                    if (options.populate) delete req.query.populate;
                    if (options.or) delete req.query.or;
                    if (options.excludes) req.query.excludes ? delete req.query.excludes : delete req.body.excludes;
                    if (options.socketInfo) {

                        req.query.socketInfo ? delete req.query.socketInfo : delete req.body.socketInfo;

                        if (types[i] == 'post' || types[i] == 'put' || types[i] == 'delete') {
                            options.populate = '';
                            let paths = models[filename].schema.paths;
                            await Functions.asyncForEach(Object.keys(paths), async (key) => {

                                if (paths[key].options.ref) {
                                    options.populate += `${key} `;

                                }
                            });
                            if (req.originalUrl.includes('/api/messages')) {
                                options.excludes = '-messages -groups -permissions';
                                options.populate = 'sender';
                            }
                        }

                    }

                    


                    let query = Object.keys(req.body).length !== 0 ? {
                        query: req.body
                    } : {
                        query: req.query
                    };

                    let dataTableSearch = {};

                    if (req.query.columns) {

                        await Functions.asyncForEach(req.query.columns, (column, index) => {

                            if (req.query.order && Number(req.query.order[0].column) === index) {

                                options.sort = column.data;
                                options.direction = req.query.order[0].dir;

                            }

                            let searchString;

                            dataTableSearch[column.data] = req.query.search && req.query.search.value ? req.query.search.value : '';

                            if (dataTableSearch[column.data] !== '') options.searching = true;

                        });
                        query = {
                            query: dataTableSearch
                        };

                        if (options.type) delete options.type;

                    }

                    if (Object.keys(options).length !== 0) query = Object.assign(
                        query, options);

                    switch (crud[i]) {
                        case 'm_create':

                            break;

                        default:
                            break;
                    }

                    let data = await models[filename][crud[i]](query).catch(e => console.log(e));
                    if (data && data.collectionSize) {

                        let collectionSize = data.collectionSize;
                        let recordsFiltered = data.searchCount ? data.searchCount : collectionSize
                        delete data.collectionSize;

                        let dataTableObj = {
                            data: data,
                            draw: req.query.draw,
                            recordsTotal: collectionSize,
                            recordsFiltered
                        }

                        data = dataTableObj;

                    } else if (!data) {
                        data = {};
                    }

                    res.status(200).send(JSON.stringify(data));

                },
                path: options.path,
                type: types[i],
                permissions: options.permissions ? options.permissions : 0,
                groups: options.groups ? options.groups : []

            }

            if (options.routes && options.routes[crud[i]]) {
                permissions = options.routes[crud[i]].permissions ? options.routes[crud[i]].permissions : options.permissions;

                groups = options.routes[crud[i]].groups ? options.routes[crud[i]].groups : options.groups;
            }

            let authentication;
            if (permissions || groups) authentication = passport.authenticate(['jwt', 'cookie'], {
                session: false
            });
            rf.push(route);
            if (authentication) {
                router.route(route.path)[route.type](authentication, server.permissions(permissions), route.route)
            } else {
                router.route(route.path)[route.type](route.route);
            }

        }
    });

    server.use('/', router)
}

asyncRoute();