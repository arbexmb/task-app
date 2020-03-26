const express = require('express')
const router = new express.Router()
const Task = require('../models/task')
const auth = require('../middlewares/auth')

router.post('/tasks', auth, async (req, res) => {
  const task = new Task({
    ...req.body,
    owner: req.user._id
  })

  try {
    await task.save()
    res.status(201).send(task)
  } catch (e) {
    res.status(400).send(e)
  }
})

router.get('/tasks', auth, async (req, res) => {
  try {
    const tasks = await req.user.populate('tasks').execPopulate()
    res.status(200).send(req.user.tasks)
  } catch (e) {
    res.status(500).send(e)
  }
})

router.get('/tasks/:id', auth, async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, owner: req.user._id })
    if (!task) {
      return res.status(404).send({error: 'Task not found.'})
    }
    res.status(200).send(task)
  } catch (e) {
    res.status(500).send(e)
  }
})

router.patch('/tasks/:id', auth, async (req, res) => {
  const bodyKeys = Object.keys(req.body)
  const allowedProperties = ['description', 'completed']
  const isValid = bodyKeys.every((key) => allowedProperties.includes(key))

  if(!isValid) {
    return res.status(400).send({error: 'Invalid update!'})
  }
  
  try {
    const task = await Task.findOne({ _id: req.params.id, owner: req.user._id })
    if(!task) {
      res.status(404).send()
    }
    bodyKeys.forEach((key) => task[key] = req.body[key])
    await task.save()
    res.status(200).send(task)
  } catch (e) {
    res.status(400).send(e)
  }
})

router.delete('/tasks/:id', auth, async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, owner: req.user._id })
    if(!task) {
      res.status(404).send({ error: 'Task not found.' })
    }
    res.status(200).send({ success: 'Task delete succesfull' })
  } catch (e) {
    res.status(500).send(e)
  }
})

module.exports = router
