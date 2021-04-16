import { version } from "../package.json";
import { distance } from "./_functions";

import IATA from "@adaptivelink/iata";

var data;

const handleRequest = async event => {
  const parsedUrl = new URL(event.request.url);
  const element = parsedUrl.pathname.split("/").filter(n => n);
  if (element[0] !== undefined) {
    return new Response("404 Not Found", {
      status: 404,
      statusText: "Not Found"
    });
  }

  var lat, lon, concerts;
  [lat, lon] = IATA.airports.get("MAD");
  if (event.request.cf.latitude) lat = event.request.cf.latitude;
  if (event.request.cf.longitude) lon = event.request.cf.longitude;

  /* only fetch if not in global variable*/
  if (!data) {
    let response = await fetch(
      `https://raw.githubusercontent.com/adaptive/cloudflare-dev-challenge/main/data/bogus.json`
    );
    data = await response.json();
  }

  concerts = data.map(item => {
    const container = {};
    container.venue = item.v;
    container.performer = item.p;
    container.date = item.s;
    container.lat = item.lat;
    container.lon = item.lon;
    container.distance = distance(lat, lon, item.lat, item.lon);
    return container;
  });
  /* filter out concert more than 1000KM away */
  const filtered = concerts.filter(x => x.distance < 1000);

  let body = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta http-equiv="X-UA-Compatible" content="IE=edge"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Concerts Near You</title></head><body><p>Concerts Near You</p>`;

  for (var i = 0, l = filtered.length; i < l; i++) {
    body += `<p>${filtered[i].venue}/${filtered[i].performer} @${filtered[i].date}</p>`;
  }

  body += `</body></html>`;

  return new Response(body, {
    status: 200,
    headers: {
      "x-version": version,
      "content-type": "text/html"
    }
  });
};

addEventListener("fetch", event => event.respondWith(handleRequest(event)));
