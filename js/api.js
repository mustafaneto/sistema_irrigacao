// Classe para gerenciar chamadas da API
class API {
    constructor() {
        this.baseURL = CONFIG.API_BASE_URL;
        this.timeout = CONFIG.API_TIMEOUT;
    }

    // Método genérico para fazer requisições
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        
        const defaultOptions = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            timeout: this.timeout
        };

        const requestOptions = {
            ...defaultOptions,
            ...options,
            headers: {
                ...defaultOptions.headers,
                ...options.headers
            }
        };

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), this.timeout);
            
            const response = await fetch(url, {
                ...requestOptions,
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            if (error.name === 'AbortError') {
                throw new Error(ERROR_MESSAGES.TIMEOUT);
            }
            
            if (error.message.includes('Failed to fetch')) {
                throw new Error(ERROR_MESSAGES.NETWORK_ERROR);
            }
            
            throw error;
        }
    }

    // Métodos para Umidade
    async getUltimaLeitura() {
        return this.request(API_ENDPOINTS.UMIDADE.ULTIMA);
    }

    async getHistoricoUmidade(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const endpoint = `${API_ENDPOINTS.UMIDADE.HISTORICO}${queryString ? `?${queryString}` : ''}`;
        return this.request(endpoint);
    }

    async getEstatisticasUmidade(periodo = 'hoje') {
        return this.request(`${API_ENDPOINTS.UMIDADE.ESTATISTICAS}?periodo=${periodo}`);
    }

    async getDadosGrafico(tipo = 'umidade', horas = 24) {
        return this.request(`${API_ENDPOINTS.UMIDADE.GRAFICO}?tipo=${tipo}&horas=${horas}`);
    }

    async inserirLeitura(dados) {
        return this.request(API_ENDPOINTS.UMIDADE.INSERIR, {
            method: 'POST',
            body: JSON.stringify(dados)
        });
    }

    // Métodos para Configurações
    async getConfiguracoes() {
        return this.request(API_ENDPOINTS.CONFIGURACAO.TODAS);
    }

    async getConfiguracao(nome) {
        const endpoint = API_ENDPOINTS.CONFIGURACAO.ESPECIFICA.replace(':nome', nome);
        return this.request(endpoint);
    }

    async atualizarConfiguracao(nome, valor) {
        const endpoint = API_ENDPOINTS.CONFIGURACAO.ATUALIZAR.replace(':nome', nome);
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify({ valor })
        });
    }

    async getConfiguracoesESP() {
        return this.request(API_ENDPOINTS.CONFIGURACAO.ESP);
    }

    async resetarConfiguracoes() {
        return this.request(API_ENDPOINTS.CONFIGURACAO.RESETAR, {
            method: 'POST'
        });
    }

    // Métodos para Alertas
    async getAlertas() {
        return this.request(API_ENDPOINTS.ALERTAS.TODOS);
    }

    async marcarAlertaLido(id) {
        const endpoint = API_ENDPOINTS.ALERTAS.MARCAR_LIDO.replace(':id', id);
        return this.request(endpoint, {
            method: 'PUT'
        });
    }

    async marcarTodosAlertasLidos() {
        return this.request(API_ENDPOINTS.ALERTAS.MARCAR_TODOS_LIDOS, {
            method: 'PUT'
        });
    }

    // Métodos para Histórico do Relé
    async getHistoricoRele(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const endpoint = `${API_ENDPOINTS.RELE.HISTORICO}${queryString ? `?${queryString}` : ''}`;
        return this.request(endpoint);
    }

    // Métodos para Status do Sistema
    async getStatusSistema() {
        return this.request(API_ENDPOINTS.SISTEMA.STATUS);
    }

    async getStatusMQTT() {
        return this.request(API_ENDPOINTS.SISTEMA.MQTT_STATUS);
    }

    // Método para testar conexão
    async testarConexao() {
        try {
            await this.getStatusSistema();
            return true;
        } catch (error) {
            console.error('Erro ao testar conexão:', error);
            return false;
        }
    }
}

// Instância global da API
window.api = new API(); 