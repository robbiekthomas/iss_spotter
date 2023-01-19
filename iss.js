const request = require("request");

const fetchMyIP = function (callback) {
  request(
    "https://api.ipify.org/?format=json",
    function (error, response, body) {
      if (error) return callback(error, null);

      if (response.statusCode !== 200) {
        const msg = `Status Code ${response.statusCode} when fetching IP. Response: ${body}`;
        callback(Error(msg), null);
        return;
      }

      const data = JSON.parse(body).ip;
      callback(null, data);
    }
  );
};

const fetchCoordsByIP = function (ip, callback) {
  request(`http://ipwho.is/${ip}`, function (error, response, body) {
    if (error) return callback(error, null);
    if (response.statusCode !== 200) {
      const msg = `Status Code ${response.statusCode} when fetching coordinates. Response: ${body}`;
      callback(Error(msg), null);
      return;
    }
    const data = JSON.parse(body);
    if (!data.success) {
      const message = `Success status was ${data.success}. Server message says: ${data.message} when fetching for IP ${data.ip}`;
      callback(Error(message), null);
      return;
    }

    const { latitude, longitude } = data;
    callback(null, { latitude, longitude });
  });
};

const fetchISSFlyOverTimes = function (coordinates, callback) {
  request(
    ` https://iss-flyover.herokuapp.com/json/?lat=${coordinates.latitude}&lon=${coordinates.longitude}`,
    function (error, response, body) {
      if (error) return callback(error, null);
      if (response.statusCode !== 200) {
        const msg = `Status Code ${response.statusCode} when fetching data. Response: ${body}`;
        callback(Error(msg), null);
        return;
      }
      const data = JSON.parse(body);

      callback(null, data.response);
    }
  );
};

const printPassTimes = function (passTimes) {
  for (let time of passTimes) {
    const date = new Date(0);
    date.setUTCSeconds(time.risetime);
    const duration = time.duration;
    console.log(`Next pass at ${date} for ${duration} seconds!`);
  }
};

const nextISSTimesForMyLocation = function (callback) {
  fetchMyIP((error, ip) => {
    if (error) {
      return callback(error, null);
    }

    fetchCoordsByIP(ip, (error, coordinates) => {
      if (error) {
        return callback(error, null);
      }

      fetchISSFlyOverTimes(coordinates, (error, nextPasses) => {
        if (error) {
          return callback(error, null);
        }

        callback(null, printPassTimes(nextPasses));
      });
    });
  });
};

module.exports = { nextISSTimesForMyLocation };
