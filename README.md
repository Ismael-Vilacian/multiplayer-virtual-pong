# Pong Multijogador Online 🏓

Este projeto é uma implementação de um jogo multiplayer online inspirado no clássico Pong, desenvolvido com o objetivo de explorar a comunicação em tempo real entre cliente e servidor utilizando WebSockets. O que começou como um simples clone do Pong evoluiu para um sistema de jogo mais complexo, com uma fila de espera e rotação de jogadores, permitindo que vários usuários participem de forma competitiva.

O foco principal é o estudo da interação online, a gestão de estado do lado do servidor e a sincronização de eventos entre múltiplos clientes para criar uma experiência de jogo fluida e interativa.

## Funcionalidades Principais ✨

  - **Multiplayer em Tempo Real:** Jogue contra outro oponente online com baixa latência.
  - **Sistema de Fila de Espera:** Quando uma partida já está em andamento, novos jogadores que se conectam são adicionados a uma fila de espera.
  - **Rotação de Jogadores:** Ao final de uma partida (quando um jogador atinge 7 pontos), o perdedor vai para o final da fila e o próximo desafiante entra no jogo.
  - **Contagem Regressiva:** Uma tela de transição com um cronômetro de 5 segundos é exibida antes do início de uma nova partida, apresentando o novo desafiante.
  - **Gerenciamento de Desconexão:** Se um jogador ativo se desconecta, o próximo da fila é promovido para que o jogo possa continuar.

## Tecnologias Utilizadas 🛠️

  - **Backend:**
      - **Node.js:** Ambiente de execução para o servidor JavaScript.
      - **Express.js:** Framework para gerenciar o servidor web e servir os arquivos do cliente.
      - **Socket.IO:** Biblioteca para habilitar a comunicação bidirecional baseada em eventos e em tempo real (WebSockets).
  - **Frontend:**
      - **HTML5 (Canvas):** Utilizado para renderizar o campo de jogo, os jogadores e a bola.
      - **CSS3:** Para estilização da interface, incluindo os elementos do jogo e as telas de espera/transição.
      - **JavaScript (ES6 Modules):** Para a lógica do lado do cliente, manipulação de eventos e comunicação com o servidor.

## Como Executar o Projeto 🚀

1.  **Clone o repositório:**

    ```bash
    git clone https://github.com/seu-usuario/seu-repositorio.git
    ```

2.  **Navegue até o diretório do projeto:**

    ```bash
    cd seu-repositorio
    ```

3.  **Instale as dependências do servidor:**

    ```bash
    npm install
    ```

4.  **Inicie o servidor:**

    ```bash
    node server.js
    ```

5.  **Acesse o jogo:**
    Abra seu navegador e acesse `http://localhost:3000`. Para testar a funcionalidade multiplayer e a fila de espera, abra múltiplas abas ou janelas do navegador.

## Créditos e Agradecimentos 🙏

Este projeto foi amplamente inspirado e guiado pelos excelentes tutoriais sobre desenvolvimento web e comunicação com sockets do canal **Filipe Deschamps**. Um agradecimento especial à playlist sobre a criação de jogos multiplayer com WebSocket, que foi fundamental para o desenvolvimento da arquitetura deste projeto.

  - **Canal:** [Filipe Deschamps](https://www.youtube.com/@FilipeDeschamps)
  - **Playlist de Referência (WebSocket):** [Como Criar um Jogo Multiplayer para Web](https://www.youtube.com/watch?v=0sTfIZvjYJk&list=PLMdYygf53DP5SVQQrkKCVWDS0TwYLVitL)

## Licença

Este projeto está licenciado sob a Licença MIT. Veja o arquivo [LICENSE](./LICENSE) para mais detalhes.