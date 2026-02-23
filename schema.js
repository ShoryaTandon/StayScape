const Joi=require("joi");



const listingSchema = Joi.object({
  listing: Joi.object({
    title: Joi.string().required(),// ye bol rha title must be string , it is required 
    description: Joi.string().required(),
     
        

 
    location: Joi.string().required(),
    country: Joi.string().required(),
    price: Joi.number().min(1).required(),// ye bol rha h price type number , price>0, price is must
    image: Joi.string().allow("", null)  
  }).required()
});



//this Joi.object({}) this expects an obj which mustt follow all specfied rules

const reviewSchema=Joi.object({
  review:Joi.object({
    rating:Joi.number().required().min(1).max(5),
    comments:Joi.string().required()
  }).required()
});

module.exports = {
  listingSchema,
  reviewSchema
};