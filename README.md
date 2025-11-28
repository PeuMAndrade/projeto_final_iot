# Axé Hero 🎸

Este é um jogo de ritmo no estilo Guitar Hero, com temática de Axé, projetado para ser jogado tanto com o teclado quanto com um controle personalizado feito com um ESP32.

<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

## O Projeto é Dividido em 3 Partes:

1.  **Frontend (React):** A interface do jogo que roda no seu navegador.
2.  **Servidor (WebSocket):** Um pequeno servidor que faz a ponte de comunicação entre o controle ESP32 e o jogo.
3.  **Controle (ESP32):** O código para a placa ESP32, que lê os botões e envia os comandos via Wi-Fi.

---

## Requisitos

### Software:
*   [Node.js](https://nodejs.org/) (versão 18 ou superior)
*   [Arduino IDE](https://www.arduino.cc/en/software)

### Hardware:
*   1x Placa ESP32 (qualquer modelo com Wi-Fi)
*   4x Botões (Push Buttons)
*   1x Protoboard (opcional, mas recomendado)
*   Fios para conexão (Jumper wires)

---

## 🚀 Como Rodar o Projeto (Passo a Passo)

Siga as duas partes abaixo para configurar o ambiente completo.

### Parte 1: Frontend e Servidor

Nesta parte, vamos preparar o jogo para rodar no seu computador.

1.  **Instale as Dependências:**
    Abra um terminal na pasta do projeto e execute o comando:
    ```bash
    npm install
    ```

2.  **Inicie o Jogo e o Servidor:**
    Ainda no terminal, execute:
    ```bash
    npm run dev
    ```
    Este comando irá iniciar duas coisas ao mesmo tempo:
    *   O **jogo**, que estará acessível em `http://localhost:3000`.
    *   O **servidor WebSocket**, que ficará ouvindo na porta `8080`.

    Você verá logs de ambos no seu terminal. Mantenha este terminal aberto enquanto joga.

### Parte 2: Controle com ESP32

Agora, vamos montar e programar o controle físico.

1.  **Montagem do Circuito:**
    Conecte os botões no ESP32 conforme o esquema abaixo. Cada botão deve ter um lado conectado a um pino GPIO e o outro lado conectado ao pino `GND` (Terra).

    *   Botão Verde   -> `GPIO 12`
    *   Botão Vermelho -> `GPIO 13`
    *   Botão Azul     -> `GPIO 14`
    *   Botão Amarelo  -> `GPIO 27`

2.  **Configuração da Arduino IDE:**
    *   Abra a Arduino IDE.
    *   Vá em `Tools > Manage Libraries...`.
    *   Procure por **"ArduinoWebsockets"** (por Gil Mota) e instale a biblioteca.

3.  **Configuração do Código do Controle:**
    *   Abra o arquivo `esp32_controller/esp32_controller.ino` na Arduino IDE.
    *   **Altere as credenciais do Wi-Fi:**
        ```cpp
        const char *ssid = "NOME_DA_SUA_REDE_WIFI";
        const char *password = "SENHA_DA_SUA_REDE_WIFI";
        ```
    *   **Altere o IP do Servidor:**
        Você precisa colocar o IP do computador onde o jogo está rodando. Para descobrir seu IP, use `ipconfig` (Windows) ou `ip addr` (Linux/macOS) no terminal.
        ```cpp
        const char *websocket_server_ip = "192.168.0.36"; // <-- MUDE PARA O IP DO SEU COMPUTADOR
        ```

4.  **Grave o Código no ESP32:**
    *   Conecte o ESP32 ao seu computador via USB.
    *   Na Arduino IDE, selecione a placa e a porta correta em `Tools > Board` e `Tools > Port`.
    *   Clique no botão de "Upload" (seta para a direita) para gravar o código.
    *   Abra o `Serial Monitor` (`Tools > Serial Monitor`) com a velocidade de `115200` para ver o status da conexão.

---

## 🎮 Como Jogar

1.  Com o comando `npm run dev` ainda rodando no seu PC, ligue o ESP32.
2.  No seu navegador, acesse o endereço do jogo (ex: `http://localhost:3000`).
3.  O ESP32 deverá se conectar automaticamente ao Wi-Fi e ao servidor. O jogo mostrará um ícone de "Guitarra Conectada".
4.  Inicie o jogo e use os botões do seu controle!

### Controles Alternativos (Teclado)

Se não quiser usar o controle, você pode jogar com o teclado usando as seguintes teclas:

*   **Pista Verde:** `A`
*   **Pista Vermelha:** `S`
*   **Pista Azul:** `D`
*   **Pista Amarela:** `F`