const fs = require('fs'),
  path = require('path')

const dir = __dirname,
  configDir = path.join(dir, '../../', 'config/modelConfigs');

Array.prototype.diff = function(a) {

    return this.filter(function(i) {return a.indexOf(i) < 0;});
};

let policy = new Promise(async (resolve, reject) => {

  let policies = {};
  let policySet = {};

  let removedFiles = ['policyLoad.js'];
  await Functions.asyncForEach(fs.readdirSync(dir).filter(item => !removedFiles.includes(item)), async (policy) => {
    let name = policy.slice(0, -3);
    policies[name] = {
      routes: {

      },
      function: `${dir}/${policy}`,
      enabled: false,
      linked: {
        groups: {},
        permissions: {}
      },
    };
  });

  await Functions.asyncForEach(fs.readdirSync(configDir), async (config) => {

    let contents = require(`${configDir}/${config}`);
    let policieDifferent;

    console.log('THIS is config', contents.path);


    if (!contents.policies) {
      contents.policies = policies;

      policySet[contents.path.toLowerCase()] = contents.policies;
      
      fs.writeFileSync(`${configDir}/${config}`, JSON.stringify(contents, null, "\t"))
    } else {
      let contentPolicy = contents.policies;
      let policyKeys = Object.keys(contentPolicy );
      await Functions.asyncForEach(policyKeys,  (key) => { 
        if (!contentPolicy [key].enabled) delete contentPolicy[key]
      })
      policySet[contents.path.toLowerCase()] = JSON.parse(JSON.stringify(contentPolicy));
      policieDifferent = Object.keys(policies).diff(Object.keys(contents.policies));
    }

    if(policieDifferent === undefined || policieDifferent.length !== 0) {
      let newPolicies = {};
      await Functions.asyncForEach(policieDifferent, (key) => {
        contents.policies[key] = policies[key];
      });

      fs.writeFileSync(`${configDir}/${config}`, JSON.stringify(contents, null, "\t"))

    }

  });

  console.log('TEST', policySet)
  resolve(policySet);

});

module.exports = policy;