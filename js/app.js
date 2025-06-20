// Aplicação principal
class App {
    constructor() {
        this.currentTab = 'dashboard';
        this.modules = {};
        this.init();
    }

    // Inicializar aplicação
    async init() {
        console.log('🚀 Iniciando Sistema de Irrigação...');
        
        // Aguardar carregamento do DOM
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupApp());
        } else {
            this.setupApp();
        }
    }

    // Configurar aplicação
    async setupApp() {
        try {
            // Testar conexão com a API
            await this.testConnection();
            
            // Configurar navegação
            this.setupNavigation();
            
            // Configurar módulos
            this.setupModules();
            
            // Configurar eventos globais
            this.setupGlobalEvents();
            
            // Carregar dados iniciais
            await this.loadInitialData();
            
            console.log('✅ Aplicação inicializada com sucesso!');
            
        } catch (error) {
            console.error('❌ Erro ao inicializar aplicação:', error);
            Utils.mostrarNotificacao('Erro ao inicializar aplicação', 'error');
        }
    }

    // Testar conexão com a API
    async testConnection() {
        try {
            const isConnected = await api.testarConexao();
            if (!isConnected) {
                throw new Error('Não foi possível conectar com o servidor');
            }
            console.log('✅ Conexão com API estabelecida');
        } catch (error) {
            console.warn('⚠️ Erro de conexão com API:', error.message);
            Utils.mostrarNotificacao('Verificando conexão com o servidor...', 'warning');
        }
    }

    // Configurar navegação
    setupNavigation() {
        const navButtons = document.querySelectorAll('.nav-btn');
        
        navButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tab = e.target.dataset.tab;
                this.switchTab(tab);
            });
        });
    }

    // Trocar de aba
    switchTab(tabName) {
        // Remover classe active de todas as abas
        document.querySelectorAll('.tab-content').forEach(tab => {
            tab.classList.remove('active');
        });
        
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });

        // Adicionar classe active à aba selecionada
        const targetTab = document.getElementById(tabName);
        const targetBtn = document.querySelector(`[data-tab="${tabName}"]`);
        
        if (targetTab && targetBtn) {
            targetTab.classList.add('active');
            targetBtn.classList.add('active');
            this.currentTab = tabName;
            
            // Carregar dados específicos da aba
            this.loadTabData(tabName);
        }
    }

    // Carregar dados específicos da aba
    loadTabData(tabName) {
        switch (tabName) {
            case 'dashboard':
                if (dashboard) {
                    dashboard.refreshData();
                }
                break;
            case 'historico':
                if (this.modules.historico) {
                    this.modules.historico.loadData();
                }
                break;
            case 'configuracoes':
                if (this.modules.configuracoes) {
                    this.modules.configuracoes.loadConfiguracoes();
                }
                break;
            case 'alertas':
                if (this.modules.alertas) {
                    this.modules.alertas.loadAlertas();
                }
                break;
        }
    }

    // Configurar módulos
    setupModules() {
        // Inicializar módulos quando necessário
        this.modules = {
            dashboard: window.dashboard,
            historico: window.historico,
            configuracoes: window.configuracoes,
            alertas: window.alertas
        };
    }

    // Configurar eventos globais
    setupGlobalEvents() {
        // Evento de online/offline
        window.addEventListener('online', () => {
            Utils.mostrarNotificacao('Conexão restaurada!', 'success');
            this.refreshAllData();
        });

        window.addEventListener('offline', () => {
            Utils.mostrarNotificacao('Conexão perdida. Verificando...', 'warning');
        });

        // Evento de visibilidade da página
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                // Pausar atualizações quando a página não está visível
                if (dashboard) dashboard.stopAutoRefresh();
            } else {
                // Retomar atualizações quando a página volta a ficar visível
                if (dashboard) dashboard.startAutoRefresh();
                this.refreshAllData();
            }
        });

        // Evento de redimensionamento
        window.addEventListener('resize', Utils.debounce(() => {
            // Redimensionar gráficos se necessário
            if (chartManager.charts.umidade) {
                chartManager.charts.umidade.resize();
            }
        }, 250));

        // Evento de teclas de atalho
        document.addEventListener('keydown', (e) => {
            this.handleKeyboardShortcuts(e);
        });

        // Evento de clique fora de modais/toasts
        document.addEventListener('click', (e) => {
            this.handleOutsideClicks(e);
        });
    }

    // Tratar atalhos de teclado
    handleKeyboardShortcuts(e) {
        // Ctrl/Cmd + R para atualizar
        if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
            e.preventDefault();
            this.refreshAllData();
        }

        // F5 para atualizar
        if (e.key === 'F5') {
            e.preventDefault();
            this.refreshAllData();
        }

        // Números para trocar de aba
        if (e.key >= '1' && e.key <= '4') {
            const tabs = ['dashboard', 'historico', 'configuracoes', 'alertas'];
            const tabIndex = parseInt(e.key) - 1;
            if (tabs[tabIndex]) {
                this.switchTab(tabs[tabIndex]);
            }
        }
    }

    // Tratar cliques fora de elementos
    handleOutsideClicks(e) {
        // Fechar toasts ao clicar fora
        const toasts = document.querySelectorAll('.toast');
        toasts.forEach(toast => {
            if (!toast.contains(e.target)) {
                toast.remove();
            }
        });
    }

    // Carregar dados iniciais
    async loadInitialData() {
        try {
            // Carregar configurações salvas
            this.loadSavedPreferences();
            
            // Verificar se há alertas não lidos
            await this.checkUnreadAlerts();
            
        } catch (error) {
            console.error('Erro ao carregar dados iniciais:', error);
        }
    }

    // Carregar preferências salvas
    loadSavedPreferences() {
        const preferences = Utils.carregarLocalStorage(STORAGE_KEYS.USER_PREFERENCES, {});
        
        // Aplicar preferências salvas
        if (preferences.lastTab) {
            this.switchTab(preferences.lastTab);
        }
        
        if (preferences.chartPeriod) {
            chartManager.currentPeriod = preferences.chartPeriod;
        }
    }

    // Salvar preferências
    savePreferences() {
        const preferences = {
            lastTab: this.currentTab,
            chartPeriod: chartManager.currentPeriod
        };
        
        Utils.salvarLocalStorage(STORAGE_KEYS.USER_PREFERENCES, preferences);
    }

    // Verificar alertas não lidos
    async checkUnreadAlerts() {
        try {
            const response = await api.getAlertas();
            if (response.success && response.data) {
                const unreadCount = response.data.filter(alerta => !alerta.lido).length;
                this.updateAlertBadge(unreadCount);
            }
        } catch (error) {
            console.error('Erro ao verificar alertas:', error);
        }
    }

    // Atualizar badge de alertas
    updateAlertBadge(count) {
        const badge = document.getElementById('alertas-badge');
        if (badge) {
            if (count > 0) {
                badge.textContent = count;
                badge.style.display = 'block';
            } else {
                badge.style.display = 'none';
            }
        }
    }

    // Atualizar todos os dados
    async refreshAllData() {
        try {
            // Atualizar dados do dashboard
            if (dashboard) {
                await dashboard.refreshData();
            }
            
            // Atualizar alertas
            await this.checkUnreadAlerts();
            
            // Atualizar dados específicos da aba atual
            this.loadTabData(this.currentTab);
            
        } catch (error) {
            console.error('Erro ao atualizar dados:', error);
        }
    }

    // Mostrar informações do sistema
    showSystemInfo() {
        const info = {
            'Versão da Aplicação': '1.0.0',
            'Navegador': navigator.userAgent,
            'Resolução': `${window.innerWidth}x${window.innerHeight}`,
            'Online': navigator.onLine ? 'Sim' : 'Não',
            'Local Storage': navigator.storage ? 'Disponível' : 'Não disponível',
            'API URL': CONFIG.API_BASE_URL
        };

        console.table(info);
        Utils.mostrarNotificacao('Informações do sistema no console', 'info');
    }

    // Limpar cache e dados
    clearCache() {
        try {
            // Limpar localStorage
            Object.values(STORAGE_KEYS).forEach(key => {
                localStorage.removeItem(key);
            });
            
            // Limpar gráficos
            chartManager.destroyAllCharts();
            
            Utils.mostrarNotificacao('Cache limpo com sucesso!', 'success');
            
            // Recarregar página
            setTimeout(() => {
                window.location.reload();
            }, 1000);
            
        } catch (error) {
            console.error('Erro ao limpar cache:', error);
            Utils.mostrarNotificacao('Erro ao limpar cache', 'error');
        }
    }

    // Destruir aplicação
    destroy() {
        // Parar todas as atualizações automáticas
        if (dashboard) dashboard.destroy();
        
        // Destruir gráficos
        chartManager.destroyAllCharts();
        
        // Salvar preferências
        this.savePreferences();
        
        console.log('👋 Aplicação finalizada');
    }
}

// Inicializar aplicação quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
});

// Evento de antes de descarregar a página
window.addEventListener('beforeunload', () => {
    if (window.app) {
        window.app.destroy();
    }
});

// Expor funções globais para debug
window.showSystemInfo = () => window.app.showSystemInfo();
window.clearCache = () => window.app.clearCache();
window.refreshAll = () => window.app.refreshAllData(); 