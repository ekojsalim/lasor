const geo = require('geographiclib');
let geod = geo.Geodesic.WGS84;
const fs = require("fs");

const LDRHorAngle = 0.001;
const LDRVerAngle = 0.001;

function calculateAttacker(ldrID, data) {
    const R = 6371;

    let { heading, alt, lat, long } = data;
    let alpha = getAlpha(ldrID);
    let beta = getBeta(ldrID);
    let gamma = getGamma(alpha, heading);

    console.log(lat, long, gamma, alt / (Math.tan(beta)));

    const { lat2, lon2 } = geod.Direct(lat, long, heading + alpha, alt / (Math.tan(beta)));

    console.log(lat2, lon2);

    // //calculate d
    // let euclideanDistance = alt/Math.tan(beta);
    // let dist = 2*R*Math.asin(euclideanDistance/(2*R))/1000;

    // // from http://www.movable-type.co.uk/scripts/latlong.html
    // // φ2 = asin( sin φ1 ⋅ cos δ + cos φ1 ⋅ sin δ ⋅ cos θ )
    // // λ2 = λ1 + atan2( sin θ ⋅ sin δ ⋅ cos φ1, cos δ − sin φ1 ⋅ sin φ2 )
    // let lat2 = Math.asin( Math.sin(lat)*Math.cos(dist/R) +
    // Math.cos(lat)*Math.sin(dist/R)*Math.cos(gamma) );
    // let lon2 = long + Math.atan2(Math.sin(gamma)*Math.sin(dist/R)*Math.cos(lat),
    //      Math.cos(dist/R)-Math.sin(lat)*Math.sin(lat2));
    return [lat2, lon2];
}

function getRandomInRange(from, to, fixed=3) {
    return (Math.random() * (to - from) + from).toFixed(fixed) * 1;
    // .toFixed() returns string, so ' * 1' is a trick to convert to number
}

function getAzimuth(alpha) {
    if(alpha < 0) {
        return (alpha + 360);
    }
    return alpha;
}

//fixed attacker location
// const r = getRandomInRange(1, 10000);
// const alpha = getRandomInRange(-80, 80);

//plane lat long
const planeLat = getRandomInRange(-90,90);
const planeLong = getRandomInRange(-90,90);
function getRandomData() {
    const r = getRandomInRange(1, 20000);
    const alpha = getRandomInRange(-90, 90);
    const x = r * Math.cos((alpha * (Math.PI)) / 180);
    const y = r * Math.sin((alpha * (Math.PI)) / 180);
    const z = geod.Direct(planeLat, planeLong, getAzimuth(alpha), r);
    //get attacker lat long
    const attLat = z.lat2;
    const attLong = z.lon2;
    //plane alt
    const planeAltitude = getRandomInRange(20,2000);
    //atacker angles vert
    const beta = Math.atan(planeAltitude/r);
    //detected angle
    const detectedAlpha = Math.round(alpha/LDRHorAngle)*LDRHorAngle || LDRHorAngle;
    const detectedBeta = Math.round(beta/LDRVerAngle)*LDRVerAngle || LDRVerAngle;
    //detect positionn
    const m = geod.Direct(planeLat, planeLong, getAzimuth(detectedAlpha), planeAltitude / (Math.tan(detectedBeta)));
    const detectedLat = m.lat2;
    const detectedLong = m.lon2;
    // console.log("actual", attLat, attLong);
    // console.log("detected",detectedLat, detectedLong);
    const q = geod.Inverse(attLat, attLong, detectedLat, detectedLong);
    console.log("difference", q.s12);
    if(!detectedLat) {
        console.error(attLat, attLong, detectedAlpha, planeAltitude / (Math.tan(detectedBeta)), detectedBeta, beta)
    }
    const attacker = {
        latitude: attLat,
        longitude: attLong,
        detected: {
            latitude: detectedLat,
            longitude: detectedLong
        },
        alpha: alpha,
        r: r,
        beta: beta
    };
    const plane = {
        latitude: planeLat,
        longitude: planeLong,
        altitude: planeAltitude
    };
    return {
        attacker: attacker,
        plane: plane,
        difference: q.s12
    };
}

let dataArray = [];
let diffArray = [];

for(let i = 0; i < 10000; i++) {
    const z = getRandomData();
    dataArray.push(z);
    diffArray.push(z.difference);
}

Math.mean= function(array){
    return array.reduce(function(a, b){ return a+b; })/array.length;
}

Math.stDeviation=function(array){
    var mean= Math.mean(array),
    dev= array.map(function(itm){return (itm-mean)*(itm-mean); });
    return Math.sqrt(dev.reduce(function(a, b){ return a+b; })/(array.length-1));
}

console.log(Math.mean(diffArray), Math.stDeviation(diffArray));
fs.writeFileSync("simulation-lasor-ccd.json", JSON.stringify(dataArray));