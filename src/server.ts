import fastify from "fastify";

const app = fastify()

app.listen({
  port: 3333
}, () => {
  console.log('HTTPs Server Running')
})

app.get('/', (req, res) => {
  res.send('Hello World')
})