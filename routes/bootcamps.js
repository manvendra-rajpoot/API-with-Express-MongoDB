const express = require('express');
const router = express.Router();

router.get('/', (req,res) => {
    res.status(200).json({success: true, message:'Show all bootcmaps'});
});
router.get('/:id', (req,res) => {
    res.status(200).json({success: true, message:`Dispaly bootcamp-${req.params.id}`});
});

router.post('/', (req,res) => {
    res.status(201).json({success: true, message:'Created a bootcmap'});
});

router.put('/:id', (req,res) => {
    res.status(200).json({success: true, message:`Updated bootcamp-${req.params.id}`});
});

router.delete('/:id', (req,res) => {
    res.status(200).json({success: true, message:`Deleted bootcmap-${req.params.id}`});
});

module.exports = router;