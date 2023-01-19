const request = require("request-promise-native");

const fetchMyIP = function () {
  return request("https://api.ipify.org/?format=json");
};

const fetchCoordsByIP = function (body) {
  const ip = JSON.parse(body).ip;
  return request(`http://ipwho.is/${ip}`);
};

const fetchISSFlyOverTimes = (body) => {
  const latitude = JSON.parse(body).latitude;
  const longitude = JSON.parse(body).longitude;
  return request(
    `https://iss-flyover.herokuapp.com/json/?lat=${latitude}&lon=${longitude}`
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

const nextISSTimesForMyLocation = () => {
  return fetchMyIP()
    .then(fetchCoordsByIP)
    .then(fetchISSFlyOverTimes)
    .then((data) => printPassTimes(JSON.parse(data).response))
    .catch((error) => console.log("Something didn't work: ", error.message));
};

module.exports = { nextISSTimesForMyLocation };
