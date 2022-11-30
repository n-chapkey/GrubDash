const path = require("path");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

//import helper functions
const validate = require("../utils/fieldValidation");
const bodyDataHas = validate.bodyDataHas;

// TODO: Implement the /dishes handlers needed to make the tests pass

function pricePropertyIsValid(req,res,next){
  const {data = {}} = req.body;
  if (data["price"] <= 0) {
    next({ status: 400, message: `price must be greater than 0` });
  }else if(!Number.isInteger(data["price"])){
    next({ status: 400, message: `price must be a number` });
  }else{
    return next();
  }
}


function dishExists(req, res, next) {
  const { dishId } = req.params;
  const foundDish = dishes.find((dish) => Number(dish.id) === Number(dishId));
  if (foundDish) {
    res.locals.dish = foundDish;
    return next();
  }
  next({
    status: 404,
    message: `Dish id not found: ${dishId}`,
  });
}

function idPropertyIsValid(req, res, next){
  const {dishId} = req.params;
  const {data: {id}} = req.body;
  
  //If ID exists then it MUST match the params. No ID is allowed.
  if(Number(id) === Number(dishId) || !id) return next();

  next({status: 400, message: `id ${id} does not match id of params ${dishId}`})
}

function read(req, res) {
  res.json({ data: res.locals.dish });
}

function create(req, res) {
  const { data: { name, description, price, image_url } = {} } = req.body;
  const newDish = {
    id: nextId(),
    name,
    description,
    price,
    image_url,
  };
  dishes.push(newDish);
  res.status(201).json({ data: newDish });
}

function update(req, res) {
  const dish = res.locals.dish;
  const { data: { name, description, price, image_url } = {} } = req.body;
  dish.name = name;
  dish.description = description;
  dish.price = price;
  dish.image_url = image_url;

  res.json({data: dish});
}
function list(req,res){
  res.json({data: dishes});
}

module.exports = {
  create: [
    bodyDataHas("name"),
    bodyDataHas("description"),
    bodyDataHas("price"),
    bodyDataHas("image_url"),
    pricePropertyIsValid,
    create,
  ],
  read: [dishExists, read],
  update: [
    dishExists,
    bodyDataHas("name"),
    bodyDataHas("description"),
    bodyDataHas("price"),
    bodyDataHas("image_url"),
    idPropertyIsValid,
    pricePropertyIsValid,
    update,
  ],
  list
};
