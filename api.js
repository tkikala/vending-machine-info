module.exports = (req, res) => {
  res.status(200).json({ 
    message: 'Root API working!', 
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.url
  });
}; 