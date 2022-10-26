const cors = require('cors');
const express = require('express');
const morgan = require('morgan');
const app = express();

// app.use(express.static('build'));
app.use(cors());
app.use(express.json());

const generateId = () => {
  return Math.floor(Math.random()*2**16-1);
}

let persons = [
  { 
    "id": 1,
    "name": "Arto Hellas", 
    "number": "040-123456"
  },
  { 
    "id": 2,
    "name": "Ada Lovelace", 
    "number": "39-44-5323523"
  },
  { 
    "id": 3,
    "name": "Dan Abramov", 
    "number": "12-43-234345"
  },
  { 
    "id": 4,
    "name": "Mary Poppendieck", 
    "number": "39-23-6423122"
  }
];

app.use(morgan((tokens, request, response) => {
  return [
    tokens.method(request, response),
    tokens.url(request, response),
    tokens.status(request, response),
    tokens.res(request, response, 'content-length'), '-',
    tokens['response-time'](request, response), 'ms',
    tokens.method(request, response) === "POST" ? JSON.stringify(request.body) : "",
  ].join(" ");
}))


const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' });
};



app.get('/', (request, response) => 
  response.send('<p>App funcionando en sincronía</p>')
)

app.get('/api/persons/', (request, response) => {
  response.json(persons);
})

app.post('/api/persons/', (request, response) => {
  const body = request.body;
  // console.log(body);

  if (!body.name || !body.number) {
    return response.status(400).json({
      error: 'content missing',
    });
  };

  if (persons.find(person => person.name === body.name)) {
    return response.status(400).json({
      error: 'name must be unique',
    });
  }

  
  const person = {
    id: generateId(),
    name: body.name,
    number: body.number,
  }
  
  morgan.token('requestData', (request, response) => {
    return JSON.stringify(person);
  })
  persons = persons.concat(person);

  response.json(person);
})

app.get('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id);
  const person = persons.find(person => person.id === id);

  if (person) {
    response.json(person);
  } else {
    response.status(404).end();
  };
})


app.get('/info/', (request, response) => {
  response.send(`<p>Phonebook has info for ${persons.length} people</p><p>${new Date().toString()}</p>`)
})

app.delete('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id);

  const person = persons.find(person => person.id === id);

  if (person) {
    persons = persons.filter(person => person.id !== id);
    response.status(204).end();
  } else {
    response.status(404).end();
  };

})


app.use(unknownEndpoint);




const PORT = process.env.PORT || 3001;
app.listen(PORT, () => { 
  console.log(`Server running on port ${PORT}`);
});