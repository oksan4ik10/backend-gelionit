
const app = require('./app')



const PORT = process.env.PORT || 4000

async function start() {
    try {
      app.listen(PORT, () => {
        console.log(`Server has been started ${PORT}...`)
      })
    } catch (e) {
      console.log(e)
    }
  }
  
  start()