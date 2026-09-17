# Idéer og fremtidige funksjoner

Løpende liste over idéer Eirik har kommet med, som ikke er bygget ennå.
Ikke en forpliktende plan - bare et sted å samle ting så de ikke forsvinner.

**Fast rutine:** Claude lagrer enhver idé Eirik nevner her, uansett hvor
stor eller liten, med det samme den nevnes - ikke bare når han ber
eksplisitt om det. Be om "gi meg en oversikt over ideene" eller lignende
for å hente dem frem igjen når som helst.

## Ikke startet

- **Nyhetstips/AI-utkast for elever.** Redaktør/Admin har nå (se
  "Gjennomført") et valg om AI skal skrive et førsteutkast fra et
  nyhetstips. Eirik har sagt at dette bør fungere annerledes når elever
  er de som bruker det - uavklart foreløpig hvordan (skal elever se
  tipsene selv? Få AI-hjelp til å skrive, eller skal det være forbeholdt
  voksne? Kommer tilbake til dette.)
- **Gjøre en innsending om til en kladd med ett klikk.** I dag må
  Redaktør/Admin åpne dokumentet fra en innsending og skrive innholdet inn
  manuelt i en ny sak. Kunne vært en "Opprett kladd fra denne"-knapp som
  forhåndsutfyller tittel/forfatternavn og lenker til dokumentet - usikkert
  om det er verdt kompleksiteten (å lese tekst ut av Word/PDF er ikke
  trivielt) med mindre det blir mye trafikk på `/send-inn`.
- **Avstemninger på siden** (2026-09-17). F.eks. "Hvem vinner Champions
  League?" - besøkende kan stemme på et lag de tror vinner, blant topp 100
  lag i verden. Uavklart: skal alle kunne stemme uten innlogging (krever da
  en måte å hindre at samme person stemmer mange ganger, f.eks. én stemme
  per nettleser), eller kun innloggede kontoer? Hvor kommer lista over topp
  100 lag fra - fast liste, eller søkbar? Vises resultatet fortløpende eller
  først etter at avstemningen er stengt?
- **Hver klasse sender inn "ukas nyhet"** (2026-09-17). Tanke om en fast
  rutine der hver klasse bidrar med én artikkel i kategorien "Ukas nyhet"
  (se "Gjennomført" - kategorien finnes allerede). Uavklart: er dette en
  ren organisatorisk rutine (læreren styrer hvilken klasse som har turen),
  eller trengs det noe i appen - f.eks. en oversikt over hvilken klasse som
  har levert/har turen denne uken, automatiske påminnelser, eller kobling
  mellom klasse og innsendinger/kladder?
- **Ny konkurranse: "Hvem er raskest?"** (2026-09-17). F.eks. koblet til
  geografi i samfunnsfag - hvem klarer å plassere/gjette alle land i Europa
  raskest, eller alle hovedsteder raskest. Resultatet vises som en
  poengtavle med topp 5 elever. Eirik har presisert et hardt krav: løsningen
  må IKKE gi løpende kostnader som øker med antall svar (dvs. ingen AI/API-
  kall per forsøk - ren logikk som sjekker svar mot en fast fasitliste og
  tidtaking, lagret i den vanlige databasen, er trolig nok og koster
  ingenting ekstra per elev som deltar). Uavklart: krever det innlogging
  for å delta (for å vise navn på poengtavla), hvordan hindre juks/om det
  gjør noe, og om dette skal være én konkurranse eller en gjenbrukbar
  "quiz/hurtigkonkurranse"-mal for flere fag/temaer over tid.

## Vurdert, ikke prioritert

*(ingen ennå)*

## Gjennomført

- **AI-agent som leter etter nyheter** (2026-09-15, utvidet 2026-09-15).
  Kjører ukentlig, hver torsdag (Vercel Cron), og bruker Claude med
  web-søk til å finne troverdige nyhetssaker fra siste uke - først og
  fremst Stovner/Østkanten i Oslo, deretter store nasjonale nyheter.
  Under **Dashbord → Nyhetstips** (kun Redaktør/Admin) kan de velge
  "Skriv utkast for meg" (Claude skriver et originalt førsteutkast med
  web-søk for faktasjekk, tydelig merket som AI-generert, går gjennom
  vanlig godkjenningsflyt), "Jeg skriver selv" (tom kladd), eller
  "Avvis". Se README "Nyhetstips" for oppsett.
- **"Kjør søket nå"-knapp** (2026-09-16). Under Dashbord → Nyhetstips kan
  Redaktør/Admin trigge det samme ukentlige søket manuelt, i stedet for å
  vente til torsdag.
- **To nye kategorier** (2026-09-17): "Historiske nyheter" og "Ukas nyhet".
- **Innsending uten innlogging** (2026-09-17). `/send-inn` lar elever/andre
  laste opp en tekst (Word/PDF/ODT) + bilder direkte til Cloudinary, uten
  konto. Havner under Dashbord → Innsendinger som en innboks Redaktør/Admin
  går gjennom manuelt - skrives om til en ordentlig kladd for hånd dersom
  den skal publiseres (ingen automatisk konvertering til artikkel ennå).
