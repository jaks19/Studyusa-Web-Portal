const request = require('request');


let apiServices = {};

// request library's request method does not return a promise so we use this wrapper
// it does the request and returns the body of the response back as a promise
function doRequest(url) {
  return new Promise(function (resolve, reject) {
    request(url, function (error, res, body) {
      if (!error && res.statusCode == 200) {
        resolve(body);
      } else {
        reject(error);
      }
    });
  });
}


apiServices.retrieveNews =
    async function retrieveNews() {
      let url = 'https://newsapi.org/v1/articles?source=cnn&sortBy=top&apiKey=c8e7fde98b5a4983b913761b2e7db0f6';
      let newsResponse = await doRequest(url);

      let parsedData = JSON.parse(newsResponse);
      return parsedData['articles'].splice(0, 10);
    }

module.exports = apiServices;
