'use strict';

module.exports = (permissions) => {
    
    return async function (req, res, next) {

        if(permissions === 0) return next();

        if(!req) return null;

        if (req.routeAccess) return next();
        let compareArray = Functions.permissionArray(permissions);

        
        let user = JSON.parse(req.user)
        let binaryArray = Functions.permissionArray(user.permissions);
        await Functions.asyncForEach(user.groups, (group) => {
            binaryArray = Object.assign(binaryArray, Functions.permissionArray(appGroups[group]));
        })

        let found = false;

        console.log(binaryArray)
        await Functions.asyncForEach(Object.keys(compareArray), (key) => {
            if (binaryArray[key]) found = true;
        });

        if (!found) return res.sendStatus(401)

        req.routeAccess = true;

        next();
    }
}
