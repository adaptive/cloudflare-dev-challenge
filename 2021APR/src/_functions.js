import getDistance from "geolib/es/getDistance";

export const distance = (latA, lonA, latB, lonB) => {
  return (
    getDistance(
      { latitude: latA, longitude: lonA },
      { latitude: latB, longitude: lonB }
    ) / 1000
  );
};
