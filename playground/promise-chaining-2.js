require('../src/db/mongoose')
const Task = require('../src/models/task')

Task.findByIdAndDelete('5e7b7f26ca5495264d9967f0').then(() => {
  return Task.countDocuments({ completed: false })
}).then((count) => {
  console.log(count + ' tasks are incomplete.')
}).catch((e) => {
  console.log(e)
})

const deleteTaskAndCount = async (id) => {
  await Task.findByIdAndDelete(id)
  const count = await Task.countDocuments({ completed: false })
  return count
}

deleteTaskAndCount('5e7b8db4de7203199ce0d507').then((count) => {
  console.log(count)
}).catch((e) => {
  console.log(e)
})

//5e7b8db4de7203199ce0d507
