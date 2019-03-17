const fs = require('fs'),
    path = require('path'),
    express = require('express'),
    server = require('../server').app,
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
       let model = require(`${apiModels}/${file}`).options;
        let options = {};
        if (model) options = model;
        options.path = options.prefix ? `/${options.prefix}/${filename}` : `/${filename}`;

        for (let i = 0; i < 4; i++) {
            let permissions = options.permissions ? options.permissions : undefined;
            let groups = options.groups ? options.groups : undefined;

            let ergg = 'm_delete'
            let route = {

                route: async (req, res) => {
                    res.setHeader('Content-Type', 'application/json');

                    let options = {
                        page: Object.keys(req.query).length !== 0 && req.query.page && !req.query.start ? Number(req.query.page) - 1 : req.query.start ? req.query.start / req.query.length : undefined,
                        perPage: Object.keys(req.query).length !== 0 && req.query.perPage && !req.query.length ? req.query.perPage : req.query.length ? req.query.length : undefined,
                        populate: Object.keys(req.query).length !== 0 && req.query.populate ? req.query.populate : undefined,
                        count: Object.keys(req.query).length !== 0 && req.query.count ? req.query.count : undefined,
                        or: Object.keys(req.query).length !== 0 && req.query.or ? req.query.or : undefined
                    }

                    if (options.page || Number(options.page) === 0) delete req.query.page
                    if (options.perPage) delete req.query.perPage;
                    if (options.count) delete req.query.count;
                    if (options.populate) delete req.query.populate;
                    if (options.or) delete req.query.or;

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

                            console.log('ERG', dataTableSearch[column.data])
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