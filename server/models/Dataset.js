const mongoose = require('mongoose');

const datasetSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Dataset title is required'],
    trim: true,
  },
  description: {
    type: String,
    trim: true,
    default: '',
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Uploader reference is required'],
  },
  fileName: {
    type: String,
    required: [true, 'File name is required'],
  },
  parsedData: {
    type: [mongoose.Schema.Types.Mixed],
    default: [],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Dataset', datasetSchema);
