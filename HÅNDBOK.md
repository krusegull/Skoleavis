# Håndbok for Stuanytt

Denne håndboken forklarer **hva appen kan gjøre**, skrevet for deg som
administrerer avisen - ikke for utviklere (det tekniske ligger i
`README.md`). Tanken er at hvis du en dag gir fra deg admin-tilgangen til
noen andre, kan de lese denne og forstå hele appen uten å måtte spørre
noen.

Be Claude om å oppdatere denne håndboken når dere legger til nye
funksjoner, og be om et sammendrag av mulighetene når som helst - bare si
"gi meg et sammendrag av appen" eller lignende.

## Hva er Stuanytt

En digital skoleavis for Haugenstua skole, bygget som en ekte
applikasjon (ikke bare en statisk nettside) med innlogging, roller,
redaksjonell arbeidsflyt og et arkiv som varer år etter år.

## Roller

Hver konto har én rolle **per skoleår** (samme konto kan ha ulik rolle
fra år til år):

| Rolle | Kan |
|---|---|
| **Admin** (lærer) | Alt Redaktør kan, pluss brukeradministrasjon og "Avslutt skoleår" |
| **Redaktør** | Godkjenne/avvise/publisere saker, se nyhetstips, redigere "Om oss", pluss alt andre roller kan |
| **Journalist / Fotograf / Grafisk designer / Sosiale medier-ansvarlig** | Opprette og redigere egne kladder |

Rettigheter følger alltid **rollen**, aldri en bestemt e-postadresse -
Admin-rollen kan fritt overføres til en annen konto.

## Redaksjonell arbeidsflyt

En sak går gjennom disse stegene:

1. **Kladd** - hvem som helst i redaksjonen kan opprette og redigere sine
   egne kladder under **Dashbord → Mine kladder → Ny sak**.
2. **Til godkjenning** - forfatteren trykker "Lagre og send til
   godkjenning". Saken kan ikke lenger redigeres av forfatteren alene.
3. **Publisert eller avvist** - en Redaktør/Admin ser saken under
   **Dashbord → Til godkjenning** og godkjenner (publiseres umiddelbart)
   eller avviser (med valgfri begrunnelse - saken går da tilbake til
   kladd hos forfatteren, som kan rette opp og sende inn på nytt).

Bidragsytere (byline) legges til på hver sak med navn + rolle. Dette
lagres som **tekst**, fryst på tidspunktet det legges til - så bylines i
arkivet forblir riktige selv om en konto senere deaktiveres.

## Innholdstyper på en sak

- Tittel, kategori (Nyheter/Reportasje/Intervju/Anmeldelse/Sport/Kultur/Quiz)
- Ingress (kort ingress under tittelen)
- Teaser (valgfri, kort tekst brukt i grid/lenker - kan foreslås av AI, se under)
- Bilde (lim inn URL, eller last opp direkte - se "Bildeopplasting")
- Brødtekst med **rik tekstredigering**: fet, kursiv, punktlister,
  nummererte lister, lenker

## Offentlige sider

| Side | Innhold |
|---|---|
| Forside (`/`) | Hovedsak + sidesaker + "flere saker"-grid, kun publiserte saker |
| Kategorisider (`/kategori/...`) | Alle publiserte saker i én kategori |
| Enkeltartikkel (`/sak/...`) | Full sak med bilde, byline, brødtekst |
| Arkiv (`/arkiv`) | Alle publiserte saker, nyeste først |
| Redaksjonen (`/redaksjonen`) | Roller og medlemmer for gjeldende skoleår, med mulighet for å bla i tidligere års redaksjoner. **Elever vises aldri her** (se Personvern) |
| Om oss (`/om-oss`) | Fritekst-side om skolen/avisen, redigeres fra dashbordet |

## Dashbord (innlogget)

- **Mine kladder** - egne saker, uansett status
- **Til godkjenning** (Redaktør/Admin) - saker som venter på beslutning
- **Nyhetstips** (Redaktør/Admin) - se eget avsnitt under
- **Om oss-siden** (Redaktør/Admin) - rediger teksten på `/om-oss`
- **Brukere** (Admin) - opprette kontoer, endre rolle, deaktivere/reaktivere, sette "Elev"-merke, nullstille passord
- **Avslutt skoleår** (Admin) - opprette nye skoleår, sette hvilket som er gjeldende, og manuelt deaktivere kontoer (aldri automatisk)

