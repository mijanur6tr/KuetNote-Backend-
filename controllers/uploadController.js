import { cloudinary } from '../config/cloudinary.js';

const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      console.error('No file in request');
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // File is already uploaded to Cloudinary via multer
    const responsePayload = {
      message: 'File uploaded successfully',
      file: {
        url: req.file.path,
        public_id: req.file.filename,
        size: req.file.size,
      },
    };
    
    // console.log('Sending response:', responsePayload);
    res.json(responsePayload);
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: error.message });
  }
};

const deleteFile = async (req, res) => {
  try {
    const { public_id } = req.body;

    if (!public_id) {
      return res.status(400).json({ message: 'Public ID required' });
    }

    await cloudinary.uploader.destroy(public_id);
    res.json({ message: 'File deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export { uploadFile, deleteFile };