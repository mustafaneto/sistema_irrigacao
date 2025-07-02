const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const http = require('http');
require('dotenv').config();

const mqttService = require('./services/mqttService');

const umidadeController = require('./controllers/umidadeController');
const releController = require('./controllers/releController');

const sistemaController = require('./controllers/sistemaController');


const app = express();
const server = http.createServer(app);


app.use(helmet());
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


const apiRouter = express.Router();


apiRouter.get('/umidade/ultima', umidadeController.getUltimaLeitura);
apiRouter.get('/umidade/historico', umidadeController.getHistorico);
apiRouter.get('/umidade/estatisticas', umidadeController.getEstatisticas);
apiRouter.get('/umidade/grafico', umidadeController.getDadosGrafico);
apiRouter.post('/umidade/inserir', umidadeController.inserirLeitura);



apiRouter.get('/rele/historico', releController.getHistoricoRele);


apiRouter.get('/sistema/status', sistemaController.getStatusSistema);
apiRouter.get('/sistema/mqtt-status', (req, res) => {
    const status = mqttService.getStatus();
    res.json({ success: true, data: status });
});

app.use('/api', apiRouter);


app.use(express.static(__dirname));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});



const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
    mqttService.connect();
});


app.use((err, req, res, next) => {
    console.error('Erro inesperado:', err.stack);
    res.status(500).send('Algo deu errado!');
});
