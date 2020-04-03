const express = require('express')
const multer = require('multer')
const sharp = require('sharp')
const User = require('../models/user')
const auth = require('../middlewares/auth')
const { sendWelcomeEmail, sendCancelationEmail } = require('../mail/account.js')
const router = new express.Router()

router.post('/users', async (req, res) => {
  const user = new User(req.body)

  try {
    await user.save()
    sendWelcomeEmail(user.email, user.name)
    res.status(201).send(user)
  } catch (e) {
    res.status(400).send(e)
  }
})

router.post('/users/login', async (req, res) => {
  try {
    const user = await User.findByCredentials(req.body.email, req.body.password)
    const token = await user.generateAuthToken()
    res.status(200).send({user, token})
  } catch (e) {
    res.status(400).send()
  }
})

router.post('/users/logout', auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter((token) => {
      return token.token !== req.token
    })
    await req.user.save()
    res.status(200).send({ success: "Logout succesfully." })
  } catch (e) {
    res.status(500).send(e)
  }
})

router.post('/users/logout-all', auth, async (req, res) => {
  try {
    req.user.tokens = []
    await req.user.save()
    res.status(200).send({ success: "Logout of all accounts." })
  } catch (e) {
    res.status(500).send(e)
  }
})

router.get('/users/me', auth, async (req, res) => {
  res.send(req.user)
})

router.patch('/users/me', auth, async (req, res) => {
  const bodyKeys = Object.keys(req.body)
  const allowedProperties = ['name', 'email', 'password', 'age']
  const isValid = bodyKeys.every((key) => allowedProperties.includes(key))

  if(!isValid) {
    return res.status(400).send({error: 'Invalid update!'})
  }

  try {
    bodyKeys.forEach((key) => req.user[key] = req.body[key])
    await req.user.save()
    res.status(200).send(req.user)
  } catch (e) {
    res.status(400).send(e)
  }
})

router.delete('/users/me', auth, async (req, res) => {
  try {
    await req.user.remove()
    sendCancelationEmail(req.user.email, req.user.name)
    res.status(200).send({ success: 'User delete succesfull' })
  } catch (e) {
    res.status(500).send(e)
  }
})

const upload = multer({
  limits: {
    fileSize: 2000000
  },
  fileFilter(req, file, callback) {
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      return callback(new Error('File type unsupported'))
    }
    callback(undefined, true)
  }
})

router.post('/users/me/avatar', auth, upload.single('avatar'), async (req, res) => {
  const buffer = await sharp(req.file.buffer).resize({ width: 250, height: 250 }).png().toBuffer()
  req.user.avatar = buffer
  await req.user.save()
  res.status(200).send({ success: 'Profile picture uploaded.' })
}, (error, req, res, next) => {
  res.status(400).send({ error: error.message })
})

router.delete('/users/me/avatar', auth, async (req, res) => {
  try {
    req.user.avatar = undefined
    await req.user.save()
    res.status(200).send({ success: 'Profile picture deleted.' })
  } catch (e) {
    res.status(500).send(e)
  }
})

router.get('/users/:id/avatar', async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
    if (!user || !user.avatar) {
      throw new Error()
    }
    res.set('Content-Type', 'image/png')
    res.status(200).send(user.avatar)
  } catch (e) {
    res.status(404).send(e)
  }
})

module.exports = router
