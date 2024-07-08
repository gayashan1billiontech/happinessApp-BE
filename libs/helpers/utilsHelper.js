const moment = require('moment');
const secret = 'happ';

const dateFormats = {
  iso_int: 'YYYY-MM-DD',
  iso_int_date: 'DD-MM-YYYY',
  short_date: 'DD/MM/YYYY',
  short_year: 'YYYY/MM/DD',
  iso_date_time: 'YYYY-MM-DDTHH:MM:SS',
  iso_date_time_utc: 'YYYY-MM-DDTHH:MM:SSZ',
};

const getFormat = d => {
  for (var prop in dateFormats) {
    if (moment(d, dateFormats[prop], true).isValid()) {
      return dateFormats[prop];
    }
  }
  return null;
};

const utilsHelper = {
  getDateTime: () => {
    return new Date().toLocaleString();
  },
  getDateTimeforDD :() => {
    const date = new Date();
    return moment(date).format('DD/MM/YYYY,hh:mm:ssA');
  },
  getTimestamp: () => {
    return new Date().getTime();
  },

  sortByDateASC: (array, key) => {
    array.sort( (a, b) => {
      return new Date(b[key]) - new Date(a[key]);
    });
  },

  sortByDateDESC: (array, key) => {
    array.sort((a, b) => {
      return new Date(b[key]) - new Date(a[key]);
    });
  },

 
  removeObjectProperties: (object, propsArray) => {
    for (let i = 0; i < propsArray.length; i++) {
      if (object.hasOwnProperty(propsArray[i])) {
        delete object[propsArray[i]];
      }
    }
  },
  

  chunkifyArray: (array, chunks) => {
    return array.reduce((resultArray, item, index) => {
      const chunkIndex = Math.floor(index / chunks);

      if (!resultArray[chunkIndex]) {
        resultArray[chunkIndex] = [];
      }

      resultArray[chunkIndex].push(item);
      return resultArray;
    }, []);
  },

  purify: obj => Object.keys(obj).forEach(key => obj[key] === undefined && delete obj[key]),

  promisify: f => {
    return  (...args) =>{
      return new Promise((resolve, reject) => {
        f(...args, (err, result) => {
          if (err) return reject(err);
          return resolve(result);
        });
      });
    };
  },

  promisifySF: f => {
    return  (...args)=> {
      return new Promise((resolve, reject) => {
        f(...args, {
          onSuccess: result => resolve(result),
          onFailure: error => reject(error),
        });
      });
    };
  },
};

module.exports = utilsHelper;
