# Skoleavisen

En digital skoleavis med ekte redaksjonell arbeidsflyt: kladd → til godkjenning
→ publisert. Rollebasert tilgang (Admin, Redaktør, Journalist, Fotograf,
Grafisk designer, Sosiale medier-ansvarlig), knyttet til skoleår slik at
redaksjonen kan skiftes ut år for år uten å miste historikk eller arkiv.

## Teknisk stack

- **Next.js 14** (App Router) + TypeScript
- **Prisma** mot **PostgreSQL** (utviklet for [Neon](https://neon.tech))
- **NextAuth.js** - e-post/passord fra dag én, Feide forberedt i koden
- **Tailwind CSS**
- Deploy: **Vercel**

## Kom i gang lokalt

```bash
npm install
cp .env.example .env
```

Fyll ut `.env`:

- `DATABASE_URL` / `DIRECT_URL` - Postgres-tilkobling (se "Database (Neon)" under)
- `NEXTAUTH_SECRET` - generer med `openssl rand -base64 32`
- `NEXTAUTH_URL` - `http://localhost:3000` lokalt
- `FEIDE_*` og `ANTHROPIC_API_KEY` - valgfrie, se egne avsnitt under

```bash
npx prisma migrate dev --name init
npm run dev
```

## Database (Neon - gratisnivå)

1. Opprett et gratis prosjekt på [neon.tech](https://neon.tech).
2. Kopier "Pooled connection" til `DATABASE_URL` og "Direct connection" til
   `DIRECT_URL` (Prisma trenger den direkte tilkoblingen for migreringer).
3. Kjør `npx prisma migrate deploy` (produksjon) eller `migrate dev` (lokalt).

## Opprette den første lærerkontoen (admin)

Det finnes ingen "opprett konto"-side i appen med vilje - kontoer opprettes av
en administrator. Den aller første admin-kontoen og det første skoleåret
opprettes derfor med seed-scriptet:

```bash
SEED_SCHOOL_YEAR="2026/2027" \
SEED_ADMIN_NAME="Ola Nordmann" \
SEED_ADMIN_EMAIL="ola@skolen.no" \
SEED_ADMIN_PASSWORD="et-sikkert-passord" \
npm run prisma:seed
```

Dette oppretter skoleåret som "gjeldende" og gir kontoen rollen `ADMIN` for
det året. Logg inn på `/login` med e-post/passord.

Etter dette gjøres all videre brukeradministrasjon i appen under
**Dashbord → Brukere** (kun synlig for Admin).

## Roller og rettigheter

Rettigheter er **alltid** knyttet til rollen en konto har for **gjeldende
skoleår** - aldri til en bestemt e-postadresse. Det betyr blant annet at
Admin-rollen fritt kan overføres til en annen lærer: gå til
**Dashbord → Brukere**, velg en konto, og sett rollen til `Admin (lærer)` for
gjeldende skoleår. Den forrige adminen kan samtidig settes til en annen rolle
eller beholde sin.

Rollene:

| Rolle | Kan |
|---|---|
| Admin (lærer) | Alt Redaktør kan, i tillegg til brukeradministrasjon og "Avslutt skoleår" |
| Redaktør | Godkjenne/avvise og publisere saker, i tillegg til alt andre roller kan |
| Journalist / Fotograf / Grafisk designer / Sosiale medier-ansvarlig | Opprette og redigere egne kladder |

### Legge til / fjerne roller

Under **Dashbord → Brukere**:

- **Ny konto**: fyll ut navn, e-post, passord og velg rolle. Kontoen får
  automatisk rollen for gjeldende skoleår.
- **Endre rolle**: bruk rolle-nedtrekket på brukerens rad. Dette oppretter
  eller oppdaterer rolletildelingen for gjeldende skoleår - historikken fra
  tidligere år endres ikke.
- **Deaktivere/reaktivere**: knappen "Aktiv — deaktiver" / "Deaktivert —
  reaktiver". Kontoer slettes aldri, kun deaktiveres, slik at bylines i
  arkivet og redaksjonshistorikken forblir korrekte. En reaktivert konto kan
  få en ny rolletildeling for det nye skoleåret.

Elevkontoer opprettes på nøyaktig samme måte som lærerkontoer (samme skjema),
men er ikke satt opp med noe eget innloggingsflow utover e-post/passord i
denne runden - det tas som en ren driftsoppgave senere.

## Godkjenningsflyt

1. Et redaksjonsmedlem oppretter en kladd under **Dashbord → Ny sak**,
   fyller ut tittel, ingress, kategori, brødtekst, bilde-URL og bidragsytere
   (byline), og lagrer.
2. Når saken er klar, trykker forfatteren **"Lagre og send til
   godkjenning"**. Saken får status `Til godkjenning` og forsvinner fra
   forfatterens redigeringsmuligheter (utenom for Redaktør/Admin).
3. En Redaktør eller Admin ser saken under **Dashbord → Til godkjenning** og
   kan:
   - **Godkjenne og publisere** - saken får status `Publisert`, får satt
     publiseringsdato, og vises på forsiden/kategorisider/arkiv umiddelbart.
   - **Avvise** - saken får status `Avvist`, med valgfri begrunnelse som vises
     til forfatteren. Når forfatteren redigerer saken på nytt, går den
     automatisk tilbake til `Kladd` og kan sendes inn på nytt.

Bidragsyternes navn og rolle lagres som tekst direkte på saken når de legges
til i redigeringsvisningen (i tillegg til en kobling til kontoen). Det betyr
at bylines i arkivet forblir korrekte selv om kontoen som skrev saken senere
deaktiveres.

## "Avslutt skoleår"

Under **Dashbord → Avslutt skoleår** (kun Admin):

- **Skoleår**: opprett et nytt skoleår (f.eks. "2027/2028") og sett det som
  gjeldende når den nye redaksjonen er klar til å ta over. Det forrige året
  forblir i historikken og kan velges på **Redaksjonen**-siden.
- **Avslutt skoleår**: velg et skoleår, kryss av kontoene som skal
  deaktiveres (f.eks. elever/redaksjonsmedlemmer som slutter), og trykk
  "Deaktiver valgte kontoer". Dette skjer **aldri automatisk** - det er
  alltid en bevisst handling en administrator utfører. En deaktivert konto
  kan reaktiveres og få ny rolle senere dersom personen kommer tilbake.

## "Foreslå teaser" (valgfritt, Claude API)

Sett `ANTHROPIC_API_KEY` i miljøvariablene (kun server-side, eksponeres aldri
til klienten) for å aktivere knappen "Foreslå teaser" i sakredigeringen. Uten
nøkkelen viser knappen bare en feilmelding, resten av appen fungerer som
normalt. Modellen kan overstyres med `ANTHROPIC_MODEL` (standard:
`claude-haiku-4-5-20251001`).

## Feide

Feide er kodet som en ekstra innloggingsleverandør i `src/lib/auth.ts`, men
er **ikke aktivert** før `FEIDE_CLIENT_ID` og `FEIDE_CLIENT_SECRET` er satt i
miljøvariablene (avklares med skolen/Feide først). Så lenge disse mangler,
vises ikke Feide-knappen på innloggingssiden, og e-post/passord fungerer som
normalt.

## Deploy (Vercel + Neon, gratisnivå)

1. Push repoet til GitHub og importer det i [Vercel](https://vercel.com).
2. Legg inn miljøvariablene fra `.env.example` i Vercel-prosjektets
   Environment Variables (minst `DATABASE_URL`, `DIRECT_URL`,
   `NEXTAUTH_SECRET`, `NEXTAUTH_URL`).
3. Kjør `npx prisma migrate deploy` mot produksjonsdatabasen (f.eks. via
   `vercel env pull` lokalt, eller et eget migrasjonssteg i CI).
4. Kjør seed-scriptet én gang mot produksjonsdatabasen for å opprette den
   første admin-kontoen (se over).

Både Vercel og Neon sine gratisnivåer er mer enn nok til denne skalaen.

## Prosjektstruktur

```
prisma/schema.prisma       Datamodell (bruker, rolle, skoleår, sak, bidragsyter)
prisma/seed.ts              Førstegangsoppsett: første admin + skoleår
src/lib/auth.ts             NextAuth-konfigurasjon (Credentials + Feide)
src/lib/permissions.ts      Eneste sted rettigheter er definert (rollebasert)
src/lib/schoolYear.ts       Gjeldende skoleår, roster, rolleoppslag
src/app/                    Sider (forside, kategori, sak, arkiv, redaksjonen, dashbord)
src/app/api/                API-ruter (saker, brukere, skoleår, teaser)
src/components/             Delte UI-komponenter
```
