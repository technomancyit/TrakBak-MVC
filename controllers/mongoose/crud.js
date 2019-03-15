const mongoose = require('mongoose');

var ObjectId = require('mongoose').Types.ObjectId;



async function populationDeep(options, populate) {
  console.log('RAzN')
  var popDeep = options.deep ? options.deep : populate;
  var popArr = []

  if (popDeep) {
    console.log(populate)
    await Functions.asyncForEach(populate.split(" "), async (pop) => {
      if(pop !== '')
      if (Object.keys(popDeep).includes(pop)) {
       
        popArr.push({ path: pop, populate: { path: popDeep[pop] } });
      } else {
        console.log('[o[', pop);
        popArr.push({ path: pop });
      }
    })
  } 

  return popArr
}

module.exports = {

  m_create: (model) => {

    return (options, _cb) => {
   
      if (options) {
        if (options.body) options.query = options.body;
        if (!options.type) options.type = 'create';
   
        model.lastQuery = options.query;
        if (!_cb) {
          return new Promise((resolve, reject) => {
            eval(model)[options.type](options.query, function (err, data) {
              if (err) return reject({
                err: `could not create in ${model.modelName} model. ${err.errmsg ? err.errmsg : err.errors[Object.keys(err.errors)[0]].message}`
              });
              return resolve(data);
            });
          });

        } else {

          eval(model)[options.type](options.query, function (err, data) {
            if (err) return _cb({
              err: `could not create in ${model.modelName} model. ${err.errmsg ? err.errmsg : err.errors[Object.keys(err.errors)[0]].message}`
            });
            return _cb(null, data);
          });
        }
      }
    }
  },

  m_read: (model) => {
    
    let runFunction = eval(model);

    return async (options, _cb) => {
      console.log(options);
      let populate = '';
      if(options.populate && options.populate !== 'false') {
        populate = options.populate;
        // await Functions.asyncForEach(Object.keys(model.schema.obj), async (key) => {
        //   var val = Array.isArray(model.schema.obj[key]) ? model.schema.obj[key][0] : model.schema.obj[key];

        //   if (typeof val === 'object' && val && val.ref) {

        //     console.log()
            
        //     populate += ` ${val.ref.toLowerCase()}`
        
        //   }
        // });
        
        delete options.populate;

       
        
      }
   
      var popArr = await populationDeep(options, populate);


      if (!options.sort) options.sort = 'createdAt'
      if (!options.direction) options.direction = 'asc'
      if (!options.perPage) options.perPage = 100;
      if (!options.page) options.page = 0;

      if (!options.query && !options.secondary && !options || !options.query && !options.secondary && Object.keys(options).length === 0) options.query = {};
      if (!options.type) options.type = 'find';


      

      if (options.or) {

        let or = {
          $or: []
        };
        await Functions.asyncForEach(Object.keys(options.query), async (value, index) => {

          let noRun = false
          let promiseAll = [];
          
          if(!runFunction.schema.paths[value] && value.includes('.')) {
            console.log(value, ' Im the rouge!');
            let newValue = value.split('.');
            let modelName = runFunction.schema.paths[newValue[0]].options.ref;

            let search = mongoose.models[modelName].schema.paths[newValue[1]];
            console.log({query:{[newValue[1]]:options.query[value]}});
            mongoose.models[modelName].m_read({query:{[newValue[1]]:options.query[value]}, or:'t'}).catch(e => console.log(e));

            //console.log(users);

           // console.log(search);



          }
          if (runFunction.schema.paths[value] && runFunction.schema.paths[value].instance === 'Number') {

            noRun = true;

            if (Number(options.query[value])) {
              options.query[value] = Number(options.query[value]);
              or.$or.push({
                [value]: {
                  $in: Number(options.query[value])
                }
              });
            }

          }



          if (runFunction.schema.paths[value] && runFunction.schema.paths[value].instance === 'ObjectID') {

            noRun = true
            if (ObjectId.isValid(options.query[value])) {
              or.$or.push({
                [value]: options.query[value]
              });
            }

          }

          if (!noRun) {
            let regEx = new RegExp(options.query[value], 'g')

            if (value !== 'updatedAt')
              or.$or.push({
                [value]: regEx
              });
          }

        });

        options.query = or;

      };
      console.log('cry', options.query);

      if (!_cb) {
        return new Promise((resolve, reject) => {

          eval(model)[options.type](options.query)
            .skip(Number(options.perPage * options.page))
            .limit(Number(options.perPage))
            .sort({
              [options.sort]: options.direction
            })
            .populate(popArr)
            .exec(async (err, doc) => {
              if (err) {
                console.log(err);
                return reject({
                  err: `could not find ${JSON.stringify(options.query)} in ${model.modelName}`
                })
              };

              if (options.searching) {
                doc.searchCount = await eval(model).countDocuments(options.query).catch(e => console.log(e));
                doc.collectionSize = await eval(model).estimatedDocumentCount(options.query).catch(e => console.log(e));
                return resolve(doc);

              }

              else if (options.count) {

                await eval(model).find({}).estimatedDocumentCount((err, count) => {
                  doc.collectionSize = count;

                  return resolve(doc);

                });
              } else {

                return resolve(doc);
              }

            });

        });

      } else {

        eval(model)[options.type](options.query)
          .skip(Number(options.perPage * options.page))
          .limit(Number(options.perPage))
          .sort({
            [options.sort]: options.direction
          })
          .exec(async (err, doc) => {
            if (err) return _cb({
              err: `could not find ${JSON.stringify(options.query)} in ${model.modelName}`
            });
            if (options.count) {

              await eval(model).find({}).estimatedDocumentCount(function (err, count) {
                doc.collectionSize = count;

                return _cb(null, data);

              });
            } else {

              return _cb(null, data);
            }

          });

      }
    }
  },

  m_update: (model) => {
    
    return (options, _cb) => {

      if (options.body) options.query = options.body;
      if (!options.type) options.type = 'updateOne';

      if(options.push) options.query = {$push: options.query};

      if (!_cb) {

        return new Promise((resolve, reject) => {
          eval(model)[options.type](
            options.where,
            options.query, (err, data) => {
              if (err) reject({
                err: 'Could not update'
              });
              return resolve(data);
            });
        });
      } else {
        eval(model)[options.type](
          options.where,
          options.query, (err, data) => {
            if (err) return _cb({
              err: 'Could not update'
            });
            return _cb(null, data);
          });
      }

    }

  },

  m_delete: (model) => {
    return (options, _cb) => {
      if (options.where || options.body) options.query = options.where ? options.where : options.body;
      if (!options.type) options.type = 'deleteOne';
      if (!_cb) {
        return new Promise((resolve, reject) => {
          eval(model)[options.type](options.query, (err, data) => {
            if (err) return reject({
              err: 'Could not delete'
            });
            return resolve(data);
          });
        });

      } else {

        eval(model)[options.type](options.query, (err, data) => {
          if (err) return _cb({
            err: 'Could not delete'
          });
          return _cb(null, data);
        });

      }

    }

  }

}