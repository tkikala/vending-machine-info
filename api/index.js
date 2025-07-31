module.exports = (req, res) => {
  res.status(200).json({ 
    message: 'API directory working!', 
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.url,
    path: req.path
  });
}; 