## Nyhetstips - AI-agenten

Hver **torsdag** søker Claude (med nettsøk) etter troverdige nyheter fra
den siste uken - først lokale saker (Stovner/Østkanten i Oslo), deretter
store nasjonale nyheter. Forslagene dukker opp under **Dashbord →
Nyhetstips**, synlig kun for Redaktør/Admin.

For hvert tips velger dere:

- **"Skriv utkast for meg"** - Claude skriver et førsteutkast med egne
  ord (aldri kopiert fra kilden), merket tydelig som AI-generert. Må
  alltid leses gjennom og faktasjekkes - går gjennom akkurat samme
  godkjenningsflyt som alt annet, ingenting publiseres automatisk.
- **"Jeg skriver selv"** - oppretter en tom kladd med forslaget som
  referanse i ingressen.
- **"Avvis"** - fjerner tipset.

*(Planlagt endring: dette skal fungere annerledes når elever - ikke bare
Admin/Redaktør - skal bruke det. Ikke bygget ennå, se `IDEAS.md`.)*

## "Foreslå teaser"

I sakredigeringen kan man trykke "Foreslå teaser" for å få Claude til å
foreslå en kort, fengende teaser-tekst basert på tittel/ingress/brødtekst.
Kan be om nytt forslag eller skrive selv.

## Bildeopplasting

Bilder til saker og "Om oss" kan enten limes inn som URL, eller lastes
opp direkte (knapp i redigeringsvisningen) - lagres hos Cloudinary.
Bilder som erstattes eller fjernes slettes automatisk fra lagringen.

## Personvern - viktige prinsipper

- **Minst mulig personopplysninger skal være offentlig synlig som
  standard.**
- Kontoer har et **"Elev"-merke**, uavhengig av rolle. Elev-merkede
  kontoer vises **aldri** på den offentlige Redaksjonen-siden. Nye
  kontoer er elev som standard - en Admin må aktivt fjerne merket for at
  noen skal vises offentlig (f.eks. lærere).
- Bylines på publiserte saker viser fortsatt navn+rolle for alle
  bidragsytere, inkludert elever - dette er et bevisst arkiv-krav (se
  README "Viktig datamodell-detalj"). Vurder samtykke fra foresatte for
  dette når elevkontoer tas i bruk.
- Deaktiverte kontoer beholdes (ikke slettet) for å bevare historikk -
  et bevisst valg.

## Skoleår og kontoer

- Hver rolletildeling er knyttet til et skoleår (f.eks. "2026/2027").
- Kontoer **deaktiveres aldri automatisk** - alltid en bevisst handling
  under "Avslutt skoleår".
- En deaktivert konto kan reaktiveres og få ny rolle om personen kommer
  tilbake.
- **I dag opprettes kun lærer-/adminkontoer manuelt av Admin.**
  Elevkontoer er forberedt i datamodellen, men selve opprettingsflyten
  for elever er ikke bygget som noe eget ennå - elevkontoer opprettes på
  samme måte som lærerkontoer (Brukere → Opprett ny konto), bare med
  "Elev"-merket satt.

## Innlogging

E-post/passord fungerer fra dag én. Feide er forberedt i koden, men
**ikke aktivert** før skolen har godkjent en Feide-klient - se README
"Feide".

## Å gi fra seg admin-tilgangen

1. Opprett en ny konto for etterfølgeren under **Brukere** (rolle:
   Admin).
2. Gi dem passordet/be dem logge inn og bytte det selv (ingen
   "glemt passord"-flyt finnes ennå - Admin må nullstille passord manuelt
   ved behov, under **Brukere**).
3. Din egen konto kan enten beholde Admin-rollen (flere admins er greit),
   eller du kan endre din egen rolle/deaktivere kontoen din når du er
   klar for det.
4. Pek dem til denne håndboken.

## Teknisk (kort - se README.md for detaljer)

Next.js + Prisma/PostgreSQL (Neon) + NextAuth + Tailwind, driftet på
Vercel. Kildekoden ligger i dette repoet
(`krusegull/Skoleavis`). `IDEAS.md` samler idéer som ikke er bygget ennå.
