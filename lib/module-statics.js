var fs = require('fs-extra');
function middleware(moduleName, routes) {
  // console.log("Middleware ", moduleName);
  return function (req, res, next) {
    var url = req.originalUrl.replace();
    var urlModuleName = url.split("/")[1];
    // console.log(url, urlModuleName);
    if(moduleName === urlModuleName){
      url = url.substr(moduleName.length+1);
      // console.log(url, routes[url]);
      // console.log(routes);
      if(routes[url] && fs.existsSync(routes[url])){
        res.sendFile(routes[url]);
      }
    }else{
      next();
    }
  };
}

module.exports = middleware;
