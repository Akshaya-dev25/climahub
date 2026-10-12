const fs = require('fs');
const csv = require('csv-parser');
const Dataset = require('../models/Dataset');
const Comment = require('../models/Comment');

// @desc    Upload and parse CSV climate dataset
// @route   POST /api/datasets
// @access  Private
const uploadDataset = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a CSV file to upload',
      });
    }

    const { title, description } = req.body;

    if (!title || !title.trim()) {
      // Remove uploaded file if title validation fails
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({
        success: false,
        message: 'Dataset title is required',
      });
    }

    const rows = [];
    const filePath = req.file.path;

    fs.createReadStream(filePath)
      .pipe(
        csv({
          mapHeaders: ({ header }) => header.trim().replace(/^\uFEFF/, ''),
          mapValues: ({ value }) => (typeof value === 'string' ? value.trim() : value),
        })
      )
      .on('data', (data) => {
        // Only push non-empty rows
        const hasValues = Object.values(data).some(
          (val) => val !== undefined && val !== null && String(val).trim() !== ''
        );
        if (hasValues) {
          rows.push(data);
        }
      })
      .on('end', async () => {
        try {
          // Clean up the temporary uploaded file
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }

          if (rows.length === 0) {
            return res.status(400).json({
              success: false,
              message: 'The uploaded CSV file is empty or contains no valid rows',
            });
          }

          const dataset = await Dataset.create({
            title: title.trim(),
            description: (description || '').trim(),
            uploadedBy: req.user._id,
            fileName: req.file.originalname,
            parsedData: rows,
          });

          await dataset.populate('uploadedBy', 'name email');

          res.status(201).json({
            success: true,
            message: 'Dataset uploaded and parsed successfully',
            dataset: {
              _id: dataset._id,
              title: dataset.title,
              description: dataset.description,
              fileName: dataset.fileName,
              rowCount: dataset.parsedData.length,
              columns: Object.keys(rows[0] || {}),
              uploadedBy: dataset.uploadedBy,
              createdAt: dataset.createdAt,
              parsedData: dataset.parsedData,
            },
          });
        } catch (dbError) {
          next(dbError);
        }
      })
      .on('error', (parseError) => {
        // Clean up file on parser error
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
        res.status(400).json({
          success: false,
          message: `Failed to parse CSV file: ${parseError.message}`,
        });
      });
  } catch (error) {
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    next(error);
  }
};

// @desc    Get all datasets with optional search query (?search=)
// @route   GET /api/datasets
// @access  Public
const getDatasets = async (req, res, next) => {
  try {
    const { search } = req.query;
    const filter = {};

    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      filter.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { fileName: searchRegex },
      ];
    }

    const datasets = await Dataset.find(filter)
      .populate('uploadedBy', 'name email')
      .sort({ createdAt: -1 });

    const formattedDatasets = datasets.map((ds) => ({
      _id: ds._id,
      title: ds.title,
      description: ds.description,
      fileName: ds.fileName,
      uploadedBy: ds.uploadedBy,
      rowCount: ds.parsedData ? ds.parsedData.length : 0,
      columns: ds.parsedData && ds.parsedData.length > 0 ? Object.keys(ds.parsedData[0]) : [],
      createdAt: ds.createdAt,
      parsedData: ds.parsedData,
    }));

    res.json({
      success: true,
      count: formattedDatasets.length,
      datasets: formattedDatasets,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get dataset by ID
// @route   GET /api/datasets/:id
// @access  Public
const getDatasetById = async (req, res, next) => {
  try {
    const dataset = await Dataset.findById(req.params.id).populate(
      'uploadedBy',
      'name email'
    );

    if (!dataset) {
      return res.status(404).json({
        success: false,
        message: 'Dataset not found',
      });
    }

    res.json({
      success: true,
      dataset: {
        _id: dataset._id,
        title: dataset.title,
        description: dataset.description,
        fileName: dataset.fileName,
        uploadedBy: dataset.uploadedBy,
        rowCount: dataset.parsedData ? dataset.parsedData.length : 0,
        columns:
          dataset.parsedData && dataset.parsedData.length > 0
            ? Object.keys(dataset.parsedData[0])
            : [],
        createdAt: dataset.createdAt,
        parsedData: dataset.parsedData,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get summary statistics (mean, min, max) for numeric columns
// @route   GET /api/datasets/:id/stats
// @access  Public
const getDatasetStats = async (req, res, next) => {
  try {
    const dataset = await Dataset.findById(req.params.id);

    if (!dataset) {
      return res.status(404).json({
        success: false,
        message: 'Dataset not found',
      });
    }

    const rows = dataset.parsedData || [];

    if (rows.length === 0) {
      return res.json({
        success: true,
        message: 'Dataset has no rows to compute statistics',
        totalRows: 0,
        stats: {},
      });
    }

    const sampleRow = rows[0] || {};
    const columns = Object.keys(sampleRow);
    const stats = {};
    const numericColumns = [];

    // Analyze each column across all rows
    for (const col of columns) {
      let count = 0;
      let sum = 0;
      let min = Infinity;
      let max = -Infinity;

      for (let i = 0; i < rows.length; i++) {
        const val = rows[i][col];

        if (val !== undefined && val !== null && String(val).trim() !== '') {
          const num = Number(val);
          // Check if valid finite number
          if (!Number.isNaN(num) && Number.isFinite(num)) {
            count++;
            sum += num;
            if (num < min) min = num;
            if (num > max) max = num;
          }
        }
      }

      // If at least one valid numeric entry was found and the column is primarily numeric
      if (count > 0) {
        numericColumns.push(col);
        const mean = sum / count;
        stats[col] = {
          count,
          min: Number(min.toFixed(4)),
          max: Number(max.toFixed(4)),
          mean: Number(mean.toFixed(4)),
          sum: Number(sum.toFixed(4)),
        };
      }
    }

    res.json({
      success: true,
      datasetId: dataset._id,
      title: dataset.title,
      totalRows: rows.length,
      numericColumns,
      stats,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add comment to a dataset
// @route   POST /api/datasets/:id/comments
// @access  Private
const addComment = async (req, res, next) => {
  try {
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Comment text is required',
      });
    }

    const dataset = await Dataset.findById(req.params.id);
    if (!dataset) {
      return res.status(404).json({
        success: false,
        message: 'Dataset not found',
      });
    }

    const comment = await Comment.create({
      dataset: req.params.id,
      user: req.user._id,
      text: text.trim(),
    });

    await comment.populate('user', 'name email');

    res.status(201).json({
      success: true,
      message: 'Comment added successfully',
      comment,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get comments for a dataset
// @route   GET /api/datasets/:id/comments
// @access  Public
const getComments = async (req, res, next) => {
  try {
    const dataset = await Dataset.findById(req.params.id);
    if (!dataset) {
      return res.status(404).json({
        success: false,
        message: 'Dataset not found',
      });
    }

    const comments = await Comment.find({ dataset: req.params.id })
      .populate('user', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: comments.length,
      comments,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  uploadDataset,
  getDatasets,
  getDatasetById,
  getDatasetStats,
  addComment,
  getComments,
};
