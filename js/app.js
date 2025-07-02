// Aplicação principal
class App {
    constructor() {
        this.currentTab = 'dashboard';
        this.modules = {};
        this.init();
    }

    // Inicializar aplicação
    async init() {
        console.log('Iniciando Sistema de Irrigação...');
        
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
        
            
            console.log('Aplicação inicializada com sucesso!');
            
        } catch (error) {
            console.error('Erro ao inicializar aplicação:', error);
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
            console.log('Conexão com API estabelecida');
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
        }
    }

    // Configurar módulos
    setupModules() {
        // Inicializar módulos quando necessário
        this.modules = {
            dashboard: window.dashboard,
            historico: window.historico,
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


        // Evento de redimensionamento
        window.addEventListener('resize', Utils.debounce(() => {
            // Redimensionar gráficos se necessário
            if (chartManager.charts.umidade) {
                chartManager.charts.umidade.resize();
            }
        }, 250));

        // Evento de clique fora de modais/toasts
        document.addEventListener('click', (e) => {
            this.handleOutsideClicks(e);
        });
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

    // Destruir aplicação
    destroy() {
        // Parar todas as atualizações automáticas
        if (dashboard) dashboard.destroy();
        
        // Destruir gráficos
        chartManager.destroyAllCharts();
        
        // Salvar preferências
        this.savePreferences();
        
        console.log('Aplicação finalizada');
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