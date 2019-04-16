'use strict';

module.exports = (req, res) => {

  return new Promise((resolve, reject) => {

   
    setTimeout(function(){  resolve("test"); }, 3000);
  });

}