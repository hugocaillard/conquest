// Our library of useful functions.

module.exports.post = function(url, data, cb) {
  var request = new XMLHttpRequest();
  request.open('POST', url, true);
  request.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
  request.onreadystatechange = function() {
    if(this.readyState == this.DONE) {
      if (request.status >= 200 && request.status < 400)
        cb(JSON.parse(request.response));
      else
        console.log('error');
    }
  };

  request.send(JSON.stringify(data));
};
