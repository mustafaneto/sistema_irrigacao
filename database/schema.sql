-- Criação do banco de dados
CREATE DATABASE IF NOT EXISTS sistema_irrigacao;
USE sistema_irrigacao;

-- Tabela de leituras de umidade
CREATE TABLE leituras_umidade (
    id INT AUTO_INCREMENT PRIMARY KEY,
    valor_umidade DECIMAL(5,2) NOT NULL,
    valor_analogico INT NOT NULL,
    status_rele ENUM('ligado', 'desligado') NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    dispositivo_id VARCHAR(50) DEFAULT 'ESP8266'
);

-- Tabela de histórico de ativações do relé
CREATE TABLE historico_rele (
    id INT AUTO_INCREMENT PRIMARY KEY,
    acao ENUM('ligado', 'desligado') NOT NULL,
    motivo VARCHAR(255),
    umidade_atual DECIMAL(5,2),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    dispositivo_id VARCHAR(50) DEFAULT 'ESP8266'
);

-- Índices para otimização
CREATE INDEX idx_leituras_timestamp ON leituras_umidade(timestamp);
CREATE INDEX idx_historico_timestamp ON historico_rele(timestamp);