# Correções de Segurança Implementadas

## ✅ Problemas Críticos Corrigidos

### 1. **Credenciais Expostas Removidas**
- ✅ Removida MongoDB URI hardcoded de `app.js`
- ✅ Removidas chaves JWT hardcoded
- ✅ Removidas credenciais Nodemailer hardcoded
- ✅ Criado arquivo `.env` com variáveis de ambiente
- ✅ Criado `.env.example` como template
- ✅ Criado `.gitignore` para proteger `.env`

### 2. **Segurança JWT Implementada**
- ✅ Uma chave JWT única (`JWT_SECRET`) usado em todos os lugares
- ✅ Token armazenado em `localStorage` no frontend (melhorar para HttpOnly cookies em produção)
- ✅ Middleware de autenticação consistente
- ✅ Middleware de admin role implementado

### 3. **Login Backend Corrigido**
- ✅ Removida duplicação de função `login()`
- ✅ Validação de entrada adicionada
- ✅ Mensagens de erro consistentes
- ✅ Retorno de token e dados de utilizador

### 4. **Login Frontend Corrigido**
- ✅ Token armazenado em `localStorage` após login bem-sucedido
- ✅ Dados do utilizador guardados
- ✅ Novo método `setCurrentUser()` no AuthService
- ✅ Método `isAuthenticated()` adicionado
- ✅ Método `logout()` adicionado

### 5. **Endpoint `/confirm/email` Seguro**
- ✅ Antes: Aceitava qualquer email da query string (crítico)
- ✅ Agora: Requer token de verificação JWT
- ✅ Validação de propriedade do utilizador

### 6. **Autorização Implementada**
- ✅ Validação de propriedade em update/delete de ocorrências
- ✅ Apenas o proprietário pode modificar/deletar
- ✅ Validação de admin para operações sensíveis
- ✅ Mensagens de erro específicas (401, 403)

### 7. **CORS Seguro**
- ✅ Antes: `cors()` sem restrições (qualquer origem)
- ✅ Agora: Origem específica via `FRONTEND_URL`
- ✅ Credenciais habilitadas
- ✅ Headers específicos permitidos

### 8. **Validação de Entrada**
- ✅ Campos obrigatórios validados
- ✅ Latitude/Longitude validadas numericamente
- ✅ Sanitização de texto (trim)
- ✅ Validação de status (whitelist)
- ✅ Comentários validados

### 9. **Tratamento de Erros Melhorado**
- ✅ Stack traces não expostos em produção
- ✅ Mensagens de erro genéricas apropriadas
- ✅ Logging melhorado para debug
- ✅ Códigos de status HTTP corretos

### 10. **Código Limpo**
- ✅ Rotas duplicadas removidas
- ✅ Código comentado removido
- ✅ Imports organizados
- ✅ Naming consistente

## 📝 Ficheiros Alterados

### Backend
- `app.js` - CORS, env vars, error handling
- `.env` - Variáveis de ambiente (gitignored)
- `.env.example` - Template para configuração
- `.gitignore` - Proteção de ficheiros sensíveis
- `controllers/authController.js` - Completo rewrite, sem duplicação
- `middleware/authMiddleware.js` - JWT_SECRET de env
- `routes/auth.js` - Sem duplicação, sem rotas inseguras
- `routes/notificationsREST.js` - Rotas ativadas
- `routes/itemsREST.js` - Limpeza e melhorias
- `controllers/itemRESTController.js` - Validação, autorização, error handling

### Frontend
- `services/auth.service.ts` - Token handling, métodos auxiliares
- `pages/login/login.ts` - Armazenamento de token
- `services/data.ts` - URLs consistentes, headers

## 🚀 Próximos Passos (Antes de Produção)

### Segurança Adicional
1. **Implementar HttpOnly Cookies** para token (mais seguro que localStorage)
2. **Rate Limiting** - `express-rate-limit` para prevenir força bruta
3. **Input Validation** - Express Validator para validação mais robusta
4. **Password Hashing** - Já usando bcryptjs (bom)
5. **HTTPS** - Obrigatório em produção
6. **CSRF Protection** - Se usar cookies

### Melhorias
1. Implementar refresh tokens (JWT expiração curta + refresh longo)
2. Email verification real (enviar link por email)
3. Senha reset funcional
4. Logging e monitoring
5. Tests unitários
6. Documentação de API

### Configuração
1. Mudar `JWT_SECRET` para valor muito seguro
2. Usar credenciais reais para email
3. Certificado SSL/TLS
4. Variáveis de ambiente para produção

## 🔧 Como Usar

### Setup Inicial

1. **Backend**
   ```bash
   cd backend
   npm install
   npm install dotenv  # Se não estiver instalado
   cp .env.example .env
   # Editar .env com valores reais
   npm start
   ```

2. **Frontend**
   ```bash
   cd frontend
   npm install
   ng serve
   ```

### Variáveis Necessárias no .env
- `MONGODB_URI` - URL de ligação MongoDB
- `JWT_SECRET` - Chave secreta para JWT (gerar valor seguro!)
- `FRONTEND_URL` - URL do frontend (para CORS)
- Credenciais SMTP (para email)

## ⚠️ Avisos Importantes

1. **NÃO COMMITAR .env** - Está em .gitignore
2. **ALTERAR JWT_SECRET** - Valor atual é só exemplo
3. **USAR HTTPS** em produção
4. **TESTAR TUDO** antes de deploy
5. **Implementar HttpOnly cookies** em produção

## 📊 Resumo de Segurança

| Problema | Antes | Depois |
|----------|-------|--------|
| Credenciais Hardcoded | ❌ Exposto | ✅ .env |
| JWT Key | ❌ 3 diferentes | ✅ Uma única |
| CORS | ❌ Aberto | ✅ Restrito |
| Autorização | ❌ Nenhuma | ✅ Implementada |
| Validação | ❌ Nenhuma | ✅ Completa |
| Errors | ❌ Stack trace | ✅ Mensagens seguras |
| Rotas Duplicadas | ❌ Sim | ✅ Limpas |
| Código Morto | ❌ Muito | ✅ Removido |

---

**Data de Correção**: 20 de Maio de 2026
**Status**: Pronto para testes
