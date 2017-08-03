const fake = {"http://localhost:3000":["randomNumber","getWeather"],"http://localhost:3001":["randomNumber","getWeather"]};

class Utils {
    static getEndpoints() {
        if (process.env.NODE_ENV==="development") {
            return Promise.resolve(fake);
        }
        return fetch('/api/lb/instances')
            .then(resp =>{
                console.log(resp);
              return  resp.text()
            })
            .then(j => {
                console.log(j);
            })

    }
}

module.exports = Utils;