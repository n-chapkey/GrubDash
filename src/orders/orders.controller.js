const path = require("path");

// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));

// Use this function to assigh ID's when necessary
const nextId = require("../utils/nextId");

//import helper functions
const {
  bodyDataHas,
  propertyIsArray,
  propertyNotEmpty,
} = require("../utils/fieldValidation");

// TODO: Implement the /orders handlers needed to make the tests pass

// Make sure dishes has quantities for each of its elements that
// are numbers greater than 0
function dishesPropertyIsValid(req, res, next) {
  const { data: { dishes } = {} } = req.body;
  let invalidIndex = -1;

  const hasInvalidQuantity = dishes.some((dish, index) => {
    if (!Number.isInteger(dish.quantity) || dish.quantity === 0) {
      invalidIndex = index;
      return true;
    }
    return false;
  });
  if (hasInvalidQuantity) {
    next({
      status: 400,
      message: `Dish ${invalidIndex} must have a quantity that is an integer greater than 0`,
    });
  }
  return next();
}

function idPropertyIsValid(req, res, next){
    const {orderId} = req.params;
    const {data: {id}} = req.body;
    
    //If ID exists then it MUST match the params. No ID is allowed.
    if(Number(id) === Number(orderId) || !id) return next();
  
    next({status: 400, message: `id ${id} does not match id of params ${orderId}`})
  }

function statusPropertyIsValid(req,res,next){
    const {data: {status} = {}} = req.body
    if(["pending","preparing","out-for-delivery"].includes(status) && status !==""){
        console.log("STatus is valid")
        console.log("status: ",status)
        return next();
    }else if(status === "delivered"){
        return next({status: 400, message:`A delivered order cannot be changed`})
    }else{
        return next({
            status: 400, 
            message:`Order must have a status of pending, preparing, out-for-delivery, delivered`})
    }
}

// Check if order exists in database
function orderExists(req, res, next) {
  const { orderId } = req.params;
  const foundOrder = orders.find(
    (order) => Number(order.id) === Number(orderId)
  );
  if (foundOrder) {
    res.locals.order = foundOrder;
    return next();
  }
  next({
    status: 404,
    message: `Order id not found: ${orderId}`,
  });
}

// Execute POST method
function create(req, res) {
  const { data: { deliverTo, mobileNumber, status, dishes } = {} } = req.body;
  const newOrder = {
    id: nextId(),
    deliverTo,
    mobileNumber,
    status,
    dishes,
  };
  orders.push(newOrder);
  res.status(201).json({ data: newOrder });
}

//Executre GET method for a single order
function read(req, res) {
  res.json({ data: res.locals.order });
}

function list(req, res) {
  res.json({ data: orders });
}

function update(req, res) {
    const order = res.locals.order;
    const {data: {deliverTo,mobileNumber,status,dishes} = {}} = req.body;

    order.deliverTo = deliverTo;
    order.mobileNumber = mobileNumber;
    order.status = status;
    order.dishes = dishes;

    res.json({data: order});
}

function destroy(req, res, next) {
  if (res.locals.order.status !== "pending") {
    return next({
      status: 400,
      message: `An order cannot be deleted unless it is pending`,
    });
  }
  const index = orders.findIndex(
    (order) => order.id === Number(res.locals.order.id)
  );

  orders.splice(index, 1);
  res.sendStatus(204);
}

module.exports = {
  //POST protocol for new order
  create: [
    //check if has fields
    bodyDataHas("deliverTo"),
    bodyDataHas("mobileNumber"),
    bodyDataHas("dishes"),

    //dishes Array validation
    propertyNotEmpty("dishes"),
    propertyIsArray("dishes"),
    dishesPropertyIsValid,

    //finally execute POST once everything is in order
    create,
  ],

  //GET one order
  read: [orderExists, read],

  //GET all orders
  list,

  //Deletes one existing order
  delete: [orderExists, destroy],

  //Responds to PUT request to update one existing order
  update: [
    orderExists,
    bodyDataHas("deliverTo"),
    bodyDataHas("mobileNumber"),
    bodyDataHas("status"),
    bodyDataHas("dishes"),
    propertyNotEmpty("dishes"),
    propertyIsArray("dishes"),
    idPropertyIsValid,
    statusPropertyIsValid,
    dishesPropertyIsValid,
    update
],
};
