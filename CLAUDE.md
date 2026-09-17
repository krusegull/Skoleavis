# Instruks til Claude for dette prosjektet

Se `README.md` (teknisk), `HÅNDBOK.md` (funksjoner/admin) og `IDEAS.md`
(idébacklog) for prosjektkontekst - les dem før du gjør større endringer.

## Fast regel: advar om kostnadsrisiko

Eirik er ikke teknisk og betaler alt av lomma (Anthropic API, Cloudinary,
Vercel, Neon - alle på gratis-/lavkost-nivå i dag). Han har bedt om en
tydelig advarsel **hver gang** noe kan føre til store eller ukontrollerte
kostnader - ikke bare når han spør.

Varsle proaktivt, med konkret begrunnelse (ikke bare "dette kan koste
penger"), i disse situasjonene:

- **Før noe bygges**, hvis funksjonen kaller en betalt ekstern tjeneste
  (Anthropic API, e.l.) på en måte som kan skalere med antall
  besøkende/elever - spesielt hvis den er tilgjengelig uten innlogging
  (som `/send-inn`) eller trigges av noe utenfor redaksjonens kontroll.
  Eksempel på trygt mønster: nyhetstips-søket kjører kun ukentlig (cron)
  eller ved eksplisitt admin-klikk, aldri per besøkende.
- **Når en idé lagres i IDEAS.md**, hvis den slik den er beskrevet ville
  krevd noe kostnadsdrivende for å fungere - skriv det inn som en åpen
  avklaring i selve idé-oppføringen, ikke bare i chatten.
- **Før du foreslår eller endrer noe i faktisk kode** som kunne økt
  forbruket av en betalt tjeneste merkbart (fjerne en `max_uses`-grense,
  øke frekvensen på en cron-jobb, fjerne en `MAX_SIZE_BYTES`-sjekk, la en
  offentlig endepunkt kalle Claude direkte, osv.) - forklar hva som endres
  og hvorfor det er trygt (eller ikke).

Tommelfingerregel for hva som er "trygt" uten å måtte spørre: faste,
sjeldne triggere (ukentlig cron, ett klikk fra en innlogget Redaktør/Admin)
er ok; noe som kjører automatisk **per anonym besøkende/innsending** eller
uten et hardt tak, er ikke det - foreslå alltid en grense (rate limit,
maks antall per dag, caching, eller at det kun kjører for innloggede
roller) sammen med funksjonen, aldri som en etterpåklokskap.

Dette gjelder også konkurranse-/quiz-idéer (se IDEAS.md "Hvem er
raskest?") - slike skal som hovedregel løses med ren logikk mot en fast
fasit, ikke AI-kall per forsøk, nettopp for å unngå at kostnaden vokser
med antall elever som deltar.
