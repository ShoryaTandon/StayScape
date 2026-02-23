const Listing=require("./models/listing.js");
const Review=require("./models/review.js");
module.exports.isLoggedIn=function(req,res,next){

     
     // this is new vraibale just to save the path it was trying to go 
    // console.log(req.user);
     if(!req.isAuthenticated()){
      req.session.redirectUrl=req.originalUrl;
     req.flash("error","You must login first !");
      return res.redirect("/login");
  }
  next();
}
module.exports.isOwner=async function(req,res,next){
 let {id} =req.params;
  let listing= await Listing.findById(id);
    
    if (!listing.owner.equals(res.locals.currentUser._id)) {
    req.flash("error", "You don't have access");
    return res.redirect(`/listings/${id}`);
  }

    next()

}
module.exports.saveRedirectUrl=function(req,res,next){
  if(req.session.redirectUrl){
    res.locals.redirectUrl=req.session.redirectUrl;
  }
  next();
}

module.exports.isReviewAuthor=async function(req,res,next){
 let {id,reviewid} =req.params;
  let listing= await Listing.findById(id);
  let review=await Review.findById(reviewid);
    
    if (!review.author.equals(res.locals.currentUser._id)) {
    req.flash("error", "You don't have access ");
    return res.redirect(`/listings/${id}`);
  }

    next()

}