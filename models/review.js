let mongoose =require("mongoose");
const Schema = mongoose.Schema;
const reviewSchema= new mongoose.Schema({
    comments:String,
    rating :{
        type:Number,
        min:1,
        max:5
    },
    createdAt:{
        type:Date,
        default:Date.now()
    },
    author: {
            type: Schema.Types.ObjectId,
            ref: "User",     
             required: true
            }
 })


const Review =mongoose.model("Review",reviewSchema);
module.exports = Review;