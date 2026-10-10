# OBSIDIAN Repair OS — etapa 1

Base inicial de uma plataforma multiempresa para assistência técnica, com interface React/Vite, integração básica com Supabase Auth e esquema SQL inicial.

## Incluído
- Interface responsiva em tema escuro futurista.
- Painel inicial e ordens de serviço de demonstração.
- Login/cadastro Supabase Auth quando configurado.
- Formulário inicial para registrar ordens.
- Esquema SQL para organizações, membros, ordens, atualizações, fotos, produtos, upgrade e pagamentos.
- Políticas RLS iniciais para limitar dados aos membros de cada organização.

## Configuração
1. Crie um projeto Supabase novo para esta plataforma.
2. Abra o SQL Editor e execute `supabase/schema.sql`.
3. Copie `.env.example` para `.env`.
4. Preencha `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` com a URL do projeto e a chave pública anon/publishable.
5. Nunca exponha a chave `service_role` no frontend.
6. Instale Node.js 20+, execute `npm install` e depois `npm run dev`.
7. Para conferir a compilação, execute `npm run build`.

## Publicação
Publique em Vercel, Netlify ou hospedagem estática compatível com Vite. Cadastre as mesmas variáveis de ambiente no painel de publicação.

## Importante: ainda não é produção
O fluxo seguro para criar a primeira organização e aprovar assinantes manualmente ainda será implementado na próxima etapa. Também faltam CRUD completo de ordens, upload seguro de fotos, portal do cliente, integração WhatsApp, Pix por empresa, catálogo/estoque e testes completos de isolamento multiempresa. Não use com dados reais de clientes até concluir essas etapas e validar as políticas de segurança.
