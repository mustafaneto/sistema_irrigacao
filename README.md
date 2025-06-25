# Sistema de Irrigação Inteligente - Frontend

## 📋 Descrição

Frontend moderno e responsivo para o Sistema de Irrigação Inteligente, desenvolvido em JavaScript vanilla com HTML5 e CSS3. O sistema permite monitorar e controlar um sistema de irrigação baseado em ESP8266 através de uma interface web intuitiva.

[sistema](https://github.com/user-attachments/assets/a944e731-3228-4194-a285-52480e075587)

## 🚀 Funcionalidades

### Dashboard Principal
- **Monitoramento em Tempo Real**: Visualização da umidade atual do solo
- **Status do Relé**: Controle e monitoramento do sistema de irrigação
- **Gráficos Interativos**: Gráficos de linha mostrando variação da umidade
- **Estatísticas**: Média, mínima e máxima de umidade
- **Ações Rápidas**: Ativar/parar irrigação manualmente, testar sensor

### Histórico de Dados
- **Tabela de Leituras**: Histórico completo de todas as leituras
- **Filtros por Data**: Filtrar dados por período específico
- **Paginação**: Navegação por páginas para grandes volumes de dados
- **Exportação**: Exportar dados em CSV ou JSON

### Configurações
- **Limites de Umidade**: Configurar thresholds para ativação automática
- **Alertas**: Configurar níveis de alerta para diferentes situações
- **Intervalos**: Ajustar frequência de leituras do sensor
- **Reset**: Restaurar configurações padrão

### Sistema de Alertas
- **Alertas em Tempo Real**: Notificações de eventos importantes
- **Filtros por Tipo**: Filtrar alertas por categoria
- **Marcação de Lidos**: Gerenciar status dos alertas
- **Histórico de Alertas**: Visualizar todos os alertas do sistema

## 🛠️ Tecnologias Utilizadas

- **HTML5**: Estrutura semântica e moderna
- **CSS3**: Design responsivo com CSS Grid e Flexbox
- **JavaScript ES6+**: Programação orientada a objetos
- **Chart.js**: Gráficos interativos
- **Font Awesome**: Ícones
- **Google Fonts**: Tipografia (Inter)

## 📁 Estrutura do Projeto

```
app/
├── index.html              # Página principal
├── styles/
│   └── main.css           # Estilos principais
├── js/
│   ├── config.js          # Configurações da aplicação
│   ├── api.js             # Cliente da API
│   ├── utils.js           # Utilitários e helpers
│   ├── charts.js          # Gerenciador de gráficos
│   ├── dashboard.js       # Módulo do dashboard
│   ├── historico.js       # Módulo de histórico
│   ├── configuracoes.js   # Módulo de configurações
│   ├── alertas.js         # Módulo de alertas
│   └── app.js             # Aplicação principal
└── README.md              # Documentação
```

## 🎨 Design System

### Cores
- **Primária**: `#2563eb` (Azul)
- **Sucesso**: `#10b981` (Verde)
- **Aviso**: `#f59e0b` (Amarelo)
- **Erro**: `#ef4444` (Vermelho)
- **Info**: `#06b6d4` (Ciano)

### Tipografia
- **Família**: Inter (Google Fonts)
- **Tamanhos**: xs, sm, base, lg, xl, 2xl, 3xl

### Componentes
- **Cards**: Status, configurações, alertas
- **Botões**: Primário, secundário, pequeno
- **Formulários**: Inputs, validação
- **Tabelas**: Dados, paginação
- **Notificações**: Toast, alertas

## 🔧 Configuração

### 1. Instalação
```bash
# Clonar o repositório
git clone [url-do-repositorio]

# Navegar para o diretório
cd app

# Abrir no navegador
# Simplesmente abra o arquivo index.html
```

### 2. Configuração da API
Edite o arquivo `js/config.js` e ajuste as configurações:

```javascript
const CONFIG = {
    API_BASE_URL: 'http://localhost:3000/api', // URL do seu backend
    API_TIMEOUT: 10000,
    // ... outras configurações
};
```

### 3. Variáveis de Ambiente
Crie um arquivo `.env` na raiz do projeto (se necessário):

```env
API_URL=http://localhost:3000/api
MQTT_BROKER=200.143.224.99
MQTT_PORT=1183
```

## 📱 Responsividade

O sistema é totalmente responsivo e funciona em:
- **Desktop**: 1200px+
- **Tablet**: 768px - 1199px
- **Mobile**: < 768px

## 🔌 Integração com ESP8266

O frontend se comunica com o ESP8266 através do backend Node.js, que:
1. Recebe dados via MQTT do ESP8266
2. Armazena no banco MySQL
3. Disponibiliza via API REST
4. Frontend consome a API e exibe os dados

### Fluxo de Dados
```
ESP8266 → MQTT → Backend → MySQL → API → Frontend
```

## 🚀 Funcionalidades Avançadas

### Atualização Automática
- Dashboard atualiza a cada 5 segundos
- Gráficos atualizam a cada 10 segundos
- Pausa quando a página não está visível

### Cache e Performance
- Dados salvos no localStorage
- Debounce em inputs
- Throttle em eventos de scroll/resize

### Notificações
- Sistema de toast notifications
- Alertas em tempo real
- Badge de alertas não lidos

### Exportação de Dados
- CSV para análise externa
- JSON para backup
- Dados formatados e organizados

## 🎯 Atalhos de Teclado

- **Ctrl/Cmd + R**: Atualizar dados
- **F5**: Atualizar dados
- **1-4**: Trocar entre abas (Dashboard, Histórico, Configurações, Alertas)

## 🔍 Debug e Desenvolvimento

### Console Functions
```javascript
// Mostrar informações do sistema
showSystemInfo();

// Limpar cache
clearCache();

// Atualizar todos os dados
refreshAll();
```

### Logs
- Console logs detalhados para debug
- Tratamento de erros com mensagens amigáveis
- Indicadores de status de conexão

## 📊 Métricas e Analytics

O sistema coleta e exibe:
- **Umidade do Solo**: Valores em tempo real
- **Ativações do Relé**: Histórico de uso
- **Alertas**: Eventos e notificações
- **Performance**: Tempo de resposta da API

## 🔒 Segurança

- Validação de dados no frontend
- Sanitização de inputs
- Timeout em requisições
- Tratamento de erros de rede

## 🧪 Testes

Para testar o sistema:

1. **Teste de Sensor**: Simula leitura do sensor
2. **Ativação Manual**: Testa controle do relé
3. **Exportação**: Verifica geração de relatórios
4. **Responsividade**: Teste em diferentes dispositivos

## 📈 Roadmap

### Próximas Funcionalidades
- [ ] Autenticação de usuários
- [ ] Múltiplos sensores
- [ ] Configuração de horários
- [ ] Relatórios avançados
- [ ] Notificações push
- [ ] Modo offline
- [ ] Temas claro/escuro


## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo LICENSE para mais detalhes.

## 👥 Autores

- **Mustafa Neto** - Desenvolvimento Frontend
- **Rafael Cabral** - Desenvolvimento Backend

## 📞 Suporte

Para suporte ou dúvidas:
- Abra uma issue no GitHub
- Entre em contato com os desenvolvedores
- Consulte a documentação da API

---

**Sistema de Irrigação Inteligente** - Versão 1.0.0 
