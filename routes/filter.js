const express = require("express");
const router = express.Router();
const Organization = require("../models/Organization");


// Health care

router.get('/healthcare', async(req, res) =>{

    try{
  
      const healthOrganizations = await Organization.find({category : 'Health Care', isApproved : false})
      res.render('health_care', 
      {healthOrganizations: healthOrganizations}
      )
    } catch(err){
      console.log(err)
    }
  })

  //Elderly care

  router.get('/elderlycare', async(req, res) =>{

    try{
  
      const elderlyOrganizations = await Organization.find({category : 'Elderly Care',isApproved : false})
      res.render('elderly_care', 
      {elderlyOrganizations: elderlyOrganizations}
      )
    } catch(err){
      console.log(err)
    }
  })

  //Disability

  router.get('/disablitycare', async(req, res) =>{

    try{
  
      const disabledOrganizations = await Organization.find({category : 'Disabled',isApproved : false})
      res.render('disabled', 
      {disabledOrganizations: disabledOrganizations}
      )
    } catch(err){
      console.log(err)
    }
  })

  //Relief

  router.get('/relief', async(req, res) =>{

    try{
  
      const reliefOrganizations = await Organization.find({category : 'Relief', isApproved : false})
      res.render('relief', 
      {reliefOrganizations: reliefOrganizations}
      )
    } catch(err){
      console.log(err)
    }
  })

  //others

  router.get('/other', async(req, res) =>{

    try{
  
      const otherOrganizations = await Organization.find({category : 'Other', isApproved : false})
      res.render('other', 
      {otherOrganizations: otherOrganizations}
      )
    } catch(err){
      console.log(err)
    }
  })

  module.exports = router;
