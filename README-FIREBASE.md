# AKATSUKY DELIVERY SUSHI — Firebase seguro

## 1. Authentication
No Firebase Console → Authentication → Sign-in method, ative **Email/Password**.

Crie contas separadas para:
- administrador → `admin`
- caixa → `cashier`
- operador → `operator`
- garçom → `garcom`

Depois de criar cada usuário, copie o UID e crie no Realtime Database:

```json
{
  "users": {
    "UID_DO_ADMIN": { "role": "admin" },
    "UID_DO_CAIXA": { "role": "cashier" },
    "UID_DO_OPERADOR": { "role": "operator" },
    "UID_DO_GARCOM": { "role": "garcom" }
  }
}
```

**Não permita que os aplicativos escrevam em `users`.**

## 2. Realtime Database
O arquivo `database.rules.json` é a fonte das regras do projeto. Ele deve ser publicado no Firebase depois de validado.

As regras usam Firebase Authentication + função armazenada em `users/<uid>/role`. O Firebase recomenda autenticação e autorização por função, além de `.validate` para validar a estrutura dos dados. Consulte também `SECURITY-AUDIT.md`.

## 3. Garçom
O Garçom deverá usar uma conta Firebase com `role = garcom` antes de ativarmos a política final de acesso somente aos pedidos de mesa.

A consulta segura deverá usar `orderByChild('mesa').equalTo(numeroDaMesa)` para evitar baixar toda a árvore de pedidos. Realtime Database permite regras baseadas nos parâmetros da consulta; regras não funcionam como filtros depois que uma leitura no caminho pai é autorizada.

## 4. Delivery
O acompanhamento do pedido precisa de identificação própria do cliente/pedido (UID anônimo ou token de acompanhamento). O objetivo é impedir que um cliente consiga consultar dados de outro pedido.

## 5. Deploy
No terminal, dentro da pasta do projeto:

```bash
firebase login
firebase use akatsuky-delivery-5b1db
firebase deploy --only database,hosting
```

**Atenção:** alterar `database.rules.json` no GitHub não altera sozinho as regras que estão publicadas no Firebase.

## 6. Teste obrigatório
Antes do deploy definitivo, testar:
- ADM lendo e alterando pedidos;
- operador alterando status;
- caixa acessando somente caixa/histórico permitido;
- garçom lendo somente pedidos de mesa;
- garçom sem acesso a configurações administrativas;
- cliente criando pedido;
- cliente sem acesso aos pedidos de outros clientes.

Use o Firebase Rules Simulator e, para testes completos, o Local Emulator Suite antes de publicar as regras.

## 7. Proteções adicionais
Ative **App Check** para os apps Web, considere MFA para contas administrativas e nunca coloque senha, token secreto ou Firebase Admin SDK em `firebase-config.js` ou no GitHub. A configuração web normal (como `apiKey`) não é um segredo; a proteção real vem do Authentication, Rules e App Check.
