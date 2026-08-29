# AKATSUKY DELIVERY SUSHI — Firebase seguro (v4.1)

## 1. Ative o Authentication
No Firebase Console → Authentication → Sign-in method, ative **Email/Password**.

## 2. Crie as contas
Crie pelo menos:
- conta do administrador → função `admin`
- conta do caixa → função `cashier`
- opcional: operador de pedidos → função `operator`

Depois de criar cada usuário, copie o UID e crie no Realtime Database:

```json
{
  "users": {
    "UID_DO_ADMIN": { "role": "admin" },
    "UID_DO_CAIXA": { "role": "cashier" },
    "UID_DO_OPERADOR": { "role": "operator" }
  }
}
```

**Não permita que o cliente escreva em `users`.** As regras desta versão já bloqueiam essa escrita.

## 3. Realtime Database
Publique `database.rules.json`. As regras fazem: 
- cliente não lê a árvore inteira de pedidos;
- cliente pode criar um pedido novo;
- cliente pode acompanhar um pedido pelo ID;
- somente `admin`/`operator` alteram status;
- somente `admin` altera cardápio e abre/fecha loja;
- somente `admin`/`cashier` acessam e fecham caixa;
- caixa finalizado não pode mais ser alterado.

## 4. Hosting
No terminal, dentro da pasta do projeto:

```bash
firebase login
firebase use akatsuky-delivery-5b1db
firebase deploy --only database,hosting
```

## 5. Senhas
Não há mais PIN fixo no JavaScript. A autenticação é feita pelo Firebase Authentication. O painel administrativo e o caixa devem usar contas diferentes para manter senhas/permissões separadas.

## 6. Segurança adicional recomendada antes da operação
Ative **App Check** para o app web, mantenha MFA para a conta principal quando disponível e nunca coloque senha ou token secreto dentro de `firebase-config.js`. A configuração Firebase web (apiKey etc.) pode ser pública; a proteção real está no Authentication e nas Rules.
