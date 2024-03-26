# Template para projetos de PDS

## Desenvolvimento de APIs REST

### Descarregar e configuração

Devem criar um clone deste projeto no vosso repositório. Para o efeito devemos ter o repositório git vazio (Os issues, gitlab board, wiki, etc podem já estar criados.) 

```
git config --global http.sslverify false
git clone https://gitlab.estg.ipp.pt/pds2/pds_template_rest.git
git config --global http.sslverify true
git config http.sslverify false
cd pds_template_rest
git remote add origin <endereço http do vosso repositório>
git push -f upstream origin master
```


### Configurar base de dados MongoAtlas

O projeto encontra-se preparado para funcionar com a base de dados `MongoDB` local (instalada no computador pessoal). 

É possível e interagir com a base de dados Mongo na MongoAtlas. Para isso é necessário alterar a string de coneeção à base de dados no ficheiro app.js.

Devemos alterar:

```
mongoose.connect('mongodb://localhost/app')
```

para o enderço fornecido pela aplicação Mongo Atlas.

A string de conexão para a plataforma MongoAtlas deve ser comum a cada grupo e todos trabalharem na mesma base de dados. Basta um dos elementos criar a base de dados e utilizadores nesta plataforma.

### Upload para o repositório do grupo de trabalho

### Iniciar projeto

Para iniciar o projeto devemos usar a ferramenta `npm`. Dependendo da situação podemos iniciar o projeto de diferentes formas:

1. Executar o projeto pela primeira vez: 
```
npm install
npm start
```

Na primeira vez que executamos o projeto é necessário executar o comando npm install para descarregar todas as dependências do projeto. Por uma questão de boas práticas, no repositório git não são guardadas as bibliotecas na pasta `node_modules`. O comando `npm install` cria esta pasta e descarrega todas as bibliotecas do nosso projeto.

2. Executar o projeto já configurado
```
npm start
```

Para executar o projeto pela segunda vez e vezes susequêntes  apenas necessitamos do comando `npm start`.

### CRUD Items

O projeto contém uma API exemplo para a coleção `Item` definida no ficheiro `models/item.js`.

As rotas para esta API estão definidas no ficheiro `routes/itemsREST.js`. Aqui são definidas as funções que são executadas para cada rota e método REST definido na nossa API.

O prefixo `api/v1/items` desta API é definido no ficheiro `app.js`, mais concretamente na linha:

```
app.use('/api/v1/items', itemsRESTRouter);
```

O objetivo é que todas as rotas no ficheiro `itemsRESTRouter.js` tenham o prefixo '/api/v1/items' adicionado antes de processar as rotas definidas.

| Método | Rota | Input (Http Body) | Output (Http Body)
| - | - | - | - |
| GET | `/api/v1/items/`| (Vazio) | Lista de Items
| GET | `/api/v1/items/show/:id`| (Vazio) | Item
| POST | `/api/v1/items/create`| Item | Item criado
| PUT | `/api/v1/items/edit/:id` | Item | Item atualizado
| DELETE | `/api/v1/items/delete/:id` | (Vazio) | Item Eliminado

### Testar Rotas

As rotas podem ser testadas com uma aplicação capaz de gerar pedidos `http`. Nas aulas exploramos a aplicação `Postman`, mas podem usar outras como por exemplo a interface `SWAGGER`.

Devemos recordar que para testar qualquer rota, devemos adicionar o domínio do servidor onde estamos a correr a nossa aplicação. Por exemplo, se estivermos a correr a aplicação no servidor na computador local, o nosso domínio é `localhost:3000` e o pedido para obter a lista de todos os items será um pedido http com o método get para o endereço `http://localhost:3000/api/v1/items`.

## Estrutura do projeto

O projeto está desenvolvido utilizando como base um projeto gerado pelo gerador express do package express-generator explorado nas aulas teóricas-práticas.

Nesta versão o projeto incluí as seguintas pastas:
* `controllers` -> cada ficheiro diz respeito a um controlador com funções que serão usadas nas rotas da aplicação
* `models` -> ficheiros com os schemas para gerar objetos nas coleções da base de dados
* `routes` -> ficheiros com as rotas da aplicação. Estes ficheiros são configurados no ficheiro `app.js` 
* `swagger` -> ficheiro com a documentação da REST API
* `jwt_secret` -> ficheiros com chave privada da aplicação para geração de tokens
* `bin` -> com ficheiros de execução e iniciação do projeto

Para além das pastas do projeto existem os seguintes ficheiros na base do projeto:
* `app.js` -> ficheiro com a configuração base da aplicação 
* `.gitignore` -> lista de ficheiros que não devem ser guardados no repositório git
* `package.json` -> configuração do npm com scritps de iniciação e instalação de dependências
* `readme.md` -> ficheiro com esta documentação 
