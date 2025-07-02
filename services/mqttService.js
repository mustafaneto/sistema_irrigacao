const mqtt = require('mqtt');
const { executeQuery } = require('../config/database');
require('dotenv').config();

class MQTTService {
    constructor() {
        this.client = null;
        this.isConnected = false;
        this.topics = {
            umidade: 'irrigacao/umidade',
            rele: 'irrigacao/rele'
        };
    }

    // Conectar ao broker MQTT
    connect() {
        const options = {
            host: process.env.MQTT_BROKER || '200.143.224.99',
            port: process.env.MQTT_PORT || 1183,
            username: process.env.MQTT_USERNAME,
            password: process.env.MQTT_PASSWORD,
            clientId: `backend_${Math.random().toString(16).slice(3)}`,
            clean: true,
            reconnectPeriod: 5000,
            connectTimeout: 30000
        };

        this.client = mqtt.connect(options);

        this.client.on('connect', () => {
            console.log('Conectado ao broker MQTT');
            this.isConnected = true;
            this.subscribeToTopics();
        });

        this.client.on('message', (topic, message) => {
            this.handleMessage(topic, message);
        });

        this.client.on('error', (error) => {
            console.error('Erro MQTT:', error);
            this.isConnected = false;
        });

        this.client.on('close', () => {
            console.log('Conexão MQTT fechada');
            this.isConnected = false;
        });

        this.client.on('reconnect', () => {
            console.log('Reconectando ao MQTT...');
        });
    }

    // Inscrever nos tópicos
    subscribeToTopics() {
        Object.values(this.topics).forEach(topic => {
            this.client.subscribe(topic, (err) => {
                if (err) {
                    console.error(`Erro ao se inscrever no tópico ${topic}:`, err);
                } else {
                    console.log(`Inscrito no tópico: ${topic}`);
                }
            });
        });
    }

    // Processar mensagens recebidas
    async handleMessage(topic, message) {
        try {
            const payload = message.toString();
            console.log(`Mensagem recebida em ${topic}: ${payload}`);

            switch (topic) {
                case this.topics.umidade:
                    await this.processarLeituraUmidade(payload);
                    break;
                case this.topics.rele:
                    await this.processarStatusRele(payload);
                    break;
                default:
                    console.log(`Tópico não reconhecido: ${topic}`);
            }
        } catch (error) {
            console.error('Erro ao processar mensagem MQTT:', error);
        }
    }

    // Processar leitura de umidade
    async processarLeituraUmidade(payload) {
        try {
            const umidade = parseFloat(payload);
            const valorAnalogico = Math.round((1 - umidade / 100) * 1023);

            const statusRele = umidade <= 30 ? 'ligado' : 'desligado';

            // Salvar leitura no banco
            const sql = `
                INSERT INTO leituras_umidade (valor_umidade, valor_analogico, status_rele)
                VALUES (?, ?, ?)
            `;
            await executeQuery(sql, [umidade, valorAnalogico, statusRele]);

            console.log(`Umidade processada: ${umidade}%`);
        } catch (error) {
            console.error('Erro ao processar leitura de umidade:', error);
        }
    }

    // Processar status do relé
    async processarStatusRele(payload) {
        try {
            const status = payload.toLowerCase();
            const acao = status === 'ligado' ? 'ligado' : 'desligado';
            
            // Buscar última leitura de umidade
            const [ultimaLeitura] = await executeQuery(
                'SELECT valor_umidade FROM leituras_umidade ORDER BY timestamp DESC LIMIT 1'
            );

            const umidadeAtual = ultimaLeitura ? ultimaLeitura.valor_umidade : null;
            const motivo = this.gerarMotivoAcao(acao, umidadeAtual);

            // Salvar no histórico
            const sql = `
                INSERT INTO historico_rele (acao, motivo, umidade_atual)
                VALUES (?, ?, ?)
            `;
            await executeQuery(sql, [acao, motivo, umidadeAtual]);

            console.log(`Status do relé processado: ${acao}`);
        } catch (error) {
            console.error('Erro ao processar status do relé:', error);
        }
    }

    // Gerar motivo da ação do relé
    gerarMotivoAcao(acao, umidade) {
        if (acao === 'ligado') {
            return umidade ? `Umidade baixa (${umidade}%) - Irrigação ativada` : 'Irrigação ativada manualmente';
        } else {
            return umidade ? `Umidade adequada (${umidade}%) - Irrigação desativada` : 'Irrigação desativada manualmente';
        }
    }


    // Desconectar
    disconnect() {
        if (this.client) {
            this.client.end();
            this.isConnected = false;
        }
    }

    // Verificar status da conexão
    getStatus() {
        return {
            connected: this.isConnected,
            topics: Object.values(this.topics)
        };
    }
}

module.exports = new MQTTService(); 