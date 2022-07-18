const dx = require('../services/dashx.service')

const getProducts = async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized.' })
  }

  Promise.all([
    dx.fetchItem('pen'),
    dx.fetchItem('coffee-mug'),
    dx.fetchItem('notebook'),
    dx.fetchItem('notebook-subscription'),
    dx.fetchItem('paper-subscription')
  ])
    .then((products) => {
      return res
        .status(200)
        .json({ message: 'Successfully fetched.', products })
    })
    .catch((error) => res.status(500).json({ message: error }))
}

const getProduct = async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized.' })
  }

  dx.fetchItem(req.params.slug)
    .then((product) => {
      return res.status(200).json({ message: 'Successfully fetched.', product })
    })
    .catch((error) => res.status(500).json({ message: error }))
}

module.exports = { getProducts, getProduct }
