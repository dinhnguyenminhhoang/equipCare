"use strict";
const _ = require("lodash");
const crypto = require("crypto");
const { Types } = require("mongoose");
const getInfoData = ({ fill = [], object = {} }) => {
  return _.pick(object, fill);
};
const getSelectData = (select = []) => {
  return Object.fromEntries(select.map((el) => [el, 1]));
};
const unGetSelectData = (select = []) => {
  return Object.fromEntries(select.map((el) => [el, 0]));
};
const removeUndefinedObject = (object) => {
  Object.keys(object).forEach((key) => {
    if (object[key] === undefined || object[key] === null) {
      delete object[key];
    }
  });
  return object;
};
const updateNestedObjectParser = (obj) => {
  const final = {};
  Object.keys(obj).forEach((key) => {
    if (typeof obj[key] === "object" && !Array.isArray()) {
      const res = updateNestedObjectParser(obj[key]);
      Object.keys(res).forEach((index) => {
        final[`${key}.${index}`] = res[index];
      });
    } else {
      final[key] = obj[key];
    }
  });

  return final;
};
const covertObjectIdMoongoDb = (id) => new Types.ObjectId(id);
function createChecksum(params) {
  const signData = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join("&");
  return crypto
    .createHmac("sha512", process.env.VNP_HASHSECRET)
    .update(signData)
    .digest("hex");
}
function sortObject(obj) {
  let sorted = {};
  let str = [];
  let key;
  for (key in obj) {
    if (obj.hasOwnProperty(key)) {
      str.push(encodeURIComponent(key));
    }
  }
  str.sort();
  for (key = 0; key < str.length; key++) {
    sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, "+");
  }
  return sorted;
}
// function sortObject(obj) {
//   return Object.entries(obj)
//     .sort(([key1], [key2]) => key1.toString().localeCompare(key2.toString()))
//     .reduce((result, item) => {
//       result = {
//         ...result,
//         [item[0]]: encodeURIComponent(item[1].toString().replace(/ /g, "+")),
//       };

//       return result;
//     }, {});
// }

module.exports = {
  getInfoData,
  getSelectData,
  unGetSelectData,
  removeUndefinedObject,
  updateNestedObjectParser,
  covertObjectIdMoongoDb,
  createChecksum,
  sortObject,
};
