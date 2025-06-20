// Gerenciador de Alertas
class Alertas {
    constructor() {
        this.alertas = [];
        this.currentFilter = 'todos';
        this.init();
    }

    // Inicializar módulo
    init() {
        this.setupEventListeners();
        this.loadAlertas();
    }

    // Configurar event listeners
    setupEventListeners() {
        // Botão marcar todos como lidos
        const marcarLidosBtn = document.getElementById('marcar-lidos');
        if (marcarLidosBtn) {
            marcarLidosBtn.addEventListener('click', () => this.marcarTodosLidos());
        }

        // Filtros de alerta
        const filtros = document.querySelectorAll('.filtro-alerta');
        filtros.forEach(filtro => {
            filtro.addEventListener('click', (e) => {
                const tipo = e.target.dataset.tipo;
                this.aplicarFiltro(tipo);
            });
        });
    }

    // Carregar alertas
    async loadAlertas() {
        try {
            Utils.mostrarLoading();
            
            const response = await api.getAlertas();
            
            if (response.success) {
                this.alertas = response.data;
                this.renderAlertas();
                this.updateAlertBadge();
            }
            
        } catch (error) {
            console.error('Erro ao carregar alertas:', error);
            Utils.tratarErroAPI(error);
        } finally {
            Utils.ocultarLoading();
        }
    }

    // Renderizar alertas
    renderAlertas() {
        const container = document.getElementById('alertas-list');
        if (!container) return;

        // Filtrar alertas
        const alertasFiltrados = this.filtrarAlertas(this.alertas, this.currentFilter);

        if (alertasFiltrados.length === 0) {
            container.innerHTML = `
                <div class="alertas-empty">
                    <i class="fas fa-bell-slash"></i>
                    <p>Nenhum alerta encontrado</p>
                </div>
            `;
            return;
        }

        container.innerHTML = '';

        alertasFiltrados.forEach(alerta => {
            const alertaElement = this.createAlertaElement(alerta);
            container.appendChild(alertaElement);
        });
    }

    // Criar elemento de alerta
    createAlertaElement(alerta) {
        const div = document.createElement('div');
        div.className = `alerta-item ${alerta.tipo} ${alerta.lido ? 'lido' : 'nao-lido'}`;
        
        const nivelClass = this.getNivelClass(alerta.nivel);
        const tipoText = CONFIG.ALERTA_TIPOS[alerta.tipo] || alerta.tipo;
        const nivelText = CONFIG.ALERTA_NIVEIS[alerta.nivel] || alerta.nivel;
        
        div.innerHTML = `
            <div class="alerta-header">
                <div class="alerta-info">
                    <span class="alerta-tipo">${tipoText}</span>
                    <span class="alerta-nivel ${nivelClass}">${nivelText}</span>
                </div>
                <div class="alerta-actions">
                    <span class="alerta-timestamp">${Utils.formatarData(alerta.timestamp, 'relative')}</span>
                    ${!alerta.lido ? `
                        <button class="btn btn-sm btn-secondary" onclick="alertas.marcarLido(${alerta.id})">
                            <i class="fas fa-check"></i>
                        </button>
                    ` : ''}
                </div>
            </div>
            <div class="alerta-mensagem">${alerta.mensagem}</div>
            ${alerta.detalhes ? `
                <div class="alerta-detalhes">
                    <small>${alerta.detalhes}</small>
                </div>
            ` : ''}
        `;

        return div;
    }

    // Obter classe do nível
    getNivelClass(nivel) {
        const classes = {
            baixo: 'baixo',
            medio: 'medio',
            alto: 'alto',
            critico: 'critico'
        };
        return classes[nivel] || 'medio';
    }

    // Filtrar alertas
    filtrarAlertas(alertas, filtro) {
        if (filtro === 'todos') {
            return alertas;
        }
        return alertas.filter(alerta => alerta.tipo === filtro);
    }

    // Aplicar filtro
    aplicarFiltro(tipo) {
        // Atualizar botões de filtro
        document.querySelectorAll('.filtro-alerta').forEach(btn => {
            btn.classList.remove('active');
        });
        
        const activeBtn = document.querySelector(`[data-tipo="${tipo}"]`);
        if (activeBtn) {
            activeBtn.classList.add('active');
        }

        this.currentFilter = tipo;
        this.renderAlertas();
    }

    // Marcar alerta como lido
    async marcarLido(id) {
        try {
            const response = await api.marcarAlertaLido(id);
            
            if (response.success) {
                // Atualizar alerta local
                const alerta = this.alertas.find(a => a.id === id);
                if (alerta) {
                    alerta.lido = true;
                }
                
                this.renderAlertas();
                this.updateAlertBadge();
                Utils.mostrarNotificacao(SUCCESS_MESSAGES.ALERT_MARKED, 'success');
            }
            
        } catch (error) {
            console.error('Erro ao marcar alerta como lido:', error);
            Utils.tratarErroAPI(error);
        }
    }

