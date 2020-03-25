const express = require('express')
const router = new express.Router()
const Task = require('../models/task')

router.post('/tasks', async (req, res) => {
  const task = new Task(req.body)

  try {
    await task.save()
    res.status(201).send(task)
  } catch (e) {
    res.status(400).send(e)
  }
})

router.get('/tasks', async (req, res) => {
  try {
    const task = await Task.find({})
    res.status(200).send(task)
  } catch (e) {
    res.status(500).send(e)
  }
})

router.get('/tasks/:id', async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
    if (!task) {
      return res.status(404).send({error: 'Task not found.'})
    }
    res.status(200).send(task)
  } catch (e) {
    res.status(500).send(e)
  }
})

router.patch('/tasks/:id', async (req, res) => {
  const bodyKeys = Object.keys(req.body)
  const allowedProperties = ['description', 'completed']
  const isValid = bodyKeys.every((key) => allowedProperties.includes(key))

  if(!isValid) {
    return res.status(400).send({error: 'Invalid update!'})
  }
  
  try {
    const task = await Task.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
    if(!task) {
      res.status(404).send()
    }
    res.status(200).send(task)
  } catch (e) {
    res.status(400).send(e)
  }
})

router.delete('/tasks/:id', async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id)
    if(!task) {
      res.status(404).send({ error: 'No user found.' })
    }
    res.status(200).send({ success: 'Task delete succesfull' })
  } catch (e) {
    res.status(500).send(e)
  }
})

module.exports = router
