// Gerenciador do Dashboard
class Dashboard {
    constructor() {
        this.currentData = null;
        this.autoRefreshInterval = null;
        this.init();
    }

    // Inicializar dashboard
    init() {
        this.setupEventListeners();
        this.loadInitialData();
        this.startAutoRefresh();
    }

    // Configurar event listeners
    setupEventListeners() {
        
        const exportData = document.getElementById('export-data');
        if (exportData) {
            exportData.addEventListener('click', () => this.exportarDados());
        }

        // Controles do gráfico
        const chartControls = document.querySelectorAll('.chart-controls button');
        chartControls.forEach(btn => {
            btn.addEventListener('click', (e) => {
                chartControls.forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                
                const period = parseInt(e.target.dataset.period);
                chartManager.currentPeriod = period;
                chartManager.updateChartData();
            });
        });
    }

    // Carregar dados iniciais
    async loadInitialData() {
        try {
            Utils.mostrarLoading();
            
            // Carregar dados em paralelo
            const [ultimaLeitura, estatisticas, statusMQTT] = await Promise.all([
                api.getUltimaLeitura(),
                api.getEstatisticasUmidade(),
                api.getStatusMQTT()
            ]);

            console.log('Dados carregados:', {
                ultimaLeitura,
                estatisticas,
                statusMQTT
            });

            this.updateDashboard(ultimaLeitura, estatisticas, statusMQTT);
            
            // Inicializar gráfico
            chartManager.initUmidadeChart();
            chartManager.updateChartData();
            
        } catch (error) {
            console.error('Erro ao carregar dados iniciais:', error);
            Utils.tratarErroAPI(error);
        } finally {
            Utils.ocultarLoading();
        }
    }

    // Atualizar dashboard
    updateDashboard(ultimaLeitura, estatisticas, statusMQTT) {
        this.updateUmidadeDisplay(ultimaLeitura);
        this.updateReleStatus(ultimaLeitura);
        this.updateEstatisticas(estatisticas);
        this.updateLastUpdate();
        this.updateMQTTStatus(statusMQTT);
    }

    // Atualizar display de umidade
    updateUmidadeDisplay(data) {
        if (!data.success || !data.data) return;

        const { umidade, statusRele, timestamp } = data.data;
        
        // Atualizar valor da umidade
        const umidadeElement = document.getElementById('umidade-atual');
        if (umidadeElement) {
            umidadeElement.textContent = Utils.formatarNumero(umidade);
        }

        // Atualizar barra de progresso
        const progressElement = document.getElementById('umidade-progress');
        if (progressElement) {
            // Garantir que a umidade esteja entre 0 e 100
            let umidadeBarra = umidade;
            if (umidade < 0) umidadeBarra = 0;
            progressElement.style.width = `${umidadeBarra}%`;
        }

        // Atualizar status da umidade
        const statusElement = document.getElementById('umidade-status');
        if (statusElement) {
            const status = Utils.getStatusUmidade(umidade);
            const cor = Utils.getCorUmidade(umidade);
            statusElement.textContent = status;
            statusElement.style.color = cor;
        }

        // Adicionar ponto ao gráfico
        if (chartManager.charts.umidade) {
            chartManager.addDataPoint(timestamp, umidade);
        }

        this.currentData = data.data;
    }

    // Atualizar status do relé
    updateReleStatus(data) {
        if (!data.success || !data.data) return;

        const { statusRele } = data.data;
        const releElement = document.getElementById('rele-status');
        
        if (releElement) {
            releElement.className = `rele-status ${statusRele}`;
            releElement.innerHTML = `
                <i class="fas fa-circle"></i>
                <span>${statusRele === 'ligado' ? 'Ligado' : 'Desligado'}</span>
            `;
        }
    }

    // Atualizar estatísticas
    updateEstatisticas(data) {
        if (!data.success || !data.data) return;

        const { umidade, rele } = data.data;

        // Estatísticas de umidade
        const mediaElement = document.getElementById('umidade-media');
        if (mediaElement && umidade.media) {
            mediaElement.textContent = `${Utils.formatarNumero(umidade.media)}%`;
        }

        const minimaElement = document.getElementById('umidade-minima');
        if (minimaElement && umidade.minima) {
            minimaElement.textContent = `${Utils.formatarNumero(umidade.minima)}%`;
        }

        const maximaElement = document.getElementById('umidade-maxima');
        if (maximaElement && umidade.maxima) {
            maximaElement.textContent = `${Utils.formatarNumero(umidade.maxima)}%`;
        }

        // Estatísticas do relé
        const ativacoesElement = document.getElementById('ativacoes-hoje');
        if (ativacoesElement && rele.vezesLigado) {
            ativacoesElement.textContent = rele.vezesLigado;
        }

        const ultimaAtivacaoElement = document.getElementById('ultima-ativacao');
        if (ultimaAtivacaoElement) {
            // Buscar última ativação do histórico
            this.loadUltimaAtivacao();
        }
    }

