const express = require("express");
const router = express.Router();
const Organization = require("../models/Organization");


router.get('/', async(req, res) =>{

  try{

    const falseOrganizations = await Organization.find({isApproved : false})
    res.render('false', 
    {falseOrganizations: falseOrganizations}
    )
  } catch(err){
    console.log(err)
  }
})



    //Approving organizations

    router.get("/approve/:id", (req, res) => {
        let id = req.params.id;
        Organization.findByIdAndUpdate(id,
          {
            isApproved: true,
          },
          (err, result) =>{
            if (err) {
              res.json({ message: err.message });
            } else {
              req.session.message = {
                type: "info",
                message: "Organization approved successfully",
              };
              res.redirect("/approvals");
            }
          }
        );
      });

 


module.exports = router;