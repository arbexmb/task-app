const express = require('express')
const router = new express.Router()
const User = require('../models/user')

router.post('/users', async (req, res) => {
  const user = new User(req.body)

  try {
    await user.save()
    res.status(201).send(user)
  } catch (e) {
    res.status(400).send(e)
  }
})

router.get('/users', async (req, res) => {
  try {
    const users = await User.find({})
    res.status(200).send(users)
  } catch (e) {
    res.status(500).send(e)
  }
})

router.get('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
    if(!user) {
      return res.status(404).send({error: "No user was found"})
    }
    res.status(200).send(user)
  } catch (e) {
    res.status(500).send(e)
  }
})

router.patch('/users/:id', async (req, res) => {
  const bodyKeys = Object.keys(req.body)
  const allowedProperties = ['name', 'email', 'password', 'age']
  const isValid = bodyKeys.every((key) => allowedProperties.includes(key))

  if(!isValid) {
    return res.status(400).send({error: 'Invalid update!'})
  }

  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
    if(!user) {
      res.status(404).send()
    }
    res.status(200).send(user)
  } catch (e) {
    res.status(400).send(e)
  }
})

router.delete('/users/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id)
    if(!user) {
      res.status(404).send({ error: 'No user found.' })
    }
    res.status(200).send({ success: 'User delete succesfull' })
  } catch (e) {
    res.status(500).send(e)
  }
})

module.exports = router
