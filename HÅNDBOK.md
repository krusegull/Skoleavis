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

- Tittel, kategori (Nyheter/Reportasje/Intervju/Anmeldelse/Sport/Kultur/Ukas
  nyhet/Historiske nyheter/Konkurranse/Kronikk)
- Ingress (valgfri, kort ingress under tittelen)
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
| Send inn (`/send-inn`) | Offentlig skjema - elever/andre kan sende inn en tekst (Word/PDF) + bilder uten å logge inn. Se eget avsnitt under |
| Avstemning (`/avstemning`) | Offentlige avstemninger - alle kan stemme uten å logge inn. Se eget avsnitt under |
| Aktiviteter (`/aktiviteter`) | Fritidstilbud i nærområdet, gruppert etter kategori. Se eget avsnitt under |

## Dashbord (innlogget)

- **Mine kladder** - egne saker, uansett status
- **Til godkjenning** (Redaktør/Admin) - saker som venter på beslutning
- **Alle saker** (Redaktør/Admin) - alle publiserte saker, uansett forfatter - rediger hvem som helst sin publiserte sak herfra
- **Nyhetstips** (Redaktør/Admin) - se eget avsnitt under
- **Innsendinger** (Redaktør/Admin) - se eget avsnitt under
- **Avstemninger** (Redaktør/Admin) - se eget avsnitt under
- **Aktiviteter** (Redaktør/Admin) - se eget avsnitt under
- **Om oss-siden** (Redaktør/Admin) - rediger teksten på `/om-oss`
- **Brukere** (Admin) - opprette kontoer, endre rolle, deaktivere/reaktivere, sette "Elev"-merke, nullstille passord
- **Avslutt skoleår** (Admin) - opprette nye skoleår, sette hvilket som er gjeldende, og manuelt deaktivere kontoer (aldri automatisk)

## Innsending fra elever/andre (uten innlogging)

Hvem som helst kan gå til `/send-inn` (lenke i toppmenyen: "Send inn") og
sende en tekst pluss valgfrie bilder til redaksjonen - uten å ha en konto.
De fyller ut navn, valgfri e-post, en valgfri melding, laster opp
dokumentet sitt (Word/PDF/ODT) og eventuelt bilder.

Bidragene havner under **Dashbord → Innsendinger** (Redaktør/Admin), som
en enkel innboks - de blir **ikke** automatisk til en artikkel. Redaktør/
Admin åpner dokumentet, og skriver eventuelt innholdet inn som en vanlig
kladd (**Mine kladder → Ny sak**) dersom saken skal publiseres. Hvert
bidrag kan merkes "Lest", arkiveres, eller slettes permanent (sletter da
også de opplastede filene).

*(Krever et eget engangs-oppsett i Cloudinary utover vanlig
bildeopplasting - se README "Innsending fra elever". Uten dette viser
siden en tydelig melding om at innsending ikke er satt opp ennå.)*

## Avstemninger

Under **Dashbord → Avstemninger** (Redaktør/Admin) kan dere opprette en
avstemning: ett spørsmål + minst to svaralternativer (ett per linje).
Avstemningen dukker straks opp offentlig på `/avstemning` (lenke i
toppmenyen: "Avstemning"), der alle kan stemme uten å logge inn.

- Hver besøkende kan stemme **én gang per avstemning** - dette håndheves
  med en informasjonskapsel (cookie) i nettleseren, ikke innlogging. Rydder
  noen bevisst bort informasjonskapsler kan de stemme på nytt - et bevisst,
  billig kompromiss for en skoleavis, ikke en manipulasjonssikker løsning.
- Etter å ha stemt (eller hvis avstemningen er stengt) vises resultatene
  som stolper med stemmetall og prosent, i stedet for stemmeknappene.
- Dere kan **Steng**e en avstemning når den skal avsluttes (resultatene
  blir stående, men ingen kan stemme mer), eller **Slett**e den permanent.
- Ingen AI eller betalt tjeneste er involvert - avstemninger koster
  ingenting ekstra uansett hvor mange som stemmer.

## Aktiviteter i nærområdet

Under **Dashbord → Aktiviteter** (Redaktør/Admin) legger dere inn
fritidstilbud - idrettslag, fritidsklubber, kultur- og bibliotektilbud
osv. Hvert tilbud har et navn, en kort beskrivelse (vises hos oss), en
valgfri aldersgruppe, en kategori, og en lenke til tilbudets egen
nettside.

Tilbudene vises offentlig på `/aktiviteter` (lenke i toppmenyen:
"Aktiviteter"), gruppert etter kategori (Idrett/Fritidsklubber/Kultur/
Bibliotek/Annet). Dette er **ikke** vanlige saker - det er en kuratert
liste med kort tekst og en "Les mer →"-lenke videre til tilbudets egen
side. Ingen fast oppdateringsfrekvens - legg til/fjern etter behov. Som
med avstemninger er dette ren databaselagring, ingen AI/betalt tjeneste,
så det koster ingenting ekstra.

## Nyhetstips - AI-agenten

Hver **torsdag** søker Claude (med nettsøk) etter troverdige nyheter fra
den siste uken - først lokale saker (Stovner/Østkanten i Oslo), deretter
store nasjonale nyheter. Forslagene dukker opp under **Dashbord →
Nyhetstips**, synlig kun for Redaktør/Admin.

Øverst på denne siden finnes også knappen **"Kjør søket nå"**, som gjør
akkurat det samme søket med en gang - nyttig hvis dere ikke vil vente til
torsdag, f.eks. for å teste eller for å hente ferske tips midt i uken.
Søket tar typisk et halvt minutt.

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

**Om kostnad:** Nyhetstips-søket og AI-utkast bruker Anthropics API
(Claude), som faktureres til kontoen som eier `ANTHROPIC_API_KEY` i
Vercels miljøvariabler (skolens/din egen konto - ikke Anthropic eller
Claude Code). Siden søket kun kjører én gang i uken, pluss noen få
"Skriv utkast for meg"-klikk, er kostnaden normalt lav (typisk noen få
kroner i måneden). Forbruk og fakturering kan følges på
console.anthropic.com.

## "Foreslå teaser"

I sakredigeringen kan man trykke "Foreslå teaser" for å få Claude til å
foreslå en kort, fengende teaser-tekst basert på tittel/ingress/brødtekst.
Kan be om nytt forslag eller skrive selv. Bruker samme `ANTHROPIC_API_KEY`
og fakturering som Nyhetstips-agenten over - hvert klikk er en liten,
rimelig API-forespørsel.

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