    // Carregar última ativação
    async loadUltimaAtivacao() {
        try {
            const response = await api.getHistoricoRele({ limit: 1 });
            if (response.success && response.data.length > 0) {
                const ultimaAtivacao = response.data[0];
                const element = document.getElementById('ultima-ativacao');
                if (element) {
                    element.textContent = Utils.formatarData(ultimaAtivacao.timestamp, 'relative');
                }
            }
        } catch (error) {
            console.error('Erro ao carregar última ativação:', error);
        }
    }

    // Atualizar última atualização
    updateLastUpdate() {
        const element = document.getElementById('ultima-atualizacao');
        if (element) {
            element.innerHTML = `
                <i class="fas fa-sync-alt"></i>
                <span>${Utils.formatarData(new Date(), 'relative')}</span>
            `;
        }

        // Calcular próxima leitura
        this.updateProximaLeitura();
    }

    // Atualizar próxima leitura
    updateProximaLeitura() {
        const element = document.getElementById('proxima-leitura');
        if (element) {
            const agora = new Date();
            const proxima = new Date(agora.getTime() + CONFIG.AUTO_REFRESH_INTERVAL);
            const diff = Math.ceil((proxima - agora) / 1000);
            element.textContent = `${diff}s`;
        }
    }

    // Atualizar status MQTT
    updateMQTTStatus(data) {
        const statusDot = document.getElementById('mqtt-status');
        const statusText = document.getElementById('mqtt-text');
        
        if (statusDot && statusText) {
            // Verificar se data existe e tem a estrutura esperada
            const isConnected = data && 
                               data.success && 
                               data.data && 
                               data.data.connected === true;
       
            if (isConnected) {
                statusDot.className = 'status-dot connected';
                statusText.textContent = 'Conectado';
            } else {
                statusDot.className = 'status-dot disconnected';
                statusText.textContent = 'Desconectado';
            }
        }
    }

    // Atualizar dados
    async refreshData() {
        try {
            const [ultimaLeitura, estatisticas, statusMQTT] = await Promise.all([
                api.getUltimaLeitura(),
                api.getEstatisticasUmidade(),
                api.getStatusMQTT()
            ]);

            this.updateDashboard(ultimaLeitura, estatisticas, statusMQTT);
            Utils.mostrarNotificacao('Dados atualizados!', 'success', 2000);
            
        } catch (error) {
            console.error('Erro ao atualizar dados:', error);
            Utils.tratarErroAPI(error);
        }
    }

    // Iniciar atualização automática
    startAutoRefresh() {
        this.autoRefreshInterval = setInterval(() => {
            this.refreshData();
        }, CONFIG.AUTO_REFRESH_INTERVAL);
    }

    // Parar atualização automática
    stopAutoRefresh() {
        if (this.autoRefreshInterval) {
            clearInterval(this.autoRefreshInterval);
            this.autoRefreshInterval = null;
        }
    }

    // Exportar dados
    async exportarDados() {
        try {
            Utils.mostrarLoading();
            
            const response = await api.getHistoricoUmidade({ limit: 1000 });
            
            if (response.success && response.data) {
                const dados = response.data.map(item => ({
                    Data: Utils.formatarData(item.timestamp),
                    Umidade: `${item.valor_umidade}%`,
                    'Valor Analógico': item.valor_analogico,
                    'Status Relé': item.status_rele
                }));
                
                Utils.exportarDados(dados, `dados_irrigacao_${new Date().toISOString().split('T')[0]}`, 'csv');
                Utils.mostrarNotificacao(SUCCESS_MESSAGES.DATA_EXPORTED, 'success');
            }
            
        } catch (error) {
            console.error('Erro ao exportar dados:', error);
            Utils.tratarErroAPI(error);
        } finally {
            Utils.ocultarLoading();
        }
    }

    // Destruir dashboard
    destroy() {
        this.stopAutoRefresh();
        chartManager.destroyAllCharts();
    }
}

// Instância global do dashboard
window.dashboard = new Dashboard(); 