const { testConnection } = require('../config/database');
const mqttService = require('../services/mqttService');

class SistemaController {

    async getStatusSistema(req, res) {
        try {
            const dbOk = await testConnection();
            const mqttStatus = mqttService.getStatus();

            res.json({
                success: true,
                data: {
                    server: {
                        status: 'online',
                        uptime: process.uptime()
                    },
                    database: {
                        status: dbOk ? 'online' : 'offline'
                    },
                    mqtt: {
                        status: mqttStatus.connected ? 'online' : 'offline',
                        broker: process.env.MQTT_BROKER
                    }
                }
            });
        } catch (error) {
            console.error('Erro ao verificar status do sistema:', error);
            res.status(500).json({ 
                success: false, 
                message: 'Erro ao verificar status do sistema'
            });
        }
    }
}

module.exports = new SistemaController(); 