'use strict';

let policyScripts;
async function asyncLoad() {
policyScripts = await require('../../../controllers/policies/policyLoad')

}

asyncLoad()

module.exports = (route) => {

    return async function (req, res, next) {
    let key = req.originalUrl.toLowerCase();
    let promises = [];
    let policies = policyScripts[key];
    
    await Functions.asyncForEach(Object.keys(policies), async key => {
        let policy = policies[key];
        promises.push(require(policy.function)(req, res));
    });

    Promise.all(promises).then(() => {
        return next()
    }).catch( (e) => {
        
        console.log(e);
        return res.send(e).status(404);
    })

    }
}
