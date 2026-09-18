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

### Konkret terskel: $3

- Om jeg anslår at **å bygge/teste** en funksjon (f.eks. at jeg selv kjører
  en ekte Claude API-/Cloudinary-forespørsel med Eiriks egne nøkler under
  utvikling) vil koste **$3 eller mer til sammen**, stopper jeg og sier
  fra FØR jeg gjør det - ikke bare rapporterer det i ettertid.
- Om jeg anslår at **én enkelt bruk** av en ferdig funksjon (ett klikk, én
  innsending, én forespørsel) kan koste $3 eller mer, sier jeg fra før den
  bygges, uansett hvor sjelden den vil bli trigget.
- Standardvalg når Eirik ber om noe på nettsiden: **velg alltid den
  billigste løsningen** som faktisk løser oppgaven godt, ikke den mest
  "imponerende" - foreslå en dyrere variant kun som et eksplisitt
  alternativ, aldri som standard.
- Kostnadskildene i dag er Anthropic API, Cloudinary, Vercel og Neon
  (alle på gratis-/lavkostnivå). Dukker det opp behov for noe annet som
  kan koste penger (en ny tjeneste, betalt API, oppgradering til et
  betalt abonnement et sted, økt lagringsbehov osv.), skal det flagges
  eksplisitt som en NY kostnadskilde - ikke stilltiende antas dekket av
  det som allerede er avtalt.
