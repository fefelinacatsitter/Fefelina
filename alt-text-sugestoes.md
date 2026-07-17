# Sugestões de Alt Text — fefelina.com.br
**Para:** Desenvolvedor(a) do site

---

## Contexto

Ao auditar as imagens do site, identificamos que as imagens principais (logo, foto institucional, ícones de serviço) já têm `alt` preenchido, mas podem ficar mais descritivos e ricos em palavras-chave. Já os ícones de contato no rodapé estão com rótulos genéricos demais. Segue abaixo a lista com o `alt` atual e a sugestão de melhoria para cada imagem.

> Obs: as 30 imagens sem `alt` encontradas na auditoria são todas avatares de avaliadores do widget de Avaliações do Google (carregadas dinamicamente por script de terceiros) — não fazem parte deste checklist, pois provavelmente não são editáveis diretamente no HTML do site. Ver observação ao final.

---

## 1. Imagens de conteúdo principal

| Imagem | Alt atual | Alt sugerido |
|---|---|---|
| Logo | `Fefelina Cat Sitter - Logo` | `Fefelina Cat Sitter - logo da marca de cuidado felino em Blumenau, SC` |
| Foto "Sobre nós" | *(já está ótimo, manter)* | `Fernanda e André, fundadores da Fefelina Cat Sitter, especialistas em cuidado felino em Blumenau` |
| Card "Cat Sitter" | `Serviço de Cat Sitter profissional em Blumenau` | `Ilustração de gatinho representando o serviço de cat sitter profissional da Fefelina em Blumenau` |
| Card "Medicação" | `Serviço de medicação para gatos em Blumenau` | `Ilustração de gato recebendo medicação oral, representando o serviço de medicação felina da Fefelina` |
| Card "Brincadeiras" | `Brincadeiras e atividades para gatos em Blumenau` | `Ilustração de gatinho brincando com bolinha, representando sessões de enriquecimento e brincadeiras da Fefelina` |

> Nota: incluímos a palavra "ilustração" nas imagens dos cards de serviço porque são imagens geradas por IA, não fotos reais de atendimentos — isso é uma boa prática de transparência com o usuário e com leitores de tela.

---

## 2. Ícones de contato/rodapé

| Imagem | Alt atual | Alt sugerido |
|---|---|---|
| Ícone Instagram | `Instagram` | `Siga a Fefelina Cat Sitter no Instagram` |
| Ícone DogHero | `DogHero` | `Perfil da Fefelina Cat Sitter no DogHero` |
| Ícone WhatsApp | `WhatsApp` | `Fale com a Fefelina Cat Sitter pelo WhatsApp` |
| Ícone Email | `Email` | `Envie um email para a Fefelina Cat Sitter` |

**Por que mudar:** um alt genérico como "Instagram" não informa a quem usa leitor de tela *o que aquele link faz* — a pessoa só ouve "imagem, Instagram", sem saber que é um link clicável para seguir o perfil. Descrever a ação deixa a navegação por voz mais clara e também ajuda a reforçar o nome da marca em contexto.

---

## 3. Observação sobre os avatares do Google Reviews

As imagens sem `alt` identificadas na auditoria pertencem ao widget de Avaliações do Google embutido no site (fotos de perfil de quem deixou review). Como são carregadas dinamicamente por um script de terceiros, normalmente não é possível editar o `alt` direto no HTML da página.

Se quiser resolver isso mesmo assim, vale verificar nas configurações do próprio widget (Elfsight, Trustindex, EmbedSocial, ou similar — depende de qual ferramenta está em uso) se existe alguma opção de customizar o `alt text` dos avatares.
