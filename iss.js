const request = require("request");

const fetchMyIP = function(callback) {
  request('https://api.ipify.org', (err, response) => {
    const {body: ipAddress} = response;
    if (err) {
      callback(err, null);
      process.exit();
    }
    if (response.statusCode !== 200) {
      const msg = `Status Code ${response.statusCode} when fetching IP. Response: ${ipAddress}`;
      callback(Error(msg), null);
      process.exit();
    }
    callback(err, ipAddress);
  });
};

const fetchCoordsByIP = (ip, callback) => {
  request(`http://api.open-notify.org/iss/v1/?lat=40.027435&lon=-105.251945`, (err, response, body) => {
    if (err) {
      callback(err, body);
      process.exit();
    }
    if (response.statusCode !== 200) {
      const msg = `Status Code ${response.statusCode} when fetching coordinates for IP.   Response: ${body}`;
      callback(Error(msg), null);
      process.exit();
    }
    const {latitude, longitude} = JSON.parse(body).request;
    callback(err, {latitude, longitude});
  });
};

const fetchISSFlyOverTimes = function(coords, callback) {
  const url = `http://api.open-notify.org/iss-pass.json?lat=${coords.latitude}&lon=${coords.longitude}`;

  request(url, (error, response, body) => {
    if (error) {
      callback(error, null);
      return;
    }

    if (response.statusCode !== 200) {
      callback((`Status Code ${response.statusCode} when fetching ISS pass times: ${body}`), null);
      return;
    }

    const passes = JSON.parse(body).response;
    callback(null, passes);
  });
};

const nextISSTimesForMyLocation = function(callback) {
  fetchMyIP((error, ip) => {
    if (error) {
      return callback(error, null);
    }

    fetchCoordsByIP(ip, (error, loc) => {
      if (error) {
        return callback(error, null);
      }

      fetchISSFlyOverTimes(loc, (error, nextPasses) => {
        if (error) {
          return callback(error, null);
        }

        callback(null, nextPasses);
      });
    });
  });
};


module.exports = { fetchMyIP, fetchCoordsByIP, fetchISSFlyOverTimes, nextISSTimesForMyLocation };


