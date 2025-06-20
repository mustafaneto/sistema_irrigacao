// Gerenciador de gráficos
class ChartManager {
    constructor() {
        this.charts = {};
        this.currentPeriod = 24;
    }

    // Inicializar gráfico de umidade
    initUmidadeChart() {
        const ctx = document.getElementById('umidade-chart');
        if (!ctx) return;

        this.charts.umidade = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Umidade (%)',
                    data: [],
                    borderColor: CONFIG.CHART_COLORS.umidade,
                    backgroundColor: `${CONFIG.CHART_COLORS.umidade}20`,
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 3,
                    pointHoverRadius: 5
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        callbacks: {
                            title: function(context) {
                                return `Hora: ${context[0].label}`;
                            },
                            label: function(context) {
                                return `Umidade: ${context.parsed.y}%`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        type: 'time',
                        time: {
                            unit: 'hour',
                            displayFormats: {
                                hour: 'HH:mm'
                            }
                        },
                        title: {
                            display: true,
                            text: 'Hora'
                        },
                        grid: {
                            color: '#e2e8f0'
                        }
                    },
                    y: {
                        beginAtZero: true,
                        max: 100,
                        title: {
                            display: true,
                            text: 'Umidade (%)'
                        },
                        grid: {
                            color: '#e2e8f0'
                        },
                        ticks: {
                            callback: function(value) {
                                return value + '%';
                            }
                        }
                    }
                },
                interaction: {
                    mode: 'nearest',
                    axis: 'x',
                    intersect: false
                },
                elements: {
                    point: {
                        hoverBackgroundColor: CONFIG.CHART_COLORS.umidade
                    }
                }
            }
        });

        // Configurar controles de período
        this.setupPeriodControls();
    }

    // Configurar controles de período
    setupPeriodControls() {
        const controls = document.querySelectorAll('.chart-controls button');
        controls.forEach(btn => {
            btn.addEventListener('click', (e) => {
                // Remover classe active de todos os botões
                controls.forEach(b => b.classList.remove('active'));
                // Adicionar classe active ao botão clicado
                e.target.classList.add('active');
                
                const period = parseInt(e.target.dataset.period);
                this.currentPeriod = period;
                this.updateChartData();
            });
        });
    }

    // Atualizar dados do gráfico
    async updateChartData() {
        try {
            const response = await api.getDadosGrafico('umidade', this.currentPeriod);
            
            if (response.success && response.data.dados) {
                this.updateChart(response.data.dados);
            }
        } catch (error) {
            console.error('Erro ao atualizar dados do gráfico:', error);
            Utils.tratarErroAPI(error);
        }
    }

    // Atualizar gráfico com novos dados
    updateChart(dados) {
        if (!this.charts.umidade) return;

        const labels = dados.map(item => new Date(item.periodo));
        const values = dados.map(item => parseFloat(item.valor));

        this.charts.umidade.data.labels = labels;
        this.charts.umidade.data.datasets[0].data = values;

        // Atualizar cores baseadas nos valores
        this.charts.umidade.data.datasets[0].backgroundColor = values.map(value => 
            `${Utils.getCorUmidade(value)}20`
        );
        this.charts.umidade.data.datasets[0].borderColor = values.map(value => 
            Utils.getCorUmidade(value)
        );

        this.charts.umidade.update('none');
    }

    // Adicionar ponto ao gráfico em tempo real
    addDataPoint(timestamp, umidade) {
        if (!this.charts.umidade) return;

        const chart = this.charts.umidade;
        
        // Adicionar novo ponto
        chart.data.labels.push(new Date(timestamp));
        chart.data.datasets[0].data.push(umidade);

        // Manter apenas os últimos pontos baseado no período
        const maxPoints = this.currentPeriod;
        if (chart.data.labels.length > maxPoints) {
            chart.data.labels.shift();
            chart.data.datasets[0].data.shift();
        }

        // Atualizar cores
        chart.data.datasets[0].backgroundColor = chart.data.datasets[0].data.map(value => 
            `${Utils.getCorUmidade(value)}20`
        );
        chart.data.datasets[0].borderColor = chart.data.datasets[0].data.map(value => 
            Utils.getCorUmidade(value)
        );

        chart.update('none');
    }

    // Criar gráfico de barras para ativações do relé
    createReleChart(containerId) {
        const ctx = document.getElementById(containerId);
        if (!ctx) return;

        this.charts.rele = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: [],
                datasets: [{
                    label: 'Ativações',
                    data: [],
                    backgroundColor: CONFIG.CHART_COLORS.rele,
                    borderColor: CONFIG.CHART_COLORS.rele,
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Número de Ativações'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Hora'
                        }
                    }
                }
            }
        });
    }

    // Atualizar gráfico do relé
    updateReleChart(dados) {
        if (!this.charts.rele) return;

        const labels = dados.map(item => item.periodo);
        const values = dados.map(item => item.ligado);

        this.charts.rele.data.labels = labels;
        this.charts.rele.data.datasets[0].data = values;
        this.charts.rele.update();
    }

    // Destruir gráfico
    destroyChart(chartName) {
        if (this.charts[chartName]) {
            this.charts[chartName].destroy();
            delete this.charts[chartName];
        }
    }

    // Destruir todos os gráficos
    destroyAllCharts() {
        Object.keys(this.charts).forEach(chartName => {
            this.destroyChart(chartName);
        });
    }

    // Obter estatísticas do gráfico
    getChartStats() {
        if (!this.charts.umidade || !this.charts.umidade.data.datasets[0].data.length) {
            return null;
        }

        const data = this.charts.umidade.data.datasets[0].data;
        const min = Math.min(...data);
        const max = Math.max(...data);
        const avg = data.reduce((a, b) => a + b, 0) / data.length;

        return {
            min: Utils.formatarNumero(min),
            max: Utils.formatarNumero(max),
            avg: Utils.formatarNumero(avg),
            total: data.length
        };
    }

    // Exportar dados do gráfico
    exportChartData(format = 'json') {
        if (!this.charts.umidade) return;

        const data = this.charts.umidade.data.labels.map((label, index) => ({
            timestamp: label.toISOString(),
            umidade: this.charts.umidade.data.datasets[0].data[index]
        }));

        const filename = `umidade_${this.currentPeriod}h_${new Date().toISOString().split('T')[0]}`;
        Utils.exportarDados(data, filename, format);
    }

    // Configurar atualização automática
    setupAutoUpdate() {
        setInterval(() => {
            this.updateChartData();
        }, CONFIG.CHART_UPDATE_INTERVAL);
    }

    // Pausar atualizações automáticas
    pauseAutoUpdate() {
        if (this.autoUpdateInterval) {
            clearInterval(this.autoUpdateInterval);
            this.autoUpdateInterval = null;
        }
    }

    // Retomar atualizações automáticas
    resumeAutoUpdate() {
        this.setupAutoUpdate();
    }
}

// Instância global do gerenciador de gráficos
window.chartManager = new ChartManager(); 