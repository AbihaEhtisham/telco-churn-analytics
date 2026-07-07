const express = require('express');
const router = express.Router();
const {
  getCustomers,
  getCustomerById,
  getSegments
} = require('../controllers/customerController');

router.get('/', getCustomers);
router.get('/segments', getSegments);
router.get('/:id', getCustomerById);

module.exports = router;