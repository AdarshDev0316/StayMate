const express = require('express');
const router = express.Router();
const { sendInterest, getOwnerInterests, getTenantInterests, acceptInterest, declineInterest } = require('../controllers/interestController');
const { protect } = require('../middlewares/auth.middleware');
const { isOwner, isTenant } = require('../middlewares/role.middleware');

router.post('/', protect, isTenant, sendInterest);
router.get('/owner', protect, isOwner, getOwnerInterests);
router.get('/tenant', protect, isTenant, getTenantInterests);
router.patch('/:id/accept', protect, isOwner, acceptInterest);
router.patch('/:id/decline', protect, isOwner, declineInterest);

module.exports = router;
