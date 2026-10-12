const express = require('express');
const router = express.Router();
const {
  uploadDataset,
  getDatasets,
  getDatasetById,
  getDatasetStats,
  addComment,
  getComments,
} = require('../controllers/datasetController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// /api/datasets
router.route('/')
  .get(getDatasets)
  .post(protect, upload.single('file'), uploadDataset);

// /api/datasets/:id
router.route('/:id')
  .get(getDatasetById);

// /api/datasets/:id/stats
router.route('/:id/stats')
  .get(getDatasetStats);

// /api/datasets/:id/comments
router.route('/:id/comments')
  .get(getComments)
  .post(protect, addComment);

module.exports = router;
