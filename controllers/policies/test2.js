'use strict';

module.exports = (req, res) => {

  return new Promise((resolve, reject) => {
    console.log('RAN')
    reject("test2")

  });

}