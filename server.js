const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const http = require('http');
require('dotenv').config();

const mqttService = require('./services/mqttService');
const umidadeController = require('./controllers/umidadeController');
const configuracaoController = require('./controllers/configuracaoController');
const alertaController = require('./controllers/alertaController');
const releController = require('./controllers/releController');
const sistemaController = require('./controllers/sistemaController');

// --- Criação do App Express ---
const app = express();
const server = http.createServer(app);

// --- Middlewares ---
app.use(helmet());
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- Rotas da API ---
const apiRouter = express.Router();

// Rotas de Umidade
apiRouter.get('/umidade/ultima', umidadeController.getUltimaLeitura);
apiRouter.get('/umidade/historico', umidadeController.getHistorico);
apiRouter.get('/umidade/estatisticas', umidadeController.getEstatisticas);
apiRouter.get('/umidade/grafico', umidadeController.getDadosGrafico);
apiRouter.post('/umidade/inserir', umidadeController.inserirLeitura);

// Rotas de Configuração
apiRouter.get('/configuracao', configuracaoController.getConfiguracoes);
apiRouter.get('/configuracao/esp', configuracaoController.getConfiguracoesESP);
apiRouter.post('/configuracao/resetar', configuracaoController.resetarConfiguracoes);
apiRouter.get('/configuracao/:nome', configuracaoController.getConfiguracao);
apiRouter.put('/configuracao/:nome', configuracaoController.atualizarConfiguracao);

// Rotas de Alertas
apiRouter.get('/alertas', alertaController.getAlertas);
apiRouter.put('/alertas/marcar-todos-lidos', alertaController.marcarTodosAlertasLidos);
apiRouter.put('/alertas/:id/lido', alertaController.marcarAlertaLido);

// Rotas do Relé
apiRouter.get('/rele/historico', releController.getHistoricoRele);

// Rotas de Status do Sistema
apiRouter.get('/sistema/status', sistemaController.getStatusSistema);
apiRouter.get('/sistema/mqtt-status', (req, res) => {
    const status = mqttService.getStatus();
    res.json({ success: true, data: status });
});

app.use('/api', apiRouter);

// --- Servir arquivos estáticos (Frontend) ---
app.use(express.static(__dirname));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});


// --- Inicialização do Servidor ---
const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
    // Conectar ao MQTT Broker
    mqttService.connect();
});

// --- Tratamento de Erros ---
app.use((err, req, res, next) => {
    console.error('❌ Erro inesperado:', err.stack);
    res.status(500).send('Algo deu errado!');
});

// --- Finalização Graciosa ---
process.on('SIGINT', () => {
    console.log('🔌 Desligando o servidor...');
    mqttService.disconnect();
    server.close(() => {
        console.log('Servidor desligado.');
        process.exit(0);
    });
}); 