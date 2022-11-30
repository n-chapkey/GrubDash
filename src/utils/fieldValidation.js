const path = require("path");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

function bodyDataHas(propertyName) {
  return function (req, res, next) {
    const { data = {} } = req.body;
    if (data[propertyName]) {
      return next();
    }
    next({ status: 400, message: `Must include a ${propertyName}` });
  };
}

function propertyNotEmpty(propertyName) {
  return function (req, res, next) {
    const { data = {} } = req.body;
    if (data[propertyName].length === 0) {
      next({ status: 400, message: `${propertyName} must not be empty` });
    }
    return next();
  };
}

function propertyIsArray(propertyName) {
  return function (req, res, next) {
    const {data = {}} = req.body;
    if (Array.isArray(data[propertyName])) {
      return next();
    }
    next({ status: 400, message: `${propertyName} is not an array` });
  };
}

module.exports = {
  bodyDataHas,
  propertyNotEmpty,
  propertyIsArray,
};