    // Marcar todos os alertas como lidos
    async marcarTodosLidos() {
        try {
            const unreadAlerts = this.alertas.filter(alerta => !alerta.lido);
            
            if (unreadAlerts.length === 0) {
                Utils.mostrarNotificacao('Não há alertas não lidos', 'info');
                return;
            }

            const confirmed = confirm(`Marcar ${unreadAlerts.length} alerta(s) como lido(s)?`);
            if (!confirmed) return;

            Utils.mostrarLoading();

            await api.marcarTodosAlertasLidos();
            
            // Atualizar alertas locais
            this.alertas.forEach(alerta => {
                alerta.lido = true;
            });
            
            this.renderAlertas();
            this.updateAlertBadge();
            Utils.mostrarNotificacao(SUCCESS_MESSAGES.ALL_ALERTS_MARKED, 'success');
            
        } catch (error) {
            console.error('Erro ao marcar todos os alertas como lidos:', error);
            Utils.tratarErroAPI(error);
        } finally {
            Utils.ocultarLoading();
        }
    }

    // Atualizar badge de alertas
    updateAlertBadge() {
        const unreadCount = this.alertas.filter(alerta => !alerta.lido).length;
        
        // Atualizar badge no header
        const badge = document.getElementById('alertas-badge');
        if (badge) {
            if (unreadCount > 0) {
                badge.textContent = unreadCount;
                badge.style.display = 'block';
            } else {
                badge.style.display = 'none';
            }
        }

        // Atualizar título da página se necessário
        if (unreadCount > 0) {
            document.title = `(${unreadCount}) Sistema de Irrigação`;
        } else {
            document.title = 'Sistema de Irrigação';
        }
    }

    // Adicionar alerta (para uso interno)
    addAlerta(alerta) {
        this.alertas.unshift(alerta);
        this.renderAlertas();
        this.updateAlertBadge();
        
        // Mostrar notificação se não estiver na aba de alertas
        if (app.currentTab !== 'alertas') {
            Utils.mostrarNotificacao(alerta.mensagem, this.getNotificationType(alerta.nivel));
        }
    }

    // Obter tipo de notificação baseado no nível
    getNotificationType(nivel) {
        const types = {
            baixo: 'info',
            medio: 'warning',
            alto: 'warning',
            critico: 'error'
        };
        return types[nivel] || 'info';
    }

    // Criar alerta de teste
    createTestAlerta() {
        const alerta = {
            id: Date.now(),
            tipo: 'baixa_umidade',
            nivel: 'medio',
            mensagem: 'Umidade do solo está baixa (25%)',
            detalhes: 'Sensor A0 detectou umidade abaixo do limite configurado',
            timestamp: new Date().toISOString(),
            lido: false
        };
        
        this.addAlerta(alerta);
    }

    // Limpar alertas antigos
    async limparAlertasAntigos(dias = 30) {
        try {
            const confirmed = confirm(`Remover alertas mais antigos que ${dias} dias?`);
            if (!confirmed) return;

            Utils.mostrarLoading();

            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - dias);

            const oldAlerts = this.alertas.filter(alerta => 
                new Date(alerta.timestamp) < cutoffDate
            );

            if (oldAlerts.length === 0) {
                Utils.mostrarNotificacao('Não há alertas antigos para remover', 'info');
                return;
            }

            // Aqui você implementaria a chamada para a API para remover alertas antigos
            // Por enquanto, apenas simular
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Remover da lista local
            this.alertas = this.alertas.filter(alerta => 
                new Date(alerta.timestamp) >= cutoffDate
            );

            this.renderAlertas();
            this.updateAlertBadge();
            Utils.mostrarNotificacao(`${oldAlerts.length} alertas antigos removidos`, 'success');
            
        } catch (error) {
            console.error('Erro ao limpar alertas antigos:', error);
            Utils.tratarErroAPI(error);
        } finally {
            Utils.ocultarLoading();
        }
    }

    // Exportar alertas
    exportarAlertas(formato = 'csv') {
        try {
            const alertasExport = this.alertas.map(alerta => ({
                Data: Utils.formatarData(alerta.timestamp),
                Tipo: CONFIG.ALERTA_TIPOS[alerta.tipo] || alerta.tipo,
                Nivel: CONFIG.ALERTA_NIVEIS[alerta.nivel] || alerta.nivel,
                Mensagem: alerta.mensagem,
                Detalhes: alerta.detalhes || '',
                Status: alerta.lido ? 'Lido' : 'Não lido'
            }));

            const nomeArquivo = `alertas_${new Date().toISOString().split('T')[0]}`;
            Utils.exportarDados(alertasExport, nomeArquivo, formato);
            Utils.mostrarNotificacao('Alertas exportados com sucesso!', 'success');
            
        } catch (error) {
            console.error('Erro ao exportar alertas:', error);
            Utils.mostrarNotificacao('Erro ao exportar alertas', 'error');
        }
    }

    // Obter estatísticas dos alertas
    getAlertasStats() {
        const total = this.alertas.length;
        const naoLidos = this.alertas.filter(a => !a.lido).length;
        const porTipo = {};
        const porNivel = {};

        this.alertas.forEach(alerta => {
            // Contar por tipo
            porTipo[alerta.tipo] = (porTipo[alerta.tipo] || 0) + 1;
            
            // Contar por nível
            porNivel[alerta.nivel] = (porNivel[alerta.nivel] || 0) + 1;
        });

        return {
            total,
            naoLidos,
            porTipo,
            porNivel
        };
    }

    // Atualizar alertas
    refresh() {
        this.loadAlertas();
    }

    // Destruir módulo
    destroy() {
        // Limpar event listeners se necessário
    }
}

// Instância global dos alertas
window.alertas = new Alertas(); 