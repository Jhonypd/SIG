<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

<p align="center">
  Um framework progressivo para Node.js para construir aplicações server-side eficientes e escaláveis.
</p>

## Sobre o Projeto

Sistema de gerenciamento de veículos desenvolvido com NestJS, MySQL e Docker. A aplicação conta com autenticação segura via JWT e criptografia dos dados mais sensíveis, garantindo que as informações dos lojistas estejam sempre protegidas.

## Requisitos

Para executar este projeto, é necessário ter instalado:

- **Node.js** (versão 16 ou superior)
- **npm** ou **yarn**
- **Docker** e **Docker Compose**

O Docker será usado para rodar o banco de dados MySQL em um container isolado, facilitando o desenvolvimento e a configuração do ambiente.

### Instalação do Docker

Se ainda não possui o Docker instalado, faça o download e instalação a partir do site oficial:

* [Docker Desktop para Windows e Mac](https://www.docker.com/products/docker-desktop)
* [Docker para Linux](https://docs.docker.com/engine/install/)

Após a instalação, certifique-se que o Docker está rodando corretamente antes de continuar.

## Instalação

1. **Clone o repositório:**
```bash
git clone [url-do-repositorio]
cd [nome-do-projeto]
```

2. **Copie o arquivo de exemplo das variáveis de ambiente:**
```bash
cp .env.example .env
```

3. **Configure as variáveis no arquivo `.env`** (veja seção abaixo)

4. **Suba o container do banco de dados:**
```bash
docker-compose up -d
```

5. **Instale as dependências:**
```bash
npm install
```

## Configuração do Banco de Dados com Docker

Este projeto utiliza um container Docker com MySQL 8.0 configurado conforme abaixo:

```yaml
services:
  mysql:
    image: mysql:8.0
    container_name: sig-db
    restart: always
    environment:
      MYSQL_ROOT_PASSWORD: admin123
      MYSQL_DATABASE: veiculo_db
      MYSQL_USER: admin
      MYSQL_PASSWORD: admin123
    ports:
      - '3306:3306'
    volumes:
      - ./database:/var/lib/mysql
```

## Variáveis de Ambiente

Configure as seguintes variáveis de ambiente no seu arquivo `.env`:

```env
# Database Configuration
MYSQL_ROOT_PASSWORD=admin123
MYSQL_DATABASE=veiculo_db
MYSQL_USER=admin
MYSQL_PASSWORD=admin123
DATABASE_PORT=3306
DATABASE_HOST=localhost

# Security Keys (generate new ones for production)
HASH_SECRET=your_hash_secret_here
ENCRYPTION_KEY=generate_with_command_below
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=3600s

# Application
PORT=4000
```

### Gerar chave de criptografia

Para gerar a chave de criptografia necessária para a variável `ENCRYPTION_KEY`, execute o comando no terminal:

**Windows (bash):**
```bash
xxd -p -l 32 /dev/urandom | tr 'a-f' 'A-F'
```

Copie a saída e cole na variável `ENCRYPTION_KEY`.

## Como executar o projeto

### Desenvolvimento

```bash
# Modo desenvolvimento (hot reload)
npm run start:dev
```

### Produção

```bash
# Build da aplicação
npm run build

# Executar em modo produção
npm run start:prod
```

## Documentação da API

Após executar a aplicação, acesse:

- **Swagger UI:** `http://localhost:4000/api/v1`
- **API Base URL:** `http://localhost:4000`

## Comandos Docker Úteis

```bash
# Iniciar os containers
docker-compose up -d

# Parar os containers
docker-compose down

# Ver logs do banco
docker logs sig-db

# Acessar o container do banco
docker exec -it sig-db bash

# Backup do banco de dados
docker exec sig-db mysqldump -u root -padmin123 veiculo_db > backup.sql

# Restaurar backup
docker exec -i sig-db mysql -u root -padmin123 veiculo_db < backup.sql
```

## Comandos para acessar o banco de dados MySQL

```bash
# Acessar MySQL via container
docker exec -it sig-db mysql -u root -p
```

Após digitar a senha (`admin123`), execute os comandos abaixo no prompt MySQL:

```sql
-- Listar bancos de dados
SHOW DATABASES;

-- Selecionar o banco configurado
USE veiculo_db;

-- Listar tabelas do banco
SHOW TABLES;

-- Sair do prompt MySQL
EXIT;
```

## Testes

```bash
# Testes unitários
npm run test

# Testes em modo watch
npm run test:watch

# Testes end-to-end
npm run test:e2e

# Relatório de cobertura dos testes
npm run test:cov
```

## Estrutura do Projeto

```
src/
├── common/                          # Utilitários compartilhados
│   ├── decorators/                  # Decorators customizados
│   │   └── usuario-token.decorator.ts
│   ├── dto/                         # DTOs compartilhados
│   │   └── response.dto.ts
│   ├── encryption/                  # Serviços de criptografia
│   │   └── criptografia.service.ts
│   ├── filters/                     # Exception filters
│   │   └── http-exception.filter.ts
│   ├── guards/                      # Guards de autenticação
│   │   └── jwt-auth.guard.ts
│   ├── interceptors/                # Interceptors
│   │   └── response.interceptor.ts
│   ├── interfaces/                  # Interfaces compartilhadas
│   │   ├── jwt-payload.interface.ts
│   │   ├── response.interface.ts
│   │   └── usuario-data.ts
│   ├── mapper/                      # Mappers para transformação de dados
│   │   └── mapear-descriptografia.mapper.ts
│   └── pipes/                       # Pipes de validação
│       └── zod-validacoes.pipe.ts
├── config/                          # Configurações da aplicação
│   └── swagger.config.ts
├── modules/                         # Módulos da aplicação
│   ├── auth/                        # Módulo de autenticação
│   │   ├── dto/
│   │   │   ├── swagger/
│   │   │   ├── login.dto.ts
│   │   │   └── register.dto.ts
│   │   ├── auth.controller.ts
│   │   ├── auth.module.ts
│   │   ├── auth.service.ts
│   │   └── jwt.strategy.ts
│   ├── imagens/                     # Módulo de gerenciamento de imagens
│   │   ├── dto/
│   │   ├── imagens.entity.ts
│   │   ├── imagens.module.ts
│   │   └── imagens.service.ts
│   ├── usuarios/                    # Módulo de usuários
│   │   ├── dto/
│   │   ├── services/                # Services específicos do módulo
│   │   │   ├── alterar-usuario.service.ts
│   │   │   ├── buscar-usuario.service.ts
│   │   │   └── criar-usuario.service.ts
│   │   ├── usuarios.controller.ts
│   │   ├── usuarios.entity.ts
│   │   └── usuarios.module.ts
│   └── veiculos/                    # Módulo de veículos
│       ├── dto/
│       ├── services/                # Services específicos do módulo
│       │   ├── alterar-veiculo.service.ts
│       │   ├── buscar-todos-veiculos.service.ts
│       │   ├── buscar-veiculo.service.ts
│       │   ├── criar-veiculo.service.ts
│       │   └── deletar-veiculo.service.ts
│       ├── veiculo.controller.ts
│       ├── veiculo.module.ts
│       └── veiculos.entity.ts
├── app.module.ts                    # Módulo principal
└── main.ts                          # Arquivo de entrada da aplicação
```

## Solução de Problemas

### Erro de conexão com o banco
- Verifique se o container MySQL está rodando: `docker ps`
- Confirme as credenciais no arquivo `.env`
- Verifique se a porta 3306 não está sendo usada por outro serviço

### Porta já em uso
- Altere a porta no arquivo `.env` e no `docker-compose.yml`
- Verifique processos rodando na porta: `netstat -tulpn | grep :4000`

### Problemas com migrações
```bash
# Reverter última migração
npm run migration:revert

# Executar migrações pendentes
npm run migration:run
```

## Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## Documentação e Recursos

* [Documentação oficial do NestJS](https://docs.nestjs.com)
* [Canal no Discord para suporte](https://discord.gg/G7Qnnhy)
* [Cursos oficiais do NestJS](https://courses.nestjs.com/)
* [Deploy com Mau na AWS](https://mau.nestjs.com)
* [Devtools NestJS para visualização da aplicação](https://devtools.nestjs.com)
* [Suporte corporativo NestJS](https://enterprise.nestjs.com)
* [Twitter](https://twitter.com/nestframework)
* [LinkedIn](https://linkedin.com/company/nestjs)
* [Jobs Board](https://jobs.nestjs.com)

## Licença

Este projeto está licenciado sob a [MIT License](LICENSE) - veja o arquivo [LICENSE](LICENSE) para mais detalhes.

### Sobre a Licença MIT
A MIT License é uma licença de software livre permissiva que permite uso comercial e modificação do código, desde que a nota de copyright seja mantida.

---
